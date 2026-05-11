/**
 * Parse Nowcoder (牛客网) school recruitment schedule.
 *
 * Strategy: The page at nowcoder.com/jobs/school/schedule is SSR with Vue.
 * All data lives in `window.__INITIAL_STATE__` as structured JSON — no HTML
 * parsing needed. We extract `scheduleData.datas[]` which contains 20 company
 * cards per page (the first page of "hot recommendations").
 *
 * Each entry has: name, companyEvaluation, batchName, cityList, careerNameList,
 * industryList, customWangshenLink, cardSchoolScheduleInfo (status + date), etc.
 *
 * Run: npx tsx scripts/parse-nowcoder.ts
 * Output: src/lib/nowcoder-data.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Category, Channel } from '../src/lib/types';

// ─── Raw types from Nowcoder __INITIAL_STATE__ ───────────────────────
interface NowcoderCompany {
  name: string;
  companyId: number;
  companyEvaluation: string;
  cityList: string[];
  batchName: string | null;
  wangshenBeginDate: number | null;
  wangshenEndDate: number | null;
  wangshenTime: string | null;
  careerNameList: string[] | null;
  industryList: string[];
  customWangshenLink: string;
  sourceInformation: string;
  homeLogo: string;
  end: number; // 0 = active, 1 = ended
  cardSchoolScheduleInfo: {
    status: number;
    content: {
      data: Array<{ text: string; color: string; fontWeight: string | null }>;
    };
    tag: unknown;
  };
  updateTime: number;
}

interface FeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceHandle?: string;
  channel: Channel;
  category: Category;
  tags: string[];
  score: number;
  featured?: boolean;
  createdAt: string;
}

// ─── Category detection ──────────────────────────────────────────────
function detectCategory(company: NowcoderCompany): Category {
  const industries = company.industryList.join(' ');
  const text = company.name + ' ' + company.companyEvaluation + ' ' + industries;

  if (/游戏|Game/.test(text)) return 'game';
  if (/银行|证券|基金|保险|金融|投资|财富|信托|期货|交易所|会计/.test(text)) return 'finance';
  if (/汽车|车企|新能源|芯片|IC|半导体|通信电子|硬件|机械制造|军工/.test(text)) return 'auto_ic';
  if (/信息安全|网络安全|安全/.test(text)) return 'security';
  if (/外企|外资|跨国/.test(text)) return 'foreign';
  if (/互联网|AI|人工智能|科技|软件|数据|算法|平台|电商|视频直播|社交|工具|企业服务/.test(text)) return 'internet';

  return 'other';
}

// ─── Channel detection ───────────────────────────────────────────────
function detectChannel(company: NowcoderCompany): Channel {
  const batch = company.batchName || '';
  const statusTexts = company.cardSchoolScheduleInfo?.content?.data?.map(d => d.text).join(' ') || '';
  const combined = batch + ' ' + statusTexts;

  if (/实习|intern/i.test(combined)) return 'intern';
  return 'campus';
}

// ─── Extract status label from card info ─────────────────────────────
function extractStatusLabel(company: NowcoderCompany): string {
  const parts = company.cardSchoolScheduleInfo?.content?.data;
  if (!parts || parts.length === 0) return company.batchName || '校招';

  // Filter out separators (丨) and date parts, keep the status text
  return parts
    .filter(p => p.text !== '丨' && !/\d{2}\.\d{2}收录/.test(p.text))
    .map(p => p.text)
    .join(' ')
    .trim() || company.batchName || '校招';
}

// ─── Extract record date from card info ──────────────────────────────
function extractRecordDate(company: NowcoderCompany): string | null {
  const parts = company.cardSchoolScheduleInfo?.content?.data;
  if (!parts) return null;

  for (const p of parts) {
    const match = p.text.match(/(\d{2})\.(\d{2})收录/);
    if (match) return `${match[1]}.${match[2]}`;
  }
  return null;
}

// ─── Score computation ───────────────────────────────────────────────
function computeScore(company: NowcoderCompany): number {
  let score = 55;

  // Tier 1 companies
  const tier1 = ['字节跳动', '腾讯', '阿里巴巴', '美团', '百度', '华为', '小米', '京东', '拼多多',
    'Google', 'Microsoft', '微软', '苹果', 'Apple', 'Amazon', 'Meta', 'NVIDIA', 'OpenAI'];
  const tier2 = ['网易', '快手', '小红书', '哔哩哔哩', '携程', '蔚来', '理想', '小鹏',
    '比亚迪', '大疆', '米哈游', '蚂蚁', '滴滴', '招商银行', '中国银行',
    '平安', '英特尔', '高通', 'Intel', 'IBM', '完美世界', '叠纸', '深信服', '金山',
    '联想', '新浪', '微博', '用友', '东方财富', '华泰证券', '厦门银行',
    '腾讯云智研发', '上海人工智能实验室', '万兴科技', '巨人网络'];

  if (tier1.some(name => company.name.includes(name))) {
    score += 15;
  } else if (tier2.some(name => company.name.includes(name))) {
    score += 10;
  } else {
    score += 5;
  }

  // Recency bonus based on record date
  const recordDate = extractRecordDate(company);
  if (recordDate) {
    const match = recordDate.match(/(\d{2})\.(\d{2})/);
    if (match) {
      const now = new Date();
      const rd = new Date(now.getFullYear(), parseInt(match[1]) - 1, parseInt(match[2]));
      const daysDiff = Math.floor((now.getTime() - rd.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 3) score += 20;
      else if (daysDiff <= 7) score += 15;
      else if (daysDiff <= 14) score += 10;
      else if (daysDiff <= 30) score += 5;
    }
  }

  // Active recruitment bonus
  if (company.end === 0) score += 5;

  // Has evaluation bonus
  if (company.companyEvaluation && company.companyEvaluation.length > 10) score += 3;

  // Career diversity bonus
  if (company.careerNameList && company.careerNameList.length > 5) score += 3;

  // Deterministic variety
  const hash = company.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  score += (hash % 5);

  return Math.min(score, 99);
}

// ─── Generate summary ────────────────────────────────────────────────
function generateSummary(company: NowcoderCompany, channel: Channel): string {
  const parts: string[] = [];

  if (company.companyEvaluation) {
    parts.push(company.companyEvaluation);
  }

  const statusLabel = extractStatusLabel(company);
  if (statusLabel) {
    parts.push(`招聘批次：${statusLabel}`);
  }

  if (company.cityList && company.cityList.length > 0) {
    parts.push(`工作地点：${company.cityList.join('、')}`);
  }

  if (company.careerNameList && company.careerNameList.length > 0) {
    const careers = company.careerNameList.slice(0, 5).join('、');
    const suffix = company.careerNameList.length > 5 ? '等' : '';
    parts.push(`招聘岗位：${careers}${suffix}`);
  }

  return parts.join('。') + '。';
}

// ─── Generate tags ───────────────────────────────────────────────────
function generateTags(company: NowcoderCompany, channel: Channel, category: Category): string[] {
  const tags: string[] = [company.name];

  if (channel === 'campus') tags.push('校招');
  else tags.push('实习');

  const batch = company.batchName || '';
  if (/提前批/.test(batch)) tags.push('提前批');
  if (/春招/.test(batch)) tags.push('春招');
  if (/秋招/.test(batch)) tags.push('秋招');
  if (/补录/.test(batch)) tags.push('补录');
  if (/暑期/.test(batch)) tags.push('暑期实习');
  if (/日常/.test(batch)) tags.push('日常实习');

  const catLabels: Record<string, string> = {
    internet: '互联网/AI',
    foreign: '外企',
    game: '游戏',
    auto_ic: '车企/IC',
    finance: '金融',
    security: '安全/云服务',
  };
  if (catLabels[category]) tags.push(catLabels[category]);

  // Add top 3 cities
  if (company.cityList) {
    tags.push(...company.cityList.slice(0, 3));
  }

  // Add top industries
  if (company.industryList) {
    tags.push(...company.industryList.slice(0, 2));
  }

  return [...new Set(tags)];
}

// ─── Build apply URL ─────────────────────────────────────────────────
function buildApplyUrl(company: NowcoderCompany): string {
  if (company.customWangshenLink) {
    return company.customWangshenLink.replace(/\\u002F/g, '/');
  }
  if (company.sourceInformation) {
    return company.sourceInformation.replace(/\\u002F/g, '/');
  }
  return `https://www.nowcoder.com/enterprise/${company.companyId}`;
}

// ─── Parse createdAt from record date or updateTime ──────────────────
function parseCreatedAt(company: NowcoderCompany): string {
  // Prefer the record date from card info
  const recordDate = extractRecordDate(company);
  if (recordDate) {
    const match = recordDate.match(/(\d{2})\.(\d{2})/);
    if (match) {
      const now = new Date();
      return new Date(now.getFullYear(), parseInt(match[1]) - 1, parseInt(match[2]), 10, 0, 0).toISOString();
    }
  }

  // Fallback to updateTime (milliseconds timestamp)
  if (company.updateTime) {
    return new Date(company.updateTime).toISOString();
  }

  return new Date().toISOString();
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  const SCHEDULE_URL = 'https://www.nowcoder.com/jobs/school/schedule';

  console.log('Fetching Nowcoder school schedule page...');

  const response = await fetch(SCHEDULE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  console.log(`Fetched ${html.length} bytes`);

  // Extract __INITIAL_STATE__ JSON
  // The JSON ends with `};` followed by an IIFE that removes the script tag
  // Extract the JSON between `__INITIAL_STATE__=` and `};(function()`
  // We avoid the `s` flag for TS compatibility; instead find by index
  const startMarker = 'window.__INITIAL_STATE__=';
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) {
    console.error('Could not find __INITIAL_STATE__ marker in HTML');
    writeOutput([]);
    return;
  }
  const jsonStart = startIdx + startMarker.length;
  // Find the closing `};(function()` pattern
  const endMarker = '};(function()';
  const endIdx = html.indexOf(endMarker, jsonStart);
  if (endIdx === -1) {
    console.error('Could not find end of __INITIAL_STATE__ JSON');
    writeOutput([]);
    return;
  }
  const jsonStr = html.substring(jsonStart, endIdx + 1); // +1 to include the `}`

  let state: any;
  try {
    // The JSON uses \u002F for forward slashes (handled natively by JSON.parse)
    state = JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse __INITIAL_STATE__ JSON:', e);
    writeOutput([]);
    return;
  }

  // Navigate to schedule data: app["120"].scheduleData.datas
  // The "120" key is the page/module ID for the schedule page
  const app120 = state?.app?.['120'];
  if (!app120) {
    console.error('Could not find app["120"] in state');
    console.log('Available app keys:', Object.keys(state?.app || {}));
    // Try alternative paths
    const altPaths = [state?.store?.['120'], state?.['120']];
    for (const alt of altPaths) {
      if (alt?.scheduleData?.datas) {
        console.log('Found data at alternative path');
        break;
      }
    }
    writeOutput([]);
    return;
  }

  const companies: NowcoderCompany[] = app120.scheduleData?.datas || [];
  console.log(`Found ${companies.length} companies in scheduleData`);

  if (companies.length === 0) {
    console.log('Warning: No companies found. Writing empty array.');
    writeOutput([]);
    return;
  }

  // Convert to FeedItems
  const feedItems: FeedItem[] = companies
    .filter(c => c.name && c.name.length > 0)
    .map((company, index) => {
      const channel = detectChannel(company);
      const category = detectCategory(company);
      const score = computeScore(company);
      const statusLabel = extractStatusLabel(company);

      return {
        id: `nowcoder-${company.companyId}`,
        title: `${company.name} — ${statusLabel}`,
        summary: generateSummary(company, channel),
        url: buildApplyUrl(company),
        source: '牛客网',
        sourceHandle: '@nowcoder',
        channel,
        category,
        tags: generateTags(company, channel, category),
        score,
        featured: score >= 80,
        createdAt: parseCreatedAt(company),
      };
    })
    .sort((a, b) => {
      // Sort by date desc, then score desc
      const dateCompare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.score - a.score;
    });

  writeOutput(feedItems);
}

// ─── Write output ────────────────────────────────────────────────────
function writeOutput(feedItems: FeedItem[]) {
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'nowcoder-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(feedItems, null, 2), 'utf-8');
  console.log(`\nWrote ${feedItems.length} items to ${outputPath}`);

  // Stats
  const channelStats = { campus: 0, intern: 0 };
  const categoryStats: Record<string, number> = {};

  feedItems.forEach(item => {
    if (item.channel === 'campus') channelStats.campus++;
    else channelStats.intern++;
    categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
  });

  console.log('\nStats:');
  console.log(`  Total: ${feedItems.length}`);
  console.log(`  Campus: ${channelStats.campus}, Intern: ${channelStats.intern}`);
  console.log(`  Categories:`, categoryStats);

  if (feedItems.length > 0) {
    console.log('\nSample items:');
    feedItems.slice(0, 5).forEach(item => {
      console.log(`  [${item.score}] ${item.title}`);
      console.log(`    ${item.channel}/${item.category} | Tags: ${item.tags.slice(0, 5).join(', ')}`);
    });
  }
}

main().catch(console.error);

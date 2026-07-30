/**
 * Parse DeepOffer.cn campus recruitment data.
 *
 * DeepOffer provides a public JSON API at /api/v1/jobs with 16K+ job listings.
 * API details:
 *   - GET https://deepoffer.cn/api/v1/jobs?page=N&page_size=50
 *   - Max page_size: 50
 *   - Returns: { code: 200, data: { total, items[] } }
 *   - Supports: job_type=campus (6900+), keyword search
 *
 * Data fields per item: id, title, job_type, company_name, company_type,
 *   industry, recruitment_type, work_location, apply_url, deadline,
 *   update_date, created_at, etc.
 *
 * Strategy: Fetch ALL pages (total/50 ≈ 335 pages), convert to FeedItem[],
 * merge with existing deepoffer-data.json to accumulate over time.
 *
 * Run: npx tsx scripts/parse-deepoffer.ts
 * Output: src/lib/deepoffer-data.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Category, Channel, CompanyType } from '../src/lib/types';
import { inferCompanyType } from './infer-company-type';

// ─── Raw types from DeepOffer API ────────────────────────────────────
interface DeepOfferJob {
  id: number;
  title: string;
  job_type: string;
  category_id: string | null;
  organization: string | null;
  company_name: string;
  company_type: string; // 民企, 央国企, 外企, 事业单位, 银行
  industry: string;
  recruitment_type: string | null; // 实习, 26届春招, etc.
  has_written_exam_exemption: boolean | null;
  positions: string | null;
  headcount: string | null;
  work_location: string;
  location_province: string | null;
  location_city: string;
  location_district: string | null;
  education_required: string | null;
  major_required: string | null;
  salary_range: string | null;
  benefits: string | null;
  description: string | null;
  requirements: string | null;
  apply_url: string;
  announcement_url: string | null;
  source_url: string | null;
  source_name: string | null;
  deadline: string | null;
  apply_start_date: string | null;
  apply_end_date: string | null;
  exam_date: string | null;
  update_date: string; // "2026-05-09"
  status: number;
  view_count: number;
  created_at: string; // "2026-05-09T18:19:34"
  updated_at: string;
  company: string;
  location: string;
}

interface DeepOfferResponse {
  code: number;
  message: string;
  data: {
    total: number;
    items: DeepOfferJob[];
  };
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
  companyType?: CompanyType;
  location?: string;
  deadline?: string;
  tags: string[];
  score: number;
  featured?: boolean;
  createdAt: string;
}

const PAGE_SIZE = 50; // API always returns max 50 regardless of requested size
const MAX_FETCH_PAGES = 10; // Daily runs: fetch latest 10 pages (500 items), merge with existing
                          // Data accumulates across builds via merge with existing JSON
const RETRY_DELAY = 5000;
const MAX_RETRIES = 6;
const REQUEST_DELAY = 2000; // Delay between sequential requests (2s to avoid 429)
const RATE_LIMIT_COOLDOWN = 15000; // 15s cooldown when hitting rate limit

// ─── Category detection ──────────────────────────────────────────────
function detectCategory(job: DeepOfferJob): Category {
  const text = [
    job.company_name,
    job.industry,
    job.title,
    job.positions,
  ].filter(Boolean).join(' ');

  if (/游戏|Game|电竞/.test(text)) return 'game';
  if (/银行|证券|基金|保险|金融|投资|财富|信托|期货|交易所|会计|审计/.test(text)) return 'finance';
  if (/汽车|车企|新能源|芯片|IC|半导体|通信|电子|硬件|机械|制造|军工|航天|航空/.test(text)) return 'auto_ic';
  if (/信息安全|网络安全|安全|云/.test(text)) return 'security';

  // Foreign company detection
  if (job.company_type === '外企') return 'foreign';

  if (/互联网|AI|人工智能|科技|软件|数据|算法|平台|电商|视频|直播|社交|工具|企业服务|IT/.test(text)) return 'internet';

  return 'other';
}

// ─── Channel detection ───────────────────────────────────────────────
function detectChannel(job: DeepOfferJob): Channel {
  const text = [
    job.recruitment_type,
    job.title,
    job.job_type,
  ].filter(Boolean).join(' ');

  if (/实习|intern/i.test(text)) return 'intern';
  return 'campus';
}

// ─── Score computation ───────────────────────────────────────────────
function computeScore(job: DeepOfferJob): number {
  let score = 50;

  // Tier 1 companies
  const tier1 = [
    '字节跳动', '腾讯', '阿里巴巴', '美团', '百度', '华为', '小米', '京东', '拼多多',
    'Google', 'Microsoft', '微软', '苹果', 'Apple', 'Amazon', 'Meta', 'NVIDIA', 'OpenAI',
  ];
  const tier2 = [
    '网易', '快手', '小红书', '哔哩哔哩', '携程', '蔚来', '理想', '小鹏',
    '比亚迪', '大疆', '米哈游', '蚂蚁', '滴滴', '招商银行', '中国银行',
    '平安', '英特尔', '高通', 'Intel', 'IBM', '完美世界', '叠纸', '深信服', '金山',
    '联想', '新浪', '微博', '用友', '东方财富', '华泰证券', '中信', '国泰君安',
    '三星', 'Samsung', '索尼', 'Sony', '博世', 'Bosch', '西门子', 'Siemens',
    '宝洁', 'P&G', '联合利华', '欧莱雅', '强生', '辉瑞',
  ];

  if (tier1.some(name => job.company_name.includes(name))) {
    score += 15;
  } else if (tier2.some(name => job.company_name.includes(name))) {
    score += 10;
  } else if (job.company_type === '央国企' || job.company_type === '外企') {
    score += 7;
  } else {
    score += 3;
  }

  // Recency bonus
  if (job.update_date) {
    const updateDate = new Date(job.update_date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 3) score += 20;
    else if (daysDiff <= 7) score += 15;
    else if (daysDiff <= 14) score += 10;
    else if (daysDiff <= 30) score += 5;
  }

  // Active status bonus
  if (job.status === 1) score += 3;

  // Has salary info bonus
  if (job.salary_range) score += 2;

  // Has headcount info bonus
  if (job.headcount) score += 1;

  // Deterministic variety
  const hash = job.company_name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  score += (hash % 5);

  return Math.min(score, 99);
}

// ─── Generate summary ────────────────────────────────────────────────
function generateSummary(job: DeepOfferJob): string {
  const parts: string[] = [];

  if (job.recruitment_type) {
    parts.push(`招聘类型：${job.recruitment_type}`);
  }

  if (job.industry) {
    parts.push(`行业：${job.industry}`);
  }

  if (job.company_type) {
    parts.push(`企业性质：${job.company_type}`);
  }

  if (job.work_location && job.work_location !== '全国多地') {
    parts.push(`工作地点：${job.work_location}`);
  } else if (job.location_city) {
    parts.push(`工作地点：${job.location_city}`);
  }

  if (job.salary_range) {
    parts.push(`薪资：${job.salary_range}`);
  }

  if (job.deadline && job.deadline !== '尽快投递') {
    parts.push(`截止日期：${job.deadline}`);
  }

  if (job.positions) {
    // Truncate long position lists
    const posText = job.positions.length > 80
      ? job.positions.substring(0, 77) + '...'
      : job.positions;
    parts.push(`岗位：${posText}`);
  }

  return parts.join('。') + (parts.length > 0 ? '。' : '');
}

// ─── Generate tags ───────────────────────────────────────────────────
function generateTags(job: DeepOfferJob, channel: Channel, category: Category): string[] {
  const tags: string[] = [job.company_name];

  if (channel === 'campus') tags.push('校招');
  else tags.push('实习');

  // Recruitment type tags
  const rt = job.recruitment_type || '';
  if (/提前批/.test(rt)) tags.push('提前批');
  if (/春招/.test(rt)) tags.push('春招');
  if (/秋招/.test(rt)) tags.push('秋招');
  if (/补录/.test(rt)) tags.push('补录');
  if (/暑期/.test(rt)) tags.push('暑期实习');
  if (/日常/.test(rt)) tags.push('日常实习');

  // Category label
  const catLabels: Record<string, string> = {
    internet: '互联网/AI',
    foreign: '外企',
    game: '游戏',
    auto_ic: '车企/IC',
    finance: '金融',
    security: '安全/云服务',
  };
  if (catLabels[category]) tags.push(catLabels[category]);

  // Company type
  if (job.company_type && job.company_type !== '民企') {
    tags.push(job.company_type);
  }

  // Industry
  if (job.industry) {
    tags.push(job.industry);
  }

  // Location
  if (job.location_city && job.location_city !== '全国多地') {
    // Split multi-city locations
    const cities = job.location_city.split(/[,，、/]/).slice(0, 3);
    tags.push(...cities.map(c => c.trim()).filter(Boolean));
  }

  return [...new Set(tags)];
}

// ─── Build URL ───────────────────────────────────────────────────────
function buildUrl(job: DeepOfferJob): string {
  return job.apply_url || job.announcement_url || job.source_url || `https://deepoffer.cn/jobs/${job.id}`;
}

// ─── Fetch with retry and rate-limit handling ───────────────────────
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<DeepOfferResponse | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      if (resp.status === 429) {
        // Rate limited — use exponential backoff with longer cooldown
        const waitTime = RATE_LIMIT_COOLDOWN * attempt;
        console.log(`\n  Rate limited (429). Waiting ${waitTime / 1000}s before retry ${attempt}/${retries}...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }

      const data = await resp.json() as DeepOfferResponse;
      if (data.code !== 200) {
        throw new Error(`API error: ${data.message}`);
      }

      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('429')) {
        // Already handled above, but just in case
        const waitTime = RATE_LIMIT_COOLDOWN * attempt;
        console.log(`\n  Rate limited. Waiting ${waitTime / 1000}s...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      if (attempt === retries) {
        console.log(`\n  Failed after ${retries} attempts: ${url}`);
        return null; // Return null instead of throwing — we'll skip this page
      }
      console.log(`\n  Retry ${attempt}/${retries}: ${errorMessage}`);
      await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
    }
  }
  return null;
}

// ─── Fetch all pages sequentially with rate-limit awareness ──────────
async function fetchAllJobs(): Promise<DeepOfferJob[]> {
  // First request to get total count
  console.log('Fetching page 1 to get total count...');
  const firstPage = await fetchWithRetry(
    `https://deepoffer.cn/api/v1/jobs?page=1&page_size=${PAGE_SIZE}`
  );

  if (!firstPage) {
    console.error('Failed to fetch first page');
    return [];
  }

  const total = firstPage.data.total;
  const totalPages = Math.min(Math.ceil(total / PAGE_SIZE), MAX_FETCH_PAGES);
  console.log(`Total available: ${total} jobs. Fetching first ${totalPages} pages (${totalPages * PAGE_SIZE} items) this run.`);

  const allJobs: DeepOfferJob[] = [...firstPage.data.items];
  let failedPages = 0;

  // Fetch remaining pages sequentially
  for (let page = 2; page <= totalPages; page++) {
    const progress = Math.round(((page - 1) / (totalPages - 1)) * 100);
    process.stdout.write(`\r  Page ${page}/${totalPages} (${progress}%) — ${allJobs.length} jobs collected`);

    const result = await fetchWithRetry(
      `https://deepoffer.cn/api/v1/jobs?page=${page}&page_size=${PAGE_SIZE}`
    );

    if (result?.data?.items) {
      allJobs.push(...result.data.items);
    } else {
      failedPages++;
      // If too many consecutive failures, stop
      if (failedPages > 10) {
        console.log(`\n  Too many failures (${failedPages}), stopping at page ${page}`);
        break;
      }
    }

    // Delay between requests
    await new Promise(r => setTimeout(r, REQUEST_DELAY));
  }

  console.log(`\n  Fetched ${allJobs.length} jobs total (${failedPages} failed pages)`);
  return allJobs;
}

// ─── Convert to FeedItem ─────────────────────────────────────────────
function convertToFeedItem(job: DeepOfferJob): FeedItem {
  const channel = detectChannel(job);
  const category = detectCategory(job);
  const score = computeScore(job);

  // Build title: "公司名 — 招聘类型/岗位概要"
  let titleSuffix = job.recruitment_type || '';
  if (job.positions) {
    // Use positions if short enough, otherwise use recruitment_type
    const posShort = job.positions.length > 40
      ? job.positions.substring(0, 37) + '...'
      : job.positions;
    titleSuffix = titleSuffix ? `${titleSuffix} | ${posShort}` : posShort;
  }
  const title = titleSuffix
    ? `${job.company_name} — ${titleSuffix}`
    : job.company_name;

  // Map company_type to CompanyType enum
  const companyTypeMap: Record<string, CompanyType> = {
    '外企': 'foreign',
    '央国企': 'state',
    '民企': 'private',
    '银行': 'bank',
    '事业单位': 'institution',
    '合资': 'foreign',
    '上市公司': 'private',
  };
  const companyType = companyTypeMap[job.company_type] || inferCompanyType(job.company_name);

  // Extract location
  const location = job.location_city && job.location_city !== '全国多地'
    ? job.location_city
    : job.work_location || undefined;

  // Extract deadline
  const deadline = job.deadline || job.apply_end_date || undefined;

  return {
    id: `deepoffer-${job.id}`,
    title,
    summary: generateSummary(job),
    url: buildUrl(job),
    source: 'DeepOffer',
    sourceHandle: '@deepoffer',
    channel,
    category,
    companyType,
    location,
    deadline,
    tags: generateTags(job, channel, category),
    score,
    featured: score >= 80,
    createdAt: job.created_at
      ? new Date(job.created_at).toISOString()
      : new Date(job.update_date).toISOString(),
  };
}

// ─── Merge with existing data ────────────────────────────────────────
function mergeWithExisting(newItems: FeedItem[]): FeedItem[] {
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'deepoffer-data.json');

  let existing: FeedItem[] = [];
  try {
    if (fs.existsSync(outputPath)) {
      existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      console.log(`Loaded ${existing.length} existing items from deepoffer-data.json`);
    }
  } catch {
    console.log('No existing data or parse error, starting fresh');
  }

  // Merge: new items override existing ones with the same id
  const merged = new Map<string, FeedItem>();
  for (const item of existing) {
    merged.set(item.id, item);
  }

  let newCount = 0;
  let updatedCount = 0;
  for (const item of newItems) {
    if (!merged.has(item.id)) newCount++;
    else updatedCount++;
    merged.set(item.id, item);
  }

  console.log(`Merge result: ${newCount} new, ${updatedCount} updated, ${merged.size} total`);

    // Only keep items from 2026-06-01 onwards
  const cutoff = new Date('2026-06-01T00:00:00Z');
  const pruned = [...merged.values()].filter(item => new Date(item.createdAt) >= cutoff);
  const prunedCount = merged.size - pruned.length;
  if (prunedCount > 0) {
    console.log(`Pruned ${prunedCount} items before 2026-06-01`);
  }

  // Sort by date desc, then score desc
  return pruned.sort((a, b) => {
    const dateCompare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (dateCompare !== 0) return dateCompare;
    return b.score - a.score;
  });
}

// ─── Write output ────────────────────────────────────────────────────
function writeOutput(feedItems: FeedItem[]) {
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'deepoffer-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(feedItems, null, 2), 'utf-8');
  console.log(`\nWrote ${feedItems.length} items to ${outputPath}`);

  // Stats
  const channelStats = { campus: 0, intern: 0 };
  const categoryStats: Record<string, number> = {};
  const companyTypeStats: Record<string, number> = {};

  feedItems.forEach(item => {
    if (item.channel === 'campus') channelStats.campus++;
    else channelStats.intern++;
    categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    // Extract company type from tags
    for (const tag of item.tags) {
      if (['央国企', '外企', '事业单位', '银行'].includes(tag)) {
        companyTypeStats[tag] = (companyTypeStats[tag] || 0) + 1;
      }
    }
  });

  console.log('\nStats:');
  console.log(`  Total: ${feedItems.length}`);
  console.log(`  Campus: ${channelStats.campus}, Intern: ${channelStats.intern}`);
  console.log(`  Categories:`, categoryStats);
  console.log(`  Company types:`, companyTypeStats);

  // Date range
  if (feedItems.length > 0) {
    const dates = feedItems.map(i => i.createdAt).sort();
    console.log(`  Date range: ${dates[0].substring(0, 10)} to ${dates[dates.length - 1].substring(0, 10)}`);
  }

  if (feedItems.length > 0) {
    console.log('\nSample items:');
    feedItems.slice(0, 5).forEach(item => {
      console.log(`  [${item.score}] ${item.title}`);
      console.log(`    ${item.channel}/${item.category} | ${item.source}`);
    });
  }
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('=== DeepOffer Data Fetcher ===\n');

  const startTime = Date.now();

  // Fetch all jobs from API
  const jobs = await fetchAllJobs();

  // Deduplicate by id (API might return duplicates across pages)
  const uniqueJobs = new Map<number, DeepOfferJob>();
  for (const job of jobs) {
    uniqueJobs.set(job.id, job);
  }
  console.log(`Unique jobs after dedup: ${uniqueJobs.size}`);

  // Convert to FeedItems
  const feedItems = [...uniqueJobs.values()]
    .filter(job => job.company_name && job.title)
    .map(convertToFeedItem);

  console.log(`Converted ${feedItems.length} items to FeedItem format`);

  // Merge with existing data
  const mergedItems = mergeWithExisting(feedItems);

  // Write output
  writeOutput(mergedItems);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s`);
}

main().catch(console.error);

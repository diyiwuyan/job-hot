/**
 * Parse 国聘 (iguopin.com) campus recruitment data.
 *
 * 国聘 is the official state-owned enterprise recruitment platform (国资委).
 * API: POST https://gp-api.iguopin.com/api/jobs/v1/list
 *   - page_size max: 200
 *   - nature: ["115xW5oQ"] for campus recruitment
 *   - Subsite header: "cujiuye"
 *   - No auth required
 *
 * Run: npx tsx scripts/parse-guopin.ts
 * Output: src/lib/guopin-data.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Category, Channel } from '../src/lib/types';

// ─── Raw types from 国聘 API ────────────────────────────────────────
interface GuopinJob {
  job_id: string;
  job_name: string;
  company_id: string;
  company_name: string;
  recruitment_type_cn: string;
  nature_cn: string;
  category_cn: string;
  amount: number | null;
  min_wage: number;
  max_wage: number;
  wage_unit_cn: string;
  is_negotiable: boolean;
  education_cn: string;
  experience_cn: string;
  is_graduates: boolean;
  department_cn: string;
  start_time: string;
  end_time: string;
  district_list: Array<{
    area_code: string;
    area_cn: string;
    address: string;
  }>;
  contents: string | null;
  company_info: {
    name: string;
    nature_cn: string;
    industry_cn: string;
    scale_cn: string;
    logo: string;
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
  tags: string[];
  score: number;
  featured?: boolean;
  createdAt: string;
}

const PAGE_SIZE = 200;
const MAX_PAGES = 10; // Daily runs: fetch latest 10 pages, merge with existing
const REQUEST_DELAY = 500;
const RETRY_DELAY = 3000;
const MAX_RETRIES = 4;

const API_URL = 'https://gp-api.iguopin.com/api/jobs/v1/list';
const HEADERS = {
  'Content-Type': 'application/json;charset=UTF-8',
  'Accept': 'application/json',
  'Device': 'pc',
  'Subsite': 'cujiuye',
  'Version': '5.0.0',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

// ─── Category detection ──────────────────────────────────────────────
function detectCategory(job: GuopinJob): Category {
  const text = [
    job.company_name,
    job.company_info?.industry_cn,
    job.job_name,
    job.category_cn,
  ].filter(Boolean).join(' ');

  if (/游戏|Game/.test(text)) return 'game';
  if (/银行|证券|基金|保险|金融|投资|信托|期货|会计|审计/.test(text)) return 'finance';
  if (/汽车|新能源车|芯片|半导体|通信|电子|机械|制造|军工|航天|航空|船舶|兵器|核|电力|能源|石油|钢铁|化工|铁路/.test(text)) return 'auto_ic';
  if (/安全|网络安全|信息安全/.test(text)) return 'security';
  if (/外资|外企/.test(job.company_info?.nature_cn || '')) return 'foreign';
  if (/互联网|AI|人工智能|科技|软件|数据|算法|电商|信息技术|计算机/.test(text)) return 'internet';

  return 'other';
}

// ─── Channel detection ───────────────────────────────────────────────
function detectChannel(job: GuopinJob): Channel {
  const text = [job.nature_cn, job.recruitment_type_cn, job.job_name].join(' ');
  if (/实习|intern/i.test(text)) return 'intern';
  return 'campus';
}

// ─── Score computation ───────────────────────────────────────────────
function computeScore(job: GuopinJob): number {
  let score = 55;

  // 央企/国企 bonus (国聘主要是国企)
  const companyNature = job.company_info?.nature_cn || '';
  if (/央企|中央/.test(companyNature)) score += 10;
  else if (/国企/.test(companyNature)) score += 8;

  // Well-known SOEs
  const tier1SOE = [
    '中国石油', '中国石化', '国家电网', '中国移动', '中国电信', '中国联通',
    '中国建筑', '中国中车', '中国航天', '中国航空', '中国船舶', '中国兵器',
    '中国电子', '中国华能', '中国大唐', '中国核工业', '中国铁路', '中国邮政',
    '招商局', '华润', '中粮', '中国中信', '国家开发银行', '中国进出口银行',
    '中国农业发展银行', '中国工商银行', '中国建设银行', '中国农业银行', '中国银行',
  ];
  if (tier1SOE.some(name => job.company_name.includes(name))) {
    score += 8;
  }

  // Recency bonus
  if (job.start_time) {
    const startDate = new Date(job.start_time);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) score += 15;
    else if (daysDiff <= 14) score += 10;
    else if (daysDiff <= 30) score += 5;
  }

  // Has salary info
  if (job.min_wage > 0 || job.max_wage > 0) score += 3;

  // Has headcount
  if (job.amount && job.amount > 0) score += 2;

  // Deterministic variety
  const hash = job.job_name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  score += (hash % 5);

  return Math.min(score, 99);
}

// ─── Generate summary ────────────────────────────────────────────────
function generateSummary(job: GuopinJob): string {
  const parts: string[] = [];

  if (job.company_info?.nature_cn) parts.push(`企业性质：${job.company_info.nature_cn}`);
  if (job.company_info?.industry_cn) parts.push(`行业：${job.company_info.industry_cn}`);

  const locations = job.district_list?.map(d => d.area_cn).filter(Boolean);
  if (locations?.length) parts.push(`工作地点：${locations.slice(0, 3).join('、')}`);

  if (job.min_wage > 0 || job.max_wage > 0) {
    parts.push(`薪资：${job.min_wage}-${job.max_wage}${job.wage_unit_cn}`);
  } else if (job.is_negotiable) {
    parts.push('薪资面议');
  }

  if (job.education_cn) parts.push(`学历：${job.education_cn}`);
  if (job.company_info?.scale_cn) parts.push(`规模：${job.company_info.scale_cn}`);

  return parts.join('。') + (parts.length > 0 ? '。' : '');
}

// ─── Generate tags ───────────────────────────────────────────────────
function generateTags(job: GuopinJob, channel: Channel, category: Category): string[] {
  const tags: string[] = [job.company_name];

  tags.push(channel === 'campus' ? '校招' : '实习');
  tags.push('国企');

  const catLabels: Record<string, string> = {
    internet: '互联网/AI', foreign: '外企', game: '游戏',
    auto_ic: '车企/IC', finance: '金融', security: '安全/云服务',
  };
  if (catLabels[category]) tags.push(catLabels[category]);

  if (job.company_info?.industry_cn) tags.push(job.company_info.industry_cn);

  const locations = job.district_list?.map(d => {
    const city = d.area_cn?.split('-')[0];
    return city;
  }).filter(Boolean);
  if (locations?.length) tags.push(...locations.slice(0, 3));

  return [...new Set(tags)];
}

// ─── Fetch with retry ────────────────────────────────────────────────
async function fetchPage(page: number): Promise<GuopinJob[]> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          page,
          page_size: PAGE_SIZE,
          nature: ['115xW5oQ'], // 校招
        }),
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = await resp.json() as { code: number; data: { list: GuopinJob[] } };
      if (data.code !== 200) throw new Error(`API code: ${data.code}`);

      return data.data?.list || [];
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.log(`\n  Failed page ${page} after ${MAX_RETRIES} attempts: ${err}`);
        return [];
      }
      console.log(`\n  Retry ${attempt}/${MAX_RETRIES} page ${page}: ${err}`);
      await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
    }
  }
  return [];
}

// ─── Fetch all jobs ──────────────────────────────────────────────────
async function fetchAllJobs(): Promise<GuopinJob[]> {
  console.log('Fetching page 1...');
  const firstPage = await fetchPage(1);
  console.log(`Page 1: ${firstPage.length} jobs`);

  if (firstPage.length === 0) return [];

  const allJobs: GuopinJob[] = [...firstPage];

  // Keep fetching until we get an empty page or hit max
  for (let page = 2; page <= MAX_PAGES; page++) {
    await new Promise(r => setTimeout(r, REQUEST_DELAY));
    process.stdout.write(`\r  Page ${page}: `);

    const jobs = await fetchPage(page);
    process.stdout.write(`${jobs.length} jobs (total: ${allJobs.length + jobs.length})`);

    if (jobs.length === 0) {
      console.log('\n  No more data, stopping.');
      break;
    }

    allJobs.push(...jobs);
  }

  console.log(`\n  Fetched ${allJobs.length} jobs total`);
  return allJobs;
}

// ─── Convert to FeedItem ─────────────────────────────────────────────
function convertToFeedItem(job: GuopinJob): FeedItem {
  const channel = detectChannel(job);
  const category = detectCategory(job);
  const score = computeScore(job);

  return {
    id: `guopin-${job.job_id}`,
    title: `${job.company_name} — ${job.job_name}`,
    summary: generateSummary(job),
    url: `https://www.iguopin.com/job/detail?id=${job.job_id}`,
    source: '国聘',
    sourceHandle: '@guopin',
    channel,
    category,
    tags: generateTags(job, channel, category),
    score,
    featured: score >= 80,
    createdAt: job.start_time
      ? new Date(job.start_time).toISOString()
      : new Date().toISOString(),
  };
}

// ─── Merge with existing data ────────────────────────────────────────
function mergeWithExisting(newItems: FeedItem[]): FeedItem[] {
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'guopin-data.json');

  let existing: FeedItem[] = [];
  try {
    if (fs.existsSync(outputPath)) {
      existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      console.log(`Loaded ${existing.length} existing items from guopin-data.json`);
    }
  } catch {
    console.log('No existing data, starting fresh');
  }

  const merged = new Map<string, FeedItem>();
  for (const item of existing) merged.set(item.id, item);

  let newCount = 0, updatedCount = 0;
  for (const item of newItems) {
    if (!merged.has(item.id)) newCount++;
    else updatedCount++;
    merged.set(item.id, item);
  }
  console.log(`Merge: ${newCount} new, ${updatedCount} updated, ${merged.size} total`);

    // Only keep items from 2026-01-01 onwards
  const cutoff = new Date('2026-01-01T00:00:00Z');
  const pruned = [...merged.values()].filter(item => new Date(item.createdAt) >= cutoff);
  const prunedCount = merged.size - pruned.length;
  if (prunedCount > 0) {
    console.log(`Pruned ${prunedCount} items before 2026-01-01`);
  }

  return pruned.sort((a, b) => {
    const d = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return d !== 0 ? d : b.score - a.score;
  });
}

// ─── Write output ────────────────────────────────────────────────────
function writeOutput(items: FeedItem[]) {
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'guopin-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`\nWrote ${items.length} items to guopin-data.json`);

  if (items.length > 0) {
    const cats: Record<string, number> = {};
    items.forEach(i => { cats[i.category] = (cats[i.category] || 0) + 1; });
    console.log('Categories:', cats);
    console.log('Sample:');
    items.slice(0, 3).forEach(i => console.log(`  [${i.score}] ${i.title}`));
  }
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('=== 国聘 Data Fetcher ===\n');
  const start = Date.now();

  const jobs = await fetchAllJobs();

  const unique = new Map<string, GuopinJob>();
  for (const j of jobs) unique.set(j.job_id, j);
  console.log(`Unique jobs: ${unique.size}`);

  const feedItems = [...unique.values()]
    .filter(j => j.company_name && j.job_name)
    .map(convertToFeedItem);

  const merged = mergeWithExisting(feedItems);
  writeOutput(merged);

  console.log(`\nDone in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

main().catch(console.error);


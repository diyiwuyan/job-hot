/**
 * Parse 应届生求职网 (yingjiesheng.com) career fair (宣讲会) data.
 *
 * The xuanjianghui page is pure SSR HTML (GBK encoded) with a table of
 * upcoming campus career fairs. ~36 pages, ~25 items per page ≈ 900 items.
 *
 * URL: https://my.yingjiesheng.com/index.php/personal/xjhinfo.htm/?page=N
 * Encoding: GBK (must decode with TextDecoder('gbk'))
 *
 * Run: npx tsx scripts/parse-yingjiesheng.ts
 * Output: src/lib/yingjiesheng-data.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Category, Channel } from '../src/lib/types';

interface FeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceHandle?: string;
  channel: Channel;
  category: Category;
  location?: string;
  deadline?: string;
  tags: string[];
  score: number;
  featured?: boolean;
  createdAt: string;
}

interface XuanjianghuiItem {
  city: string;
  date: string;       // "2026-05-11(周一)"
  company: string;
  school: string;
  location: string;
  detailUrl: string;   // "/xjh-006-262-131.html"
}

const MAX_PAGES = 20; // Daily runs: fetch latest 20 pages (~500 items), merge with existing
const REQUEST_DELAY = 400;
const MAX_RETRIES = 3;
const BASE_URL = 'https://my.yingjiesheng.com';

// ─── Fetch with GBK decoding ────────────────────────────────────────
async function fetchGBK(url: string): Promise<string | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buf = await resp.arrayBuffer();
      return new TextDecoder('gbk').decode(buf);
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.log(`\n  Failed ${url}: ${err}`);
        return null;
      }
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  return null;
}

// ─── Parse HTML table rows ───────────────────────────────────────────
function parseTableRows(html: string): XuanjianghuiItem[] {
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  const items: XuanjianghuiItem[] = [];

  // Skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length < 6) continue;

    const extractText = (cell: string | undefined) => (cell || '').replace(/<[^>]+>/g, '').trim();
    const extractHref = (cell: string | undefined) => (cell || '').match(/href="([^"]+)"/)?.[1] || '';

    const city = extractText(cells[0]);
    const date = extractText(cells[1]);
    const company = extractText(cells[3]);
    const companyHref = extractHref(cells[3]);
    const school = extractText(cells[4]);
    const location = extractText(cells[5]);

    // Skip rows with missing essential data
    if (!date || !school) continue;

    items.push({
      city,
      date,
      company: company || '（多家企业）',
      school,
      location,
      detailUrl: companyHref || extractHref(cells[6]),
    });
  }

  return items;
}

// ─── Parse date string ───────────────────────────────────────────────
/**
 * Convert event date to createdAt.
 * The date from the page is the career fair date (宣讲会举办日期),
 * which may be in the future. For the feed timeline we cap it at "today"
 * so future events appear under today's date rather than a future date.
 */
function parseDateToISO(dateStr: string): string {
  const match = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
  if (match) {
    const eventDate = new Date(match[1] + 'T09:00:00+08:00');
    const now = new Date();
    // Cap at today — future events show under today's date
    if (eventDate.getTime() > now.getTime()) {
      return now.toISOString();
    }
    return eventDate.toISOString();
  }
  return new Date().toISOString();
}

// ─── Category detection ──────────────────────────────────────────────
function detectCategory(item: XuanjianghuiItem): Category {
  const text = item.company + ' ' + item.school;

  if (/游戏|Game/.test(text)) return 'game';
  if (/银行|证券|基金|保险|金融|投资|信托|会计/.test(text)) return 'finance';
  if (/汽车|芯片|半导体|通信|电子|机械|制造|军工|航天|航空|船舶|电力|能源|石油|钢铁|化工/.test(text)) return 'auto_ic';
  if (/安全|网络安全/.test(text)) return 'security';
  if (/外资|外企/.test(text)) return 'foreign';
  if (/互联网|AI|科技|软件|数据|算法|电商|信息/.test(text)) return 'internet';

  return 'other';
}

// ─── Score computation ───────────────────────────────────────────────
function computeScore(item: XuanjianghuiItem): number {
  let score = 55;

  // Well-known companies
  const tier1 = [
    '华为', '中兴', '比亚迪', '大疆', '腾讯', '阿里', '字节', '百度', '美团',
    '中国移动', '中国电信', '中国联通', '国家电网', '中国石油', '中国石化',
    '中国建筑', '中国中车', '中国航天', '中国银行', '工商银行', '建设银行',
  ];
  const tier2 = [
    '小米', '京东', '网易', '快手', '小红书', '招商银行', '平安', '格力',
    '美的', '海尔', '联想', '中芯', '长江存储', '紫光', '宁德时代',
  ];

  if (tier1.some(n => item.company.includes(n))) score += 12;
  else if (tier2.some(n => item.company.includes(n))) score += 8;
  else score += 3;

  // Recency bonus
  const dateMatch = item.date.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    const eventDate = new Date(dateMatch[1]);
    const now = new Date();
    const daysDiff = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    // Future events get higher scores
    if (daysDiff >= 0 && daysDiff <= 3) score += 20;
    else if (daysDiff >= 0 && daysDiff <= 7) score += 15;
    else if (daysDiff >= 0) score += 10;
    // Recent past events
    else if (daysDiff >= -3) score += 12;
    else if (daysDiff >= -7) score += 8;
    else if (daysDiff >= -30) score += 3;
  }

  // Top university bonus
  const top = ['清华', '北大', '浙大', '复旦', '上交', '中科大', '南大', '哈工大', '西交', '华科', '武大', '同济'];
  if (top.some(n => item.school.includes(n))) score += 5;

  // Deterministic variety
  const hash = (item.company + item.school).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  score += (hash % 5);

  return Math.min(score, 99);
}

// ─── Generate tags ───────────────────────────────────────────────────
function generateTags(item: XuanjianghuiItem, category: Category): string[] {
  const tags: string[] = ['宣讲会', '校招'];

  if (item.company) tags.push(item.company);
  if (item.school) tags.push(item.school);
  if (item.city) tags.push(item.city);

  const catLabels: Record<string, string> = {
    internet: '互联网/AI', foreign: '外企', game: '游戏',
    auto_ic: '车企/IC', finance: '金融', security: '安全/云服务',
  };
  if (catLabels[category]) tags.push(catLabels[category]);

  return [...new Set(tags)];
}

// ─── Fetch all pages ─────────────────────────────────────────────────
async function fetchAllItems(): Promise<XuanjianghuiItem[]> {
  const allItems: XuanjianghuiItem[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1
      ? `${BASE_URL}/xuanjianghui.html`
      : `${BASE_URL}/index.php/personal/xjhinfo.htm/?page=${page}&city=0&province=0`;

    process.stdout.write(`\r  Page ${page}: `);
    const html = await fetchGBK(url);

    if (!html) {
      console.log('failed, stopping');
      break;
    }

    const items = parseTableRows(html);
    process.stdout.write(`${items.length} items (total: ${allItems.length + items.length})`);

    if (items.length === 0) {
      console.log('\n  No more data, stopping.');
      break;
    }

    allItems.push(...items);
    await new Promise(r => setTimeout(r, REQUEST_DELAY));
  }

  console.log(`\n  Fetched ${allItems.length} items total`);
  return allItems;
}

// ─── Convert to FeedItem ─────────────────────────────────────────────
function convertToFeedItem(item: XuanjianghuiItem, index: number): FeedItem {
  const category = detectCategory(item);
  const score = computeScore(item);

  // Build a unique ID from company + school + date
  const idBase = `${item.company}-${item.school}-${item.date}`.replace(/[^a-zA-Z0-9\u4e00-\u9fff-]/g, '');
  const hash = idBase.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const id = `yjs-${Math.abs(hash).toString(36)}`;

  const dateStr = item.date.replace(/\(.*\)/, '').trim();
  const title = item.company
    ? `${item.company} 宣讲会 — ${item.school}`
    : `校园宣讲会 — ${item.school}`;

  const summaryParts = [];
  if (item.city) summaryParts.push(`城市：${item.city}`);
  summaryParts.push(`时间：${item.date}`);
  if (item.location) summaryParts.push(`地点：${item.location}`);
  summaryParts.push(`学校：${item.school}`);

  // Extract location (city from the career fair listing)
  const location = item.city || undefined;

  // Extract deadline (event date as the deadline — after this date the event has passed)
  const dateMatch = item.date.match(/(\d{4}-\d{2}-\d{2})/);
  const deadline = dateMatch ? dateMatch[1].replace(/-/g, '/') : undefined;

  return {
    id,
    title,
    summary: summaryParts.join('。') + '。',
    url: item.detailUrl
      ? `${BASE_URL}${item.detailUrl}`
      : `${BASE_URL}/xuanjianghui.html`,
    source: '应届生求职网',
    sourceHandle: '@yingjiesheng',
    channel: 'campus' as Channel,
    category,
    location,
    deadline,
    tags: generateTags(item, category),
    score,
    featured: score >= 80,
    createdAt: parseDateToISO(item.date),
  };
}

// ─── Merge with existing data ────────────────────────────────────────
function mergeWithExisting(newItems: FeedItem[]): FeedItem[] {
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'yingjiesheng-data.json');

  let existing: FeedItem[] = [];
  try {
    if (fs.existsSync(outputPath)) {
      existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      console.log(`Loaded ${existing.length} existing items`);
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
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'yingjiesheng-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`\nWrote ${items.length} items to yingjiesheng-data.json`);

  if (items.length > 0) {
    const cities: Record<string, number> = {};
    items.forEach(i => {
      const city = i.tags.find(t => !['宣讲会', '校招'].includes(t) && !t.includes('/'));
      if (city) cities[city] = (cities[city] || 0) + 1;
    });
    console.log('Top cities:', Object.entries(cities).sort((a, b) => b[1] - a[1]).slice(0, 5));
    console.log('Sample:');
    items.slice(0, 3).forEach(i => console.log(`  [${i.score}] ${i.title}`));
  }
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('=== 应届生求职网 Data Fetcher ===\n');
  const start = Date.now();

  const rawItems = await fetchAllItems();

  const feedItems = rawItems.map((item, i) => convertToFeedItem(item, i));
  console.log(`Converted ${feedItems.length} items`);

  const merged = mergeWithExisting(feedItems);
  writeOutput(merged);

  console.log(`\nDone in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

main().catch(console.error);

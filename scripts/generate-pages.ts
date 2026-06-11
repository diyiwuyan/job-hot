/**
 * Pre-generate paginated JSON files for the /all page.
 *
 * Instead of bundling all 21K+ items into the client JS bundle,
 * this script generates small JSON files at build time:
 *   public/api/feed/all-all-1.json   (channel-category-page)
 *   public/api/feed/campus-all-1.json
 *   ...
 *
 * The client fetches only the current page's JSON (~30 items),
 * reducing initial load from ~17MB to ~50KB.
 *
 * Run: npx tsx scripts/generate-pages.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import type { FeedItem, FeedDay, Channel, Category } from '../src/lib/types';
import { inferMajors } from '../src/lib/majors';

// ─── Import and merge data (same logic as data.ts) ──────────────────
const dataDir = path.join(__dirname, '..', 'src', 'lib');

function loadJson(filename: string): FeedItem[] {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) return [];
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

const cutoffDate = new Date('2026-01-01T00:00:00Z');

// Filter out items with createdAt in the future
const now = new Date();
console.log(`[generate-pages] Build time (UTC): ${now.toISOString()}`);

const allItems: FeedItem[] = [
  ...loadJson('campus-data.json'),
  ...loadJson('nowcoder-data.json'),
  ...loadJson('deepoffer-data.json'),
  ...loadJson('guopin-data.json'),
  ...loadJson('yingjiesheng-data.json'),
].filter(item => {
  const t = new Date(item.createdAt);
  return t >= cutoffDate && t <= now;
});

console.log(`[generate-pages] Items after filtering (future excluded): ${allItems.length}`);

// Deduplicate
const seen = new Map<string, FeedItem>();
for (const item of allItems) {
  const existing = seen.get(item.id);
  if (!existing || item.score > existing.score) {
    seen.set(item.id, item);
  }
}

// Re-tag items with "宣讲会" tag as channel='talk' (was 'campus')
for (const item of seen.values()) {
  if (item.tags.includes('宣讲会')) {
    item.channel = 'talk' as Channel;
  }
}

const feedItems = [...seen.values()].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

// ─── Beijing time helpers (with memoization) ────────────────────────
const dateKeyCache = new Map<string, string>();
const dateCNCache = new Map<string, string>();
const dateTimestampCache = new Map<string, number>();

function toBeijingDateKey(dateString: string): string {
  let cached = dateKeyCache.get(dateString);
  if (cached !== undefined) return cached;
  const date = new Date(dateString);
  const bjTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const y = bjTime.getUTCFullYear();
  const m = String(bjTime.getUTCMonth() + 1).padStart(2, '0');
  const d = String(bjTime.getUTCDate()).padStart(2, '0');
  cached = `${y}-${m}-${d}`;
  dateKeyCache.set(dateString, cached);
  return cached;
}

function formatDateCN(dateString: string): string {
  let cached = dateCNCache.get(dateString);
  if (cached !== undefined) return cached;
  const date = new Date(dateString);
  const bjTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const m = bjTime.getUTCMonth() + 1;
  const d = bjTime.getUTCDate();
  cached = `${m}月${d}日`;
  dateCNCache.set(dateString, cached);
  return cached;
}

function getTimestamp(dateString: string): number {
  let cached = dateTimestampCache.get(dateString);
  if (cached !== undefined) return cached;
  cached = new Date(dateString).getTime();
  dateTimestampCache.set(dateString, cached);
  return cached;
}

// ─── Feed logic (mirrors feed.ts) ───────────────────────────────────
const ITEMS_PER_PAGE = 30;

const channels: Channel[] = ['all', 'campus', 'intern', 'talk'];
const categories: Category[] = ['all', 'internet', 'foreign', 'game', 'auto_ic', 'finance', 'security', 'other'];

function filterByChannel(items: FeedItem[], channel: Channel): FeedItem[] {
  if (channel === 'all') return items;
  return items.filter(item => item.channel === channel);
}

function filterByCategory(items: FeedItem[], category: Category): FeedItem[] {
  if (category === 'all') return items;
  return items.filter(item => item.category === category);
}

function sortItems(items: FeedItem[]): FeedItem[] {
  return [...items].sort((a, b) => {
    const dayA = toBeijingDateKey(a.createdAt);
    const dayB = toBeijingDateKey(b.createdAt);
    if (dayA !== dayB) return dayB.localeCompare(dayA);
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    if (b.score !== a.score) return b.score - a.score;
    return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
  });
}

function groupByDate(items: FeedItem[]): FeedDay[] {
  const groups = new Map<string, FeedItem[]>();
  // items are already sorted, just group them
  for (const item of items) {
    const dateKey = formatDateCN(item.createdAt);
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(item);
  }

  const days: FeedDay[] = [];
  groups.forEach((dayItems, date) => {
    days.push({ date, items: dayItems });
  });

  days.sort((a, b) => {
    return getTimestamp(b.items[0].createdAt) - getTimestamp(a.items[0].createdAt);
  });

  return days;
}

interface PageData {
  days: FeedDay[];
  currentPage: number;
  totalPages: number;
}

function generateFeed(channel: Channel, category: Category, page: number): PageData {
  let filtered = feedItems;
  filtered = filterByChannel(filtered, channel);
  filtered = filterByCategory(filtered, category);
  filtered = sortItems(filtered);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(startIndex, endIndex);
  const days = groupByDate(paginatedItems);

  return { days, currentPage: validPage, totalPages };
}

// ─── Generate files ─────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'public', 'api', 'feed');
fs.mkdirSync(outDir, { recursive: true });

// Clean old files
const oldFiles = fs.readdirSync(outDir).filter(f => f.endsWith('.json'));
for (const f of oldFiles) {
  fs.unlinkSync(path.join(outDir, f));
}

let fileCount = 0;

// Pre-sort each channel×category combination once, then paginate from cache
const sortedCache = new Map<string, FeedItem[]>();

for (const channel of channels) {
  for (const category of categories) {
    const key = `${channel}-${category}`;
    let filtered = feedItems;
    filtered = filterByChannel(filtered, channel);
    filtered = filterByCategory(filtered, category);

    if (filtered.length === 0) continue;

    const sorted = sortItems(filtered);
    sortedCache.set(key, sorted);

    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

    for (let page = 1; page <= totalPages; page++) {
      const validPage = Math.max(1, Math.min(page, totalPages));
      const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedItems = sorted.slice(startIndex, endIndex);
      const days = groupByDate(paginatedItems);

      const data: PageData = { days, currentPage: validPage, totalPages };
      const filename = `${channel}-${category}-${page}.json`;
      fs.writeFileSync(
        path.join(outDir, filename),
        JSON.stringify(data),
        'utf8'
      );
      fileCount++;
    }

    if (fileCount % 100 === 0) {
      console.log(`  [progress] ${fileCount} files generated...`);
    }
  }
}

// ─── Generate search index (columnar format for minimal size) ────────
// Instead of one giant JSON array of objects (11+ MB), we use a columnar
// format that eliminates repeated key names (saves ~50% of file size):
//
//   { k: ["id","title",...],       // field names (once)
//     u: {"W":"https://mp.weixin.qq.com",...},  // URL prefix map
//     s: {"gp":"国聘",...},         // source code map
//     c: {"c":"campus",...},        // channel code map
//     g: {"int":"internet",...},    // category code map
//     d: [["id1","title1",...], ...] // data rows (arrays, not objects)
//   }
//
// Client reconstructs objects from rows + header. Sharded by channel.
// Each shard is cached in memory after first download.

// Source name → short code mapping
const sourceCodeMap: Record<string, string> = {
  '国聘': 'gp',
  '应届生求职网': 'yjs',
  'DeepOffer': 'do',
  '牛客网': 'nk',
};

// Channel → short code
const channelCodeMap: Record<string, string> = {
  'campus': 'c',
  'intern': 'i',
  'talk': 't',
};

// Category → short code
const categoryCodeMap: Record<string, string> = {
  'internet': 'int',
  'foreign': 'for',
  'game': 'gam',
  'auto_ic': 'aut',
  'finance': 'fin',
  'security': 'sec',
  'other': 'oth',
};

// URL prefix → single-char code (top domains by frequency)
const urlPrefixMap: Record<string, string> = {
  'https://mp.weixin.qq.com': 'W',
  'https://www.iguopin.com': 'G',
  'https://app.mokahr.com': 'M',
  'https://my.yingjiesheng.com': 'Y',
  'https://wecruit.hotjob.cn': 'H',
  'https://campus.51job.com': 'J',
  'http://mp.weixin.qq.com': 'w',
  'https://www.wjx.cn': 'X',
  'https://xiaoyuan.zhaopin.com': 'Z',
  'https://recruit.cscec.com': 'C',
  'https://xyz.51job.com': 'j',
  'https://xym.51job.com': 'y',
};

function compactUrl(url: string): string {
  for (const [prefix, code] of Object.entries(urlPrefixMap)) {
    if (url.startsWith(prefix)) return code + url.slice(prefix.length);
  }
  return url;
}

function compactDate(iso: string): string {
  return iso.slice(0, 10);
}

// 专业大类 → 短码（用于压缩搜索分片体积）
const majorCodeMap: Record<string, string> = {
  unlimited: 'X', cs: 'cs', ee: 'ee', auto: 'au', mech: 'me', civil: 'ci',
  material: 'ma', math: 'mt', physics: 'ph', bio: 'bi', medical: 'md',
  finance: 'fi', management: 'mg', law: 'la', literature: 'li', art: 'ar',
  agri: 'ag', education: 'ed',
};

// Field order in columnar data rows
const searchFields = ['id', 'title', 'summary', 'url', 'source', 'channel', 'category', 'tags', 'createdAt', 'companyType', 'location', 'deadline', 'majors'];

const channelShards: Record<string, typeof feedItems> = {
  all: feedItems,
  campus: feedItems.filter(i => i.channel === 'campus'),
  intern: feedItems.filter(i => i.channel === 'intern'),
  talk: feedItems.filter(i => i.channel === 'talk'),
};

// Reverse maps for client-side restoration (code → full name)
const sourceReverseMap = Object.fromEntries(Object.entries(sourceCodeMap).map(([k, v]) => [v, k]));
const channelReverseMap = Object.fromEntries(Object.entries(channelCodeMap).map(([k, v]) => [v, k]));
const categoryReverseMap = Object.fromEntries(Object.entries(categoryCodeMap).map(([k, v]) => [v, k]));
const urlReverseMap = Object.fromEntries(Object.entries(urlPrefixMap).map(([k, v]) => [v, k]));
const majorReverseMap = Object.fromEntries(Object.entries(majorCodeMap).map(([k, v]) => [v, k]));

for (const [ch, items] of Object.entries(channelShards)) {
  const rows = items.map(item => [
    item.id,
    item.title,
    item.summary.length > 50 ? item.summary.slice(0, 50) + '…' : item.summary,
    compactUrl(item.url),
    sourceCodeMap[item.source] || item.source,
    channelCodeMap[item.channel] || item.channel,
    categoryCodeMap[item.category] || item.category,
    // Tags as pipe-separated string (saves ~3.7 MB vs JSON arrays across 21K items)
    item.tags.join('|'),
    compactDate(item.createdAt),
    item.companyType || '',
    item.location || '',
    item.deadline || '',
    // 专业大类：管道分隔的短码（构建时推断）
    inferMajors(item.title, item.summary, item.tags)
      .map(m => majorCodeMap[m] || m)
      .join('|'),
  ]);

  const shard = {
    k: searchFields,
    u: urlReverseMap,   // code → prefix (for client restoration)
    s: sourceReverseMap,
    c: channelReverseMap,
    g: categoryReverseMap,
    m: majorReverseMap, // major code → full name
    d: rows,
  };

  fs.writeFileSync(
    path.join(outDir, `search-${ch}.json`),
    JSON.stringify(shard),
    'utf8'
  );

  const size = fs.statSync(path.join(outDir, `search-${ch}.json`)).size;
  console.log(`  search-${ch}.json: ${(size / 1024 / 1024).toFixed(1)} MB (${items.length} items)`);
}

// 注：已移除冗余的 search-index.json（曾是 search-all.json 的完整拷贝，约 9MB）。
// 前端不再引用该文件，删除可减少仓库体积与构建产物。

// ─── 详情页轻量索引（按 id 哈希分桶）────────────────────────────
// 详情页 /item?id=xxx 只需按 id 查一条，过去要整包下载 9MB 的 search-all.json。
// 这里按 id 的哈希均匀分散到 64 个小桶，详情页只需下载对应桶（每桶通常 <50KB）。
// 字段顺序固定，summary 截断到 80 字（详情页展示足够）。
const detailFields = ['title', 'summary', 'url', 'source', 'channel', 'category', 'tags', 'createdAt', 'companyType', 'location', 'deadline'];

const DETAIL_BUCKET_COUNT = 64;
// 简单稳定哈希（djb2），与客户端 bucketOf 保持完全一致。
function detailBucketOf(id: string): string {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) & 0xffffffff;
  const idx = Math.abs(h) % DETAIL_BUCKET_COUNT;
  return `b${idx}`;
}

const detailBuckets: Record<string, { k: string[]; u: Record<string, string>; s: Record<string, string>; c: Record<string, string>; g: Record<string, string>; d: Record<string, (string | number)[]> }> = {};

for (const item of feedItems) {
  const bucket = detailBucketOf(item.id);
  if (!detailBuckets[bucket]) {
    detailBuckets[bucket] = {
      k: detailFields,
      u: urlReverseMap,
      s: sourceReverseMap,
      c: channelReverseMap,
      g: categoryReverseMap,
      d: {},
    };
  }
  detailBuckets[bucket].d[item.id] = [
    item.title,
    item.summary.length > 80 ? item.summary.slice(0, 80) + '…' : item.summary,
    compactUrl(item.url),
    sourceCodeMap[item.source] || item.source,
    channelCodeMap[item.channel] || item.channel,
    categoryCodeMap[item.category] || item.category,
    item.tags.join('|'),
    compactDate(item.createdAt),
    item.companyType || '',
    item.location || '',
    item.deadline || '',
  ];
}

const detailDir = path.join(outDir, 'detail');
if (!fs.existsSync(detailDir)) fs.mkdirSync(detailDir, { recursive: true });
for (const [bucket, data] of Object.entries(detailBuckets)) {
  fs.writeFileSync(path.join(detailDir, `${bucket}.json`), JSON.stringify(data), 'utf8');
  const kb = (fs.statSync(path.join(detailDir, `${bucket}.json`)).size / 1024).toFixed(0);
  console.log(`  detail/${bucket}.json: ${kb} KB (${Object.keys(data.d).length} items)`);
}

// ─── Generate daily digest JSON ─────────────────────────────────────
const dailyGrouped = new Map<string, FeedItem[]>();
const dailySorted = [...feedItems].sort(
  (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
);

for (const item of dailySorted) {
  const key = toBeijingDateKey(item.createdAt);
  if (!dailyGrouped.has(key)) dailyGrouped.set(key, []);
  dailyGrouped.get(key)!.push(item);
}

const dailyDigest = Array.from(dailyGrouped.entries())
  .sort((a, b) => b[0].localeCompare(a[0]))
  .slice(0, 7)
  .map(([key, items]) => {
    const [y, m, d] = key.split('-').map(Number);
    const label = `${y}年${m}月${d}日`;
    const topItems = items.sort((a, b) => b.score - a.score).slice(0, 10);
    return { date: key, label, items: topItems };
  });

fs.writeFileSync(
  path.join(outDir, 'daily-digest.json'),
  JSON.stringify(dailyDigest),
  'utf8'
);

// ─── Generate home page data JSON ───────────────────────────────────
const featuredItems = feedItems
  .filter(item => item.featured)
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);

// ─── Extract city list from tags for city filter ────────────────────
// Cities appear in tags of items from yingjiesheng (宣讲会) and guopin/deepoffer.
// We extract them from summary patterns like "城市：{city}" or "工作地点：{city}".
const cityCount = new Map<string, number>();
const cityPattern = /(?:城市|工作地点)[：:]\s*([^。\n]+)/;
for (const item of feedItems) {
  const match = item.summary.match(cityPattern);
  if (match) {
    // Some items have multiple cities separated by "、" or "，" or "/"
    const cities = match[1].split(/[、，,/]/).map(c => c.trim()).filter(c => c.length > 0 && c.length <= 10);
    for (const city of cities) {
      cityCount.set(city, (cityCount.get(city) || 0) + 1);
    }
  }
}

// Sort by frequency, take top 30 cities
const topCities = [...cityCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .map(([city]) => city);

console.log(`[generate-pages] Top cities (${topCities.length}): ${topCities.slice(0, 10).join(', ')}...`);

// Write city list for client-side filter
fs.writeFileSync(
  path.join(outDir, 'cities.json'),
  JSON.stringify(topCities),
  'utf8'
);

// Count unique companies (extract from first tag which is typically company name)
const companySet = new Set<string>();
for (const item of feedItems) {
  if (item.tags.length > 0) companySet.add(item.tags[0]);
}

// Count data sources
const sourceSet = new Set<string>();
for (const item of feedItems) {
  sourceSet.add(item.source);
}

// Today's update count (Beijing time)
const todayKey = toBeijingDateKey(now.toISOString());
const todayCount = feedItems.filter(i => toBeijingDateKey(i.createdAt) === todayKey).length;

const homeData = {
  featuredItems,
  totalItems: feedItems.length,
  campusCount: feedItems.filter(i => i.channel === 'campus').length,
  internCount: feedItems.filter(i => i.channel === 'intern').length,
  talkCount: feedItems.filter(i => i.channel === 'talk').length,
  companyCount: companySet.size,
  sourceCount: sourceSet.size,
  todayCount,
};

fs.writeFileSync(
  path.join(outDir, 'home.json'),
  JSON.stringify(homeData),
  'utf8'
);

console.log(`Generated ${fileCount} paginated JSON files in public/api/feed/`);
console.log(`Daily digest: ${dailyDigest.length} days`);
console.log(`Total items: ${feedItems.length}`);

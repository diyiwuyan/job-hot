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

const feedItems = [...seen.values()].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

// ─── Beijing time helpers ────────────────────────────────────────────
function toBeijingDateKey(dateString: string): string {
  const date = new Date(dateString);
  const bjTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const y = bjTime.getUTCFullYear();
  const m = String(bjTime.getUTCMonth() + 1).padStart(2, '0');
  const d = String(bjTime.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateCN(dateString: string): string {
  const date = new Date(dateString);
  const bjTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const y = bjTime.getUTCFullYear();
  const m = bjTime.getUTCMonth() + 1;
  const d = bjTime.getUTCDate();
  // For simplicity in static generation, just use "M月D日" format
  // (today/yesterday labels are handled client-side)
  return `${m}月${d}日`;
}

// ─── Feed logic (mirrors feed.ts) ───────────────────────────────────
const ITEMS_PER_PAGE = 30;

const channels: Channel[] = ['all', 'campus', 'intern'];
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
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function groupByDate(items: FeedItem[]): FeedDay[] {
  const groups = new Map<string, FeedItem[]>();
  const sortedByDate = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  for (const item of sortedByDate) {
    const dateKey = formatDateCN(item.createdAt);
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(item);
  }

  const days: FeedDay[] = [];
  groups.forEach((items, date) => {
    days.push({ date, items });
  });

  days.sort((a, b) => {
    const dateA = new Date(a.items[0].createdAt);
    const dateB = new Date(b.items[0].createdAt);
    return dateB.getTime() - dateA.getTime();
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

for (const channel of channels) {
  for (const category of categories) {
    // First, figure out total pages for this combination
    let filtered = feedItems;
    filtered = filterByChannel(filtered, channel);
    filtered = filterByCategory(filtered, category);

    if (filtered.length === 0) continue;

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    for (let page = 1; page <= totalPages; page++) {
      const data = generateFeed(channel, category, page);
      const filename = `${channel}-${category}-${page}.json`;
      fs.writeFileSync(
        path.join(outDir, filename),
        JSON.stringify(data),
        'utf8'
      );
      fileCount++;
    }
  }
}

// ─── Generate search index (compact: truncate summary, drop optional fields) ──
const searchIndex = feedItems.map(item => ({
  id: item.id,
  title: item.title,
  summary: item.summary.length > 80 ? item.summary.slice(0, 80) + '…' : item.summary,
  url: item.url,
  source: item.source,
  channel: item.channel,
  category: item.category,
  tags: item.tags,
  score: item.score,
  createdAt: item.createdAt,
}));

fs.writeFileSync(
  path.join(outDir, 'search-index.json'),
  JSON.stringify(searchIndex),
  'utf8'
);

// ─── Generate daily digest JSON ─────────────────────────────────────
const dailyGrouped = new Map<string, FeedItem[]>();
const dailySorted = [...feedItems].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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

const homeData = {
  featuredItems,
  totalItems: feedItems.length,
  campusCount: feedItems.filter(i => i.channel === 'campus').length,
  internCount: feedItems.filter(i => i.channel === 'intern').length,
};

fs.writeFileSync(
  path.join(outDir, 'home.json'),
  JSON.stringify(homeData),
  'utf8'
);

const searchSize = fs.statSync(path.join(outDir, 'search-index.json')).size;
console.log(`Generated ${fileCount} paginated JSON files in public/api/feed/`);
console.log(`Search index: ${(searchSize / 1024 / 1024).toFixed(1)} MB`);
console.log(`Daily digest: ${dailyDigest.length} days`);
console.log(`Total items: ${feedItems.length}`);

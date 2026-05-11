/**
 * Generate RSS/Atom feed from campus data.
 * Run: npx tsx scripts/generate-rss.ts
 * Output: public/feed.xml
 */

import * as fs from 'fs';
import * as path from 'path';

interface FeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  channel: string;
  category: string;
  tags: string[];
  score: number;
  featured?: boolean;
  createdAt: string;
}

const SITE_URL = 'https://diyiwuyan.github.io/job-hot';
const FEED_TITLE = 'JOBHOT - 大学生求职热点';
const FEED_DESC = '汇集大学生求职热点信息，提供精选校招和实习动态。';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function main() {
  const dataPath = path.join(__dirname, '..', 'src', 'lib', 'campus-data.json');
  if (!fs.existsSync(dataPath)) {
    console.log('campus-data.json not found, skipping RSS generation');
    return;
  }

  const items: FeedItem[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // Take top 30 items by score
  const topItems = items
    .sort((a, b) => b.score - a.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  const now = new Date().toUTCString();
  const latestDate = topItems.length > 0
    ? new Date(topItems[0].createdAt).toUTCString()
    : now;

  const rssItems = topItems.map((item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="false">${escapeXml(item.id)}</guid>
      <description>${escapeXml(item.summary)}</description>
      <pubDate>${new Date(item.createdAt).toUTCString()}</pubDate>
      <category>${escapeXml(item.channel === 'campus' ? '校招' : '实习')}</category>
      ${item.tags.map(t => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>`).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(FEED_DESC)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${latestDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'feed.xml');
  fs.writeFileSync(outputPath, rss, 'utf-8');
  console.log(`Generated RSS feed with ${topItems.length} items → ${outputPath}`);
}

main();

/** Extract structured 2027 campus channels from Picrew/Campus2027. */
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import type { FeedItem } from '../src/lib/types';
import { inferCompanyType } from './infer-company-type';

const README_URL = 'https://raw.githubusercontent.com/Picrew/Campus2027/main/README.md';
const SOURCE_URL = 'https://github.com/Picrew/Campus2027';
const VERIFIED_AT = '2026-09-03';

function text(value: string) { return value.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim(); }
function url(value: string) {
  const match = value.match(/https?:\/\/[^\s)]+/);
  return match ? match[0].replace(/[),.;]+$/, '').replace(/&amp;/g, '&') : null;
}
function categoryFor(value: string): FeedItem['category'] {
  if (/Games|游戏/.test(value)) return 'game';
  if (/Quant|金融|Finance/.test(value)) return 'finance';
  if (/Chips|Vision|Infrastructure|芯片|基础/.test(value)) return 'auto_ic';
  if (/Driving|Robotics|Embodied|机器人|自动驾驶/.test(value)) return 'auto_ic';
  if (/Research|研究|AI/.test(value)) return 'internet';
  return 'internet';
}
function categoryLabel(value: FeedItem['category']) { return ({ internet: '互联网/AI', foreign: '外企', game: '游戏', auto_ic: '车企/通信/IC', finance: '金融/国企', security: '软件/云服务', other: '其他', all: '其他' } as Record<FeedItem['category'], string>)[value]; }

async function main() {
  const response = await fetch(README_URL, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Picrew Campus2027 HTTP ${response.status}`);
  const markdown = await response.text();
  if (!markdown.includes('Official Apply') || !markdown.includes('Last Verified')) throw new Error('Unexpected Picrew source format');
  const lines = markdown.split(/\r?\n/);
  let section = '';
  const items: FeedItem[] = [];
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) { section = heading[1].trim(); continue; }
    if (section === 'Checked but Not Counted as Open' || !/^\s*\|/.test(line) || /^\s*\|\s*-+/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map(v => v.trim());
    if (cells.length < 10 || /^(Company|公司)$/.test(text(cells[0]))) continue;
    const company = text(cells[0]);
    const program = text(cells[1]);
    const batch = text(cells[2]);
    const audience = text(cells[3]);
    const location = text(cells[4]) || '以官方页面为准';
    const applyUrl = url(cells[7]);
    const verified = text(cells[9]);
    if (!company || !program || !applyUrl || verified !== VERIFIED_AT) continue;
    const category = categoryFor(section);
    const id = `picrew-campus-${createHash('sha256').update(`${company}|${program}|${applyUrl}`).digest('hex').slice(0, 20)}`;
    items.push({
      id,
      title: `${company}｜${program}`,
      summary: `2027届校招；批次：${batch}；对象：${audience}；地点：${location}。该条目由公开校招索引于 ${VERIFIED_AT} 核验，岗位状态、专业要求和截止时间请以官方投递页为准。原始来源：${SOURCE_URL}`,
      url: applyUrl,
      source: 'GitHub 校招精选',
      sourceHandle: '@Picrew/Campus2027',
      channel: 'campus',
      category,
      companyType: inferCompanyType(company),
      location,
      tags: [company, '校招', '2027届', categoryLabel(category), '官方投递链接', 'GitHub来源'],
      score: 84,
      featured: false,
      createdAt: `${VERIFIED_AT}T02:00:00.000Z`,
    });
  }
  const unique = [...new Map(items.map(item => [item.id, item])).values()];
  if (!unique.length) throw new Error('No usable Picrew rows');
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'picrew-campus-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2), 'utf-8');
  console.log(`Wrote ${unique.length} verified campus links from ${SOURCE_URL}`);
}
main().catch(error => { console.error(error); process.exit(1); });

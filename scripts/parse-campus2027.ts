/**
 * Extract factual campus/internship rows from the public Campus2027 GitHub
 * index. We keep the company, batch, date, location and application URL, but
 * do not copy the README's narrative/promotional text.
 */
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import type { FeedItem } from '../src/lib/types';
import { inferCompanyType } from './infer-company-type';

const README_URL = 'https://raw.githubusercontent.com/namewyf/Campus2027/main/README.md';
const SOURCE_URL = 'https://github.com/namewyf/Campus2027';
const CUTOFF = new Date('2026-06-01T00:00:00Z');
const blockedHosts = ['github.com', 'juejin.cn', 'mp.weixin.qq.com', 'nowcoder.com', 'zhipin.com', 'niuqizp.com'];

function cellText(value: string): string {
  return value.replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
}

function firstUrl(value: string): string | null {
  const match = value.match(/https?:\/\/[^\s)]+/);
  if (!match) return null;
  const url = match[0].replace(/[),.;]+$/, '').replace(/&amp;/g, '&');
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (/\/social(?:\/|$)/i.test(parsed.pathname) || /202[0-5]/.test(parsed.pathname)) return null;
    return blockedHosts.some(blocked => host === blocked || host.endsWith(`.${blocked}`)) ? null : url;
  } catch {
    return null;
  }
}

function categoryFor(section: string): FeedItem['category'] {
  if (/游戏/.test(section)) return 'game';
  if (/外企/.test(section)) return 'foreign';
  if (/车企|通信|IC|芯片/.test(section)) return 'auto_ic';
  if (/银行|保险|金融|地产|国企/.test(section)) return 'finance';
  if (/安全|软件|云/.test(section)) return 'security';
  return /互联网|AI|算法|大模型/.test(section) ? 'internet' : 'other';
}

function categoryLabel(category: FeedItem['category']): string {
  const labels: Record<FeedItem['category'], string> = { internet: '互联网/AI', foreign: '外企', game: '游戏', auto_ic: '车企/通信/IC', finance: '金融/国企', security: '软件/云服务', other: '其他', all: '其他' };
  return labels[category];
}

function parseDate(value: string): Date | null {
  const match = value.match(/(20\d{2})\/(\d{1,2})\/(\d{1,2})/);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 2));
  return Number.isNaN(date.getTime()) ? null : date;
}

async function main() {
  const response = await fetch(README_URL, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Campus2027 HTTP ${response.status}`);
  const markdown = await response.text();
  if (!markdown.includes('## 校招篇') || !markdown.includes('## 实习篇')) throw new Error('Unexpected source format; preserving existing data');
  const lines = markdown.split(/\r?\n/);
  let mode: 'campus' | 'intern' | null = null;
  let batch = '';
  let section = '';
  const items: FeedItem[] = [];

  for (const line of lines) {
    if (/^##\s+校招篇/.test(line)) { mode = 'campus'; batch = ''; section = ''; continue; }
    if (/^##\s+实习篇/.test(line)) { mode = 'intern'; batch = ''; section = ''; continue; }
    if (!mode) continue;
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      if (mode === 'campus' && /^校招(提前批|正式批)$/.test(h2[1].trim())) batch = h2[1].trim();
      else mode = null;
      section = ''; continue;
    }
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) { section = h3[1].trim(); continue; }
    if (!/^\s*\|/.test(line) || /^\s*\|\s*-+/.test(line)) continue;

    const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
    if (cells.length < 4 || /^(企业|公司|公司名称)$/.test(cellText(cells[0]))) continue;
    const company = cellText(cells[0]);
    const url = firstUrl(cells[1]);
    const date = parseDate(cells[2]);
    if (!company || !url || !date || date < CUTOFF || date > new Date()) continue;
    const location = cellText(cells[3]) || '以官方页面为准';
    const category = categoryFor(section);
    const channel = mode === 'campus' ? 'campus' : 'intern';
    const kindLabel = mode === 'campus' ? '校招' : '实习';
    const idKey = `${company}|${kindLabel}|${batch}|${url}`;
    const id = `campus2027-${createHash('sha256').update(idKey).digest('hex').slice(0, 20)}`;
    items.push({
      id,
      title: `${company}｜${batch || kindLabel}项目索引`,
      summary: `来源收录分类：${batch || kindLabel}；来源标注更新日期：${date.toISOString().slice(0, 10)}；来源标注地点：${location}。这是招聘入口索引，并非已核验开放的具体岗位；请进入企业页面选择校招/实习，确认届次、城市与截止时间。原始来源：${SOURCE_URL}`,
      url,
      source: 'GitHub 校招索引',
      sourceHandle: '@namewyf/Campus2027',
      channel,
      category,
      companyType: inferCompanyType(company),
      location,
      tags: [company, kindLabel, batch || '公开项目', categoryLabel(category), '官方投递链接', 'GitHub来源'],
      score: 70,
      featured: false,
      createdAt: date.toISOString(),
    });
  }

  const unique = [...new Map(items.map(item => [item.id, item])).values()];
  if (!unique.length) throw new Error('No usable source rows; preserving existing data');
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'campus2027-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2), 'utf-8');
  console.log(`Wrote ${unique.length} factual campus/internship links from ${SOURCE_URL}`);
}

main().catch(error => { console.error(error); process.exit(1); });

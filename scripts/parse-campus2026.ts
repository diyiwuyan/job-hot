/**
 * Parse Campus2026 README.md from GitHub and generate feed data.
 * Run: npx tsx scripts/parse-campus2026.ts
 * Output: src/lib/campus-data.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ───────────────────────────────────────────────────────────
interface RawEntry {
  company: string;
  status: string;     // e.g. "校招正式批", "暑期实习"
  url: string;
  date: string;
  location: string;
  notes: string;
  section: 'campus' | 'intern';
  subSection: string; // e.g. "校招提前批", "校招正式批"
  category: string;
}

interface FeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceHandle?: string;
  channel: 'campus' | 'intern' | 'info';
  category: string;
  tags: string[];
  score: number;
  featured?: boolean;
  createdAt: string;
}

// ─── Category mapping ────────────────────────────────────────────────
function detectCategory(headerText: string): string | null {
  if (/互联网|AI/.test(headerText)) return 'internet';
  if (/外企/.test(headerText)) return 'foreign';
  if (/游戏/.test(headerText)) return 'game';
  if (/车企|通信|IC|机厂|车厂/.test(headerText)) return 'auto_ic';
  if (/银行|保险|金融|地产|国企/.test(headerText)) return 'finance';
  if (/安全|软件|云服务/.test(headerText)) return 'security';
  return null;
}

// ─── Parse table row (handles rows that may not end with |) ──────────
function parseTableRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return null;

  // Remove trailing | if present
  const normalized = trimmed.endsWith('|') ? trimmed.slice(1, -1) : trimmed.slice(1);

  // Skip separator rows (only dashes, colons, spaces)
  if (/^[\s\-:|]+$/.test(normalized)) return null;

  const cells = normalized.split('|').map(c => c.trim());
  return cells;
}

// ─── Extract link from markdown [text](url) ──────────────────────────
function extractLink(cell: string): { text: string; url: string } {
  const match = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (match) {
    return { text: match[1], url: match[2] };
  }
  return { text: cell, url: '' };
}

// ─── Parse date string to ISO date ───────────────────────────────────
function parseDateToISO(dateStr: string): string {
  const now = new Date();
  const year = now.getFullYear();

  if (!dateStr || dateStr.trim() === '') {
    return new Date(year, now.getMonth(), now.getDate(), 10, 0, 0).toISOString();
  }

  // "YYYY/M/D" format
  let match = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]), 10, 0, 0).toISOString();
  }

  // "YYYY/M" format (no day)
  match = dateStr.match(/(\d{4})\/(\d{1,2})$/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, 1, 10, 0, 0).toISOString();
  }

  // "X月Y日" format
  match = dateStr.match(/(\d{1,2})月(\d{1,2})日?/);
  if (match) {
    return new Date(year, parseInt(match[1]) - 1, parseInt(match[2]), 10, 0, 0).toISOString();
  }

  // "M.D" format
  match = dateStr.match(/(\d{1,2})\.(\d{1,2})/);
  if (match) {
    return new Date(year, parseInt(match[1]) - 1, parseInt(match[2]), 10, 0, 0).toISOString();
  }

  return new Date(year, now.getMonth(), now.getDate(), 10, 0, 0).toISOString();
}

// ─── Score heuristic ─────────────────────────────────────────────────
function computeScore(entry: RawEntry): number {
  let score = 50;

  // Recency bonus based on parsed date
  try {
    const entryDate = new Date(parseDateToISO(entry.date));
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) score += 30;
    else if (daysDiff <= 30) score += 25;
    else if (daysDiff <= 90) score += 20;
    else if (daysDiff <= 180) score += 15;
    else if (daysDiff <= 365) score += 12;
    else score += 8;
  } catch {
    score += 8;
  }

  // Tier 1 companies (top tech)
  const tier1 = ['字节', '腾讯', '阿里', '美团', '百度', '华为', '小米', '京东', '拼多多',
    'Google', 'Microsoft', '微软', '苹果', 'Apple', 'Amazon', 'Meta', 'NVIDIA'];
  // Tier 2 companies (well-known)
  const tier2 = ['网易', '快手', '小红书', '哔哩哔哩', '携程', '蔚来', '理想', '小鹏',
    '比亚迪', '大疆', '米哈游', '蚂蚁', '滴滴', 'OpenAI', '招商银行', '中国银行',
    '平安', '英特尔', '高通', 'Intel', 'IBM', '完美世界', '叠纸', '深信服', '金山'];

  if (tier1.some(name => entry.company.includes(name))) {
    score += 15;
  } else if (tier2.some(name => entry.company.includes(name))) {
    score += 10;
  } else {
    score += 5;
  }

  // Has date info bonus (more complete data)
  if (entry.date && entry.date.length > 3) {
    score += 3;
  }

  // Has notes bonus
  if (entry.notes && entry.notes.length > 2) {
    score += 3;
  }

  // Add some deterministic variety based on company name hash
  const hash = entry.company.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  score += (hash % 5);

  return Math.min(score, 99);
}

// ─── Generate summary ────────────────────────────────────────────────
function generateSummary(entry: RawEntry): string {
  const parts: string[] = [];

  parts.push(`${entry.company}${entry.status}通道已开放`);

  if (entry.location && entry.location.trim() !== '' && entry.location !== '-') {
    parts.push(`工作地点：${entry.location}`);
  }

  if (entry.notes && entry.notes.trim() !== '' && entry.notes !== '-') {
    parts.push(entry.notes);
  }

  if (entry.date) {
    parts.push(`最近更新：${entry.date}`);
  }

  return parts.join('。') + '。点击查看详情并投递简历。';
}

// ─── Generate tags ───────────────────────────────────────────────────
function generateTags(entry: RawEntry): string[] {
  const tags: string[] = [entry.company];

  if (entry.section === 'campus') tags.push('校招');
  else tags.push('实习');

  // Sub-section tag
  if (entry.subSection.includes('提前批')) tags.push('提前批');
  if (entry.subSection.includes('正式批')) tags.push('正式批');
  if (entry.status.includes('暑期')) tags.push('暑期实习');
  if (entry.status.includes('日常')) tags.push('日常实习');

  const catLabels: Record<string, string> = {
    internet: '互联网/AI',
    foreign: '外企',
    game: '游戏',
    auto_ic: '车企/IC',
    finance: '金融/国企',
    security: '安全/云服务',
  };
  if (catLabels[entry.category]) tags.push(catLabels[entry.category]);

  if (entry.location && entry.location !== '-' && entry.location.trim()) {
    const cities = entry.location.split(/[、,，/]/).map(s => s.trim()).filter(Boolean);
    tags.push(...cities.slice(0, 2));
  }

  return [...new Set(tags)];
}

// ─── Main parse function ─────────────────────────────────────────────
async function main() {
  const README_URL = 'https://raw.githubusercontent.com/namewyf/Campus2026/main/README.md';

  console.log('Fetching Campus2026 README.md...');
  const response = await fetch(README_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  const markdown = await response.text();
  console.log(`Fetched ${markdown.length} bytes`);

  const lines = markdown.split('\n');
  const entries: RawEntry[] = [];

  let currentSection: 'campus' | 'intern' | null = null;
  let currentSubSection = '';
  let currentCategory = 'other';
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect top-level section headers
    // "## 校招篇" or "## 校招提前批" or "## 校招正式批"
    if (/^##\s.*校招/.test(trimmed)) {
      currentSection = 'campus';
      currentSubSection = trimmed.replace(/^#+\s*/, '');
      inTable = false;
      // Don't reset category here — sub-headers will set it
      continue;
    }
    if (/^##\s.*实习/.test(trimmed)) {
      currentSection = 'intern';
      currentSubSection = trimmed.replace(/^#+\s*/, '');
      inTable = false;
      continue;
    }

    // Detect category sub-headers (### level)
    if (/^###\s/.test(trimmed)) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      const detected = detectCategory(headerText);
      if (detected) {
        currentCategory = detected;
      }
      inTable = false;
      continue;
    }

    if (!currentSection) continue;

    // Try to parse as table row
    const cells = parseTableRow(trimmed);
    if (!cells || cells.length < 2) {
      if (inTable && !trimmed.startsWith('|')) inTable = false;
      continue;
    }

    // Detect table header row (contains 公司)
    if (cells[0].includes('公司') || cells[0].includes('企业')) {
      inTable = true;
      continue;
    }

    // Skip separator rows
    if (cells.every(c => /^[\s\-:]*$/.test(c))) {
      continue;
    }

    if (!inTable) {
      // Check if this might be a header row followed by separator
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1]?.trim() || '';
        if (nextLine.startsWith('|') && /^[\s\-:|]+$/.test(nextLine.replace(/^\|/, '').replace(/\|$/, ''))) {
          inTable = true;
          continue;
        }
      }
      continue;
    }

    // Parse data row
    const companyName = cells[0].trim();
    if (!companyName || companyName.length < 1) continue;

    // Second cell usually contains the link
    const linkCell = cells[1] || '';
    const { text: status, url } = extractLink(linkCell);

    // Remaining cells: date, location, notes
    let dateStr = '';
    let location = '';
    let notes = '';

    for (let j = 2; j < cells.length; j++) {
      const cell = cells[j].trim();
      if (!cell || cell === '-') continue;

      // Date detection
      if (!dateStr && /\d{4}\/\d{1,2}/.test(cell)) {
        dateStr = cell;
      } else if (!dateStr && /\d{1,2}月\d{1,2}/.test(cell)) {
        dateStr = cell;
      } else if (!location && /[\u4e00-\u9fff]/.test(cell) && cell.length <= 10) {
        location = cell;
      } else if (cell.length > 1) {
        notes = notes ? notes + ' ' + cell : cell;
      }
    }

    entries.push({
      company: companyName,
      status: status || (currentSection === 'campus' ? '校招' : '实习'),
      url: url || `https://www.google.com/search?q=${encodeURIComponent(companyName + ' 2026 校招')}`,
      date: dateStr,
      location,
      notes,
      section: currentSection,
      subSection: currentSubSection,
      category: currentCategory,
    });
  }

  console.log(`Parsed ${entries.length} entries`);

  // Convert to FeedItems
  const feedItems: FeedItem[] = entries.map((entry, index) => {
    const score = computeScore(entry);

    return {
      id: `campus2026-${index + 1}`,
      title: `${entry.company} — ${entry.status}`,
      summary: generateSummary(entry),
      url: entry.url,
      source: 'Campus2026',
      sourceHandle: '@namewyf/Campus2026',
      channel: entry.section,
      category: entry.category,
      tags: generateTags(entry),
      score,
      featured: score >= 82,
      createdAt: parseDateToISO(entry.date),
    };
  });

  // Sort by date (newest first), then by score
  feedItems.sort((a, b) => {
    const dateCompare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (dateCompare !== 0) return dateCompare;
    return b.score - a.score;
  });

  // Write output
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'campus-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(feedItems, null, 2), 'utf-8');
  console.log(`\nWrote ${feedItems.length} items to ${outputPath}`);

  // Print stats
  const stats = {
    total: feedItems.length,
    campus: feedItems.filter(i => i.channel === 'campus').length,
    intern: feedItems.filter(i => i.channel === 'intern').length,
    categories: {} as Record<string, number>,
  };
  feedItems.forEach(item => {
    stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
  });
  console.log('\nStats:', JSON.stringify(stats, null, 2));

  // Print first 3 items as sample
  console.log('\nSample items:');
  feedItems.slice(0, 3).forEach(item => {
    console.log(`  [${item.channel}/${item.category}] ${item.title}`);
    console.log(`    Tags: ${item.tags.join(', ')}`);
    console.log(`    Score: ${item.score}, Date: ${item.createdAt}`);
  });
}

main().catch(console.error);

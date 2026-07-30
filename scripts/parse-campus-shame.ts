/**
 * Parse CampusShame README.md from GitHub and generate shame/warning data.
 * Run: npx tsx scripts/parse-campus-shame.ts
 * Output: src/lib/shame-data.json
 */

import * as fs from 'fs';
import * as path from 'path';

interface ShameEntry {
  id: string;
  company: string;
  event: string;
  year: string;       // e.g. "24届", "23届"
  date?: string;
  link?: string;
  type: 'shame' | 'safe';  // 污点 or 无污点
}

interface SupplementalIssue {
  number: number;
  company: string;
  event: string;
  year: string;
  date: string;
  link: string;
}

const SUPPLEMENTAL_ISSUES: SupplementalIssue[] = [
  {
    number: 22,
    company: '美团',
    event: '毁暑期实习 OC。CampusShame issue 中补充了牛客讨论链接，后续评论反馈原帖已不可见。',
    year: '25届',
    date: '2024/04/01',
    link: 'https://github.com/forthespada/CampusShame/issues/22',
  },
];

function parseTableRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return null;
  const normalized = trimmed.endsWith('|') ? trimmed.slice(1, -1) : trimmed.slice(1);
  if (/^[\s\-:|]+$/.test(normalized)) return null;
  const cells = normalized.split('|').map(c => c.trim());
  return cells;
}

function extractLink(cell: string): { text: string; url: string } {
  const match = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (match) return { text: match[1], url: match[2] };
  return { text: cell, url: '' };
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, '').trim();
}

function addSupplementalIssues(entries: ShameEntry[], startIndex: number) {
  let idx = startIndex;
  const seen = new Set(entries.map(entry => `${entry.year}|${entry.company}|${entry.link ?? ''}`));

  for (const issue of SUPPLEMENTAL_ISSUES) {
    const key = `${issue.year}|${issue.company}|${issue.link}`;
    if (seen.has(key)) continue;

    idx++;
    entries.push({
      id: `shame-issue-${issue.number}`,
      company: issue.company,
      event: issue.event,
      year: issue.year,
      date: issue.date,
      link: issue.link,
      type: 'shame',
    });
    seen.add(key);
  }

  return idx;
}

async function fetchTextWithRetry(url: string, retries = 3) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Fetch attempt ${attempt}/${retries} failed: ${message}`);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1500));
      }
    }
  }
  throw lastError;
}

async function fetchCampusShameMarkdown() {
  const rawUrl = 'https://raw.githubusercontent.com/forthespada/CampusShame/refs/heads/main/README.md';
  const apiUrl = 'https://api.github.com/repos/forthespada/CampusShame/contents/README.md?ref=main';

  try {
    return await fetchTextWithRetry(rawUrl);
  } catch (rawError) {
    const message = rawError instanceof Error ? rawError.message : String(rawError);
    console.warn(`Raw README fetch failed, trying GitHub contents API: ${message}`);
  }

  const apiText = await fetchTextWithRetry(apiUrl);
  const payload = JSON.parse(apiText) as { content?: string; encoding?: string };
  if (!payload.content || payload.encoding !== 'base64') {
    throw new Error('GitHub contents API returned an unexpected README payload');
  }
  return Buffer.from(payload.content, 'base64').toString('utf-8');
}

function loadExistingEntries() {
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'shame-data.json');
  if (!fs.existsSync(outputPath)) return [];
  return JSON.parse(fs.readFileSync(outputPath, 'utf-8')) as ShameEntry[];
}

async function main() {
  console.log('Fetching CampusShame README.md...');
  let markdown = '';
  try {
    markdown = await fetchCampusShameMarkdown();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Unable to refresh README, keeping existing records: ${message}`);
  }
  console.log(`Fetched ${markdown.length} bytes`);

  if (!markdown) {
    const existing = loadExistingEntries();
    const nextIndex = existing.length;
    addSupplementalIssues(existing, nextIndex);
    const outputPath = path.join(__dirname, '..', 'src', 'lib', 'shame-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2), 'utf-8');
    console.log(`Wrote ${existing.length} existing + supplemental items to ${outputPath}`);
    return;
  }

  const lines = markdown.split('\n');
  const entries: ShameEntry[] = [];

  let currentType: 'shame' | 'safe' = 'safe';
  let currentYear = '';
  let inTable = false;
  let tableColumns = 0;
  let idx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = stripHtml(line.trim());

    // Detect sections
    if (/无污点公司/.test(trimmed)) {
      currentType = 'safe';
      inTable = false;
      continue;
    }
    if (/污点公司目录/.test(trimmed) || /污点公司/.test(trimmed)) {
      currentType = 'shame';
      inTable = false;
      continue;
    }

    // Detect year headers
    const yearMatch = trimmed.match(/(\d{2})届/);
    if (yearMatch && /^#/.test(trimmed)) {
      currentYear = `${yearMatch[1]}届`;
      inTable = false;
      continue;
    }

    // Parse table rows
    const cells = parseTableRow(trimmed);
    if (!cells || cells.length < 2) {
      if (inTable && !trimmed.startsWith('|')) inTable = false;
      continue;
    }

    // Detect header row
    if (cells[0].includes('公司') || cells[0].includes('企业')) {
      inTable = true;
      tableColumns = cells.length;
      continue;
    }

    // Skip separator
    if (cells.every(c => /^[\s\-:]*$/.test(c))) {
      continue;
    }

    if (!inTable) {
      // Check if next line is separator
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1]?.trim() || '';
        if (nextLine.startsWith('|') && /^[\s\-:|]+$/.test(nextLine.replace(/^\|/, '').replace(/\|$/, ''))) {
          inTable = true;
          tableColumns = cells.length;
          continue;
        }
      }
      continue;
    }

    const company = cells[0].trim();
    if (!company || company.length < 1 || company === 'xxx') continue;

    idx++;

    if (currentType === 'safe') {
      // Safe company: | 公司 | 性质 | 备注/补充 | 链接 |
      const nature = cells[1] || '';
      const notes = cells[2] || '';
      const linkCell = cells[3] || '';
      const { url } = extractLink(linkCell);

      entries.push({
        id: `shame-safe-${idx}`,
        company,
        event: `${nature}${notes ? ' — ' + notes : ''}`,
        year: '无污点',
        link: url || undefined,
        type: 'safe',
      });
    } else {
      // Shame company: varies by year
      // 24届: | 公司 | 事件 | 外链 | 长截图 |
      // 23届+: | 公司 | 时间 | 事件 | 外链 | 长截图 |
      let event = '';
      let date = '';
      let link = '';

      if (tableColumns >= 5) {
        // Has date column
        date = cells[1] || '';
        event = cells[2] || '';
        const linkCell = cells[3] || '';
        const { url } = extractLink(linkCell);
        link = url;
      } else {
        // No date column (24届 format)
        event = cells[1] || '';
        const linkCell = cells[2] || '';
        const { url } = extractLink(linkCell);
        link = url;
      }

      // Keep markdown links intact for frontend rendering, just trim
      event = event.trim();
      if (event.length > 300) event = event.slice(0, 300) + '...';

      entries.push({
        id: `shame-${idx}`,
        company,
        event,
        year: currentYear || '未知',
        date: date || undefined,
        link: link || undefined,
        type: 'shame',
      });
    }
  }

  idx = addSupplementalIssues(entries, idx);

  console.log(`Parsed ${entries.length} entries (${entries.filter(e => e.type === 'shame').length} shame, ${entries.filter(e => e.type === 'safe').length} safe)`);
  console.log('By year:', entries.reduce<Record<string, number>>((acc, item) => {
    acc[item.year] = (acc[item.year] ?? 0) + 1;
    return acc;
  }, {}));

  // Write output
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'shame-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2), 'utf-8');
  console.log(`Wrote ${entries.length} items to ${outputPath}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

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

async function main() {
  const README_URL = 'https://raw.githubusercontent.com/forthespada/CampusShame/refs/heads/main/README.md';

  console.log('Fetching CampusShame README.md...');
  const response = await fetch(README_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  const markdown = await response.text();
  console.log(`Fetched ${markdown.length} bytes`);

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

  console.log(`Parsed ${entries.length} entries (${entries.filter(e => e.type === 'shame').length} shame, ${entries.filter(e => e.type === 'safe').length} safe)`);

  // Write output
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'shame-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2), 'utf-8');
  console.log(`Wrote ${entries.length} items to ${outputPath}`);
}

main().catch(console.error);

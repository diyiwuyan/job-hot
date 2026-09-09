/**
 * Generate transparent directory cards for verified official campus portals.
 *
 * These are not fabricated job postings. They are stable source entries that
 * take the user to the employer's live recruitment page; the summary makes
 * that distinction explicit so a stale or closed job is never presented as
 * open by JOBHOT.
 *
 * Run: npx tsx scripts/parse-official-campus.ts
 * Output: src/lib/official-campus-data.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { FeedItem } from '../src/lib/types';
import { inferCompanyType } from './infer-company-type';
import { OFFICIAL_RECRUITMENT_SOURCES } from '../src/lib/recruitment-sources';

function toCompanyName(sourceName: string): string {
  return sourceName.replace(/校园招聘|招聘$/, '').trim();
}

const now = new Date().toISOString();

const feedItems: FeedItem[] = OFFICIAL_RECRUITMENT_SOURCES.map(source => {
  const company = toCompanyName(source.name);
  const categoryLabel = source.category === 'internet' ? '互联网/AI' : source.category === 'auto_ic' ? '车企/IC' : source.category === 'game' ? '游戏' : '企业招聘';
  return {
    id: `official-campus-${source.id}`,
    title: `${company}｜官方校招入口`,
    summary: `${source.focus}。${source.coverage}。这是企业官方招聘入口，岗位状态、批次和截止时间请以官网实时页面为准。`,
    url: source.url,
    source: '企业官方招聘',
    sourceHandle: '@official-campus',
    channel: 'campus',
    category: source.category,
    companyType: inferCompanyType(company),
    location: '以官网职位为准',
    tags: [company, '官方入口', '校招', categoryLabel],
    score: 78,
    featured: false,
    createdAt: now,
  } satisfies FeedItem;
});

const outputPath = path.join(__dirname, '..', 'src', 'lib', 'official-campus-data.json');
fs.writeFileSync(outputPath, JSON.stringify(feedItems, null, 2), 'utf-8');
console.log(`Wrote ${feedItems.length} verified official source entries to ${outputPath}`);


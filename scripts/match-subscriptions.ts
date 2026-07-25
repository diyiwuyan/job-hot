/**
 * Match subscription keywords against latest feed data and write results to Supabase.
 *
 * This script runs in GitHub Actions AFTER data fetching. It:
 * 1. Reads all *-data.json files to get the latest feed items
 * 2. Fetches all active subscriptions from Supabase
 * 3. For each subscription, matches keywords/filters against feed items
 * 4. Inserts new matches into subscription_matches (skips duplicates)
 * 5. Sends email digest for unnotified matches via Supabase's built-in email
 *
 * Required env vars:
 *   SUPABASE_URL           — Supabase project URL
 *   SUPABASE_SERVICE_KEY   — Supabase service_role key (bypasses RLS)
 *
 * Run: npx tsx scripts/match-subscriptions.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { syncCareerAtlas } from './seed-career-atlas';

// ─── Types ───────────────────────────────────────────────────
interface FeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  channel: string;
  category: string;
  companyType?: string;
  location?: string;
  deadline?: string;
  tags: string[];
  score: number;
  createdAt: string;
}

interface Subscription {
  id: string;
  user_id: string;
  keywords: string[];
  categories: string[];
  company_types: string[];
  cities: string[];
  channels: string[];
  push_frequency: string;
  is_active: boolean;
}

interface UserEmail {
  id: string;
  email: string;
}

// ─── Config ──────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.log('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY, skipping subscription matching.');
  process.exit(0);
}

const DATA_DIR = path.join(__dirname, '..', 'src', 'lib');
const DATA_FILES = [
  'deepoffer-data.json',
  'guopin-data.json',
  'nowcoder-data.json',
  'yingjiesheng-data.json',
];

// Only match items from the last 2 days (recent data)
const RECENCY_CUTOFF_MS = 2 * 24 * 60 * 60 * 1000;

// ─── Supabase REST helpers ───────────────────────────────────
async function supabaseGet<T>(table: string, query: string = ''): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`;
  const resp = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!resp.ok) {
    console.error(`GET ${table} failed: ${resp.status} ${await resp.text()}`);
    return [];
  }
  return resp.json();
}

async function supabasePost(table: string, data: any[], upsert = false): Promise<boolean> {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const headers: Record<string, string> = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': upsert ? 'resolution=ignore-duplicates' : 'return=minimal',
  };
  if (upsert) {
    headers['Prefer'] = 'resolution=ignore-duplicates,return=minimal';
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!resp.ok && resp.status !== 409) {
    console.error(`POST ${table} failed: ${resp.status} ${await resp.text()}`);
    return false;
  }
  return true;
}

// ─── Load feed data ──────────────────────────────────────────
function loadFeedItems(): FeedItem[] {
  const allItems: FeedItem[] = [];

  for (const file of DATA_FILES) {
    const filePath = path.join(DATA_DIR, file);
    try {
      if (fs.existsSync(filePath)) {
        const items: FeedItem[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        allItems.push(...items);
      }
    } catch (err) {
      console.log(`Warning: Could not read ${file}: ${err}`);
    }
  }

  return allItems;
}

// ─── Match logic ─────────────────────────────────────────────
function matchItem(item: FeedItem, sub: Subscription): string[] {
  const matchedKeywords: string[] = [];

  // Keyword matching (against title, summary, tags, source)
  const searchText = [item.title, item.summary, ...item.tags, item.source, item.location || ''].join(' ').toLowerCase();

  for (const kw of sub.keywords) {
    if (searchText.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    }
  }

  // If keywords are set but none matched, skip
  if (sub.keywords.length > 0 && matchedKeywords.length === 0) {
    return [];
  }

  // Category filter
  if (sub.categories.length > 0 && !sub.categories.includes(item.category)) {
    return [];
  }

  // Company type filter
  if (sub.company_types.length > 0 && item.companyType && !sub.company_types.includes(item.companyType)) {
    return [];
  }

  // Channel filter
  if (sub.channels.length > 0 && !sub.channels.includes(item.channel)) {
    return [];
  }

  // City filter
  if (sub.cities.length > 0 && item.location) {
    const locationLower = item.location.toLowerCase();
    const cityMatch = sub.cities.some(city => locationLower.includes(city.toLowerCase()));
    if (!cityMatch) return [];
  }

  // If no keywords set but filters match, still count it
  // (but only if at least one filter is active to avoid matching everything)
  if (sub.keywords.length === 0 &&
      sub.categories.length === 0 &&
      sub.company_types.length === 0 &&
      sub.channels.length === 0 &&
      sub.cities.length === 0) {
    return []; // No criteria set at all
  }

  return matchedKeywords.length > 0 ? matchedKeywords : ['筛选匹配'];
}

// ─── Extract company name from title ─────────────────────────
function extractCompanyName(title: string): string {
  // Titles are usually "公司名 — 岗位/描述"
  const parts = title.split(' — ');
  return parts[0] || title;
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('=== Subscription Matcher ===\n');

  // Keep the Career Atlas catalog in sync during the existing scheduled job.
  // This reuses the service-role environment already provided to this workflow.
  try {
    await syncCareerAtlas();
  } catch (error) {
    console.error('Career Atlas sync skipped:', error instanceof Error ? error.message : error);
  }

  // 1. Load feed items
  const allItems = loadFeedItems();
  console.log(`Loaded ${allItems.length} total feed items`);

  // Filter to recent items only
  const cutoff = new Date(Date.now() - RECENCY_CUTOFF_MS);
  const recentItems = allItems.filter(item => new Date(item.createdAt) >= cutoff);
  console.log(`Recent items (last 2 days): ${recentItems.length}`);

  if (recentItems.length === 0) {
    console.log('No recent items to match. Done.');
    return;
  }

  // 2. Fetch active subscriptions
  const subscriptions = await supabaseGet<Subscription>(
    'subscriptions',
    'is_active=eq.true&select=*'
  );
  console.log(`Active subscriptions: ${subscriptions.length}`);

  if (subscriptions.length === 0) {
    console.log('No active subscriptions. Done.');
    return;
  }

  // 3. Match each subscription against recent items
  let totalMatches = 0;
  const allNewMatches: any[] = [];

  for (const sub of subscriptions) {
    const subMatches: any[] = [];

    for (const item of recentItems) {
      const matchedKeywords = matchItem(item, sub);
      if (matchedKeywords.length > 0) {
        subMatches.push({
          user_id: sub.user_id,
          feed_item_id: item.id,
          title: item.title,
          url: item.url,
          source: item.source,
          company_name: extractCompanyName(item.title),
          location: item.location || null,
          deadline: item.deadline || null,
          channel: item.channel,
          category: item.category,
          score: item.score,
          matched_keywords: matchedKeywords,
          is_read: false,
          is_pushed: false,
        });
      }
    }

    if (subMatches.length > 0) {
      console.log(`  User ${sub.user_id.substring(0, 8)}...: ${subMatches.length} matches`);
      allNewMatches.push(...subMatches);
      totalMatches += subMatches.length;
    }
  }

  console.log(`\nTotal new matches: ${totalMatches}`);

  if (allNewMatches.length === 0) {
    console.log('No new matches found. Done.');
    return;
  }

  // 4. Insert matches (ignore duplicates via unique constraint)
  // Batch insert in chunks of 100
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < allNewMatches.length; i += BATCH_SIZE) {
    const batch = allNewMatches.slice(i, i + BATCH_SIZE);
    const ok = await supabasePost('subscription_matches', batch, true);
    if (ok) {
      inserted += batch.length;
    }
  }

  console.log(`Inserted/skipped ${inserted} match records`);

  // 5. TODO: Email notification via Supabase Edge Function or Resend API
  // For MVP, matches are visible in the web UI inbox.
  // Email push will be added when Resend API key is configured.
  console.log('\nNote: Email push not yet configured. Matches are available in the web inbox.');

  console.log('\nDone.');
}

main().catch(console.error);

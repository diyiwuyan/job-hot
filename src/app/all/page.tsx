'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { PaginatedFeed, Channel, Category, FeedItem, FeedDay } from '@/lib/types';
import { Timeline } from '@/components/Timeline';
import { Pagination } from '@/components/Pagination';
import { FeedToolbar } from '@/components/FeedToolbar';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/job-hot';

// ─── Search index cache ─────────────────────────────────────────────
// Search indexes use a columnar format to minimize file size (~4.6 MB vs 11.7 MB).
// Format: { k: [field names], u/s/c/g: reverse maps, d: [[row], ...] }
// We download per-channel shards and cache the reconstructed objects in memory.
// Pagination within the same search session is instant (no network).
const searchCache = new Map<string, FeedItem[]>();

// Columnar shard type (matches build output)
interface ColumnarShard {
  k: string[];                          // field names
  u: Record<string, string>;            // URL code → prefix
  s: Record<string, string>;            // source code → full name
  c: Record<string, string>;            // channel code → full name
  g: Record<string, string>;            // category code → full name
  d: string[][];                         // data rows (all values are strings)
}

function restoreUrl(compact: string, urlMap: Record<string, string>): string {
  // First char might be a URL prefix code
  const code = compact[0];
  if (urlMap[code]) return urlMap[code] + compact.slice(1);
  return compact;
}

async function loadSearchShard(channel: Channel): Promise<FeedItem[]> {
  const shardKey = channel === 'all' ? 'all' : channel;
  const cached = searchCache.get(shardKey);
  if (cached) return cached;

  const res = await fetch(`${basePath}/api/feed/search-${shardKey}.json`);
  if (!res.ok) return [];

  const shard: ColumnarShard = await res.json();
  const { k: fields, u: urlMap, s: srcMap, c: chMap, g: catMap, d: rows } = shard;

  // Field index lookup
  const idx: Record<string, number> = {};
  fields.forEach((f, i) => { idx[f] = i; });

  // Reconstruct FeedItem objects from columnar rows
  const items: FeedItem[] = rows.map(row => {
    const srcCode = row[idx.source] as string;
    const chCode = row[idx.channel] as string;
    const catCode = row[idx.category] as string;
    const dateStr = row[idx.createdAt] as string;

    return {
      id: row[idx.id] as string,
      title: row[idx.title] as string,
      summary: row[idx.summary] as string,
      url: restoreUrl(row[idx.url] as string, urlMap),
      source: srcMap[srcCode] || srcCode,
      channel: (chMap[chCode] || chCode) as FeedItem['channel'],
      category: (catMap[catCode] || catCode) as FeedItem['category'],
      // Tags stored as pipe-separated string in columnar format
      tags: (row[idx.tags] as string).split('|'),
      createdAt: dateStr.length === 10 ? dateStr + 'T12:00:00.000Z' : dateStr,
      // Fields not in search index — provide defaults
      score: 0,
      featured: false,
      sourceAvatar: '',
      sourceHandle: '',
      images: [],
    };
  });

  searchCache.set(shardKey, items);
  return items;
}

/**
 * Client-side search: load the channel-specific search shard (cached),
 * filter by category + query, paginate, and group by date.
 */
async function searchFeed(query: string, channel: Channel, category: Category, page: number, cities: string[] = []): Promise<PaginatedFeed> {
  const ITEMS_PER_PAGE = 30;

  let items = await loadSearchShard(channel);

  // Exclude future-dated items (createdAt > now)
  const now = new Date().toISOString();
  items = items.filter(i => i.createdAt <= now);

  // Category filter (channel already handled by shard selection)
  if (category !== 'all') items = items.filter(i => i.category === category);

  // City filter: match against tags or summary
  if (cities.length > 0) {
    items = items.filter(i =>
      cities.some(city =>
        i.tags.some(t => t.includes(city)) ||
        i.summary.includes(city)
      )
    );
  }

  const lowerQuery = query.toLowerCase().trim();
  if (lowerQuery) {
    items = items.filter(i =>
      i.title.toLowerCase().includes(lowerQuery) ||
      i.summary.toLowerCase().includes(lowerQuery) ||
      i.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      i.source.toLowerCase().includes(lowerQuery)
    );
  }

  // Paginate
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));
  const start = (validPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(start, start + ITEMS_PER_PAGE);

  // Group by date (Beijing time)
  const groups = new Map<string, FeedItem[]>();
  for (const item of paginatedItems) {
    const d = new Date(new Date(item.createdAt).getTime() + 8 * 3600000);
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const key = `${m}月${day}日`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const days: FeedDay[] = Array.from(groups.entries()).map(([date, items]) => ({ date, items }));

  return { days, currentPage: validPage, totalPages };
}

/**
 * Prefetch search shard in background so city/search filters feel instant.
 * Called once on mount — the shard is cached in searchCache for reuse.
 */
function prefetchSearchShard(channel: Channel) {
  const key = channel === 'all' ? 'all' : channel;
  if (searchCache.has(key)) return; // already cached
  // Fire-and-forget: load shard into cache
  loadSearchShard(channel).catch(() => {});
}

function AllPageContent() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const channel = (searchParams.get('channel') || 'all') as Channel;
  const category = (searchParams.get('category') || 'all') as Category;
  const query = searchParams.get('q') || '';
  const citiesParam = searchParams.get('cities') || '';
  const cities = citiesParam ? citiesParam.split(',').filter(Boolean) : [];

  const [feed, setFeed] = useState<PaginatedFeed | null>(null);
  const [loading, setLoading] = useState(true);

  // Prefetch search shard in background on mount so city/search filters are fast
  useEffect(() => {
    prefetchSearchShard(channel);
  }, [channel]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (query || cities.length > 0) {
        // Search or city filter: use search index shard (cached after first load)
        const result = await searchFeed(query, channel, category, page, cities);
        setFeed(result);
      } else {
        // Normal browsing: load pre-generated paginated JSON (~20KB, instant)
        const filename = `${channel}-${category}-${page}.json`;
        const res = await fetch(`${basePath}/api/feed/${filename}`);
        if (!res.ok) {
          setFeed({ days: [], currentPage: 1, totalPages: 0 });
        } else {
          const data: PaginatedFeed = await res.json();
          const nowStr = new Date().toISOString();
          data.days = data.days.map(day => ({
            ...day,
            items: day.items.filter(item => item.createdAt <= nowStr),
          })).filter(day => day.items.length > 0);
          setFeed(data);
        }
      }
    } catch {
      setFeed({ days: [], currentPage: 1, totalPages: 0 });
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, channel, category, query, citiesParam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build search params for pagination
  const paginationParams: Record<string, string> = {};
  if (channel !== 'all') paginationParams.channel = channel;
  if (category !== 'all') paginationParams.category = category;
  if (query) paginationParams.q = query;
  if (cities.length > 0) paginationParams.cities = cities.join(',');

  return (
    <div className="page page-feed">
      <FeedToolbar
        currentChannel={channel}
        currentCategory={category}
        currentQuery={query}
        currentCities={cities}
        basePath="/all"
      />

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-title">
            {(query || cities.length > 0) ? '搜索数据加载中，首次稍慢…' : '加载中…'}
          </div>
        </div>
      ) : feed ? (
        <>
          <Timeline days={feed.days} />
          <Pagination
            currentPage={feed.currentPage}
            totalPages={feed.totalPages}
            baseUrl="/all"
            searchParams={paginationParams}
          />
        </>
      ) : null}
    </div>
  );
}

export default function AllPage() {
  return (
    <Suspense fallback={<div className="empty-state"><div className="empty-state-title">加载中...</div></div>}>
      <AllPageContent />
    </Suspense>
  );
}

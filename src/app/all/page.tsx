'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { PaginatedFeed, Channel, Category, FeedItem, FeedDay } from '@/lib/types';
import { Timeline } from '@/components/Timeline';
import { Pagination } from '@/components/Pagination';
import { FeedToolbar } from '@/components/FeedToolbar';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/job-hot';

/**
 * Client-side search: load the lightweight search index, filter, paginate, and group.
 */
async function searchFeed(query: string, channel: Channel, category: Category, page: number): Promise<PaginatedFeed> {
  const ITEMS_PER_PAGE = 30;
  const res = await fetch(`${basePath}/api/feed/search-index.json`);
  if (!res.ok) return { days: [], currentPage: 1, totalPages: 0 };

  let items: FeedItem[] = await res.json();

  // Exclude future-dated items (createdAt > now)
  const now = new Date().toISOString();
  items = items.filter(i => i.createdAt <= now);

  // Apply filters
  if (channel !== 'all') items = items.filter(i => i.channel === channel);
  if (category !== 'all') items = items.filter(i => i.category === category);

  const lowerQuery = query.toLowerCase().trim();
  items = items.filter(i =>
    i.title.toLowerCase().includes(lowerQuery) ||
    i.summary.toLowerCase().includes(lowerQuery) ||
    i.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
    i.source.toLowerCase().includes(lowerQuery)
  );

  // Paginate
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));
  const start = (validPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(start, start + ITEMS_PER_PAGE);

  // Group by date (simple: use createdAt date portion)
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

function AllPageContent() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const channel = (searchParams.get('channel') || 'all') as Channel;
  const category = (searchParams.get('category') || 'all') as Category;
  const query = searchParams.get('q') || '';

  const [feed, setFeed] = useState<PaginatedFeed | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (query) {
        // Search: load search index and filter client-side
        const result = await searchFeed(query, channel, category, page);
        setFeed(result);
      } else {
        // Normal browsing: load pre-generated paginated JSON (~20KB)
        const filename = `${channel}-${category}-${page}.json`;
        const res = await fetch(`${basePath}/api/feed/${filename}`);
        if (!res.ok) {
          setFeed({ days: [], currentPage: 1, totalPages: 0 });
        } else {
          const data: PaginatedFeed = await res.json();
          // Runtime guard: filter out any future-dated items that slipped through build
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
  }, [page, channel, category, query]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build search params for pagination
  const paginationParams: Record<string, string> = {};
  if (channel !== 'all') paginationParams.channel = channel;
  if (category !== 'all') paginationParams.category = category;
  if (query) paginationParams.q = query;

  return (
    <div className="page page-feed">
      <FeedToolbar
        currentChannel={channel}
        currentCategory={category}
        currentQuery={query}
        basePath="/all"
      />

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-title">加载中...</div>
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

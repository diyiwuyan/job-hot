'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { getFeed } from '@/lib/feed';
import { Channel, Category } from '@/lib/types';
import { Timeline } from '@/components/Timeline';
import { Pagination } from '@/components/Pagination';
import { FeedToolbar } from '@/components/FeedToolbar';

function AllPageContent() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const channel = (searchParams.get('channel') || 'all') as Channel;
  const category = (searchParams.get('category') || 'all') as Category;
  const query = searchParams.get('q') || '';

  const feed = getFeed({ page, channel, category, query });

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

      <Timeline days={feed.days} />

      <Pagination
        currentPage={feed.currentPage}
        totalPages={feed.totalPages}
        baseUrl="/all"
        searchParams={paginationParams}
      />
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

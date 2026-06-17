'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { PaginatedFeed, Channel, Category, CompanyType, Major, FeedItem, FeedDay } from '@/lib/types';
import { Timeline } from '@/components/Timeline';
import { Pagination } from '@/components/Pagination';
import { FeedToolbar } from '@/components/FeedToolbar';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// ─── Search index cache ─────────────────────────────────────────────
const searchCache = new Map<string, FeedItem[]>();

interface ColumnarShard {
  k: string[];
  u: Record<string, string>;
  s: Record<string, string>;
  c: Record<string, string>;
  g: Record<string, string>;
  m?: Record<string, string>;
  d: string[][];
}

// 专业大类全名 → short code（与 generate-pages.ts 中 majorCodeMap 一致）
const majorCodeMap: Record<string, string> = {
  unlimited: 'X', cs: 'cs', ee: 'ee', auto: 'au', mech: 'me', civil: 'ci',
  material: 'ma', math: 'mt', physics: 'ph', bio: 'bi', medical: 'md',
  finance: 'fi', management: 'mg', law: 'la', literature: 'li', art: 'ar',
  agri: 'ag', education: 'ed',
};

function restoreUrl(compact: string, urlMap: Record<string, string>): string {
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

  const idx: Record<string, number> = {};
  fields.forEach((f, i) => { idx[f] = i; });

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
      companyType: (row[idx.companyType] as FeedItem['companyType']) || undefined,
      location: (row[idx.location] as string) || undefined,
      deadline: (row[idx.deadline] as string) || undefined,
      tags: (row[idx.tags] as string).split('|'),
      createdAt: dateStr.length === 10 ? dateStr + 'T12:00:00.000Z' : dateStr,
      score: 0,
      featured: false,
      sourceAvatar: '',
      sourceHandle: '',
      images: [],
      // 专业大类短码列表（可能不存在于旧分片）
      majors: idx.majors !== undefined
        ? ((row[idx.majors] as string) || '').split('|').filter(Boolean)
        : [],
    } as FeedItem & { majors: string[] };
  });

  searchCache.set(shardKey, items);
  return items;
}

async function searchFeed(
  query: string,
  channel: Channel,
  category: Category,
  page: number,
  cities: string[] = [],
  companyType: CompanyType = 'all',
  major: Major = 'all',
): Promise<PaginatedFeed> {
  const ITEMS_PER_PAGE = 30;

  let items = await loadSearchShard(channel);

  const now = new Date().toISOString();
  items = items.filter(i => i.createdAt <= now);

  if (category !== 'all') items = items.filter(i => i.category === category);

  // 专业大类过滤（majors 列存的是短码）
  if (major !== 'all') {
    const code = majorCodeMap[major] || major;
    items = items.filter(i => {
      const ms = (i as FeedItem & { majors?: string[] }).majors || [];
      return ms.includes(code);
    });
  }

  // Company type filter
  if (companyType !== 'all') {
    items = items.filter(i => i.companyType === companyType);
  }

  // City filter
  if (cities.length > 0) {
    items = items.filter(i =>
      cities.some(city =>
        i.tags.some(t => t.includes(city)) ||
        i.summary.includes(city) ||
        (i.location && i.location.includes(city))
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

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));
  const start = (validPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(start, start + ITEMS_PER_PAGE);

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

function prefetchSearchShard(channel: Channel) {
  const key = channel === 'all' ? 'all' : channel;
  if (searchCache.has(key)) return;
  loadSearchShard(channel).catch(() => {});
}

/* ── CSV Export ────────────────────────────────────────────────── */
function exportCSV(days: FeedDay[]) {
  const items = days.flatMap(d => d.items);
  if (items.length === 0) return;

  const headers = ['标题', '公司', '来源', '类型', '行业', '公司性质', '城市', '截止日期', '分数', '链接', '日期'];
  const rows = items.map(item => [
    item.title,
    item.tags[0] || '',
    item.source,
    item.channel,
    item.category,
    item.companyType || '',
    item.location || '',
    item.deadline || '',
    item.score.toString(),
    item.url,
    item.createdAt.slice(0, 10),
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jobhot-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Back to Top Button ───────────────────────────────────────── */
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="回到顶部"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

function AllPageContent() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const channel = (searchParams.get('channel') || 'all') as Channel;
  const category = (searchParams.get('category') || 'all') as Category;
  const companyType = (searchParams.get('companyType') || 'all') as CompanyType;
  const major = (searchParams.get('major') || 'all') as Major;
  const query = searchParams.get('q') || '';
  const citiesParam = searchParams.get('cities') || '';
  const cities = citiesParam ? citiesParam.split(',').filter(Boolean) : [];

  const [feed, setFeed] = useState<PaginatedFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'detail' | 'table'>('detail');

  // Read saved view mode preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jobhot-viewmode');
      if (saved === 'detail' || saved === 'table') setViewMode(saved);
    } catch {}
  }, []);

  function handleViewModeChange(mode: 'detail' | 'table') {
    setViewMode(mode);
    try { localStorage.setItem('jobhot-viewmode', mode); } catch {}
  }

  // 仅在用户真正发起搜索/筛选时才预热搜索包，避免移动端一进页面就空载下载 9MB
  const willSearch = !!query || cities.length > 0 || companyType !== 'all' || major !== 'all';
  useEffect(() => {
    if (willSearch) prefetchSearchShard(channel);
  }, [channel, willSearch]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (query || cities.length > 0 || companyType !== 'all' || major !== 'all') {
        const result = await searchFeed(query, channel, category, page, cities, companyType, major);
        setFeed(result);
      } else {
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
  }, [page, channel, category, companyType, major, query, citiesParam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const paginationParams: Record<string, string> = {};
  if (channel !== 'all') paginationParams.channel = channel;
  if (category !== 'all') paginationParams.category = category;
  if (companyType !== 'all') paginationParams.companyType = companyType;
  if (major !== 'all') paginationParams.major = major;
  if (query) paginationParams.q = query;
  if (cities.length > 0) paginationParams.cities = cities.join(',');

  return (
    <div className="page page-feed">
      <FeedToolbar
        currentChannel={channel}
        currentCategory={category}
        currentQuery={query}
        currentCities={cities}
        currentCompanyType={companyType}
        currentMajor={major}
        basePath="/all"
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onExportCSV={feed ? () => exportCSV(feed.days) : undefined}
      />

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-title">
            {(query || cities.length > 0 || companyType !== 'all' || major !== 'all') ? '搜索数据加载中，首次稍慢…' : '加载中…'}
          </div>
        </div>
      ) : feed ? (
        <>
          <Timeline days={feed.days} viewMode={viewMode} />
          <Pagination
            currentPage={feed.currentPage}
            totalPages={feed.totalPages}
            baseUrl="/all"
            searchParams={paginationParams}
          />
        </>
      ) : null}

      <BackToTop />
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

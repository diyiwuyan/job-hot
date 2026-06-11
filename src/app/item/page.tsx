'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { FeedItem } from '@/lib/types';
import { ShareButton } from '@/components/ShareButton';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/job-hot';

interface ColumnarShard {
  k: string[];
  u: Record<string, string>;
  s: Record<string, string>;
  c: Record<string, string>;
  g: Record<string, string>;
  m?: Record<string, string>;
  d: (string | number)[][];
}

function restoreUrl(compact: string, urlMap: Record<string, string>): string {
  const code = compact[0];
  if (urlMap[code]) return urlMap[code] + compact.slice(1);
  return compact;
}

let shardPromise: Promise<ColumnarShard | null> | null = null;
function loadAllShard(): Promise<ColumnarShard | null> {
  if (!shardPromise) {
    shardPromise = fetch(`${basePath}/api/feed/search-all.json`)
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return shardPromise;
}

async function findItemById(id: string): Promise<FeedItem | null> {
  const shard = await loadAllShard();
  if (!shard) return null;
  const { k: fields, u: urlMap, s: srcMap, c: chMap, g: catMap, d: rows } = shard;
  const idx: Record<string, number> = {};
  fields.forEach((f, i) => { idx[f] = i; });

  const row = rows.find(r => (r[idx.id] as string) === id);
  if (!row) return null;

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
    tags: ((row[idx.tags] as string) || '').split('|').filter(Boolean),
    createdAt: dateStr.length === 10 ? dateStr + 'T12:00:00.000Z' : dateStr,
    score: 0,
    featured: false,
  };
}

function CompanyTypeBadge({ type }: { type?: string }) {
  if (!type || type === 'private') return null;
  const labelMap: Record<string, { label: string; cls: string }> = {
    foreign: { label: '外企', cls: 'badge-foreign' },
    state: { label: '央国企', cls: 'badge-state' },
    bank: { label: '银行', cls: 'badge-bank' },
    institution: { label: '事业单位', cls: 'badge-state' },
  };
  const info = labelMap[type];
  if (!info) return null;
  return <span className={`company-badge ${info.cls}`}>{info.label}</span>;
}

function formatDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 8 * 3600000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function ItemContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const [item, setItem] = useState<FeedItem | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading');

  useEffect(() => {
    let cancelled = false;
    if (!id) { setState('notfound'); return; }
    setState('loading');
    findItemById(id).then(found => {
      if (cancelled) return;
      if (found) { setItem(found); setState('ok'); }
      else setState('notfound');
    });
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="page item-page">
      {state === 'loading' && (
        <div className="empty-state"><div className="empty-state-title">加载中…</div></div>
      )}

      {state === 'notfound' && (
        <div className="empty-state">
          <div className="empty-state-title">没找到这条岗位</div>
          <div className="empty-state-desc">它可能已过期或链接有误。</div>
          <Link href="/" className="share-btn-full" style={{ marginTop: '1rem', textDecoration: 'none' }}>
            返回 JOBHOT 首页
          </Link>
        </div>
      )}

      {state === 'ok' && item && (
        <>
          {/* 岗位卡片 */}
          <article className={`timeline-card item-card${item.featured ? ' timeline-card-featured' : ''}`}>
            <div className="timeline-card-head">
              <div className="timeline-source">
                <span>{item.source}</span>
                <CompanyTypeBadge type={item.companyType} />
              </div>
              <span className="item-date">{formatDate(item.createdAt)}</span>
            </div>

            <h1 className="item-title">
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="item-title-link">
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </h1>

            {item.summary && <p className="timeline-summary item-summary">{item.summary}</p>}

            {(item.location || item.deadline) && (
              <div className="timeline-meta-row">
                {item.location && (
                  <span className="meta-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {item.location}
                  </span>
                )}
                {item.deadline && (
                  <span className="meta-item meta-deadline">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {item.deadline}
                  </span>
                )}
              </div>
            )}

            {item.tags.length > 0 && (
              <div className="timeline-tags">
                {item.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </div>
            )}

            <div className="item-actions">
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="item-origin-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  查看原岗位详情
                </a>
              )}
              <ShareButton item={item} variant="full" />
            </div>
          </article>

          {/* JOBHOT 介绍 */}
          <section className="timeline-card item-about">
            <h2 className="item-about-title">
              关于 <span className="text-gradient">JOBHOT</span>
            </h2>
            <p className="item-about-text">
              JOBHOT 是一个大学生求职信息聚合平台，自动从国聘、DeepOffer、牛客网、应届生求职网等多个数据源抓取
              校招、实习和宣讲会信息，通过智能评分系统筛选高质量内容，帮助求职者快速获取最新、最热的招聘动态。
            </p>
            <div className="item-about-actions">
              <Link href="/" className="share-btn-full">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                进入 JOBHOT 首页
              </Link>
              <Link href="/about" className="item-about-link">了解更多 →</Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function ItemPage() {
  return (
    <Suspense fallback={<div className="empty-state"><div className="empty-state-title">加载中…</div></div>}>
      <ItemContent />
    </Suspense>
  );
}

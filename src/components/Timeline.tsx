'use client';

import { useState, useEffect } from 'react';
import { FeedDay, FeedItem } from '@/lib/types';

function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 50) return 'score-mid';
  return 'score-muted';
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const bjTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const hours = bjTime.getUTCHours().toString().padStart(2, '0');
  const minutes = bjTime.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/* ── Bookmark helpers (localStorage) ────────────────────────────── */
function getBookmarks(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('jobhot-bookmarks');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function toggleBookmark(id: string): Set<string> {
  const bm = getBookmarks();
  if (bm.has(id)) bm.delete(id);
  else bm.add(id);
  localStorage.setItem('jobhot-bookmarks', JSON.stringify([...bm]));
  return bm;
}

/* ── Company type badge ─────────────────────────────────────────── */
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

/* ── Detail Card ────────────────────────────────────────────────── */
function TimelineCard({ item, bookmarked, onToggleBookmark }: { item: FeedItem; bookmarked: boolean; onToggleBookmark: () => void }) {
  return (
    <article className={`timeline-card${item.featured ? ' timeline-card-featured' : ''}`}>
      <div className="timeline-card-head">
        <div className="timeline-source">
          {item.sourceAvatar && (
            <img src={item.sourceAvatar} alt="" className="timeline-source-icon" width={16} height={16} />
          )}
          <span>{item.source}</span>
          <CompanyTypeBadge type={item.companyType} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`bookmark-btn${bookmarked ? ' bookmarked' : ''}`}
            onClick={onToggleBookmark}
            title={bookmarked ? '取消收藏' : '收藏'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          {item.featured && <span className="timeline-selected-badge">精选</span>}
          <span className={`timeline-score ${getScoreClass(item.score)}`} title="AI 推荐分">{item.score}</span>
        </div>
      </div>

      <a href={item.url} target="_blank" rel="noopener noreferrer" className="timeline-title">
        {item.title}
      </a>

      <p className="timeline-summary">{item.summary}</p>

      {/* Location & Deadline row */}
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

      {item.images && item.images.length > 0 && (
        <div className="timeline-images" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {item.images.map((img, i) => (
            <img key={i} src={img} alt="" style={{ maxWidth: '200px', borderRadius: '0.5rem', border: '1px solid var(--border)' }} loading="lazy" />
          ))}
        </div>
      )}

      <div className="timeline-tags">
        {item.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </article>
  );
}

/* ── Compact Row ────────────────────────────────────────────────── */
function CompactRow({ item, bookmarked, onToggleBookmark }: { item: FeedItem; bookmarked: boolean; onToggleBookmark: () => void }) {
  // Extract company name from first tag
  const company = item.tags[0] || '';
  return (
    <div className={`compact-row${item.featured ? ' compact-row-featured' : ''}`}>
      <span className="compact-date">{formatTime(item.createdAt)}</span>
      <CompanyTypeBadge type={item.companyType} />
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="compact-title" title={item.title}>
        <span className="compact-company">{company}</span>
        <span className="compact-sep">·</span>
        <span>{item.title.replace(`${company} — `, '').replace(company, '').trim() || item.title}</span>
      </a>
      {item.location && <span className="compact-location">{item.location}</span>}
      {item.deadline && <span className="compact-deadline">{item.deadline}</span>}
      <span className="compact-source">{item.source}</span>
      <span className={`timeline-score timeline-score-sm ${getScoreClass(item.score)}`}>{item.score}</span>
      <button
        type="button"
        className={`bookmark-btn bookmark-btn-sm${bookmarked ? ' bookmarked' : ''}`}
        onClick={onToggleBookmark}
        title={bookmarked ? '取消收藏' : '收藏'}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}

/* ── Detail Timeline Item ───────────────────────────────────────── */
function TimelineItem({ item, bookmarked, onToggleBookmark }: { item: FeedItem; bookmarked: boolean; onToggleBookmark: () => void }) {
  return (
    <div className={`timeline-item${item.featured ? ' timeline-item-selected' : ''}`}>
      <div className="timeline-time">{formatTime(item.createdAt)}</div>
      <div className="timeline-rail" aria-hidden="true">
        <span className="timeline-dot"></span>
        <span className="timeline-line"></span>
      </div>
      <TimelineCard item={item} bookmarked={bookmarked} onToggleBookmark={onToggleBookmark} />
    </div>
  );
}

/* ── Main Timeline Component ────────────────────────────────────── */
export function Timeline({ days, viewMode = 'detail' }: { days: FeedDay[]; viewMode?: 'detail' | 'compact' }) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  function handleToggle(id: string) {
    setBookmarks(new Set(toggleBookmark(id)));
  }

  if (days.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <div className="empty-state-title">暂无相关内容</div>
        <div className="empty-state-desc">试试调整筛选条件或搜索关键词</div>
      </div>
    );
  }

  if (viewMode === 'compact') {
    return (
      <section className="compact-list">
        {days.map((day) => (
          <div key={day.date} className="compact-day">
            <div className="timeline-day-head">
              <div className="timeline-date">{day.date}</div>
            </div>
            {day.items.map((item) => (
              <CompactRow
                key={item.id}
                item={item}
                bookmarked={bookmarks.has(item.id)}
                onToggleBookmark={() => handleToggle(item.id)}
              />
            ))}
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="timeline">
      {days.map((day) => (
        <div key={day.date} className="timeline-day">
          <div className="timeline-day-head">
            <div className="timeline-date">{day.date}</div>
          </div>
          <div className="timeline-day-items">
            {day.items.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                bookmarked={bookmarks.has(item.id)}
                onToggleBookmark={() => handleToggle(item.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

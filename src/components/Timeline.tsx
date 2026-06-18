'use client';

import React from 'react';
import { FeedDay, FeedItem } from '@/lib/types';
import { ShareButton } from '@/components/ShareButton';
import { useBookmarks } from '@/hooks/useBookmarks';

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

/* ── Login prompt toast (simple) ────────────────────────────────── */
function showLoginToast() {
  // Brief non-blocking notification
  if (typeof window !== 'undefined') {
    const existing = document.getElementById('login-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'login-toast';
    toast.className = 'login-toast';
    toast.textContent = '请先登录后再收藏';
    toast.onclick = () => { window.location.href = '/login'; toast.remove(); };
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
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
          <ShareButton item={item} variant="icon" />
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
      <span className={`timeline-score timeline-score-sm ${getScoreClass(item.score)}`}>{item.score}</span>
      <ShareButton item={item} variant="icon" />
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

/* ── Helper maps for table view ──────────────────────────────────── */
const channelLabel: Record<string, string> = {
  campus: '校招', intern: '实习', talk: '宣讲会', all: '全部',
};
const categoryLabel: Record<string, string> = {
  internet: '互联网/AI', foreign: '外企', game: '游戏', auto_ic: '车企/IC',
  finance: '金融/国企', security: '安全/云', other: '其他', all: '全部',
};
const companyTypeLabel: Record<string, string> = {
  foreign: '外企', state: '央国企', private: '民企', bank: '银行', institution: '事业单位',
};

function extractCompanyAndPosition(item: FeedItem): { company: string; position: string } {
  const company = item.tags[0] || '';
  // title 格式通常是 "公司名 — 招聘类型 | 岗位" 或 "公司名 — 岗位"
  let position = item.title;
  if (company) {
    position = position.replace(`${company} — `, '').replace(`${company}—`, '').replace(company, '').trim();
  }
  // 去掉招聘类型前缀
  position = position.replace(/^(校招|实习|2026届|2025届|秋招|春招|补录)\s*\|\s*/, '').trim();
  return { company: company || '—', position: position || item.title };
}

function extractIndustry(item: FeedItem): string {
  // 优先取 tags 里的行业标签（通常是第3-4个 tag，含"/"的）
  const industryTag = item.tags.find((t, i) => i > 0 && t.includes('/') && !['央国企', '外企', '银行', '事业单位'].includes(t));
  if (industryTag) return industryTag;
  return categoryLabel[item.category] || '—';
}

function formatDate(dateStr: string): string {
  const d = new Date(new Date(dateStr).getTime() + 8 * 3600000);
  const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = d.getUTCDate().toString().padStart(2, '0');
  const h = d.getUTCHours().toString().padStart(2, '0');
  const min = d.getUTCMinutes().toString().padStart(2, '0');
  return `${m}-${day} ${h}:${min}`;
}

/* ── Table View ─────────────────────────────────────────────────── */
function TableView({ days, bookmarks, onToggle }: { days: FeedDay[]; bookmarks: Set<string>; onToggle: (item: FeedItem) => void }) {
  const allItems = days.flatMap(d => d.items);

  if (allItems.length === 0) {
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

  return (
    <div className="feed-table-wrap">
      <table className="feed-table">
        <thead>
          <tr>
            <th className="feed-th-time">更新时间</th>
            <th className="feed-th-company">企业名称</th>
            <th className="feed-th-type">企业性质</th>
            <th className="feed-th-industry">行业</th>
            <th className="feed-th-channel">招聘类型</th>
            <th className="feed-th-position">招聘岗位</th>
            <th className="feed-th-location">工作地点</th>
            <th className="feed-th-deadline">截止时间</th>
            <th className="feed-th-score">推荐</th>
            <th className="feed-th-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          {allItems.map(item => {
            const { company, position } = extractCompanyAndPosition(item);
            const bookmarked = bookmarks.has(item.id);
            return (
              <tr key={item.id} className={item.featured ? 'feed-tr-featured' : ''}>
                <td className="feed-td-time">{formatDate(item.createdAt)}</td>
                <td className="feed-td-company">
                  <CompanyTypeBadge type={item.companyType} />
                  {company}
                </td>
                <td className="feed-td-type">{companyTypeLabel[item.companyType || ''] || '民企'}</td>
                <td className="feed-td-industry">{extractIndustry(item)}</td>
                <td className="feed-td-channel">
                  <span className={`feed-channel-tag feed-channel-${item.channel}`}>
                    {channelLabel[item.channel] || item.channel}
                  </span>
                </td>
                <td className="feed-td-position">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" title={item.title}>
                    {position}
                  </a>
                </td>
                <td className="feed-td-location">{item.location || '—'}</td>
                <td className="feed-td-deadline">{item.deadline || '—'}</td>
                <td className="feed-td-score">
                  <span className={`timeline-score timeline-score-sm ${getScoreClass(item.score)}`}>{item.score}</span>
                </td>
                <td className="feed-td-actions">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="feed-table-link" title="查看详情">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <button
                    type="button"
                    className={`bookmark-btn bookmark-btn-sm${bookmarked ? ' bookmarked' : ''}`}
                    onClick={() => onToggle(item)}
                    title={bookmarked ? '取消收藏' : '收藏'}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main Timeline Component ────────────────────────────────────── */
export function Timeline({ days, viewMode = 'detail' }: { days: FeedDay[]; viewMode?: 'detail' | 'table' }) {
  const { bookmarkIds: bookmarks, toggle } = useBookmarks();

  async function handleToggle(item: FeedItem) {
    const result = await toggle(item);
    if (result === 'login') {
      showLoginToast();
    }
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

  if (viewMode === 'table') {
    return <TableView days={days} bookmarks={bookmarks} onToggle={handleToggle} />;
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
                onToggleBookmark={() => handleToggle(item)}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

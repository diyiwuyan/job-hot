import Link from 'next/link';
import { FeedDay, FeedItem } from '@/lib/types';

function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 50) return 'score-mid';
  return 'score-muted';
}

function formatTime(dateString: string): string {
  // Use Beijing time (UTC+8) for consistent display
  const date = new Date(dateString);
  const bjTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const hours = bjTime.getUTCHours().toString().padStart(2, '0');
  const minutes = bjTime.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function TimelineCard({ item }: { item: FeedItem }) {
  return (
    <article className={`timeline-card${item.featured ? ' timeline-card-featured' : ''}`}>
      <div className="timeline-card-head">
        <div className="timeline-source">
          {item.sourceAvatar && (
            <img
              src={item.sourceAvatar}
              alt=""
              className="timeline-source-icon"
              width={16}
              height={16}
            />
          )}
          <span>{item.source}</span>
          {item.sourceHandle && (
            <span className="muted" style={{ fontSize: '0.6875rem' }}>
              {item.sourceHandle}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {item.featured && (
            <span className="timeline-selected-badge">精选</span>
          )}
          <span className={`timeline-score ${getScoreClass(item.score)}`} title="AI 推荐分">
            {item.score}
          </span>
        </div>
      </div>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="timeline-title"
      >
        {item.title}
      </a>

      <p className="timeline-summary">{item.summary}</p>

      {item.images && item.images.length > 0 && (
        <div className="timeline-images" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {item.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              style={{
                maxWidth: '200px',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
              }}
              loading="lazy"
            />
          ))}
        </div>
      )}

      <div className="timeline-tags">
        {item.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function TimelineItem({ item }: { item: FeedItem }) {
  return (
    <div className={`timeline-item${item.featured ? ' timeline-item-selected' : ''}`}>
      <div className="timeline-time">{formatTime(item.createdAt)}</div>
      <div className="timeline-rail" aria-hidden="true">
        <span className="timeline-dot"></span>
        <span className="timeline-line"></span>
      </div>
      <TimelineCard item={item} />
    </div>
  );
}

export function Timeline({ days }: { days: FeedDay[] }) {
  if (days.length === 0) {
    return (
      <div className="empty-state">
        <svg
          className="empty-state-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <div className="empty-state-title">暂无相关内容</div>
        <div className="empty-state-desc">试试调整筛选条件或搜索关键词</div>
      </div>
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
              <TimelineItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

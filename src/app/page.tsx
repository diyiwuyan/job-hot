import Link from 'next/link';
import * as fs from 'fs';
import * as path from 'path';
import { FeedItem } from '@/lib/types';

function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 50) return 'score-mid';
  return 'score-muted';
}

function FeaturedCard({ item }: { item: FeedItem }) {
  return (
    <article className="timeline-card" style={{ marginBottom: '1rem' }}>
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
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="timeline-selected-badge">精选</span>
          <span className={`timeline-score ${getScoreClass(item.score)}`}>
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

interface HomeData {
  featuredItems: FeedItem[];
  totalItems: number;
  campusCount: number;
  internCount: number;
  talkCount?: number;
}

function getHomeData(): HomeData {
  // Read pre-generated home data at build time (Server Component)
  const jsonPath = path.join(process.cwd(), 'public', 'api', 'feed', 'home.json');
  if (fs.existsSync(jsonPath)) {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
  // Fallback: import from data.ts (first build before generate-pages runs)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { feedItems } = require('@/lib/data');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getFeaturedItems } = require('@/lib/feed');
  return {
    featuredItems: getFeaturedItems(10),
    totalItems: feedItems.length,
    campusCount: feedItems.filter((i: FeedItem) => i.channel === 'campus').length,
    internCount: feedItems.filter((i: FeedItem) => i.channel === 'intern').length,
  };
}

export default function HomePage() {
  const { featuredItems, totalItems, campusCount, internCount, talkCount = 0 } = getHomeData();

  return (
    <div className="page page-home">
      <div className="page-header">
        <div style={{ marginBottom: '0.5rem' }}>
          <h1>
            <span>JOB</span>
            <span className="text-gradient">HOT</span>
            {' '}精选
          </h1>
          <p>编辑精选的高质量求职信息，助你高效求职</p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '0.75rem',
        marginTop: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { label: '总信息量', value: totalItems, color: 'var(--accent)' },
          { label: '校招岗位', value: campusCount, color: 'var(--success)' },
          { label: '实习岗位', value: internCount, color: 'var(--warning)' },
          { label: '宣讲会', value: talkCount, color: 'var(--danger)' },
          { label: '精选推荐', value: featuredItems.length, color: 'var(--gradient-end)' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="timeline-card"
            style={{ textAlign: 'center', padding: '0.875rem 0.5rem' }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div style={{ marginTop: '1.5rem' }}>
        {featuredItems.map((item) => (
          <FeaturedCard key={item.id} item={item} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href="/all" className="btn">
          查看全部动态 →
        </Link>
      </div>
    </div>
  );
}

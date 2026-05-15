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
          {item.companyType && item.companyType !== 'private' && (
            <span className={`company-badge ${
              item.companyType === 'foreign' ? 'badge-foreign' :
              item.companyType === 'state' ? 'badge-state' :
              item.companyType === 'bank' ? 'badge-bank' : 'badge-state'
            }`}>
              {item.companyType === 'foreign' ? '外企' :
               item.companyType === 'state' ? '央国企' :
               item.companyType === 'bank' ? '银行' : '事业单位'}
            </span>
          )}
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

      {/* Location & Deadline */}
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
  companyCount?: number;
  sourceCount?: number;
  todayCount?: number;
}

function getHomeData(): HomeData {
  const jsonPath = path.join(process.cwd(), 'public', 'api', 'feed', 'home.json');
  if (fs.existsSync(jsonPath)) {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
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

const dataSources = [
  { name: '国聘', color: '#e53935' },
  { name: '牛客网', color: '#00c853' },
  { name: 'DeepOffer', color: '#6366f1' },
  { name: '应届生求职网', color: '#ff9800' },
  { name: 'Campus2026', color: '#2196f3' },
];

export default function HomePage() {
  const {
    featuredItems, totalItems, campusCount, internCount,
    talkCount = 0, companyCount = 0, todayCount = 0,
  } = getHomeData();

  return (
    <div className="page page-home">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">
          <span className="brand-job">JOB</span>
          <span className="orbit-dot" aria-hidden="true"></span>
          <span className="brand-hot" style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>HOT</span>
        </h1>
        <p className="hero-subtitle">聚合 {dataSources.length} 大平台，每日自动更新校招信息</p>
        <p className="hero-desc">大学生求职信息一站式聚合平台</p>
      </div>

      {/* Stats Grid - Enhanced */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-value">{totalItems.toLocaleString()}</div>
          <div className="stat-label">总信息量</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{campusCount.toLocaleString()}</div>
          <div className="stat-label">校招岗位</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{internCount.toLocaleString()}</div>
          <div className="stat-label">实习岗位</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{talkCount.toLocaleString()}</div>
          <div className="stat-label">宣讲会</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{companyCount.toLocaleString()}</div>
          <div className="stat-label">覆盖企业</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--gradient-end)' }}>{todayCount.toLocaleString()}</div>
          <div className="stat-label">今日更新</div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="sources-section">
        <div className="sources-label">数据来源</div>
        <div className="sources-list">
          {dataSources.map(src => (
            <span key={src.name} className="source-badge" style={{ borderColor: src.color, color: src.color }}>
              {src.name}
            </span>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', margin: '1.5rem 0' }}>
        <Link href="/all" className="btn btn-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          全部动态
        </Link>
        <Link href="/all/?channel=campus" className="btn btn-secondary btn-lg">
          校招信息
        </Link>
        <Link href="/all/?channel=intern" className="btn btn-secondary btn-lg">
          实习信息
        </Link>
      </div>

      <div className="divider" />

      {/* Featured Items */}
      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          <span className="text-gradient">编辑精选</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>
            TOP {featuredItems.length}
          </span>
        </h2>
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

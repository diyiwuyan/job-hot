'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FeedItem } from '@/lib/types';
import { DailyAccordion } from '@/components/DailyAccordion';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const dataSources = [
  { name: '国聘', color: '#e53935' },
  { name: '牛客网', color: '#00c853' },
  { name: 'DeepOffer', color: '#6366f1' },
  { name: '应届生求职网', color: '#ff9800' },
  { name: 'Campus2026', color: '#2196f3' },
];

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

interface DailyDay {
  date: string;
  label: string;
  items: FeedItem[];
}

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [dailyDays, setDailyDays] = useState<DailyDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${basePath}/api/feed/home.json`).then(r => r.ok ? r.json() : null),
      fetch(`${basePath}/api/feed/daily-digest.json`).then(r => r.ok ? r.json() : []),
    ]).then(([home, daily]) => {
      if (home) setHomeData(home);
      // Filter future items
      const nowStr = new Date().toISOString();
      const filtered = (daily as DailyDay[]).map(day => ({
        ...day,
        items: day.items.filter((item: FeedItem) => item.createdAt <= nowStr),
      })).filter(day => day.items.length > 0);
      setDailyDays(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalItems = homeData?.totalItems || 0;
  const campusCount = homeData?.campusCount || 0;
  const internCount = homeData?.internCount || 0;
  const talkCount = homeData?.talkCount || 0;
  const companyCount = homeData?.companyCount || 0;
  const todayCount = homeData?.todayCount || 0;

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

      {/* Stats Grid */}
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

      {/* Daily Featured Section (merged from daily page) */}
      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          <span className="text-gradient">每日精选</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>
            近 {dailyDays.length} 天
          </span>
        </h2>

        {loading ? (
          <div className="empty-state" style={{ marginTop: '1rem' }}>
            <div className="empty-state-title">加载中...</div>
          </div>
        ) : (
          <DailyAccordion days={dailyDays} />
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href="/all" className="btn">
          查看全部动态 →
        </Link>
      </div>
    </div>
  );
}

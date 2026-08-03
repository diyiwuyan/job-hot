'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ZhiluBrandIntro } from '@/components/ZhiluBrandIntro';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

interface HomeData {
  totalItems: number;
  campusCount: number;
  internCount: number;
  talkCount?: number;
  companyCount?: number;
  todayCount?: number;
}

const features = [
  {
    icon: '🔄',
    title: '每日自动更新',
    desc: '全网校招信息自动采集，每天更新，不错过任何机会',
  },
  {
    icon: '🎯',
    title: '精准筛选',
    desc: '按行业、城市、岗位类型快速过滤，找到最匹配的职位',
  },
  {
    icon: '⭐',
    title: '智能评分',
    desc: '基于岗位质量、企业规模、时效性等维度综合打分排序',
  },
  {
    icon: '🔔',
    title: '订阅推送',
    desc: '设置关键词订阅，新岗位第一时间邮件通知你',
  },
  {
    icon: '📌',
    title: '收藏管理',
    desc: '一键收藏心仪岗位，云端同步，随时查看',
  },
  {
    icon: '🧭',
    title: '求职导航',
    desc: '精选50+求职网站分类导航，一站直达各大招聘平台',
  },
];

const journeys = [
  {
    icon: '⌕',
    title: '找机会',
    desc: '查看校招、实习和宣讲会，建立自己的目标岗位池。',
    href: '/all',
    action: '浏览招聘信息',
    color: '#3b82f6',
  },
  {
    icon: '◎',
    title: '找方向',
    desc: '从职业坐标和免费测评开始，先看清兴趣、资源与当前卡点。',
    href: '/tools/assessment',
    action: '进入职业测评',
    color: '#8b5cf6',
  },
  {
    icon: '✓',
    title: '做准备',
    desc: '练习笔试、优化材料，把经历转化成岗位看得见的证据。',
    href: '/tools/exam',
    action: '开始求职准备',
    color: '#f59e0b',
  },
  {
    icon: '↗',
    title: '获得支持',
    desc: '了解训练营和后续支持，让方向、材料和行动形成闭环。',
    href: '/tools/coaching',
    action: '查看支持方案',
    color: '#22c55e',
  },
];

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);

  useEffect(() => {
    fetch(`${basePath}/api/feed/home.json`)
      .then(r => r.ok ? r.json() : null)
      .then(home => { if (home) setHomeData(home); })
      .catch(() => {});
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
        <p className="hero-subtitle">更好用的大学生求职网站</p>
        <p className="hero-desc">校招 · 实习 · 宣讲会，每日自动更新，一站搞定</p>
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

      {/* CTA Button */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', margin: '1.5rem 0' }}>
        <Link href="/all" className="btn btn-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          浏览全部岗位
        </Link>
      </div>

      <section className="journey-section">
        <div className="journey-heading">
          <span>你现在想先解决什么？</span>
          <p>不必一次用完所有功能，先从最接近当前状态的一步开始。</p>
        </div>
        <div className="journey-grid">
          {journeys.map((journey) => (
            <Link key={journey.title} href={journey.href} className="journey-card">
              <span className="journey-icon" style={{ color: journey.color, borderColor: `${journey.color}55`, background: `${journey.color}12` }}>{journey.icon}</span>
              <div>
                <h2>{journey.title}</h2>
                <p>{journey.desc}</p>
                <strong style={{ color: journey.color }}>{journey.action} →</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ZhiluBrandIntro />

      <div className="divider" />

      {/* Features Section */}
      <div className="features-section">
        <h2 className="features-title">
          <span className="text-gradient">为什么选择 JOBHOT</span>
        </h2>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-content">
                <div className="feature-name">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Bottom CTA */}
      <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          立即开始，发现适合你的校招机会
        </p>
        <Link href="/all" className="btn btn-lg">
          浏览全部岗位 →
        </Link>
      </div>
    </div>
  );
}

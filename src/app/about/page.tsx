import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于 - JOBHOT',
  description: '了解 JOBHOT 项目背景、数据来源、评分机制和技术栈。一个大学生求职信息聚合平台。',
};

export default function AboutPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>
          关于{' '}
          <span className="text-gradient">JOBHOT</span>
        </h1>
        <p>为大学生求职者打造的信息聚合平台</p>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section className="timeline-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>JOBHOT 是什么？</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            JOBHOT 是一个大学生求职信息聚合平台，自动从多个数据源抓取校招、实习和宣讲会信息，
            通过智能评分系统筛选出高质量内容，帮助求职者快速获取最新、最热的招聘动态。
            我们的目标是让每一位大学生都能高效地获取求职信息，不再错过心仪的机会。
          </p>
        </section>

        <section className="timeline-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>数据来源</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            目前的数据来源包括：国聘（央国企、事业单位等优质岗位）、DeepOffer（覆盖互联网、金融、车企/IC 等多行业校招实习）、
            牛客网（校招日历与宣讲会）、应届生求职网（全国高校宣讲会信息），以及
            CampusShame（记录校招中毁约、违规等污点行为的公司名单）。
            数据每天自动更新，确保信息的时效性。同时提供 RSS 订阅源，方便通过 RSS 阅读器获取最新动态。
          </p>
        </section>

        <section className="timeline-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>评分机制</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            每条招聘信息都会经过智能评分系统打分（满分 99），评分依据包括：
            信息时效性（越新分越高）、企业知名度（分为 Tier1/Tier2 两档）、
            信息完整度（是否包含日期、地点、备注等）。
            评分 82 分及以上的内容会被标记为「精选」，优先展示在首页。
          </p>
        </section>

        <section className="timeline-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>技术栈</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            JOBHOT 基于 Next.js 16 + React 19 + Tailwind CSS 4 构建，采用静态导出（SSG）部署在 GitHub Pages 上。
            数据抓取脚本使用 TypeScript 编写，通过 GitHub Actions 每天自动执行。
          </p>
        </section>

      </div>
    </div>
  );
}

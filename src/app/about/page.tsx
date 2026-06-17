import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于 - JOBHOT',
  description: '了解 JOBHOT 项目背景、数据来源、评分机制，以及联系作者和打赏支持。',
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

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
            数据每天自动更新，确保信息的时效性。
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

        {/* 联系与反馈 */}
        <section className="timeline-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>联系与反馈</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
            如果你发现了 Bug、有功能建议、或者想推荐新的数据源，欢迎通过以下方式联系我：
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>微信号</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>diyiwuyan</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>邮箱</div>
                <a href="mailto:diyiwuyan@163.com" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--accent)' }}>diyiwuyan@163.com</a>
              </div>
            </div>
          </div>
        </section>

        {/* 打赏支持 */}
        <section className="timeline-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>打赏支持</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
            JOBHOT 是个人免费项目，服务器、域名、数据采集都需要持续投入。你的支持是我继续维护的动力，金额随意，心意最重要。
          </p>
          <div className="donate-grid">
            <div className="donate-card donate-card-wechat">
              <div className="donate-card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M8.5 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM13.5 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="#07C160"/>
                  <path d="M21 12.5C21 7.25 16.75 3 11.5 3S2 7.25 2 12.5c0 2.9 1.3 5.5 3.4 7.2.2.2.3.4.3.7l.1 2.1c0 .4.4.6.7.4l2.4-1.2c.2-.1.4-.1.6 0 .6.2 1.3.3 2 .3 5.25 0 9.5-4.25 9.5-9.5Z" stroke="#07C160" strokeWidth="1.5" fill="none"/>
                </svg>
                <span style={{ fontWeight: 600, color: '#07C160' }}>微信支付</span>
              </div>
              <img
                src={`${basePath}/images/donate-wechat.jpg`}
                alt="微信收款码"
                className="donate-qr"
              />
            </div>

            <div className="donate-card donate-card-alipay">
              <div className="donate-card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="#1677FF" strokeWidth="1.5"/>
                  <path d="M14 12c2.5 1.5 4 2.5 4 2.5s-1.5.5-4-.5c-1.5-.6-3-1.5-3-1.5" stroke="#1677FF" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 9h5M8 11h3" stroke="#1677FF" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontWeight: 600, color: '#1677FF' }}>支付宝</span>
              </div>
              <img
                src={`${basePath}/images/donate-alipay.jpg`}
                alt="支付宝收款码"
                className="donate-qr"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

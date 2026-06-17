import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '反馈 - JOBHOT',
  description: '向 JOBHOT 提交反馈、Bug 报告、功能建议或数据源推荐。',
};

export default function FeedbackPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>反馈</h1>
        <p>你的反馈是 JOBHOT 持续改进的动力</p>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section className="timeline-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>联系作者</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
            如果你发现了 Bug、有功能建议、或者想推荐新的数据源，欢迎通过以下方式联系我：
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

        <section className="timeline-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>常见反馈类型</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: '🐛', title: 'Bug 报告', desc: '页面显示异常、功能不正常、数据错误等' },
              { icon: '💡', title: '功能建议', desc: '希望增加的新功能、交互优化建议等' },
              { icon: '📊', title: '数据源推荐', desc: '推荐新的校招/实习信息数据源' },
              { icon: '🎨', title: 'UI/UX 改进', desc: '界面设计、用户体验方面的改进建议' },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

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
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>提交反馈</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
            如果你发现了 Bug、有功能建议、或者想推荐新的数据源，欢迎通过以下方式反馈：
          </p>
          <a
            href="https://github.com/diyiwuyan/job-hot/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ width: 'fit-content' }}
          >
            在 GitHub 提交 Issue
          </a>
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

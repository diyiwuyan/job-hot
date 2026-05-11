'use client';

export default function LoginPage() {
  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="timeline-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            <span>JOB</span>
            <span
              style={{
                background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              HOT
            </span>
          </span>
        </div>

        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>个性化功能即将上线</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          我们正在开发以下功能，敬请期待
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
          {[
            { icon: '⭐', title: '收藏职位', desc: '一键收藏感兴趣的校招/实习信息，随时查看' },
            { icon: '🔔', title: '订阅推送', desc: '设置关键词和行业偏好，新岗位第一时间通知' },
            { icon: '📊', title: '求职看板', desc: '跟踪投递进度，管理你的求职流程' },
            { icon: '🎯', title: '智能推荐', desc: '基于你的偏好和浏览历史，推荐最匹配的岗位' },
          ].map((feature) => (
            <div
              key={feature.title}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'var(--bg-elevated)',
                borderRadius: '0.5rem',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{feature.icon}</span>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{feature.title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem', lineHeight: 1.6 }}>
          目前所有功能均可免登录使用。你也可以通过 RSS 订阅获取最新动态。
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'center' }}>
          <a
            href="/"
            className="btn"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            返回首页
          </a>
          <a
            href="/feed.xml"
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: 'center' }}
            target="_blank"
          >
            RSS 订阅
          </a>
        </div>
      </div>
    </div>
  );
}

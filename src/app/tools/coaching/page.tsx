import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '求职辅导 - JOBHOT',
  description: '大学生求职辅导训练营，资深职业 coach 带你从简历优化到拿下心仪 offer。',
};

export default function CoachingPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>求职辅导</h1>
        <p>资深职业 coach 带你走好求职每一步</p>
      </div>

      {/* 训练营介绍 */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.05rem',
            fontWeight: 700,
            paddingBottom: '0.6rem',
            marginBottom: '1rem',
            borderBottom: '2px solid var(--border)',
          }}
        >
          <span>🚀</span> 大学生求职辅导训练营
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.9 }}>
            面向在校生与应届毕业生的系统化求职辅导，覆盖简历优化、岗位定位、笔试面试、offer
            选择与职业规划。由资深职业 coach 带你从「不知道怎么找」到「拿到心仪 offer」，
            提供社群答疑与一对一指导。扫码即可加入，了解课程与最新开营信息。
          </p>
        </div>

        {/* 服务亮点 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '📝', title: '简历精修', desc: '一对一简历诊断与优化' },
            { icon: '🎯', title: '岗位定位', desc: '结合测评结果精准定位' },
            { icon: '💬', title: '面试模拟', desc: '真实场景还原 + 复盘' },
            { icon: '🤝', title: '社群答疑', desc: '实时互动，问题秒回' },
          ].map((item) => (
            <div key={item.title} className="timeline-card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{item.icon}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.2rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 二维码 */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1.25rem',
          }}
        >
          {/* 公众号 */}
          <div className="timeline-card qr-card" style={{ textAlign: 'center', padding: '1.5rem 1.25rem', width: 280, flexShrink: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              关注公众号
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              「职路同行社」· 求职干货 & 开营通知
            </div>
            <img
              src="/images/qr-official.jpeg"
              alt="职路同行社 公众号二维码"
              style={{
                display: 'block',
                margin: '0 auto',
                width: 180,
                height: 180,
                maxWidth: '100%',
                borderRadius: 12,
                background: '#fff',
                padding: 8,
                objectFit: 'contain',
              }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              微信扫码关注
            </div>
          </div>

          {/* 个人微信 */}
          <div className="timeline-card qr-card" style={{ textAlign: 'center', padding: '1.5rem 1.25rem', width: 280, flexShrink: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              添加辅导老师
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              「职业 coach 小仙」· 一对一咨询报名
            </div>
            <img
              src="/images/qr-coach.jpeg"
              alt="职业coach 小仙 微信二维码"
              style={{
                display: 'block',
                margin: '0 auto',
                width: 180,
                height: 180,
                maxWidth: '100%',
                borderRadius: 12,
                background: '#fff',
                padding: 8,
                objectFit: 'contain',
              }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              微信扫码添加好友
            </div>
          </div>
        </div>
      </section>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2rem', lineHeight: 1.7 }}>
        提示：训练营为第三方提供的求职辅导服务，具体课程内容与费用以辅导老师说明为准，请理性选择。
      </p>
    </div>
  );
}

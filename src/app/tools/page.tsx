import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '职业服务 - JOBHOT',
  description: '职业兴趣测评（霍兰德测试）与大学生求职辅导训练营，提供职业方向探索与一对一求职指导。',
};

export default function ToolsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>职业服务</h1>
        <p>测一测适合的方向，再找专业的人陪你走好求职这一程</p>
      </div>

      {/* ============ 模块一：职业测评 ============ */}
      <section style={{ marginTop: '0.5rem' }}>
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
          <span>🎯</span> 职业测评
        </div>

        <Link
          href="/tools/holland"
          className="timeline-card timeline-card-featured"
          style={{ display: 'block', textDecoration: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.5" />
              </svg>
            </span>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                霍兰德职业兴趣测试
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Holland RIASEC · 48 题 · 约 5 分钟
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0.5rem' }}>
            通过六大职业兴趣维度（现实/研究/艺术/社会/企业/常规），测出你的霍兰德代码，
            得到适合的职业方向与专业参考，帮助你在求职前先搞清楚「我适合做什么」。
          </p>
          <div className="timeline-tags" style={{ marginTop: 0 }}>
            <span className="tag">职业兴趣</span>
            <span className="tag">方向探索</span>
            <span className="tag">免费测试</span>
            <span className="tag">立即开始 →</span>
          </div>
        </Link>
      </section>

      {/* ============ 模块二：央国企服务 ============ */}
      <section style={{ marginTop: '2rem' }}>
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
          <span>🏢</span> 央国企服务
        </div>

        <Link
          href="/services/soe-delivery"
          className="timeline-card timeline-card-featured"
          style={{ display: 'block', textDecoration: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M9 7h1" />
                <path d="M14 7h1" />
                <path d="M9 11h1" />
                <path d="M14 11h1" />
                <path d="M9 15h1" />
                <path d="M14 15h1" />
              </svg>
            </span>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                央国企投递导航
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                企业地图 · 岗位方向 · 26届招聘复盘
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0.5rem' }}>
            面向咨询场景的央国企投递工具，可按学生专业、学历、院校层次和城市偏好，快速定位可投企业、
            常见岗位、冲刺/匹配/补充机会，并查看26届招聘复盘和备考档案。
          </p>
          <div className="timeline-tags" style={{ marginTop: 0 }}>
            <span className="tag">央国企</span>
            <span className="tag">投递导航</span>
            <span className="tag">咨询工具</span>
            <span className="tag">打开工具 →</span>
          </div>
        </Link>
      </section>

      {/* ============ 模块三：大学生求职辅导训练营 ============ */}
      <section style={{ marginTop: '2rem' }}>
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

        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.9 }}>
            面向在校生与应届毕业生的系统化求职辅导，覆盖简历优化、岗位定位、笔试面试、
            offer 选择与职业规划。由资深职业 coach 带你从「不知道怎么找」到「拿到心仪 offer」，
            提供社群答疑与一对一指导。扫码即可加入，了解课程与最新开营信息。
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          {/* 公众号 */}
          <div className="timeline-card" style={{ textAlign: 'center', padding: '1.5rem 1.125rem', flex: '1 1 260px', maxWidth: 360 }}>
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
          <div className="timeline-card" style={{ textAlign: 'center', padding: '1.5rem 1.125rem', flex: '1 1 260px', maxWidth: 360 }}>
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

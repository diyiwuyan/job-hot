import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '打赏 - JOBHOT',
  description: '如果 JOBHOT 对你有帮助，请作者喝杯咖啡吧',
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function DonatePage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>打赏</h1>
        <p>如果 JOBHOT 对你有帮助，可以请作者喝杯咖啡 ☕</p>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section className="timeline-card">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
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

        <section className="timeline-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>资金用途</h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            <p>你的打赏将用于：服务器和域名续费、数据源接入与维护、新功能开发投入、以及作者的咖啡续命。感谢每一位支持者！</p>
          </div>
        </section>
      </div>
    </div>
  );
}

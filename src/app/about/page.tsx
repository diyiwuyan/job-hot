import type { Metadata } from 'next';
import Image from 'next/image';
import { ZhiluBrandIntro } from '@/components/ZhiluBrandIntro';

export const metadata: Metadata = {
  title: '关于我们 - JOBHOT｜职路同行社出品',
  description: '了解 JOBHOT、职路同行社的出品关系、平台定位、职业支持内容、数据来源与联系渠道。',
};

export default function AboutPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>
          关于 <span className="text-gradient">JOBHOT</span>
        </h1>
        <p>职路同行社出品的大学生求职信息与职业发展工具平台</p>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section className="timeline-card">
          <div className="timeline-tags" style={{ marginBottom: '0.75rem' }}>
            <span className="tag">职路同行社出品</span>
            <span className="tag">免费求职信息与工具</span>
          </div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>JOBHOT 是什么？</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            JOBHOT 是职路同行社打造的大学生求职网站，聚合校招、实习和宣讲会信息，并提供订阅收藏、职业坐标、求职测评和训练营学习工具。
            我们希望把“找到机会、认识自己、准备材料和持续行动”放进同一条路径，让学生不只看到更多信息，也能更清楚地走出下一步。
          </p>
        </section>

        <ZhiluBrandIntro mode="full" />

        <section className="timeline-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>招聘信息从哪里来？</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            目前的数据来源包括国聘、DeepOffer、牛客网、应届生求职网及 CampusShame 等公开渠道，覆盖校招、实习、宣讲会和招聘风险信息。
            数据会定期更新，但招聘状态和截止时间可能发生变化；投递前请以招聘单位官网或官方招聘账号的最新公告为准。
          </p>
        </section>

        <section className="timeline-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>信息排序与评分</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            招聘信息会根据发布时间、信息完整度和企业类别等因素进行辅助排序。评分用于帮助用户提高浏览效率，不代表企业质量、录用概率或求职结果，最终判断仍需结合岗位要求、官方信息和个人情况。
          </p>
        </section>

        <details className="about-maintenance-details">
          <summary>
            <span>
              <strong>项目维护与支持</strong>
              <small>技术说明、网站反馈与自愿打赏</small>
            </span>
            <span aria-hidden="true">展开查看</span>
          </summary>

          <div className="about-maintenance-content">
            <section>
              <h2>技术与维护</h2>
              <p>
                JOBHOT 基于 Next.js、React 和 TypeScript 构建，采用静态站点方式部署，并通过自动化任务更新公开招聘数据。
                这部分信息主要面向关心网站实现和持续维护的用户。
              </p>
            </section>

            <section>
              <h2>网站反馈</h2>
              <p>如果你发现网站 Bug、失效信息，或希望推荐新的公开数据源，可以联系网站维护者：</p>
              <div className="about-maintenance-contact">
                <span>微信：diyiwuyan</span>
                <a href="mailto:diyiwuyan@163.com">邮箱：diyiwuyan@163.com</a>
              </div>
              <p>职业方向、测评解读和求职服务，请通过上方“职路同行社”公众号进入。</p>
            </section>

            <section>
              <h2>自愿支持</h2>
              <p>JOBHOT 的公开信息与基础工具免费使用。如果这个网站对你有帮助，可以自愿支持后续维护；不打赏不会影响任何功能或服务。</p>
              <div className="donate-grid about-donate-grid">
                <div className="donate-card donate-card-wechat">
                  <div className="donate-card-header"><span style={{ fontWeight: 600, color: '#07C160' }}>微信支付</span></div>
                  <Image src="/images/donate-wechat.jpg" alt="微信收款码" width={220} height={220} className="donate-qr" />
                </div>
                <div className="donate-card donate-card-alipay">
                  <div className="donate-card-header"><span style={{ fontWeight: 600, color: '#1677FF' }}>支付宝</span></div>
                  <Image src="/images/donate-alipay.jpg" alt="支付宝收款码" width={220} height={220} className="donate-qr" />
                </div>
              </div>
            </section>
          </div>
        </details>
      </div>
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';

type ZhiluBrandIntroProps = {
  mode?: 'summary' | 'full';
};

export function ZhiluBrandIntro({ mode = 'summary' }: ZhiluBrandIntroProps) {
  const full = mode === 'full';

  return (
    <section id={full ? 'zhilu' : undefined} className={`zhilu-brand-card ${full ? 'zhilu-brand-card-full' : ''}`}>
      <div className="zhilu-brand-main">
        <div className="zhilu-brand-heading">
          <span className="zhilu-brand-mark" aria-hidden="true">
            <Image src="/images/zhilu-tongxingshe-brand-mark.svg" alt="" width={48} height={41} />
          </span>
          <div>
            <div className="zhilu-brand-eyebrow">JOBHOT｜职路同行社出品</div>
            <h2>职路同行社｜大学生职业发展与求职支持平台</h2>
          </div>
        </div>

        <p className="zhilu-brand-copy">
          我们关注的不只是简历、面试和 offer，也关注求职中的迷茫、焦虑、行动力，以及你怎样慢慢找到自己的方向。
          希望结合心理学、职业咨询和真实招聘场景，用更专业、也更有温度的方式，陪大学生把求职这条路走得更稳一点。
        </p>

        <div className="zhilu-relationship">
          <div><strong>JOBHOT</strong><span>职路同行社打造的求职信息与在线工具平台</span></div>
          <span className="zhilu-relationship-plus">出品</span>
          <div><strong>职路同行社</strong><span>专业内容、测评解读与求职支持主体</span></div>
        </div>

        {full && (
          <>
            <div className="timeline-tags zhilu-brand-tags">
              <span className="tag">职业方向与发展选择</span>
              <span className="tag">简历、面试与求职策略</span>
              <span className="tag">实习与校招关键问题</span>
              <span className="tag">焦虑、拖延与行动恢复</span>
            </div>
            <div className="zhilu-mentor-note">
              <strong>双重专业视角：既适合自己，也能被市场看见。</strong>
              <span>小仙老师的心理学与职业咨询经验，和心悦老师的企业招聘与HR实务经验，共同用于判断方向、梳理经历、理解岗位并推进真实行动。</span>
            </div>
          </>
        )}

        <div className="zhilu-brand-actions">
          {!full && <Link href="/about#zhilu" className="btn btn-secondary">认识职路同行社</Link>}
          <Link href="/tools/assessment" className="btn">先做一次免费诊断 →</Link>
        </div>
      </div>

      {full && (
        <div className="zhilu-official-qr">
          <div className="zhilu-official-qr-title">官方内容与服务入口</div>
          <Image src="/images/qr-official.jpeg" alt="职路同行社公众号二维码" width={176} height={176} />
          <strong>职路同行社</strong>
          <span>持续获取职业方向、简历面试、校招行动与心理支持内容</span>
        </div>
      )}
    </section>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: '27届秋招启动训练营 - JOBHOT｜职路同行社出品',
  description: '7天完成秋招状态诊断、求职行动风格识别、优势筹码盘点、方向初筛、简历问题识别和30天行动计划。',
};

const path = [
  ['Day 1', '秋招启动地图', '看清窗口、当前位置和当前优先级'],
  ['Day 2', '求职行动风格', '理解自己为什么容易卡住，找到更可持续的启动方式'],
  ['Day 3', '优势筹码盘点', '把课程、项目、社团和实习转成可使用的能力证据'],
  ['Day 4', '方向初筛', '形成主投、备选和暂缓方向，不追求一次选定终身'],
  ['Day 5', '简历问题识别', '先看岗位匹配和内容重点，再决定怎样修改'],
  ['Day 6', '30天行动计划', '把岗位池、材料、投递和复盘放进同一套节奏'],
  ['Day 7', '结营复盘', '确认已经完成的成果和下一步需要哪种支持'],
];

export default function CoachingPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>27届秋招启动训练营</h1>
        <p>7天完成一次初步诊断，把模糊焦虑转成可以执行的路径</p>
      </div>

      <section className="card" style={{ marginBottom: '1rem', borderTop: '4px solid #22c55e' }}>
        <div className="timeline-tags" style={{ marginBottom: '0.75rem' }}>
          <span className="tag">职路同行社</span>
          <span className="tag">双导师共同设计</span>
          <span className="tag">作业＋反馈</span>
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.5, marginBottom: '0.65rem' }}>
          免费测评帮你看见问题，训练营陪你把关键动作做出来
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.9 }}>
          训练营面向正在准备27届秋招、愿意投入时间完成练习的学生。它不是“大而全”的求职课，也不承诺录用结果；重点是通过状态诊断、工具练习、作业反馈和同伴节奏，形成方向初稿、经历筹码、简历优化重点和30天行动计划。
        </p>
      </section>

      <section style={{ marginBottom: '1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, paddingBottom: '0.6rem', marginBottom: '0.8rem', borderBottom: '2px solid var(--border)' }}>
          <span>🗺️</span> 7天推进路径
        </div>
        <div style={{ display: 'grid', gap: '0.7rem' }}>
          {path.map(([day, title, description]) => (
            <div key={day} className="timeline-card" style={{ display: 'grid', gridTemplateColumns: '58px minmax(0,1fr)', gap: '0.75rem', alignItems: 'start' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem' }}>{day}</span>
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.2rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.65 }}>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem', marginBottom: '1.4rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem' }}>你会完成的四项成果</h2>
          <ul style={{ paddingLeft: '1.15rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.9 }}>
            <li>一张个人秋招启动地图</li>
            <li>一份优势筹码与经历证据初稿</li>
            <li>一组方向和简历优化优先级</li>
            <li>一份未来30天行动计划</li>
          </ul>
        </div>
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem' }}>更适合这样的同学</h2>
          <ul style={{ paddingLeft: '1.15rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.9 }}>
            <li>知道秋招重要，但不知道先做什么</li>
            <li>经历不少，却说不清能证明什么</li>
            <li>收藏很多信息，行动优先级仍然混乱</li>
            <li>愿意完成作业并接受过程反馈</li>
          </ul>
        </div>
      </section>

      <section className="card" style={{ marginBottom: '1.25rem', background: 'var(--accent-muted)', borderColor: 'var(--accent)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>还不确定是否适合？先做免费诊断</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.75, marginBottom: '0.8rem' }}>
          先获得完整基础结果和一项72小时行动，再决定要不要进一步了解训练营。
        </p>
        <Link href="/tools/autumn-start" className="btn">做27届秋招启动诊断 →</Link>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, paddingBottom: '0.6rem', marginBottom: '1rem', borderBottom: '2px solid var(--border)' }}>
          <span>💬</span> 领取说明或咨询适配性
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          <div className="timeline-card qr-card" style={{ textAlign: 'center', padding: '1.3rem', width: 280 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 650, marginBottom: '0.25rem' }}>关注职路同行社</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>持续获取秋招工具和公开内容</div>
            <Image src="/images/qr-official.jpeg" alt="职路同行社公众号二维码" width={180} height={180} style={{ width: 180, height: 180, maxWidth: '100%', borderRadius: 12, background: '#fff', padding: 8, objectFit: 'contain' }} />
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>微信扫码关注</div>
          </div>
          <div className="timeline-card qr-card" style={{ textAlign: 'center', padding: '1.3rem', width: 280 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 650, marginBottom: '0.25rem' }}>添加小仙老师</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>发送“测评＋你的结果”</div>
            <Image src="/images/qr-coach-xiaoxian.png" alt="小仙老师微信二维码" width={180} height={180} style={{ width: 180, height: 180, maxWidth: '100%', borderRadius: 12, background: '#fff', padding: 8, objectFit: 'contain' }} />
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>先说明情况，再判断训练营是否适配</div>
          </div>
        </div>
      </section>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1.5rem', lineHeight: 1.7 }}>
        边界说明：训练营提供诊断框架、练习、反馈和行动支持，不保证offer、面试邀请、内推或任何录用结果；复杂方向选择、整份简历深改和长期执行支持需另行评估。
      </p>
    </div>
  );
}

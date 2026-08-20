import type { Metadata } from 'next';
import Link from 'next/link';
import { AssessmentSourceCapture } from '@/components/AssessmentSourceCapture';
import { ZhiluBrandIntro } from '@/components/ZhiluBrandIntro';

export const metadata: Metadata = {
  title: '职业测评与求职诊断 - JOBHOT｜职路同行社出品',
  description: 'JOBHOT 提供免费自我探索与求职诊断工具，职路同行社提供结果解读、行动建议与进一步支持。',
};

const entryCards = [
  {
    question: '正在准备27届秋招，不知道先做什么',
    title: '27届秋招启动诊断',
    meta: '18道诊断题＋4道状态题 · 约5分钟',
    description: '判断你当前更接近方向摇摆、经历未转化、简历失焦、行动拖延、信息过载还是目标冲刺，并获得一项72小时行动。',
    href: '/tools/autumn-start',
    icon: '↗',
    gradient: 'linear-gradient(135deg, #16a34a, #14b8a6)',
    tags: ['当前推荐', '秋招卡点', '完整结果免费'],
    featured: true,
  },
  {
    question: '不知道自己手里缺什么资源',
    title: '求职底牌自测表',
    meta: '12题 · 约3—5分钟',
    description: '从缓冲地带、信息密度、试错能力和家庭期待管理四个维度，看看你当前最值得优先补哪张牌。',
    href: '/tools/dipai',
    icon: '▦',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    tags: ['资源盘点', '短板识别', '免费'],
  },
  {
    question: '不知道自己可能对什么工作感兴趣',
    title: '霍兰德职业兴趣测试',
    meta: 'Holland RIASEC · 90题 · 约8—10分钟',
    description: '兴趣、能力自评、职业反馈各10分，并结合专业与AI实践推荐现代校招岗位大类；结果用于探索，不用于限定职业。',
    href: '/tools/holland',
    icon: '◎',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    tags: ['职业兴趣', '方向探索', '免费'],
  },
  {
    question: '想了解自己的性格与工作环境偏好',
    title: 'MBTI 测试（非官方）',
    meta: '70道原创题 · 约10分钟 · 支持续测',
    description: '从精力来源、信息偏好、决策偏好和生活方式四组维度获得16型偏好结果；用于自我探索，不把类型直接等同于职业答案。',
    href: '/tools/mbti',
    icon: '◔',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    tags: ['MBTI', '非官方版', '完整结果免费'],
  },
  {
    question: '想知道一份工作需要满足哪些条件',
    title: '职业价值观测评',
    meta: '30道原创题 · 约5分钟',
    description: '梳理成长、自主、稳定、影响、关系与生活边界六项优先条件，并得到可用于看JD和面试反问的岗位验证表。',
    href: '/tools/values',
    icon: '◇',
    gradient: 'linear-gradient(135deg, #0f766e, #2563eb)',
    tags: ['岗位筛选', '价值观', '完整结果免费'],
  },
];

export default function AssessmentPage() {
  return (
    <div className="page">
      <AssessmentSourceCapture page="assessment-center" />
      <div className="page-header">
        <h1>职业测评与求职诊断</h1>
        <p>从兴趣、资源和当前行动三个角度，找到更适合你的下一步</p>
      </div>

      <section className="card" style={{ marginBottom: '1rem', background: 'var(--accent-muted)', borderColor: 'var(--accent)' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.3rem' }}>不知道选哪一个？</div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 750, marginBottom: '0.35rem' }}>先看你现在最想解决的问题</h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
          不需要连续做完所有测评。选择最接近你当前状态的一项，完成后先执行一条建议，再决定是否继续下一步。
        </p>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, paddingBottom: '0.6rem', marginBottom: '1rem', borderBottom: '2px solid var(--border)' }}>
          <span>📋</span> 你现在最想解决什么？
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {entryCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="timeline-card timeline-card-featured"
              style={{ display: 'block', textDecoration: 'none', borderColor: card.featured ? '#22c55e' : undefined, position: 'relative' }}
            >
              {card.featured && (
                <span style={{ position: 'absolute', top: 14, right: 14, padding: '0.25rem 0.55rem', borderRadius: 999, background: 'rgba(34,197,94,.14)', color: '#22c55e', fontSize: '0.7rem', fontWeight: 700 }}>
                  27届当前推荐
                </span>
              )}
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.55rem', paddingRight: card.featured ? 105 : 0 }}>
                如果你：{card.question}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: card.gradient, color: '#fff', fontSize: '1.3rem', fontWeight: 800, flexShrink: 0 }}>
                  {card.icon}
                </span>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 650, color: 'var(--text)' }}>{card.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.meta}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{card.description}</p>
              <div className="timeline-tags" style={{ marginTop: '0.55rem' }}>
                {card.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
              </div>
            </Link>
          ))}

        </div>
      </section>

      <div style={{ marginTop: '1.25rem' }}>
        <ZhiluBrandIntro />
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '1.5rem' }}>
        测评工具由JOBHOT提供，结果解读与行动支持由职路同行社提供。所有结果只用于自我探索和行动参考，不构成专业心理诊断或录用结果承诺。
      </p>
    </div>
  );
}

import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { AssessmentSourceCapture } from '@/components/AssessmentSourceCapture';
import { CAREER_ASSESSMENTS } from '@/lib/career-assessment-data';
import styles from './AssessmentCenter.module.css';

export const metadata: Metadata = {
  title: '全部职业测评 - JOBHOT',
  description: '从职业倾向、职业资本和求职诊断三个方向，选择适合大学生当前问题的职业测评。',
};

const entryCards = [
  {
    id: 'autumn-start', question: '正在准备27届秋招，不知道先做什么', title: '27届秋招启动诊断',
    meta: '15道行为题＋3道状态题 · 约4分钟',
    description: '从目标聚焦、证据材料、机会投递、笔面准备和复盘节奏五个求职环节，定位当前最高优先级并获得一项72小时行动。',
    href: '/tools/autumn-start', icon: '↗', gradient: 'linear-gradient(135deg,#16a34a,#14b8a6)',
    tags: ['当前推荐', '秋招卡点', '完整结果免费'], featured: true,
  },
  {
    id: 'dipai', question: '不知道自己手里缺什么资源', title: '求职底牌自测表', meta: '12题 · 约3—5分钟',
    description: '从缓冲地带、信息密度、试错能力和家庭期待管理四个维度，看看你当前最值得优先补哪张牌。',
    href: '/tools/dipai', icon: '▦', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', tags: ['资源盘点', '短板识别', '免费'], featured: false,
  },
  {
    id: 'holland', question: '不知道自己可能对什么工作感兴趣', title: '霍兰德职业兴趣测试', meta: 'Holland RIASEC · 90题 · 约8—10分钟',
    description: '从兴趣、能力自评和职业反馈理解RIASEC倾向，并探索与专业和现代校招岗位的可能连接。',
    href: '/tools/holland', icon: '◎', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', tags: ['职业兴趣', '方向探索', '免费'], featured: false,
  },
  {
    id: 'mbti', question: '想了解自己的性格与工作环境偏好', title: 'MBTI 测试（非官方）', meta: '70道原创题 · 约10分钟 · 支持续测',
    description: '从精力、信息、决策和生活方式四组偏好认识自己；用于自我探索，不把类型直接等同于职业答案。',
    href: '/tools/mbti', icon: '◔', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', tags: ['MBTI', '非官方版', '完整结果免费'], featured: false,
  },
  {
    id: 'career-values', question: '想知道一份工作需要满足哪些条件', title: '职业价值观测评', meta: '30道原创题 · 约5分钟',
    description: '梳理成长、自主、稳定、影响、关系与生活边界六项优先条件，并生成看JD和面试反问的验证线索。',
    href: '/tools/values', icon: '◇', gradient: 'linear-gradient(135deg,#0f766e,#2563eb)', tags: ['岗位筛选', '价值观', '完整结果免费'], featured: false,
  },
];

const assessmentCards = [
  ...entryCards,
  ...CAREER_ASSESSMENTS.map((assessment) => ({
    id: assessment.id,
    question: assessment.question,
    title: assessment.title,
    meta: `${assessment.questions.length}题 · ${assessment.duration}`,
    description: assessment.description,
    href: `/tools/assessment/${assessment.slug}`,
    icon: assessment.icon,
    gradient: assessment.gradient,
    tags: assessment.tags,
    featured: false,
  })),
];

const assessmentGroups = [
  {
    id: 'tendency', number: '01', title: '职业倾向',
    question: '我喜欢什么、看重什么，通常怎样工作？',
    audience: '对方向模糊，或在多个岗位之间不知道自己更愿意做什么的同学。',
    description: '职业倾向帮助你理解兴趣、价值取向与工作偏好，用来提出方向假设，而不是直接替你决定职业。',
    tools: '霍兰德职业兴趣、职业价值观、职业工作风格、MBTI（辅助）',
    ids: ['holland', 'career-values', 'work-style', 'mbti'], color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  },
  {
    id: 'capital', number: '02', title: '职业资本',
    question: '我会什么、拥有什么，还能发展什么？',
    audience: '有目标但说不清自己能做什么，或简历缺少能力证据和经历支撑的同学。',
    description: '职业资本盘点技能、经历证据、职场能力和适应资源，它会随着课程、项目与实习持续增长。',
    tools: '通用技能画像、就业胜任力、职业适应力、求职底牌',
    ids: ['skills-map', 'employability', 'career-adaptability', 'dipai'], color: '#0f766e', gradient: 'linear-gradient(135deg,#0f766e,#14b8a6)',
  },
  {
    id: 'diagnosis', number: '03', title: '求职诊断',
    question: '我现在卡在哪里，下一步先做什么？',
    audience: '已经进入求职流程，却卡在方向选择、材料准备、面试投递或持续行动上的同学。',
    description: '求职诊断定位当前阶段最需要解决的问题，结果会连接一项具体行动，适合在关键求职节点复测。',
    tools: '秋招启动诊断、求职行动准备度、职业决策卡点',
    ids: ['autumn-start', 'job-readiness', 'decision-difficulties'], color: '#ea580c', gradient: 'linear-gradient(135deg,#f97316,#ef4444)',
  },
];

export default function AssessmentPage() {
  return (
    <div className="page">
      <AssessmentSourceCapture page="assessment-center" />
      <div className="page-header">
        <h1>全部职业测评</h1>
        <p>先选择最接近你当前问题的一类，再从中完成一项测评。不需要一次全部做完。</p>
      </div>

      <main className={styles.catalogue}>
        {assessmentGroups.map((group) => {
          const cards = group.ids.map((id) => assessmentCards.find((card) => card.id === id)).filter((card): card is NonNullable<typeof card> => Boolean(card));
          return (
            <details key={group.id} className={styles.groupSection} style={{ '--group-color': group.color, '--group-gradient': group.gradient } as CSSProperties}>
              <summary className={styles.groupHeader}>
                <span className={styles.groupNumber}>{group.number}</span>
                <div className={styles.groupCopy}>
                  <div><span>{cards.length}项测评</span><h2>{group.title}</h2></div>
                  <strong>{group.question}</strong>
                  <p><span>适合：{group.audience}</span><small>包含：{group.tools}</small></p>
                </div>
                <span className={styles.groupToggle}><b>展开查看</b><i>⌄</i></span>
              </summary>
              <div className={styles.groupLead}><strong>{group.description}</strong><span>选择最符合你当前问题的一项即可，完成后再根据报告建议决定下一步。</span></div>
              <div className={styles.assessmentGrid}>
                {cards.map((card) => (
                  <Link key={card.id} href={card.href} className={styles.assessmentCard} data-featured={card.featured}>
                    {card.featured && <span className={styles.featuredBadge}>27届当前推荐</span>}
                    <div className={styles.cardTop}><span className={styles.cardIcon} style={{ background: card.gradient }}>{card.icon}</span><small>{card.meta}</small></div>
                    <span className={styles.cardQuestion}>如果你：{card.question}</span>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <div className={styles.cardTags}>{card.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
                    <b className={styles.cardAction}>查看介绍并开始测评 <span>→</span></b>
                  </Link>
                ))}
              </div>
            </details>
          );
        })}
      </main>

      <p style={{ fontSize: '.72rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '1.5rem' }}>
        所有结果只用于自我探索和行动参考，不构成专业心理诊断或录用结果承诺。登录后可在“我的职业画像”中查看已保存结果。
      </p>
    </div>
  );
}

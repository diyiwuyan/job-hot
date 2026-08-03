import type { Metadata } from 'next';
import Link from 'next/link';
import { ZhiluBrandIntro } from '@/components/ZhiluBrandIntro';

export const metadata: Metadata = {
  title: '职业服务 - JOBHOT × 职路同行社',
  description: 'JOBHOT 与职路同行社共同提供职业测评、求职诊断、训练营与行动支持。',
};

export default function ToolsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>职业服务</h1>
        <p>由 JOBHOT 与职路同行社共同提供工具、内容与行动支持</p>
      </div>

      <ZhiluBrandIntro />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
        {/* 职业坐标 */}
        <Link
          href="/tools/career-atlas"
          className="timeline-card timeline-card-featured"
          style={{ display: 'block', textDecoration: 'none', padding: '1.5rem' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🧭</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
            职业坐标
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            从经历、兴趣和能力出发匹配值得探索的岗位，并查看岗位要求、成长路线、薪资结构和市场证据。
          </p>
          <div className="timeline-tags" style={{ marginTop: '0.75rem' }}>
            <span className="tag">19个岗位</span>
            <span className="tag">8个岗位族</span>
            <span className="tag">岗位对比</span>
          </div>
        </Link>

        {/* 职业测评 */}
        <Link
          href="/tools/assessment"
          className="timeline-card timeline-card-featured"
          style={{ display: 'block', textDecoration: 'none', padding: '1.5rem' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎯</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
            职业测评
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            秋招启动诊断、求职底牌、霍兰德兴趣与16型性格偏好 —— 四套免费自我探索工具，帮你找到更具体的下一步。
          </p>
          <div className="timeline-tags" style={{ marginTop: '0.75rem' }}>
            <span className="tag">免费</span>
            <span className="tag">4套测评</span>
            <span className="tag">5-10分钟</span>
          </div>
        </Link>

        {/* 求职辅导 */}
        <Link
          href="/tools/coaching"
          className="timeline-card timeline-card-featured"
          style={{ display: 'block', textDecoration: 'none', padding: '1.5rem' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🚀</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
            求职辅导
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            由职路同行社提供职业方向、经历梳理、简历面试与行动支持；不承诺录用结果，重点把求职中的关键动作做扎实。
          </p>
          <div className="timeline-tags" style={{ marginTop: '0.75rem' }}>
            <span className="tag">系统辅导</span>
            <span className="tag">一对一</span>
            <span className="tag">社群答疑</span>
          </div>
        </Link>

        {/* 求职训练营 */}
        <Link
          href="/tools/career-camp"
          className="timeline-card timeline-card-featured"
          style={{ display: 'block', textDecoration: 'none', padding: '1.5rem' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📚</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
            求职训练营
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            登录后跟随课程大纲完成课后作业打卡，老师可查看完成情况和个人累计完成率。
          </p>
          <div className="timeline-tags" style={{ marginTop: '0.75rem' }}>
            <span className="tag">课程大纲</span>
            <span className="tag">作业打卡</span>
            <span className="tag">老师反馈</span>
          </div>
        </Link>

        {/* 笔试训练 */}
        <Link
          href="/tools/exam"
          className="timeline-card timeline-card-featured"
          style={{ display: 'block', textDecoration: 'none', padding: '1.5rem' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📝</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
            笔试训练
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            5 套行测类通用笔试题库，涵盖数量关系、言语理解、逻辑推理、资料分析、常识判断，在线答题并记录成绩。
          </p>
          <div className="timeline-tags" style={{ marginTop: '0.75rem' }}>
            <span className="tag">5套题库</span>
            <span className="tag">100道题</span>
            <span className="tag">成绩记录</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

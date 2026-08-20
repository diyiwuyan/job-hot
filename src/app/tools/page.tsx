import type { Metadata } from 'next';
import Link from 'next/link';
import { ZhiluBrandIntro } from '@/components/ZhiluBrandIntro';

export const metadata: Metadata = {
  title: '职业工具 - JOBHOT｜职路同行社出品',
  description: 'JOBHOT 是职路同行社出品的大学生求职网站，提供职业测评、求职诊断、职业探索与笔试训练工具。',
};

export default function ToolsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>职业工具</h1>
        <p>从认识方向、完成测评到笔试准备，选择当前真正需要的一项</p>
      </div>

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
            从霍兰德兴趣、职业价值观到工作风格、技能、就业胜任力和行动准备度，十一套免费工具共同形成综合职业画像。
          </p>
          <div className="timeline-tags" style={{ marginTop: '0.75rem' }}>
            <span className="tag">免费</span>
            <span className="tag">11套测评</span>
            <span className="tag">5-10分钟</span>
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
      <div style={{ marginTop:'1.25rem' }}><ZhiluBrandIntro /></div>
    </div>
  );
}

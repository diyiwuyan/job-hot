import type { Metadata } from 'next';
import Link from 'next/link';
import { EXAM_SETS } from '@/lib/exam-data';
import { COMPANY_EXAM_SETS } from '@/lib/company-exam-data';
import { GROUP_CASES, INTERVIEW_QUESTIONS } from '@/lib/interview-data';

export const metadata: Metadata = {
  title: '职业工具 - JOBHOT',
  description: 'JOBHOT 提供职业测评、求职诊断、职业探索、笔试和面试训练工具。',
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

        {/* 求职准备 */}
        <Link
          href="/tools/prep"
          className="timeline-card timeline-card-featured"
          style={{ display: 'block', textDecoration: 'none', padding: '1.5rem' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📝</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
            求职准备中心
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            从简历、笔试到单面和无领导小组，按真实招聘环节选择当前要练的一项。
          </p>
          <div className="timeline-tags" style={{ marginTop: '0.75rem' }}>
            <span className="tag">{EXAM_SETS.length + COMPANY_EXAM_SETS.length}套笔试</span>
            <span className="tag">{INTERVIEW_QUESTIONS.length}道面试题</span>
            <span className="tag">{GROUP_CASES.length}个群面案例</span>
          </div>
        </Link>

        <Link href="/tools/interview" className="timeline-card timeline-card-featured" style={{ display:'block', textDecoration:'none', padding:'1.5rem' }}>
          <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>💬</div>
          <h2 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'.5rem', color:'var(--text)' }}>面试与群面题库</h2>
          <p style={{ fontSize:'.85rem', color:'var(--text-muted)', lineHeight:1.7, margin:0 }}>按岗位和企业方向筛选单面题，练习经历深挖、业务问题、技术问题和无领导小组案例。</p>
          <div className="timeline-tags" style={{ marginTop:'.75rem' }}><span className="tag">回答框架</span><span className="tag">继续追问</span><span className="tag">群面时间线</span></div>
        </Link>
      </div>
    </div>
  );
}

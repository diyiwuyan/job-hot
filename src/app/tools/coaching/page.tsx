import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '求职支持 - JOBHOT｜职路同行社出品',
  description: '职路同行社求职支持服务状态说明。',
  robots: { index: false, follow: false },
};

export default function CoachingPage() {
  return (
    <div className="page">
      <div className="page-header"><h1>求职支持</h1><p>当前没有开放新的训练营或集中报名计划</p></div>
      <section className="card" style={{ maxWidth:680, margin:'0 auto' }}>
        <h2 style={{ fontSize:'1.05rem', marginBottom:'.5rem' }}>先把免费工具用好</h2>
        <p style={{ color:'var(--text-muted)', fontSize:'.84rem', lineHeight:1.8 }}>现阶段不进行训练营推广。你仍然可以免费完成职业测评、保存结果，并使用招聘信息和笔试训练工具推进自己的求职计划。</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'.6rem', marginTop:'1rem' }}>
          <Link href="/tools/assessment" className="btn">进入职业测评</Link>
          <Link href="/all" className="btn btn-secondary">浏览招聘机会</Link>
        </div>
      </section>
    </div>
  );
}

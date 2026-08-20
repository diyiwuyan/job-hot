'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';
import { CAREER_ASSESSMENTS } from '@/lib/career-assessment-data';
import styles from './CareerProfile.module.css';

type ResultRow = { assessment_id: string; result_name: string; scores: Record<string, number>; updated_at: string };

const SOURCES = [
  { id:'holland', title:'霍兰德职业兴趣', note:'你愿意做什么', href:'/tools/holland' },
  { id:'career-values', title:'职业价值观', note:'你看重什么条件', href:'/tools/values' },
  ...CAREER_ASSESSMENTS.map((item) => ({ id:item.id, title:item.title, note:item.question, href:`/tools/assessment/${item.slug}` })),
];

const dimensionName = new Map(CAREER_ASSESSMENTS.flatMap((assessment) => assessment.dimensions.map((dimension) => [`${assessment.id}:${dimension.key}`, dimension.name] as const)));

export default function CareerProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !supabase) {
      const timer = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(timer);
    }
    let cancelled = false;
    supabase.from('assessment_results').select('assessment_id,result_name,scores,updated_at').eq('user_id', user.id).order('updated_at', { ascending:false }).then(({ data }) => {
      if (!cancelled) { setResults((data as ResultRow[] | null) || []); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [authLoading, user]);

  const byId = useMemo(() => new Map(results.map((result) => [result.assessment_id, result])), [results]);
  const signals = useMemo(() => {
    const output: Array<{ label:string; risk?:boolean }> = [];
    for (const result of results) {
      if (result.assessment_id === 'holland' || result.assessment_id === 'career-values') {
        output.push({ label:result.result_name });
        continue;
      }
      const definition = CAREER_ASSESSMENTS.find((item) => item.id === result.assessment_id);
      if (!definition) continue;
      const ranked = definition.dimensions.map((item) => ({ key:item.key, score:result.scores[item.key] || 0 })).sort((a,b) => b.score-a.score);
      if (ranked[0]) output.push({ label:`${definition.shortTitle} · ${dimensionName.get(`${definition.id}:${ranked[0].key}`)}`, risk:definition.scoreDirection === 'risk' });
    }
    return output.slice(0,6);
  }, [results]);

  if (authLoading || loading) return <div className="page"><section className="card">正在读取你的职业画像…</section></div>;
  if (!user) return <div className="page"><div className="page-header"><h1>综合职业画像</h1><p>登录后，把不同测评结果放在同一个账号里理解</p></div><section className="card"><h2 style={{fontSize:'1rem'}}>需要先登录账号</h2><p style={{color:'var(--text-muted)',fontSize:'.82rem'}}>登录后才能读取和汇总属于你的测评结果。</p><Link href="/login?redirect=/tools/assessment/profile" className="btn">登录账号 →</Link></section></div>;

  const completion = Math.round((SOURCES.filter((source) => byId.has(source.id)).length / SOURCES.length) * 100);
  const holland = byId.get('holland')?.result_name;
  const values = byId.get('career-values')?.result_name;
  const risk = signals.find((signal) => signal.risk)?.label;
  const title = signals.filter((signal) => !signal.risk).slice(0,3).map((signal) => signal.label).join(' · ') || '完成测评后生成你的组合洞察';
  const synthesis = `${holland ? `兴趣结果显示${holland}。` : ''}${values ? `工作条件上更看重${values}。` : ''}${risk ? ` 当前值得优先处理的卡点是${risk}。` : ''}${results.length < 2 ? ' 再完成一项不同类型的测评，组合判断会比单份报告更可靠。' : ' 把这些信号与真实项目、实习和岗位JD交叉验证，再决定下一步。'}`;

  return <div className={`page ${styles.page}`}>
    <section className={styles.hero}><div><span>JOBHOT CAREER PROFILE</span><h1>我的综合职业画像</h1><p>兴趣回答“愿意做什么”，价值观回答“什么条件值得投入”，工作风格与技能回答“通常怎么做、已经会什么”，决策卡点和行动准备度回答“现在先解决什么”。</p></div><div className={styles.completion}><strong>{completion}%</strong><small>画像完整度</small></div></section>
    <section className={styles.insight}><div className={styles.insightTop}><span>跨测评组合洞察</span><span>{results.length} 份云端结果</span></div><h2>{title}</h2><p>{synthesis}</p><div className={styles.signals}>{signals.map((signal) => <span key={signal.label} className={signal.risk ? styles.risk : ''}>{signal.label}</span>)}</div></section>
    <section className={styles.section}><div className={styles.heading}><div><h2>画像的数据来源</h2><p>不必一次做完，选择最接近当前问题的一项。</p></div><Link href="/tools/assessment">继续测评 →</Link></div><div className={styles.sourceGrid}>{SOURCES.map((source) => { const complete=byId.has(source.id); return <Link href={source.href} className={styles.source} data-complete={complete} key={source.id}><span>{complete?'✓':'○'}</span><div><strong>{source.title}</strong><small>{source.note}</small></div><em>{complete?'已接入':'待补充'}</em></Link>; })}</div></section>
    <section className={styles.section}><div className={styles.heading}><div><h2>账号内已保存报告</h2><p>重新完成同一测评后会更新为最新结果。</p></div></div>{results.length ? <div className={styles.reportList}>{results.map((result) => { const source=SOURCES.find((item)=>item.id===result.assessment_id); if(!source)return null; const overall=result.scores.overall; return <Link href={source.href} className={styles.report} key={result.assessment_id}><div className={styles.score}>{Number.isFinite(overall)?overall:'✓'}</div><div><strong>{source.title}</strong><small>{result.result_name} · {new Intl.DateTimeFormat('zh-CN',{dateStyle:'medium'}).format(new Date(result.updated_at))}</small></div><b>→</b></Link>; })}</div> : <div className={styles.empty}>还没有云端测评结果。先从霍兰德兴趣或职业工作风格开始。</div>}</section>
  </div>;
}

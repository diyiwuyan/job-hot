'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AssessmentResultActions } from '@/components/AssessmentResultActions';
import { captureAssessmentSource } from '@/lib/assessment-source';
import { trackEvent } from '@/lib/analytics';
import { VALUE_INFO, VALUE_ORDER, VALUES_QUESTIONS, VALUES_SCALE, type ValueKey } from '@/lib/values-data';

type Stage = 'intro' | 'quiz' | 'result';

export default function ValuesPage() {
  const [stage, setStage] = useState<Stage>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const total = VALUES_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;

  useEffect(() => { captureAssessmentSource(); }, []);

  const scores = useMemo(() => {
    const result: Record<ValueKey, number> = { growth: 0, autonomy: 0, stability: 0, impact: 0, connection: 0, balance: 0 };
    VALUES_QUESTIONS.forEach((question) => { result[question.key] += answers[question.id] || 0; });
    return result;
  }, [answers]);
  const ranked = useMemo(() => VALUE_ORDER.map((key) => ({ key, score: scores[key] })).sort((a, b) => b.score - a.score), [scores]);

  function start() {
    const source = captureAssessmentSource();
    trackEvent('assessment_start', 'career-values', { source });
    setStage('quiz');
  }
  function answer(value: number) {
    const question = VALUES_QUESTIONS[current];
    setAnswers((previous) => ({ ...previous, [question.id]: value }));
    if (current < total - 1) window.setTimeout(() => setCurrent((index) => index + 1), 150);
    else window.setTimeout(() => setStage('result'), 200);
  }
  function restart() { setAnswers({}); setCurrent(0); setStage('intro'); }

  if (stage === 'intro') return <div className="page"><div className="page-header"><h1>职业价值观测评</h1><p>不是替你选职业，而是帮你看清：一份工作里，你最希望被满足什么</p></div><section className="card" style={{ marginBottom: '1rem' }}><p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>同一份岗位，对不同人可能有完全不同的吸引力。这个原创自测从成长、自主、稳定、影响、关系与生活边界六个维度，帮你形成一张可用于筛选岗位和提问面试官的“条件清单”。</p><div className="divider" /><p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.7, margin: 0 }}>共30题，约5分钟。没有高低好坏，请按你当下真实看重的程度作答。</p></section><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>{VALUE_ORDER.map((key) => { const item = VALUE_INFO[key]; return <div key={key} className="timeline-card" style={{ borderTop: `3px solid ${item.color}`, padding: '0.8rem' }}><strong style={{ fontSize: '0.9rem' }}>{item.name}</strong><p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', lineHeight: 1.65, margin: '0.35rem 0 0' }}>{item.signals}</p></div>; })}</div><button className="btn btn-lg" onClick={start}>开始测评 →</button></div>;

  if (stage === 'quiz') {
    const question = VALUES_QUESTIONS[current]; const selected = answers[question.id]; const progress = Math.round((answeredCount / total) * 100);
    return <div className="page"><div className="page-header"><h1>第 {current + 1} / {total} 题</h1><p>请按当下真实看重的程度选择</p></div><div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 999, overflow: 'hidden', marginBottom: '1.25rem' }}><div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #0f766e, #2563eb)', transition: 'width .25s ease' }} /></div><section className="card" style={{ marginBottom: '1rem' }}><h2 style={{ fontSize: '1.12rem', lineHeight: 1.7, margin: 0 }}>{question.text}</h2></section><div style={{ display: 'grid', gap: '0.55rem' }}>{VALUES_SCALE.map((option) => <button key={option.value} type="button" className="timeline-card" onClick={() => answer(option.value)} style={{ width: '100%', display: 'flex', gap: '0.75rem', textAlign: 'left', cursor: 'pointer', alignItems: 'center', borderColor: selected === option.value ? '#0f766e' : undefined, background: selected === option.value ? 'rgba(13,148,136,.10)' : undefined }}><span style={{ width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: selected === option.value ? '#0f766e' : 'var(--bg-elevated)', color: selected === option.value ? '#fff' : 'var(--text-muted)', fontWeight: 700 }}>{option.value}</span>{option.label}</button>)}</div><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}><button type="button" className="btn btn-secondary" disabled={current === 0} style={{ opacity: current === 0 ? .5 : 1 }} onClick={() => setCurrent((index) => Math.max(0, index - 1))}>← 上一题</button>{current < total - 1 && <button type="button" className="btn btn-secondary" disabled={!selected} style={{ opacity: selected ? 1 : .5 }} onClick={() => setCurrent((index) => index + 1)}>下一题 →</button>}</div></div>;
  }

  const top3 = ranked.slice(0, 3); const first = VALUE_INFO[top3[0].key]; const second = VALUE_INFO[top3[1].key];
  const action = `找3个你正在考虑的真实岗位，把“${first.name}、${second.name}、${VALUE_INFO[top3[2].key].name}”分别打1—5分，并用岗位JD、招聘沟通或学长学姐访谈写下每一分的证据。`;
  return <div className="page"><div className="page-header"><h1>你的职业价值观优先项</h1><p>最突出的三项是：{top3.map((item) => VALUE_INFO[item.key].name).join('、')}</p></div><section className="card" style={{ marginBottom: '1rem', borderTop: `4px solid ${first.color}` }}><h2 style={{ fontSize: '1.12rem', marginBottom: '.45rem' }}>把“我想要什么”变成筛选岗位的依据</h2><p style={{ color: 'var(--text-muted)', fontSize: '.88rem', lineHeight: 1.8, margin: 0 }}>这份结果反映的是你本次作答中更看重的工作条件，不代表能力高低，也不等于只能选择某一种职业。真正有用的是把它带回真实岗位中验证。</p></section><section className="card" style={{ marginBottom: '1rem' }}><h2 style={{ fontSize: '1rem', marginBottom: '.85rem' }}>六项价值观得分</h2>{ranked.map((item) => { const info = VALUE_INFO[item.key]; const pct = Math.round(item.score / 25 * 100); return <div key={item.key} style={{ marginBottom: '.8rem' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: '.28rem' }}><strong>{info.name}</strong><span className="mono" style={{ color: 'var(--text-muted)' }}>{item.score} / 25</span></div><div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 999, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: info.color }} /></div></div>; })}</section><section className="card" style={{ marginBottom: '1rem' }}><h2 style={{ fontSize: '1rem', marginBottom: '.35rem' }}>三项优先条件：看岗位时这样用</h2><p style={{ color: 'var(--text-muted)', fontSize: '.78rem', lineHeight: 1.7 }}>建议保存这张表，在看JD、参加宣讲会或面试反问时逐项补证据。</p><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620, fontSize: '.8rem', lineHeight: 1.65 }}><thead><tr>{['优先项', '你可能更看重的信号', '可以直接问的问题', '别忽略的提醒'].map((text) => <th key={text} style={{ textAlign: 'left', padding: '.6rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{text}</th>)}</tr></thead><tbody>{top3.map((item) => { const info = VALUE_INFO[item.key]; return <tr key={item.key}><td style={{ padding: '.7rem .6rem', borderBottom: '1px solid var(--border)', fontWeight: 700, color: info.color }}>{info.name}</td><td style={{ padding: '.7rem .6rem', borderBottom: '1px solid var(--border)' }}>{info.signals}</td><td style={{ padding: '.7rem .6rem', borderBottom: '1px solid var(--border)' }}>{info.jobQuestions[0]}</td><td style={{ padding: '.7rem .6rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{info.watchout}</td></tr>; })}</tbody></table></div></section><section className="card" style={{ marginBottom: '1rem' }}><h2 style={{ fontSize: '1rem', marginBottom: '.5rem' }}>你接下来可以验证的岗位条件</h2><div className="timeline-tags">{top3.flatMap((item) => VALUE_INFO[item.key].conditions).map((condition) => <span className="tag" key={condition}>{condition}</span>)}</div><p style={{ color: 'var(--text-muted)', fontSize: '.8rem', lineHeight: 1.7, margin: '.75rem 0 0' }}>如果两项得分接近，并不说明你“矛盾”。例如既看重成长也看重稳定，下一步是判断你当前阶段更不能妥协的条件，以及愿意承担的代价。</p></section><AssessmentResultActions assessmentId="career-values" assessmentName="职业价值观测评" resultName={top3.map((item) => VALUE_INFO[item.key].name).join('、')} headline={`我当前最看重：${top3.map((item) => VALUE_INFO[item.key].name).join('、')}`} summary="价值观结果适合用来筛选岗位条件，并需要与经历、能力和真实工作任务一起验证。" action={action} campFit="如果你想把“我看重什么”落实到目标岗位、投递判断和面试沟通中，职路同行社可以协助你把条件转成行动。" accent={first.color} nextStep={{ href: '/tools/career-atlas', label: '再用职业坐标验证可能方向', description: '价值观帮助你筛条件；职业坐标帮助你把兴趣、经历与岗位任务放在一起比较。' }} /><div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap' }}><button className="btn btn-secondary" onClick={restart}>重新测评</button><Link href="/tools/assessment" className="btn btn-secondary">返回测评中心</Link></div><p style={{ fontSize: '.72rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '1.25rem' }}>说明：这是职路同行社原创的轻量自我探索工具，不构成心理诊断、招聘筛选或职业选择结论。</p></div>;
}

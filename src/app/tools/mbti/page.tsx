'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AssessmentResultActions } from '@/components/AssessmentResultActions';
import { trackEvent } from '@/lib/analytics';
import { captureAssessmentSource } from '@/lib/assessment-source';
import { MBTI_AXES, MBTI_QUESTIONS, MBTI_RESULTS, calculateMbti } from '@/lib/mbti-data';

type Stage = 'intro' | 'quiz' | 'result';
type SavedProgress = { current: number; answers: Record<string, number> };

const STORAGE_KEY = 'jobhot_mbti_progress_v1';
const SCALE = [
  { value: 1, label: '很不符合' },
  { value: 2, label: '不太符合' },
  { value: 3, label: '比较符合' },
  { value: 4, label: '很符合' },
];

export default function MbtiPage() {
  const [stage, setStage] = useState<Stage>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<SavedProgress | null>(null);

  useEffect(() => {
    captureAssessmentSource();
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as SavedProgress;
        if (parsed.current >= 0 && parsed.current < MBTI_QUESTIONS.length && Object.keys(parsed.answers || {}).length) {
          setSaved(parsed);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const calculation = useMemo(() => calculateMbti(answers), [answers]);
  const result = MBTI_RESULTS[calculation.code] || MBTI_RESULTS.ISTJ;

  function beginNew() {
    const source = captureAssessmentSource();
    window.localStorage.removeItem(STORAGE_KEY);
    trackEvent('assessment_start', 'mbti', { source, mode: 'new' });
    setAnswers({});
    setCurrent(0);
    setSaved(null);
    setStage('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resume() {
    if (!saved) return;
    const source = captureAssessmentSource();
    trackEvent('assessment_start', 'mbti', { source, mode: 'resume', answered: Object.keys(saved.answers).length });
    setAnswers(saved.answers);
    setCurrent(saved.current);
    setStage('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function answerQuestion(id: string, value: number) {
    const nextAnswers = { ...answers, [id]: value };
    setAnswers(nextAnswers);
    if (current < MBTI_QUESTIONS.length - 1) {
      const progress = { current: current + 1, answers: nextAnswers };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      window.setTimeout(() => setCurrent((index) => index + 1), 120);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      setSaved(null);
      window.setTimeout(() => {
        setStage('result');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 160);
    }
  }

  function goPrevious() {
    if (current === 0) {
      const progress = { current: 0, answers };
      if (Object.keys(answers).length) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        setSaved(progress);
      }
      setStage('intro');
      return;
    }
    setCurrent((index) => index - 1);
  }

  function restart() {
    window.localStorage.removeItem(STORAGE_KEY);
    setStage('intro');
    setCurrent(0);
    setAnswers({});
    setSaved(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (stage === 'intro') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>16型性格偏好自测</h1>
          <p>70道原创题 · 约10分钟 · 完整结果免费</p>
        </div>

        <section className="card" style={{ maxWidth: 700, margin: '0 auto 1rem', borderTop: '4px solid #f97316' }}>
          <div className="timeline-tags" style={{ marginBottom: '0.8rem' }}>
            <span className="tag">非官方版</span>
            <span className="tag">无中立选项</span>
            <span className="tag">支持中断续测</span>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.55, marginBottom: '0.65rem' }}>
            看见自己的偏好，不用一个类型限制未来
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.85, marginBottom: '1rem' }}>
            请按你大多数时候自然、舒服的状态作答，而不是按“理想的自己”或某个岗位期待作答。结果会呈现四组偏好比例、接近中线提示、可能的优势与提醒，并给出一项72小时行动。
          </p>
          <button type="button" className="btn btn-lg" style={{ width: '100%' }} onClick={beginNew}>
            {saved ? '重新开始测试' : '开始测试'} →
          </button>
          {saved && (
            <button type="button" className="btn btn-secondary btn-lg" style={{ width: '100%', marginTop: '0.65rem' }} onClick={resume}>
              继续上次测试（已完成 {Object.keys(saved.answers).length} / {MBTI_QUESTIONS.length}）
            </button>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', lineHeight: 1.7, marginTop: '0.85rem' }}>
            说明：本测试并非 Myers-Briggs Company 官方量表，题目由职路同行社原创，仅用于轻量自我探索；不构成心理诊断、招聘筛选、职业定论或求职结果承诺。
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.65rem', maxWidth: 700, margin: '0 auto' }}>
          {MBTI_AXES.map((axis) => (
            <div key={axis.key} className="timeline-card" style={{ padding: '0.8rem', textAlign: 'center' }}>
              <strong style={{ fontSize: '0.85rem' }}>{axis.leftLabel} / {axis.rightLabel}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stage === 'quiz') {
    const question = MBTI_QUESTIONS[current];
    const selected = answers[question.id];
    const answeredCount = Object.keys(answers).length;
    const progress = Math.round((answeredCount / MBTI_QUESTIONS.length) * 100);
    return (
      <div className="page">
        <div className="page-header">
          <h1>第 {current + 1} / {MBTI_QUESTIONS.length} 题</h1>
          <p>选择更接近你自然状态的一项</p>
        </div>
        <div style={{ maxWidth: 700, margin: '0 auto 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
            <span>已完成 {answeredCount} 题</span><span>{progress}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #f97316, #db2777)', transition: 'width .25s ease' }} />
          </div>
        </div>
        <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.08rem', lineHeight: 1.75, marginBottom: '1rem' }}>{question.text}</h2>
          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {SCALE.map((option) => (
              <button
                key={option.value}
                type="button"
                className="timeline-card"
                data-score={option.value}
                onClick={() => answerQuestion(question.id, option.value)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left', cursor: 'pointer', borderColor: selected === option.value ? '#f97316' : undefined, background: selected === option.value ? 'rgba(249,115,22,.10)' : undefined }}
              >
                <span style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: selected === option.value ? '#f97316' : 'var(--bg-elevated)', color: selected === option.value ? '#fff' : 'var(--text-muted)', fontWeight: 700 }}>{option.value}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={goPrevious}>← 上一步</button>
            {current < MBTI_QUESTIONS.length - 1 && (
              <button type="button" className="btn btn-secondary" disabled={!selected} style={{ opacity: selected ? 1 : 0.5 }} onClick={() => setCurrent((index) => index + 1)}>下一题 →</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>你的16型性格偏好结果</h1>
        <p>{calculation.borderline ? '有维度接近中线，请重点看比例而不只看四字母' : '四组偏好相对清晰，但偏好仍会随情境变化'}</p>
      </div>

      <section className="card" style={{ marginBottom: '1rem', borderTop: `4px solid ${result.color}` }}>
        <div className="timeline-tags" style={{ marginBottom: '0.75rem' }}>
          <span className="tag">{result.code}</span>
          <span className="tag">非官方自测结果</span>
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 850, lineHeight: 1.45, marginBottom: '0.35rem' }}>{result.code} · {result.name}</h2>
        <div style={{ color: result.color, fontWeight: 750, marginBottom: '0.65rem' }}>{result.tagline}</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.85, margin: 0 }}>{result.description}</p>
      </section>

      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.8rem' }}>四组偏好比例</h2>
        {calculation.dimensions.map((dimension) => {
          const axis = MBTI_AXES.find((item) => item.key === dimension.axis)!;
          return (
            <div key={dimension.axis} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <strong>{axis.leftLabel} {dimension.leftPercent}%</strong>
                <span style={{ color: dimension.clarity === '偏好清晰' ? 'var(--text-muted)' : '#f97316' }}>{dimension.clarity}</span>
                <strong>{dimension.rightPercent}% {axis.rightLabel}</strong>
              </div>
              <div style={{ height: 10, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${dimension.leftPercent}%`, height: '100%', background: dimension.selected === dimension.left ? result.color : `${result.color}66` }} />
                <div style={{ width: `${dimension.rightPercent}%`, height: '100%', background: dimension.selected === dimension.right ? result.color : `${result.color}66` }} />
              </div>
            </div>
          );
        })}
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
          比例表示你在本次作答中的相对倾向，不是能力高低。精确相同时系统暂归入左侧字母，并标记“非常接近中线”。
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <section className="card">
          <h2 style={{ fontSize: '1rem', marginBottom: '0.65rem' }}>可能的优势</h2>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.9 }}>
            {result.strengths.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
        <section className="card">
          <h2 style={{ fontSize: '1rem', marginBottom: '0.65rem' }}>可能更舒服的环境</h2>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.9 }}>
            {result.environment.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </div>

      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.65rem' }}>需要留意</h2>
        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.9 }}>
          {result.watchouts.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <AssessmentResultActions
        assessmentId="mbti"
        assessmentName="16型性格偏好自测（非官方）"
        resultName={`${result.code} · ${result.name}`}
        headline={result.tagline}
        summary={result.description}
        action={result.action}
        campFit={result.camp}
        accent={result.color}
        nextStep={{
          href: '/tools/autumn-start',
          label: '继续做一次秋招启动诊断',
          description: '性格偏好回答“你更习惯怎样行动”，但不能替代对当前求职卡点的判断。再用5分钟找出眼下最优先的一步。',
        }}
      />

      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary" onClick={restart}>重新测试</button>
        <Link href="/tools/assessment" className="btn btn-secondary">返回测评中心</Link>
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '1.25rem' }}>
        本测试并非 Myers-Briggs Company 官方量表。结果只用于自我探索，不能用于心理诊断、招聘筛选或直接判断“适合/不适合”某个职业；请结合真实岗位任务、实践体验和持续反馈做选择。
      </p>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AssessmentResultActions } from '@/components/AssessmentResultActions';
import { AssessmentScopeDisclosure } from '@/components/AssessmentScopeDisclosure';
import { trackEvent } from '@/lib/analytics';
import { captureAssessmentSource } from '@/lib/assessment-source';
import {
  AUTUMN_DIMENSIONS,
  AUTUMN_QUESTIONS,
  AUTUMN_RESULTS,
  BASIC_QUESTIONS,
  calculateAutumnResult,
  type BasicKey,
} from '@/lib/autumn-start-data';

type Stage = 'intro' | 'basics' | 'quiz' | 'result';
const SCALE = [
  { value: 1, label: '完全不符合' },
  { value: 2, label: '比较不符合' },
  { value: 3, label: '有时符合' },
  { value: 4, label: '比较符合' },
  { value: 5, label: '非常符合' },
];

export default function AutumnStartPage() {
  const [stage, setStage] = useState<Stage>('intro');
  const [basicCurrent, setBasicCurrent] = useState(0);
  const [current, setCurrent] = useState(0);
  const [basics, setBasics] = useState<Partial<Record<BasicKey, string | number>>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    captureAssessmentSource();
  }, []);

  const calculation = useMemo(() => calculateAutumnResult(answers, basics), [answers, basics]);
  const result = AUTUMN_RESULTS[calculation.primary];
  const secondary = calculation.secondary ? AUTUMN_RESULTS[calculation.secondary] : null;

  function start() {
    const source = captureAssessmentSource();
    trackEvent('assessment_start', 'autumn-start', { source });
    setStage('basics');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function answerBasic(key: BasicKey, value: string | number) {
    setBasics((previous) => ({ ...previous, [key]: value }));
    if (basicCurrent < BASIC_QUESTIONS.length - 1) {
      window.setTimeout(() => setBasicCurrent((index) => index + 1), 140);
    } else {
      window.setTimeout(() => {
        setStage('quiz');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 180);
    }
  }

  function answerQuestion(id: string, value: number) {
    setAnswers((previous) => ({ ...previous, [id]: value }));
    if (current < AUTUMN_QUESTIONS.length - 1) {
      window.setTimeout(() => setCurrent((index) => index + 1), 140);
    } else {
      window.setTimeout(() => {
        setStage('result');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 180);
    }
  }

  function restart() {
    setStage('intro');
    setBasicCurrent(0);
    setCurrent(0);
    setBasics({});
    setAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (stage === 'intro') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>27届秋招启动诊断</h1>
          <p>约4分钟，定位当前求职循环最值得优先处理的环节</p>
        </div>

        <section className="card" style={{ maxWidth: 680, margin: '0 auto 1rem', borderTop: '4px solid #22c55e' }}>
          <div className="timeline-tags" style={{ marginBottom: '0.8rem' }}>
            <span className="tag">27届当前推荐</span>
            <span className="tag">15道行为题＋3道状态题</span>
            <span className="tag">免费</span>
            <span className="tag">完整结果立即可见</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.5, marginBottom: '0.65rem' }}>
            秋招推进不顺，不一定是因为“不够努力”
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.85, marginBottom: '1rem' }}>
            求职是一个“明确目标—准备证据—管理机会—通过筛选—读取反馈”的循环。请按最近14天真实发生的行为作答，结果会定位当前最高优先级，并给出一项72小时行动和对应工具。
          </p>
          <button type="button" className="btn btn-lg" style={{ width: '100%' }} onClick={start}>
            开始诊断 →
          </button>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', lineHeight: 1.7, marginTop: '0.85rem' }}>
            本工具诊断当前求职行为，不测人格或长期能力，也不构成心理诊断和职业定论；无需留下联系方式即可查看完整结果。
          </p>
        </section>

        <div style={{ maxWidth: 680, margin: '0 auto' }}><AssessmentScopeDisclosure mode="diagnostic" areas={['目标聚焦', '证据与材料', '机会与投递', '笔试面试准备', '复盘与行动节奏']} /></div>
      </div>
    );
  }

  if (stage === 'basics') {
    const question = BASIC_QUESTIONS[basicCurrent];
    const selected = basics[question.key];
    return (
      <div className="page">
        <div className="page-header">
          <h1>先了解你的当前进度</h1>
          <p>{basicCurrent + 1} / {BASIC_QUESTIONS.length} · 这部分帮助校准结果</p>
        </div>
        <div className="card" style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '1rem' }}>{question.title}</h2>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {question.options.map((option) => (
              <button
                key={String(option.value)}
                type="button"
                className="timeline-card"
                onClick={() => answerBasic(question.key, option.value)}
                style={{ width: '100%', textAlign: 'left', cursor: 'pointer', borderColor: selected === option.value ? 'var(--accent)' : undefined, background: selected === option.value ? 'var(--accent-muted)' : undefined }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
            onClick={() => basicCurrent === 0 ? setStage('intro') : setBasicCurrent((index) => index - 1)}
          >
            ← 上一步
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'quiz') {
    const question = AUTUMN_QUESTIONS[current];
    const selected = answers[question.id];
    const progress = Math.round((Object.keys(answers).length / AUTUMN_QUESTIONS.length) * 100);
    return (
      <div className="page">
        <div className="page-header">
          <h1>第 {current + 1} / {AUTUMN_QUESTIONS.length} 题</h1>
          <p>请按最近两周的真实状态作答</p>
        </div>
        <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 999, overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #16a34a, #14b8a6)', transition: 'width .25s ease' }} />
        </div>
        <div className="card" style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.08rem', lineHeight: 1.7, marginBottom: '1rem' }}>{question.text}</h2>
          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {SCALE.map((option) => (
              <button
                key={option.value}
                type="button"
                className="timeline-card"
                onClick={() => answerQuestion(question.id, option.value)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left', cursor: 'pointer', borderColor: selected === option.value ? 'var(--accent)' : undefined, background: selected === option.value ? 'var(--accent-muted)' : undefined }}
              >
                <span style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: selected === option.value ? 'var(--accent)' : 'var(--bg-elevated)', color: selected === option.value ? '#fff' : 'var(--text-muted)', fontWeight: 700 }}>{option.value}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => current === 0 ? setStage('basics') : setCurrent((index) => index - 1)}>← 上一步</button>
            {current < AUTUMN_QUESTIONS.length - 1 && (
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
        <h1>你的秋招启动结果</h1>
        <p>{calculation.confidence}{secondary ? `，次卡点可能是“${secondary.type}”` : ''}</p>
      </div>

      <section className="card" style={{ marginBottom: '1rem', borderTop: `4px solid ${result.color}` }}>
        <div className="timeline-tags" style={{ marginBottom: '0.75rem' }}>
          <span className="tag">{result.type}</span>
          {secondary && <span className="tag">次卡点：{secondary.type}</span>}
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.5, marginBottom: '0.65rem' }}>{result.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.85 }}>{result.description}</p>
      </section>

      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>五个求职环节</h2>
        <p style={{ color:'var(--text-muted)', fontSize:'.72rem', lineHeight:1.65, margin:'0 0 .8rem' }}>分数越高，代表这个环节当前阻塞越明显；它反映最近14天的状态，不代表长期能力。</p>
        {AUTUMN_DIMENSIONS.map((dimension) => (
          <div key={dimension.key} style={{ display: 'grid', gridTemplateColumns: '92px 1fr 32px', gap: '0.6rem', alignItems: 'center', marginBottom: '0.65rem', fontSize: '0.8rem' }}>
            <span>{dimension.name}</span>
            <div style={{ height: 7, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(calculation.scores[dimension.key] / 15) * 100}%`, background: dimension.key === calculation.primary ? result.color : 'var(--accent)', opacity: dimension.key === calculation.primary ? 1 : 0.55 }} />
            </div>
            <strong>{calculation.scores[dimension.key]}</strong>
          </div>
        ))}
      </section>

      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.65rem' }}>你可能最容易踩的坑</h2>
        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.9 }}>
          {result.pitfalls.map((pitfall) => <li key={pitfall}>{pitfall}</li>)}
        </ul>
      </section>

      <AssessmentResultActions
        assessmentId="autumn-start"
        assessmentName="27届秋招启动诊断"
        resultName={result.type}
        headline={result.title}
        summary={result.description}
        action={result.action}
        accent={result.color}
        nextStep={result.nextStep}
      />

      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary" onClick={restart}>重新诊断</button>
        <Link href="/tools/assessment" className="btn btn-secondary">返回测评中心</Link>
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '1.25rem' }}>
        说明：本工具用于行动诊断，不给人贴标签，不替代真实岗位研究、实践和个体职业咨询，也不承诺求职结果。
      </p>
    </div>
  );
}

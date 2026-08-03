'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AssessmentResultActions } from '@/components/AssessmentResultActions';
import { trackEvent } from '@/lib/analytics';
import { captureAssessmentSource } from '@/lib/assessment-source';
import {
  QUESTIONS,
  CARDS,
  getDiagForScore,
  getProfile,
  type CardType,
} from '@/lib/dipai-data';

type Stage = 'intro' | 'quiz' | 'result';

const SCALE = [0, 1, 2, 3, 4, 5];

export default function DipaiPage() {
  const [stage, setStage] = useState<Stage>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const total = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / total) * 100);

  useEffect(() => {
    captureAssessmentSource();
  }, []);

  // 计算各维度得分
  const scores = useMemo(() => {
    const s: Record<CardType, number> = { buffer: 0, info: 0, trial: 0, family: 0 };
    for (const q of QUESTIONS) {
      s[q.type] += answers[q.id] ?? 0;
    }
    return s;
  }, [answers]);

  const totalScore = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);

  function answer(value: number) {
    const next = { ...answers, [QUESTIONS[current].id]: value };
    setAnswers(next);
    if (current < total - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 150);
    }
  }

  function finish() {
    if (answeredCount < total) return;
    setStage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function start() {
    const source = captureAssessmentSource();
    trackEvent('assessment_start', 'dipai', { source });
    setStage('quiz');
  }

  function restart() {
    setAnswers({});
    setCurrent(0);
    setStage('intro');
  }

  // ====== Intro ======
  if (stage === 'intro') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>求职底牌自测表</h1>
          <p>12 道题，约 3—5 分钟，看看你当前最值得优先补哪张牌</p>
        </div>

        <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
            每道题按你的真实情况给自己打分：<strong>0 = 完全不符合，5 = 完全符合</strong>。
            测完后会盘点你在四张底牌上的当前状态，并给出一项可以马上开始的补牌动作。
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {CARDS.map((card) => (
              <div key={card.type} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{card.emoji}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{card.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{card.description}</div>
              </div>
            ))}
          </div>

          <button
            onClick={start}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            开始测试（约 3—5 分钟）
          </button>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '0.8rem' }}>
            结果用于自我观察和行动参考，不给人贴标签；无需留下联系方式也能查看完整结果。
          </p>
        </div>
      </div>
    );
  }

  // ====== Quiz ======
  if (stage === 'quiz') {
    const q = QUESTIONS[current];
    const card = CARDS.find((c) => c.type === q.type)!;

    return (
      <div className="page">
        {/* 进度条 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span>{card.emoji} {card.name}</span>
            <span>{current + 1} / {total}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)', transition: 'width 0.3s ease', borderRadius: 3 }} />
          </div>
        </div>

        {/* 题目 */}
        <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.7, marginBottom: '1.5rem' }}>
            第 {current + 1} 题：{q.text}
          </p>

          {/* 评分按钮 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {SCALE.map((val) => (
              <button
                key={val}
                onClick={() => answer(val)}
                style={{
                  flex: 1,
                  padding: '0.75rem 0',
                  borderRadius: '0.5rem',
                  border: answers[q.id] === val ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: answers[q.id] === val ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
                  color: answers[q.id] === val ? 'var(--accent)' : 'var(--text)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {val}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>完全不符合</span>
            <span>完全符合</span>
          </div>
        </div>

        {/* 导航 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', maxWidth: 600, margin: '1.5rem auto 0' }}>
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.4rem',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: current === 0 ? 'var(--text-muted)' : 'var(--text)',
              cursor: current === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
            }}
          >
            ← 上一题
          </button>

          {current < total - 1 ? (
            <button
              onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.4rem',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              下一题 →
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={answeredCount < total}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.4rem',
                border: 'none',
                background: answeredCount >= total ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'var(--border)',
                color: answeredCount >= total ? '#fff' : 'var(--text-muted)',
                cursor: answeredCount >= total ? 'pointer' : 'not-allowed',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              查看结果
            </button>
          )}
        </div>
      </div>
    );
  }

  // ====== Result ======
  const profile = getProfile(scores);
  const lowestCard = [...CARDS].sort((a, b) => scores[a.type] - scores[b.type])[0];
  const lowestScore = scores[lowestCard.type];
  const resultName = profile?.name ?? `优先补牌：${lowestCard.name}`;
  const resultHeadline = `当前优先补“${lowestCard.name}”，先把问题拆成一个可以执行的小动作`;

  return (
    <div className="page">
      <div className="page-header">
        <h1>你的底牌诊断</h1>
        <p>总分 {totalScore} / 60</p>
      </div>

      {/* 四维得分 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {CARDS.map((card) => {
          const score = scores[card.type];
          const diag = getDiagForScore(score);
          return (
            <div key={card.type} className="timeline-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{card.emoji}</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{card.name}</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                {score}<span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}> / 15</span>
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                {diag.emoji} <strong>{diag.label}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {diag.advice}
              </div>
              {/* 进度条 */}
              <div style={{ marginTop: '0.5rem', height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(score / 15) * 100}%`,
                    borderRadius: 2,
                    background: diag.level === 'critical' ? '#3b82f6' : diag.level === 'moderate' ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 画像匹配 */}
      {profile && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            你的画像：「{profile.name}」
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0.4rem' }}>
            {profile.description}
          </p>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>
            💡 <strong>建议：</strong>{profile.suggestion}
          </p>
        </div>
      )}

      <AssessmentResultActions
        assessmentId="dipai"
        assessmentName="求职底牌自测"
        resultName={resultName}
        headline={resultHeadline}
        summary={profile?.description ?? lowestCard.description}
        action={lowestCard.action}
        nextStep={{
          href: '/tools/autumn-start',
          label: '如果你正在准备27届秋招，继续判断当前任务卡点',
          description: '求职底牌回答“你手里有什么”，秋招启动诊断会进一步回答“你此刻应该先处理方向、经历、简历、行动还是信息”。',
        }}
        campFit={`你的“${lowestCard.name}”得分为 ${lowestScore}/15。免费自测先完成第一轮判断；如果还需要把方向、经历、简历和30天行动计划系统落下来，可以再了解训练营。`}
        accent="#10b981"
      />

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={restart}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text)',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          重新测试
        </button>
        <Link
          href="/tools/assessment"
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text)',
            fontSize: '0.85rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          返回测评中心
        </Link>
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1.25rem', lineHeight: 1.7 }}>
        测评工具由JOBHOT提供，结果解读与行动支持由职路同行社提供。本结果不构成专业心理诊断或职业定论。
      </p>
    </div>
  );
}

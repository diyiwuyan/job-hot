'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
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
          <p>12 道题，5 分钟，测出你在求职路上最缺哪张底牌</p>
        </div>

        <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
            每道题按你的真实情况给自己打分：<strong>0 = 完全不符合，5 = 完全符合</strong>。
            测完后会诊断你在四张底牌上的表现，并匹配典型画像给出改善建议。
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
            onClick={() => setStage('quiz')}
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
            开始测试（约 5 分钟）
          </button>
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
                    background: diag.level === 'critical' ? '#ef4444' : diag.level === 'moderate' ? '#f59e0b' : '#10b981',
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

      {/* 行动按钮 */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
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
          href="/tools/coaching"
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          获取一对一辅导 →
        </Link>
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
          做更多测评
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  QUESTIONS,
  TYPE_INFO,
  TYPE_ORDER,
  SCALE_OPTIONS,
  type HollandType,
} from '@/lib/holland-data';

type Stage = 'intro' | 'quiz' | 'result';

export default function HollandPage() {
  const [stage, setStage] = useState<Stage>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const total = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / total) * 100);

  // 计算得分
  const scores = useMemo(() => {
    const s: Record<HollandType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    for (const q of QUESTIONS) {
      s[q.type] += answers[q.id] || 0;
    }
    return s;
  }, [answers]);

  // 每维度满分 = 8 题 * 5 = 40
  const maxScore = 8 * 5;

  const ranked = useMemo(() => {
    return TYPE_ORDER.map((t) => ({ type: t, score: scores[t] })).sort(
      (a, b) => b.score - a.score
    );
  }, [scores]);

  const code = ranked.slice(0, 3).map((r) => r.type).join('');

  function answer(value: number) {
    const q = QUESTIONS[current];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    // 自动跳到下一题
    if (current < total - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 150);
    } else {
      setTimeout(() => setStage('result'), 200);
    }
  }

  function restart() {
    setAnswers({});
    setCurrent(0);
    setStage('intro');
  }

  // ============ Intro ============
  if (stage === 'intro') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>霍兰德职业兴趣测试</h1>
          <p>Holland RIASEC · 探索你的职业兴趣类型，找到更适合你的方向</p>
        </div>

        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            霍兰德职业兴趣理论由美国心理学家 John Holland 提出，将人的职业兴趣分为六种类型：
            现实型（R）、研究型（I）、艺术型（A）、社会型（S）、企业型（E）、常规型（C）。
            通过本测试，你将得到一个由得分最高的三个类型组成的「霍兰德代码」，并获得对应的职业方向参考。
          </p>
          <div className="divider" />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            共 {total} 道题，约需 5 分钟。请根据第一直觉作答，没有标准答案，越真实结果越准确。
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          {TYPE_ORDER.map((t) => {
            const info = TYPE_INFO[t];
            return (
              <div key={t} className="timeline-card" style={{ borderTop: `3px solid ${info.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: info.color,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {t}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{info.name}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{info.alias}</div>
              </div>
            );
          })}
        </div>

        <button className="btn btn-lg" onClick={() => setStage('quiz')}>
          开始测试 →
        </button>
      </div>
    );
  }

  // ============ Quiz ============
  if (stage === 'quiz') {
    const q = QUESTIONS[current];
    const selected = answers[q.id];
    return (
      <div className="page">
        <div className="page-header">
          <h1>第 {current + 1} / {total} 题</h1>
          <p>请根据你的真实感受选择符合程度</p>
        </div>

        {/* 进度条 */}
        <div
          style={{
            height: 8,
            background: 'var(--bg-elevated)',
            borderRadius: 9999,
            overflow: 'hidden',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.6, padding: '0.5rem 0' }}>
            {q.text}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {SCALE_OPTIONS.map((opt) => {
            const active = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => answer(opt.value)}
                className="timeline-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderColor: active ? 'var(--accent)' : undefined,
                  background: active ? 'var(--accent-muted)' : undefined,
                  width: '100%',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: `2px solid ${active ? 'var(--accent)' : 'var(--border-light)'}`,
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}
                >
                  {opt.value}
                </span>
                <span style={{ fontSize: '0.95rem', color: active ? 'var(--accent)' : 'var(--text)' }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            style={{ opacity: current === 0 ? 0.5 : 1 }}
          >
            ← 上一题
          </button>
          {current < total - 1 && (
            <button
              className="btn btn-secondary"
              onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              disabled={!selected}
              style={{ opacity: !selected ? 0.5 : 1 }}
            >
              跳过 / 下一题 →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============ Result ============
  const top3 = ranked.slice(0, 3);
  return (
    <div className="page">
      <div className="page-header">
        <h1>你的霍兰德代码：{code}</h1>
        <p>得分最高的三个职业兴趣类型，代表你最突出的职业倾向</p>
      </div>

      {/* 六维度得分条 */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '1rem' }}>六维度得分</div>
        {ranked.map((r) => {
          const info = TYPE_INFO[r.type];
          const pct = Math.round((r.score / maxScore) * 100);
          return (
            <div key={r.type} style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 600 }}>
                  <span style={{ color: info.color }}>{r.type}</span> {info.name}
                </span>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>{r.score} / {maxScore}</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: info.color, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top3 详解 */}
      {top3.map((r, idx) => {
        const info = TYPE_INFO[r.type];
        return (
          <div key={r.type} className="card" style={{ marginBottom: '1rem', borderLeft: `4px solid ${info.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: info.color,
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                {r.type}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  No.{idx + 1} {info.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{info.alias}</div>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
              {info.summary}
            </p>
            <div style={{ marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, marginRight: '0.5rem' }}>性格特质：</span>
              {info.traits.map((t) => (
                <span key={t} className="tag" style={{ marginRight: '0.35rem', marginBottom: '0.35rem' }}>{t}</span>
              ))}
            </div>
            <div style={{ marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, marginRight: '0.5rem' }}>适合职业：</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{info.careers.join('、')}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, marginRight: '0.5rem' }}>相关专业：</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{info.majors.join('、')}</span>
            </div>
          </div>
        );
      })}

{/* 公众号引导 - 关注留存 */}
<div
className="card"
style={{ marginTop: '0.5rem', marginBottom: '1.25rem', textAlign: 'center', padding: '1.5rem' }}
>
<div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🚀</div>
<h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>想了解更多职业方向？</h3>
<p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
关注「职路同行社」，获取更多职业测评解读、行业分析和求职策略，助你找到最适合的发展路径。
</p>
        <img
          src="/images/qr-official.jpeg"
          alt="职路同行社 公众号二维码"
          style={{
            display: 'block',
            margin: '0 auto',
            width: 160,
            height: 160,
            borderRadius: 12,
            background: '#fff',
            padding: 8,
            objectFit: 'contain',
          }}
        />
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          微信扫码关注 · 免费获取报告
        </div>
      </div>

      <div
        className="card"
        style={{ marginBottom: '1.25rem', background: 'var(--accent-muted)', borderColor: 'var(--accent)' }}
      >
        <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.8 }}>
          想根据测评结果做更系统的职业规划？欢迎加入「大学生求职辅导训练营」，获取一对一指导。
        </p>
        <Link href="/tools/coaching" className="btn" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
          了解求职辅导 →
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={restart}>重新测试</button>
        <Link href="/tools" className="btn btn-secondary">返回工具页</Link>
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1.5rem', lineHeight: 1.7 }}>
        说明：本测试为简化版霍兰德兴趣量表，结果仅供职业探索参考，不构成专业测评或诊断结论。
      </p>
    </div>
  );
}

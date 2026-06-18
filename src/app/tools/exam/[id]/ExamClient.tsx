'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';
import { EXAM_SETS, type ExamQuestion } from '@/lib/exam-data';

type Stage = 'ready' | 'quiz' | 'result';

export default function ExamClient({ id }: { id: string }) {
  const { user, loading } = useAuth();

  const exam = useMemo(() => EXAM_SETS.find((e) => e.id === id), [id]);

  const [stage, setStage] = useState<Stage>('ready');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [saved, setSaved] = useState(false);
  const savingRef = useRef(false);

  // 计算成绩
  const results = useMemo(() => {
    if (!exam) return { score: 0, total: 0, details: [] as boolean[] };
    const details = exam.questions.map((q, i) => answers[i] === q.answer);
    const score = details.filter(Boolean).length;
    return { score, total: exam.questions.length, details };
  }, [exam, answers]);

  // 保存成绩
  useEffect(() => {
    if (stage !== 'result' || !user || !supabase || savingRef.current || saved) return;
    savingRef.current = true;

    async function saveResult() {
      await supabase!.from('exam_results').insert({
        user_id: user!.id,
        exam_id: id,
        score: results.score,
        total: results.total,
        duration_seconds: duration,
      });
      setSaved(true);
    }

    saveResult();
  }, [stage, user, id, results, duration, saved]);

  if (!exam) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>题库不存在</h1>
          <p>未找到对应的题库</p>
        </div>
        <Link href="/tools/exam" className="btn">返回题库列表</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>{exam.title}</h1>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>{exam.title}</h1>
          <p>{exam.description}</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>
            登录后开始答题
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            登录后可以保存你的成绩记录。
          </p>
          <Link href="/login" className="btn" style={{ display: 'inline-block' }}>
            去登录
          </Link>
        </div>
      </div>
    );
  }

  // ============ Ready ============
  if (stage === 'ready') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>{exam.icon} {exam.title}</h1>
          <p>{exam.description}</p>
        </div>

        <div className="card" style={{ maxWidth: '500px' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>题目数量</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>{exam.questions.length} 道选择题</div>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>答题方式</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.7 }}>逐题作答，选择后自动跳转下一题，答完即时出分</div>
          </div>
          <div className="divider" />
          <button
            className="btn"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
            onClick={() => {
              setStage('quiz');
              setStartTime(Date.now());
              setAnswers({});
              setCurrent(0);
              setSaved(false);
              savingRef.current = false;
            }}
          >
            开始答题
          </button>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/tools/exam" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            ← 返回题库列表
          </Link>
        </div>
      </div>
    );
  }

  // ============ Quiz ============
  if (stage === 'quiz') {
    const question: ExamQuestion = exam.questions[current];
    const progress = Math.round(((current) / exam.questions.length) * 100);

    return (
      <div className="page">
        {/* 进度条 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              第 {current + 1} / {exam.questions.length} 题
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>
              {progress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: 'var(--bg-elevated)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* 题目 */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {question.question}
          </div>
        </div>

        {/* 选项 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {question.options.map((option, idx) => {
            const labels = ['A', 'B', 'C', 'D'];
            const isSelected = answers[current] === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  const next = { ...answers, [current]: idx };
                  setAnswers(next);
                  if (current < exam.questions.length - 1) {
                    setTimeout(() => setCurrent((c) => c + 1), 200);
                  } else {
                    const elapsed = Math.round((Date.now() - startTime) / 1000);
                    setDuration(elapsed);
                    setTimeout(() => setStage('result'), 300);
                  }
                }}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: isSelected ? 'var(--accent-muted)' : 'var(--bg-card)',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  color: 'var(--text)',
                  lineHeight: 1.7,
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isSelected ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>
                  {labels[idx]}
                </span>
                <span style={{ paddingTop: '0.2rem' }}>{option}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ============ Result ============
  const percentage = Math.round((results.score / results.total) * 100);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <div className="page">
      <div className="page-header">
        <h1>答题完成</h1>
        <p>{exam.title} · 成绩报告</p>
      </div>

      {/* 分数环形图 */}
      <div className="card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '1.25rem' }}>
        <div style={{
          position: 'relative',
          width: '160px',
          height: '160px',
          margin: '0 auto 1.5rem',
        }}>
          {/* 环形背景 */}
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="80" cy="80" r="68"
              fill="none"
              stroke="var(--bg-elevated)"
              strokeWidth="12"
            />
            <circle
              cx="80" cy="80" r="68"
              fill="none"
              stroke={percentage >= 80 ? 'var(--success)' : percentage >= 60 ? 'var(--warning)' : 'var(--danger)'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 68}`}
              strokeDashoffset={`${2 * Math.PI * 68 * (1 - percentage / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          {/* 中心文字 */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{percentage}%</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{results.score}/{results.total}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>用时</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
              {minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>正确</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--success)' }}>{results.score}题</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>错误</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--danger)' }}>{results.total - results.score}题</div>
          </div>
        </div>

        {saved && (
          <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--success)' }}>
            ✓ 成绩已保存
          </div>
        )}
        {!supabase && (
          <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            （离线模式，成绩未保存）
          </div>
        )}
      </div>

      {/* 每题对错详情 */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>
          答题详情
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '0.5rem' }}>
          {results.details.map((correct, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: correct ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)',
                color: correct ? 'var(--success)' : 'var(--danger)',
                border: `1px solid ${correct ? 'rgba(63, 185, 80, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`,
              }}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* 错题回顾 */}
      {results.details.some((c) => !c) && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>
            错题回顾
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {exam.questions.map((q, idx) => {
              if (results.details[idx]) return null;
              const labels = ['A', 'B', 'C', 'D'];
              const userAnswer = answers[idx];
              return (
                <div key={idx} style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                    第 {idx + 1} 题
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
                    {q.question}
                  </div>
                  <div style={{ fontSize: '0.8125rem', lineHeight: 1.8 }}>
                    <div style={{ color: 'var(--danger)' }}>
                      你的答案：{labels[userAnswer]} · {q.options[userAnswer]}
                    </div>
                    <div style={{ color: 'var(--success)' }}>
                      正确答案：{labels[q.answer]} · {q.options[q.answer]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          className="btn"
          onClick={() => {
            setStage('ready');
            setAnswers({});
            setCurrent(0);
            setSaved(false);
            savingRef.current = false;
          }}
        >
          再做一次
        </button>
        <Link href="/tools/exam" className="btn btn-secondary">
          返回题库列表
        </Link>
      </div>
    </div>
  );
}

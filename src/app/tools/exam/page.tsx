'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';
import { EXAM_SETS, type ExamQuestion } from '@/lib/exam-data';
import Link from 'next/link';

// ============ Types ============
type Mode = 'practice' | 'review'; // 做题模式 / 背题模式
type QuizStage = 'ready' | 'quiz' | 'result';

interface QuestionState {
  answered: boolean;
  selected: number | null;
  correct: boolean | null;
}

// ============ Main Component ============
export default function ExamPage() {
  const { user, loading } = useAuth();

  // 分类选择（tab 切换，不离开页面）
  const [activeCategory, setActiveCategory] = useState(0);
  const [mode, setMode] = useState<Mode>('practice');
  const [stage, setStage] = useState<QuizStage>('ready');
  const [current, setCurrent] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [showCard, setShowCard] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savingRef = useRef(false);

  const exam = EXAM_SETS[activeCategory];
  const questions = exam.questions;
  const totalQuestions = questions.length;

  // 初始化/重置题目状态（回到说明页）
  const initStates = useCallback(() => {
    setQuestionStates(
      Array.from({ length: totalQuestions }, () => ({
        answered: false,
        selected: null,
        correct: null,
      }))
    );
    setCurrent(0);
    setStage('ready');
    setSaved(false);
    savingRef.current = false;
    setElapsed(0);
  }, [totalQuestions]);

  // 切换分类时回到 ready
  useEffect(() => {
    setStage('ready');
    setQuestionStates(
      Array.from({ length: totalQuestions }, () => ({
        answered: false,
        selected: null,
        correct: null,
      }))
    );
    setCurrent(0);
    setSaved(false);
    savingRef.current = false;
    setElapsed(0);
  }, [activeCategory, totalQuestions]);

  // 计时器
  useEffect(() => {
    if (stage === 'quiz') {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, startTime]);

  // 统计
  const stats = useMemo(() => {
    const answered = questionStates.filter((s) => s.answered).length;
    const correct = questionStates.filter((s) => s.correct === true).length;
    const wrong = questionStates.filter((s) => s.correct === false).length;
    return { answered, correct, wrong };
  }, [questionStates]);

  // 选择答案
  const handleSelect = (optionIdx: number) => {
    if (stage !== 'quiz') return;
    const q = questions[current];
    const isCorrect = optionIdx === q.answer;

    setQuestionStates((prev) => {
      const next = [...prev];
      next[current] = {
        answered: true,
        selected: optionIdx,
        correct: isCorrect,
      };
      return next;
    });

    // 做题模式：选完后短暂停留显示对错，然后自动跳下一题
    if (mode === 'practice') {
      setTimeout(() => {
        if (current < totalQuestions - 1) {
          setCurrent((c) => c + 1);
        }
      }, 600);
    }
  };

  // 交卷
  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStage('result');
    // 保存成绩
    if (user && supabase && !savingRef.current) {
      savingRef.current = true;
      const score = questionStates.filter((s) => s.correct === true).length;
      supabase
        .from('exam_results')
        .insert({
          user_id: user.id,
          exam_id: exam.id,
          score,
          total: totalQuestions,
          duration_seconds: elapsed,
        })
        .then(() => setSaved(true));
    }
  };

  // 开始考试
  const handleStart = () => {
    setQuestionStates(
      Array.from({ length: totalQuestions }, () => ({
        answered: false,
        selected: null,
        correct: null,
      }))
    );
    setCurrent(0);
    setSaved(false);
    savingRef.current = false;
    setStartTime(Date.now());
    setElapsed(0);
    setStage('quiz');
  };

  // 格式化时间
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // ============ Loading ============
  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>笔试训练</h1>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  // ============ Ready Stage (考试说明页) ============
  if (stage === 'ready') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>📝 笔试训练</h1>
          <p>行测类通用笔试题训练，模拟真实考试环境</p>
        </div>

        {/* 选择题库 */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {EXAM_SETS.map((set, idx) => (
            <button
              key={set.id}
              onClick={() => setActiveCategory(idx)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
                borderRadius: '1rem',
                border: idx === activeCategory ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: idx === activeCategory ? 'var(--accent-muted)' : 'transparent',
                color: idx === activeCategory ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: idx === activeCategory ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              {set.icon} {set.title}
            </button>
          ))}
        </div>

        {/* 考试信息卡片 */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.25rem' }}>
            {exam.icon} {exam.title}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {exam.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.25rem' }}>
                {totalQuestions}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>题目数量</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)', marginBottom: '0.25rem' }}>
                不限时
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>答题时间</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.25rem' }}>
                {totalQuestions}分
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>满分</div>
            </div>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>考试规则</div>
            <div>• 共 {totalQuestions} 道单选题，每题 1 分，满分 {totalQuestions} 分</div>
            <div>• 选择答案后即时判定对错，自动跳转下一题</div>
            <div>• 支持答题卡快速跳转，可随时交卷查看成绩</div>
            <div>• 答题结束后可查看错题回顾和详细解析</div>
            {user && <div>• 成绩将自动保存到你的账户</div>}
          </div>

          <div className="divider" style={{ margin: '1.25rem 0' }} />

          {/* 登录状态 */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 600,
              }}>
                {(user.email || '用')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                  {user.email || '已登录用户'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>✓ 成绩将自动保存</div>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.875rem 1rem', background: 'rgba(210, 153, 34, 0.08)',
              borderRadius: '0.625rem', border: '1px solid rgba(210, 153, 34, 0.2)',
              marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--warning)' }}>
                ⚠ 未登录，答题成绩不会保存
              </div>
              <Link href="/login" style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                去登录 →
              </Link>
            </div>
          )}

          {/* 开始按钮 */}
          <button
            className="btn"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600 }}
            onClick={handleStart}
          >
            开始答题
          </button>
        </div>
      </div>
    );
  }

  // ============ Result Stage ============
  if (stage === 'result') {
    const score = stats.correct;
    const percentage = Math.round((score / totalQuestions) * 100);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    return (
      <div className="page">
        <div className="page-header">
          <h1>答题完成</h1>
          <p>{exam.title} · 成绩报告</p>
        </div>

        {/* 分数卡片 */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1.5rem' }}>
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r="58" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
              <circle
                cx="70" cy="70" r="58" fill="none"
                stroke={percentage >= 80 ? 'var(--success)' : percentage >= 60 ? 'var(--warning)' : 'var(--danger)'}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - percentage / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>{percentage}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{score}/{totalQuestions}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.875rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>用时</div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                {minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>正确</div>
              <div style={{ fontWeight: 600, color: 'var(--success)' }}>{stats.correct}题</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>错误</div>
              <div style={{ fontWeight: 600, color: 'var(--danger)' }}>{stats.wrong}题</div>
            </div>
          </div>

          {saved && <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--success)' }}>✓ 成绩已保存</div>}
          {!user && <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>（未登录，成绩未保存）</div>}
        </div>

        {/* 错题回顾 */}
        {stats.wrong > 0 && (
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>
              错题回顾
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {questions.map((q, idx) => {
                const state = questionStates[idx];
                if (!state || state.correct !== false) return null;
                const labels = ['A', 'B', 'C', 'D'];
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
                        你的答案：{labels[state.selected!]} · {q.options[state.selected!]}
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
          <button className="btn" onClick={initStates}>再做一次</button>
          <button className="btn btn-secondary" onClick={() => {
            setActiveCategory((c) => (c + 1) % EXAM_SETS.length);
          }}>
            换一套题
          </button>
        </div>
      </div>
    );
  }

  // ============ Quiz Stage (Main) ============
  const question = questions[current];
  const currentState = questionStates[current];
  const labels = ['A', 'B', 'C', 'D'];
  const isAnswered = currentState?.answered;

  return (
    <div className="page" style={{ position: 'relative' }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        {/* 分类 Tabs */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {EXAM_SETS.map((set, idx) => (
            <button
              key={set.id}
              onClick={() => setActiveCategory(idx)}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.8125rem',
                borderRadius: '1rem',
                border: idx === activeCategory ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: idx === activeCategory ? 'var(--accent-muted)' : 'transparent',
                color: idx === activeCategory ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: idx === activeCategory ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              {set.icon} {set.title}
            </button>
          ))}
        </div>

        {/* 右侧：计时器 + 模式切换 + 答题卡 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* 计时器 */}
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
          }}>
            ⏱ {formatTime(elapsed)}
          </span>

          {/* 模式切换 */}
          <button
            onClick={() => setMode(mode === 'practice' ? 'review' : 'practice')}
            style={{
              padding: '0.3rem 0.625rem',
              fontSize: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {mode === 'practice' ? '📝 做题' : '📖 背题'}
          </button>

          {/* 答题卡按钮 */}
          <button
            onClick={() => setShowCard(!showCard)}
            style={{
              padding: '0.3rem 0.625rem',
              fontSize: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border)',
              background: showCard ? 'var(--accent-muted)' : 'var(--bg-card)',
              color: showCard ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            🗂 答题卡
          </button>
        </div>
      </div>

      {/* 进度条 */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            第 {current + 1} / {totalQuestions} 题
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            已答 {stats.answered} · 对 {stats.correct} · 错 {stats.wrong}
          </span>
        </div>
        <div style={{
          width: '100%', height: '4px', background: 'var(--bg-elevated)',
          borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${(stats.answered / totalQuestions) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent), var(--success))',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* 答题卡面板 */}
      {showCard && (
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '0.375rem' }}>
            {questionStates.map((state, idx) => {
              let bg = 'var(--bg-elevated)';
              let color = 'var(--text-muted)';
              let border = '1px solid transparent';
              if (state.correct === true) {
                bg = 'rgba(63, 185, 80, 0.15)';
                color = 'var(--success)';
              } else if (state.correct === false) {
                bg = 'rgba(248, 81, 73, 0.15)';
                color = 'var(--danger)';
              }
              if (idx === current) {
                border = '2px solid var(--accent)';
              }
              return (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  style={{
                    width: '32px', height: '32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem', fontWeight: 600,
                    background: bg, color, border,
                    cursor: 'pointer',
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }} onClick={handleSubmit}>
              交卷
            </button>
          </div>
        </div>
      )}

      {/* 题目卡片 */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {question.question}
        </div>
      </div>

      {/* 选项 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
        {question.options.map((option, idx) => {
          let optionBg = 'var(--bg-card)';
          let optionBorder = '1px solid var(--border)';
          let optionColor = 'var(--text)';
          let labelBg = 'var(--bg-elevated)';
          let labelColor = 'var(--text-muted)';

          if (isAnswered) {
            if (idx === question.answer) {
              // 正确答案高亮
              optionBg = 'rgba(63, 185, 80, 0.08)';
              optionBorder = '1px solid var(--success)';
              labelBg = 'var(--success)';
              labelColor = '#fff';
            } else if (idx === currentState.selected && !currentState.correct) {
              // 选错了
              optionBg = 'rgba(248, 81, 73, 0.08)';
              optionBorder = '1px solid var(--danger)';
              labelBg = 'var(--danger)';
              labelColor = '#fff';
            }
          } else if (mode === 'review') {
            // 背题模式：直接显示正确答案
            if (idx === question.answer) {
              optionBg = 'rgba(63, 185, 80, 0.08)';
              optionBorder = '1px solid var(--success)';
              labelBg = 'var(--success)';
              labelColor = '#fff';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => !isAnswered && mode === 'practice' && handleSelect(idx)}
              disabled={isAnswered || mode === 'review'}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.875rem 1rem',
                cursor: isAnswered || mode === 'review' ? 'default' : 'pointer',
                border: optionBorder,
                background: optionBg,
                textAlign: 'left',
                fontSize: '0.875rem',
                color: optionColor,
                lineHeight: 1.7,
                transition: 'all 0.15s ease',
                width: '100%',
                borderRadius: '0.75rem',
                opacity: 1,
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '26px', height: '26px', borderRadius: '50%',
                background: labelBg, color: labelColor,
                fontSize: '0.8125rem', fontWeight: 600, flexShrink: 0,
              }}>
                {labels[idx]}
              </span>
              <span style={{ paddingTop: '0.15rem' }}>{option}</span>
            </button>
          );
        })}
      </div>

      {/* 底部导航 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.8125rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: current === 0 ? 'var(--border)' : 'var(--text-muted)',
            cursor: current === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          ← 上一题
        </button>

        {current === totalQuestions - 1 ? (
          <button className="btn" style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }} onClick={handleSubmit}>
            交卷出分
          </button>
        ) : (
          <button
            onClick={() => setCurrent((c) => Math.min(totalQuestions - 1, c + 1))}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8125rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            下一题 →
          </button>
        )}
      </div>
    </div>
  );
}

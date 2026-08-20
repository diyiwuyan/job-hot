'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { AssessmentCloudStatus, SavedAssessmentResultCard } from '@/components/AssessmentAccountResult';
import { AssessmentRadar, ScoreBars, type AssessmentMetric } from '@/components/AssessmentRadar';
import { AssessmentResultActions } from '@/components/AssessmentResultActions';
import reportStyles from '@/components/AssessmentReport.module.css';
import { useAssessmentResult } from '@/hooks/useAssessmentResult';
import { trackEvent } from '@/lib/analytics';
import { captureAssessmentSource } from '@/lib/assessment-source';
import {
  QUESTIONS,
  TYPE_INFO,
  TYPE_ORDER,
  SCALE_OPTIONS,
  type HollandType,
} from '@/lib/holland-data';

type Stage = 'intro' | 'quiz' | 'result';

function calculateHollandScores(answerSet: Record<number, number>) {
  const result: Record<HollandType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  for (const question of QUESTIONS) result[question.type] += answerSet[question.id] || 0;
  return result;
}

function hollandCode(scoreSet: Record<HollandType, number>) {
  return TYPE_ORDER.map((type) => ({ type, score: scoreSet[type] }))
    .sort((first, second) => second.score - first.score)
    .slice(0, 3)
    .map((item) => item.type)
    .join('');
}

function restoreNumericAnswers(answerSet: Record<string, number>) {
  return Object.fromEntries(Object.entries(answerSet).map(([id, value]) => [Number(id), value]));
}

export default function HollandPage() {
  const [stage, setStage] = useState<Stage>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const accountResult = useAssessmentResult('holland');

  const total = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / total) * 100);

  useEffect(() => {
    captureAssessmentSource();
  }, []);

  // 计算得分
  const scores = useMemo(() => calculateHollandScores(answers), [answers]);

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
      const completedScores = calculateHollandScores(next);
      void accountResult.saveResult({
        resultName: `霍兰德代码 ${hollandCode(completedScores)}`,
        answers: next,
        scores: completedScores,
      });
      setTimeout(() => setStage('result'), 200);
    }
  }

  function restart() {
    setAnswers({});
    setCurrent(0);
    setStage('intro');
  }

  function start() {
    const source = captureAssessmentSource();
    trackEvent('assessment_start', 'holland', { source });
    setStage('quiz');
  }

  function viewSavedResult() {
    if (!accountResult.savedResult) return;
    setAnswers(restoreNumericAnswers(accountResult.savedResult.answers));
    setCurrent(total - 1);
    setStage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            共 {total} 道题，约需 5 分钟。请根据第一直觉作答，没有标准答案；越贴近真实偏好，结果越有参考价值。
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

        <SavedAssessmentResultCard
          email={accountResult.user?.email}
          loading={accountResult.loading}
          error={accountResult.error}
          savedResult={accountResult.savedResult}
          onView={viewSavedResult}
        />

        <button className="btn btn-lg" onClick={start}>
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
  const dominant = TYPE_INFO[top3[0].type];
  const secondary = TYPE_INFO[top3[1].type];
  const supporting = TYPE_INFO[top3[2].type];
  const topNames = top3.map((item) => TYPE_INFO[item.type].name).join('、');
  const scoreGap = top3[0].score - top3[2].score;
  const profileNote = scoreGap <= 3
    ? '前三项分数很接近，说明你的兴趣线索比较多元。先保留多个方向，用真实任务体验来区分，不必急着选出唯一答案。'
    : `${dominant.name}相对更突出，可以先从它对应的任务开始验证，再看${secondary.name}与${supporting.name}如何补充你的工作方式。`;
  const profileAnalysis = `你可能更容易被“${dominant.workSignals}”的工作吸引；${secondary.name}让你同时在意“${secondary.workSignals}”；${supporting.name}则提供第三层偏好。这个组合描述的是你更愿意投入的任务与环境，不等于已经具备对应能力。`;
  const metrics: AssessmentMetric[] = ranked.map((item) => ({
    key: item.type,
    label: `${item.type} · ${TYPE_INFO[item.type].name}`,
    shortLabel: item.type,
    score: item.score,
    maxScore,
    color: TYPE_INFO[item.type].color,
  }));
  const hollandAction = `从“${dominant.name}”相关方向中选3个真实岗位，分别查看日常任务、招聘要求和工作环境，记录哪些内容让你愿意继续了解。`;
  return (
    <div className="page">
      <div className={reportStyles.report}>
        <section
          className={reportStyles.hero}
          style={{ '--report-accent': dominant.color } as CSSProperties}
        >
          <div className={reportStyles.heroCopy}>
            <span className={reportStyles.eyebrow}>Holland RIASEC · 测评报告</span>
            <h1>你的霍兰德代码：{code}</h1>
            <p className={reportStyles.heroLead}>{profileAnalysis}</p>
            <span className={reportStyles.heroNote}>{profileNote}</span>
          </div>
          <div className={reportStyles.heroRanks} aria-label="前三项职业兴趣">
            {top3.map((item, index) => {
              const info = TYPE_INFO[item.type];
              return (
                <div
                  className={reportStyles.heroRank}
                  key={item.type}
                  style={{ '--rank-color': info.color } as CSSProperties}
                >
                  <span>{item.type}</span>
                  <strong>No.{index + 1} {info.name}</strong>
                  <small>{item.score} / {maxScore}</small>
                </div>
              );
            })}
          </div>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}>
            <div><h2>六维职业兴趣画像</h2><p>雷达图看整体形状，右侧排序看强弱。分数只用于你自己的六个维度之间比较。</p></div>
            <span className={reportStyles.sectionNumber}>01 / OVERVIEW</span>
          </div>
          <div className={reportStyles.overviewGrid}>
            <AssessmentRadar metrics={metrics} title="霍兰德六维职业兴趣雷达图" />
            <ScoreBars metrics={metrics} />
          </div>
        </section>

        <div
          className={reportStyles.analysisBox}
          style={{ '--analysis-color': dominant.color } as CSSProperties}
        >
          <span className={reportStyles.analysisMark}>读</span>
          <div><h3>如何理解这组分数</h3><p>{profileNote} 高分表示偏好更强，不代表能力更高；低分也不表示你不能胜任相关工作。</p></div>
        </div>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}>
            <div><h2>你的前三类兴趣线索</h2><p>先看最突出的偏好，再理解它们分别对应怎样的任务、环境与投入方式。</p></div>
            <span className={reportStyles.sectionNumber}>02 / TOP 3</span>
          </div>
          <div className={reportStyles.rankGrid}>
            {top3.map((item, index) => {
              const info = TYPE_INFO[item.type];
              return (
                <article
                  className={reportStyles.rankCard}
                  data-rank={String(index + 1).padStart(2, '0')}
                  key={item.type}
                  style={{ '--rank-color': info.color } as CSSProperties}
                >
                  <div className={reportStyles.rankCardTop}>
                    <span className={reportStyles.rankBadge}>{item.type}</span>
                    <div><h3>{info.name}</h3><small>{info.alias}</small></div>
                  </div>
                  <p>{info.summary}</p>
                  <div className={reportStyles.tagList}>{info.traits.map((trait) => <span key={trait}>{trait}</span>)}</div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}>
            <div><h2>把代码带回真实岗位验证</h2><p>方向名称只能提供起点，真正有效的是检查你是否喜欢岗位里的日常任务与工作环境。</p></div>
            <span className={reportStyles.sectionNumber}>03 / VERIFY</span>
          </div>
          <div className={reportStyles.verificationList}>
            {top3.map((item) => {
              const info = TYPE_INFO[item.type];
              return (
                <article
                  className={reportStyles.verificationCard}
                  key={item.type}
                  style={{ '--item-color': info.color } as CSSProperties}
                >
                  <div><h3>{item.type} · {info.name}</h3><p>{info.careers.slice(0, 5).join('、')}</p></div>
                  <div><strong>留意这些任务与环境</strong><p>{info.workSignals}</p></div>
                  <div><strong>直接向从业者或面试官提问</strong><blockquote>“{info.verifyQuestion}”</blockquote></div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}>
            <div><h2>结果使用提醒</h2><p>把职业兴趣、能力证据、价值观与现实约束放在一起，结论才更可靠。</p></div>
            <span className={reportStyles.sectionNumber}>04 / NOTES</span>
          </div>
          <div className={reportStyles.detailGrid}>
            {top3.map((item) => {
              const info = TYPE_INFO[item.type];
              return <article className={reportStyles.detailCard} key={item.type}><h3>{item.type} · {info.name}</h3><p>{info.reminder}</p><p style={{ marginTop: '.45rem' }}>关联专业线索：{info.majors.join('、')}</p></article>;
            })}
            <article className={reportStyles.detailCard}><h3>不要只看职业名单</h3><p>同一个职业包含多种任务，不同组织的工作环境也不同。优先用岗位JD、实习体验和从业者访谈验证。</p></article>
          </div>
        </section>
      </div>

      <AssessmentCloudStatus
        email={accountResult.user?.email}
        saving={accountResult.saving}
        error={accountResult.error}
        savedResult={accountResult.savedResult}
      />

      <AssessmentResultActions
        assessmentId="holland"
        assessmentName="霍兰德职业兴趣测试"
        resultName={`霍兰德代码 ${code}`}
        headline={`你的前三类职业兴趣线索是：${topNames}`}
        summary="兴趣结果适合用来生成探索假设，不能单独决定你应该选择哪个职业。"
        action={hollandAction}
        nextStep={{
          href: '/tools/values',
          label: '继续梳理你筛选工作时最看重什么',
          description: '兴趣线索回答“我愿意探索什么”，职业价值观测评进一步帮你判断一份工作需要满足哪些条件。',
        }}
        campFit="如果你仍需把兴趣线索与真实经历、岗位要求和行动计划连接起来，可以再了解训练营；它不会依据一次测评替你决定职业。"
        accent={dominant.color}
      />

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={restart}>重新测试</button>
        <Link href="/tools/assessment" className="btn btn-secondary">返回测评中心</Link>
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1.5rem', lineHeight: 1.7 }}>
        说明：本测试为原创的简化版霍兰德兴趣自测，结果仅供职业探索参考，不构成专业测评、心理诊断或岗位匹配结论。
      </p>
    </div>
  );
}

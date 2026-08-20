'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AssessmentCloudStatus, SavedAssessmentResultCard } from '@/components/AssessmentAccountResult';
import { AssessmentRadar, ScoreBars, type AssessmentMetric } from '@/components/AssessmentRadar';
import { AssessmentResultActions } from '@/components/AssessmentResultActions';
import reportStyles from '@/components/AssessmentReport.module.css';
import { useAssessmentResult } from '@/hooks/useAssessmentResult';
import { captureAssessmentSource } from '@/lib/assessment-source';
import { trackEvent } from '@/lib/analytics';
import { VALUE_INFO, VALUE_ORDER, VALUES_QUESTIONS, VALUES_SCALE, type ValueKey } from '@/lib/values-data';

type Stage = 'intro' | 'quiz' | 'result';

const TRADEOFF_INSIGHTS: Partial<Record<string, string>> = {
  'growth|stability': '你既在意成长，也重视稳定。优先寻找业务相对可靠、同时有明确带教和复杂任务的团队，而不是在“冒险”和“躺平”之间二选一。',
  'autonomy|connection': '你既需要自主空间，也看重关系质量。适合关注目标清楚、沟通直接、授权与协作边界明确的团队。',
  'balance|impact': '你希望成果有影响，同时保持可持续节奏。面试时要同时确认结果责任、资源支持，以及高峰期是否长期化。',
  'balance|growth': '你既想持续成长，也不愿长期透支。重点判断成长是否来自高质量任务与反馈，而不是仅靠超长工时。',
  'impact|stability': '你希望成果可见，也希望风险可控。可以优先考察成熟组织中的关键项目、清晰指标和真实负责范围。',
};

function tradeoffInsight(keys: ValueKey[]) {
  for (let first = 0; first < keys.length; first += 1) {
    for (let second = first + 1; second < keys.length; second += 1) {
      const pair = [keys[first], keys[second]].sort().join('|');
      if (TRADEOFF_INSIGHTS[pair]) return TRADEOFF_INSIGHTS[pair];
    }
  }
  return '前三项价值观不是互相排斥的标签。把它们写成岗位条件，并明确哪一项不能妥协、哪一项可以通过团队或阶段选择来平衡。';
}

function calculateValueScores(answerSet: Record<number, number>) {
  const result: Record<ValueKey, number> = { growth: 0, autonomy: 0, stability: 0, impact: 0, connection: 0, balance: 0 };
  VALUES_QUESTIONS.forEach((question) => { result[question.key] += answerSet[question.id] || 0; });
  return result;
}

function valueResultName(scoreSet: Record<ValueKey, number>) {
  return VALUE_ORDER.map((key) => ({ key, score: scoreSet[key] }))
    .sort((first, second) => second.score - first.score)
    .slice(0, 3)
    .map((item) => VALUE_INFO[item.key].name)
    .join('、');
}

function restoreNumericAnswers(answerSet: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(answerSet)
      .filter(([id, value]) => /^\d+$/.test(id) && typeof value === 'number')
      .map(([id, value]) => [Number(id), value as number])
  );
}

export default function ValuesPage() {
  const [stage, setStage] = useState<Stage>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const accountResult = useAssessmentResult('career-values');
  const total = VALUES_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;

  useEffect(() => { captureAssessmentSource(); }, []);

  const scores = useMemo(() => calculateValueScores(answers), [answers]);

  const ranked = useMemo(
    () => VALUE_ORDER.map((key) => ({ key, score: scores[key] })).sort((a, b) => b.score - a.score),
    [scores]
  );

  function start() {
    const source = captureAssessmentSource();
    trackEvent('assessment_start', 'career-values', { source });
    setStage('quiz');
  }

  function answer(value: number) {
    const question = VALUES_QUESTIONS[current];
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (current < total - 1) window.setTimeout(() => setCurrent((index) => index + 1), 150);
    else {
      const completedScores = calculateValueScores(next);
      void accountResult.saveResult({
        resultName: valueResultName(completedScores),
        answers: next,
        scores: completedScores,
      });
      window.setTimeout(() => setStage('result'), 200);
    }
  }

  function restart() {
    setAnswers({});
    setCurrent(0);
    setStage('intro');
  }

  function viewSavedResult() {
    if (!accountResult.savedResult) return;
    setAnswers(restoreNumericAnswers(accountResult.savedResult.answers));
    setCurrent(total - 1);
    setStage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (stage === 'intro') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>职业价值观测评</h1>
          <p>不是替你选职业，而是帮你看清：一份工作里，你最希望被满足什么</p>
        </div>
        <section className="card" style={{ marginBottom: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
            同一份岗位，对不同人可能有完全不同的吸引力。这个原创自测从成长、自主、稳定、影响、关系与生活边界六个维度，帮你形成一张可用于筛选岗位和提问面试官的“条件清单”。
          </p>
          <div className="divider" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.7, margin: 0 }}>共30题，约5分钟。没有高低好坏，请按你当下真实看重的程度作答。</p>
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
          {VALUE_ORDER.map((key) => {
            const item = VALUE_INFO[key];
            return (
              <div key={key} className="timeline-card" style={{ borderTop: `3px solid ${item.color}`, padding: '0.8rem' }}>
                <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', lineHeight: 1.65, margin: '0.35rem 0 0' }}>{item.signals}</p>
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
        <button className="btn btn-lg" onClick={start}>开始测评 →</button>
      </div>
    );
  }

  if (stage === 'quiz') {
    const question = VALUES_QUESTIONS[current];
    const selected = answers[question.id];
    const progress = Math.round((answeredCount / total) * 100);
    return (
      <div className="page">
        <div className="page-header"><h1>第 {current + 1} / {total} 题</h1><p>请按当下真实看重的程度选择</p></div>
        <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 999, overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #0f766e, #2563eb)', transition: 'width .25s ease' }} />
        </div>
        <section className="card" style={{ marginBottom: '1rem' }}><h2 style={{ fontSize: '1.12rem', lineHeight: 1.7, margin: 0 }}>{question.text}</h2></section>
        <div style={{ display: 'grid', gap: '0.55rem' }}>
          {VALUES_SCALE.map((option) => (
            <button
              key={option.value}
              type="button"
              className="timeline-card"
              onClick={() => answer(option.value)}
              style={{ width: '100%', display: 'flex', gap: '0.75rem', textAlign: 'left', cursor: 'pointer', alignItems: 'center', borderColor: selected === option.value ? '#0f766e' : undefined, background: selected === option.value ? 'rgba(13,148,136,.10)' : undefined }}
            >
              <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: selected === option.value ? '#0f766e' : 'var(--bg-elevated)', color: selected === option.value ? '#fff' : 'var(--text-muted)', fontWeight: 700 }}>{option.value}</span>
              {option.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" disabled={current === 0} style={{ opacity: current === 0 ? .5 : 1 }} onClick={() => setCurrent((index) => Math.max(0, index - 1))}>← 上一题</button>
          {current < total - 1 && <button type="button" className="btn btn-secondary" disabled={!selected} style={{ opacity: selected ? 1 : .5 }} onClick={() => setCurrent((index) => index + 1)}>下一题 →</button>}
        </div>
      </div>
    );
  }

  const top3 = ranked.slice(0, 3);
  const dominant = VALUE_INFO[top3[0].key];
  const secondary = VALUE_INFO[top3[1].key];
  const supporting = VALUE_INFO[top3[2].key];
  const topKeys = top3.map((item) => item.key);
  const topNames = top3.map((item) => VALUE_INFO[item.key].name).join('、');
  const scoreSpread = top3[0].score - top3[2].score;
  const profileNote = scoreSpread <= 2
    ? '前三项得分接近，说明它们都可能是重要条件。下一步不是硬排唯一顺序，而是判断当前阶段最不能妥协哪一项。'
    : `${dominant.name}相对更突出，它更可能成为你判断一份工作“值不值得长期投入”的第一道门槛。`;
  const profileAnalysis = `${dominant.summary}${secondary.summary}${supporting.summary} 三项组合起来，构成你筛选岗位时最值得优先核实的条件。`;
  const metrics: AssessmentMetric[] = ranked.map((item) => ({
    key: item.key,
    label: VALUE_INFO[item.key].name,
    shortLabel: VALUE_INFO[item.key].name.replace('与', '·'),
    score: item.score,
    maxScore: 25,
    color: VALUE_INFO[item.key].color,
  }));
  const action = `找3个你正在考虑的真实岗位，把“${topNames}”分别打1—5分，并用岗位JD、招聘沟通或学长学姐访谈写下每一分的证据。`;

  return (
    <div className="page">
      <div className={reportStyles.report}>
        <section className={reportStyles.hero} style={{ '--report-accent': dominant.color } as CSSProperties}>
          <div className={reportStyles.heroCopy}>
            <span className={reportStyles.eyebrow}>Career Values · 测评报告</span>
            <h1>你的职业价值观优先项</h1>
            <p className={reportStyles.heroLead}>{profileAnalysis}</p>
            <span className={reportStyles.heroNote}>{profileNote}</span>
          </div>
          <div className={reportStyles.heroRanks} aria-label="前三项职业价值观">
            {top3.map((item, index) => {
              const info = VALUE_INFO[item.key];
              return (
                <div className={reportStyles.heroRank} key={item.key} style={{ '--rank-color': info.color } as CSSProperties}>
                  <span>{index + 1}</span><strong>{info.name}</strong><small>{item.score} / 25</small>
                </div>
              );
            })}
          </div>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}>
            <div><h2>六项价值观排序</h2><p>先看整体分布，再重点解释前三项。排名靠后不等于不重要，只表示本次作答中优先级相对较低。</p></div>
            <span className={reportStyles.sectionNumber}>01 / OVERVIEW</span>
          </div>
          <div className={reportStyles.overviewGrid}>
            <AssessmentRadar metrics={metrics} title="职业价值观六维雷达图" />
            <ScoreBars metrics={metrics} />
          </div>
        </section>

        <div className={reportStyles.analysisBox} style={{ '--analysis-color': dominant.color } as CSSProperties}>
          <span className={reportStyles.analysisMark}>衡</span>
          <div><h3>你的价值观组合提醒</h3><p>{tradeoffInsight(topKeys)} 价值观用于比较工作条件，不用于判断能力或人格好坏。</p></div>
        </div>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}>
            <div><h2>前三项优先条件详解</h2><p>前三名重点展示，并补充岗位信号和容易忽略的代价。</p></div>
            <span className={reportStyles.sectionNumber}>02 / TOP 3</span>
          </div>
          <div className={reportStyles.rankGrid}>
            {top3.map((item, index) => {
              const info = VALUE_INFO[item.key];
              return (
                <article className={reportStyles.rankCard} data-rank={String(index + 1).padStart(2, '0')} key={item.key} style={{ '--rank-color': info.color } as CSSProperties}>
                  <div className={reportStyles.rankCardTop}>
                    <span className={reportStyles.rankBadge}>{index + 1}</span>
                    <div><h3>{info.name}</h3><small>{item.score} / 25</small></div>
                  </div>
                  <p>{info.summary}</p>
                  <div className={reportStyles.tagList}>{info.conditions.map((condition) => <span key={condition}>{condition}</span>)}</div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}>
            <div><h2>岗位筛选与面试提问卡</h2><p>保存这三张卡，看JD、参加宣讲会或面试反问时逐项补证据。</p></div>
            <span className={reportStyles.sectionNumber}>03 / VERIFY</span>
          </div>
          <div className={reportStyles.verificationList}>
            {top3.map((item) => {
              const info = VALUE_INFO[item.key];
              return (
                <article className={reportStyles.verificationCard} key={item.key} style={{ '--item-color': info.color } as CSSProperties}>
                  <div><h3>{info.name}</h3><p>{info.signals}</p></div>
                  <div><strong>面试时可以直接问</strong><blockquote>“{info.jobQuestions[0]}”</blockquote></div>
                  <div><strong>别忽略的代价</strong><p>{info.watchout}</p></div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}>
            <div><h2>六项价值观词典</h2><p>保留完整主题解释，避免只看到前三名而误解其他维度。</p></div>
            <span className={reportStyles.sectionNumber}>04 / DEFINITIONS</span>
          </div>
          <div className={reportStyles.definitions}>
            {VALUE_ORDER.map((key) => {
              const info = VALUE_INFO[key];
              return <details className={reportStyles.definition} key={key}><summary>{info.name}</summary><p>{info.summary}</p><p>岗位信号：{info.signals}</p></details>;
            })}
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
        assessmentId="career-values"
        assessmentName="职业价值观测评"
        resultName={topNames}
        headline={`我当前最看重：${topNames}`}
        summary="价值观结果适合用来筛选岗位条件，并需要与经历、能力和真实工作任务一起验证。"
        action={action}
        campFit="如果你想把“我看重什么”落实到目标岗位、投递判断和面试沟通中，职路同行社可以协助你把条件转成行动。"
        accent={dominant.color}
        nextStep={{ href: '/tools/career-atlas', label: '再用职业坐标验证可能方向', description: '价值观帮助你筛条件；职业坐标帮助你把兴趣、经历与岗位任务放在一起比较。' }}
      />

      <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={restart}>重新测评</button>
        <Link href="/tools/assessment" className="btn btn-secondary">返回测评中心</Link>
      </div>
      <p style={{ fontSize: '.72rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '1.25rem' }}>说明：这是职路同行社原创的轻量自我探索工具，不构成心理诊断、招聘筛选或职业选择结论。</p>
    </div>
  );
}

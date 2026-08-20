'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AssessmentCloudStatus, SavedAssessmentResultCard } from '@/components/AssessmentAccountResult';
import { AssessmentRadar, ScoreBars, type AssessmentMetric } from '@/components/AssessmentRadar';
import { AssessmentResultActions } from '@/components/AssessmentResultActions';
import { AssessmentScopeDisclosure } from '@/components/AssessmentScopeDisclosure';
import reportStyles from '@/components/AssessmentReport.module.css';
import styles from '@/components/CareerAssessmentRunner.module.css';
import { useAssessmentResult } from '@/hooks/useAssessmentResult';
import { captureAssessmentSource } from '@/lib/assessment-source';
import { trackEvent } from '@/lib/analytics';
import {
  answerValue,
  assessmentBand,
  scoreCareerAssessment,
  type CareerAssessmentAnswer,
  type CareerAssessmentDefinition,
  type EvidenceKey,
} from '@/lib/career-assessment-data';

type Stage = 'intro' | 'quiz' | 'result';
type AnswerSet = Record<string, CareerAssessmentAnswer>;

const EVIDENCE_OPTIONS: Array<[EvidenceKey, string]> = [
  ['none', '暂时没有'], ['course', '课程作业'], ['campus', '社团 / 学生工作'], ['internship', '实习 / 兼职'], ['project', '比赛 / 作品'],
];

const INTRO_SCOPES: Record<string, { mode: 'minimal' | 'broad' | 'diagnostic'; areas: string[] }> = {
  'work-style': { mode: 'minimal', areas: ['日常互动', '协作方式', '任务习惯', '压力感受', '学习与探索'] },
  'skills-map': { mode: 'broad', areas: ['沟通表达', '分析思考', '协作推进', '数字工具', '自我管理', '经历证据'] },
  'career-adaptability': { mode: 'broad', areas: ['面向未来', '自主应对', '主动探索', '变化信心'] },
  'decision-difficulties': { mode: 'diagnostic', areas: ['启动与动力', '信息准备', '选择方法', '内外冲突'] },
  employability: { mode: 'broad', areas: ['学习执行', '沟通协作', '问题解决', '数字素养', '职业规范', '自我管理'] },
  'job-readiness': { mode: 'diagnostic', areas: ['目标方向', '岗位研究', '求职材料', '面试准备', '投递节奏', '支持与恢复'] },
};

function resultLabel(definition: CareerAssessmentDefinition, scores: Record<string, number>) {
  const ranked = definition.dimensions.map((item) => ({ ...item, score: scores[item.key] || 0 })).sort((a, b) => b.score - a.score);
  return `${definition.scoreDirection === 'risk' ? '主要卡点' : '突出组合'}：${ranked.slice(0, 2).map((item) => item.name).join('、')}`;
}

export function CareerAssessmentRunner({ definition }: { definition: CareerAssessmentDefinition }) {
  const [stage, setStage] = useState<Stage>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerSet>({});
  const accountResult = useAssessmentResult(definition.id);
  const accent = definition.dimensions[0]?.color || 'var(--accent)';
  const storageKey = `jobhot-assessment-draft:${definition.id}`;
  const total = definition.questions.length;
  const answeredCount = Object.values(answers).filter((answer) => answerValue(answer) > 0).length;
  const scores = useMemo(() => scoreCareerAssessment(definition, answers), [definition, answers]);
  const ranked = useMemo(() => definition.dimensions.map((item) => ({ ...item, score: scores[item.key] || 0 })).sort((a, b) => b.score - a.score), [definition, scores]);

  useEffect(() => {
    captureAssessmentSource();
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as { answers?: AnswerSet; current?: number };
      const timer = window.setTimeout(() => {
        if (draft.answers) setAnswers(draft.answers);
        if (Number.isInteger(draft.current)) setCurrent(Math.max(0, Math.min(total - 1, draft.current || 0)));
      }, 0);
      return () => window.clearTimeout(timer);
    } catch { window.localStorage.removeItem(storageKey); }
  }, [storageKey, total]);

  useEffect(() => {
    if (stage !== 'quiz') return;
    window.localStorage.setItem(storageKey, JSON.stringify({ answers, current }));
  }, [answers, current, stage, storageKey]);

  function start() {
    trackEvent('assessment_start', definition.id, { source: captureAssessmentSource() });
    setStage('quiz');
  }

  function finish(next: AnswerSet) {
    const completedScores = scoreCareerAssessment(definition, next);
    void accountResult.saveResult({ resultName: resultLabel(definition, completedScores), answers: next, scores: completedScores });
    window.localStorage.removeItem(storageKey);
    window.setTimeout(() => setStage('result'), 160);
  }

  function select(value: number) {
    const question = definition.questions[current];
    const previous = answers[question.id];
    const answer: CareerAssessmentAnswer = definition.collectEvidence
      ? { value, evidence: typeof previous === 'object' ? previous.evidence || 'none' : 'none' }
      : value;
    const next = { ...answers, [question.id]: answer };
    setAnswers(next);
    if (!definition.collectEvidence) {
      if (current < total - 1) window.setTimeout(() => setCurrent((index) => index + 1), 140);
      else finish(next);
    }
  }

  function setEvidence(evidence: EvidenceKey) {
    const question = definition.questions[current];
    const previous = answers[question.id];
    setAnswers({ ...answers, [question.id]: { value: answerValue(previous), evidence } });
  }

  function goNext() {
    const question = definition.questions[current];
    if (!answerValue(answers[question.id])) return;
    if (current < total - 1) setCurrent((index) => index + 1);
    else if (answeredCount === total) finish(answers);
  }

  function restart() {
    setAnswers({}); setCurrent(0); setStage('intro'); window.localStorage.removeItem(storageKey);
  }

  function viewSavedResult() {
    if (!accountResult.savedResult) return;
    setAnswers(accountResult.savedResult.answers as AnswerSet);
    setCurrent(total - 1); setStage('result'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (stage === 'intro') {
    const scope = INTRO_SCOPES[definition.id] || { mode: 'broad' as const, areas: definition.dimensions.map((item) => item.name) };
    return <div className={`page ${styles.shell}`} style={{ '--assessment-accent': accent } as CSSProperties}>
      <section className={styles.introHero}>
        <span className={styles.introStage}>{definition.stage} · JOBHOT CAREER PROFILE</span>
        <h1>{definition.title}</h1><p className={styles.introQuestion}>{definition.question}</p><p className={styles.introDescription}>{definition.description}</p>
      </section>
      <div className={styles.factGrid}>
        <div className={styles.fact}><strong>{definition.questions.length} 道题</strong><span>{definition.duration}，可随时续答</span></div>
        <div className={styles.fact}><strong>{definition.dimensions.length} 个维度</strong><span>分维度解释和行动建议</span></div>
        <div className={styles.fact}><strong>账号云端保存</strong><span>登录后进入综合职业画像</span></div>
      </div>
      <AssessmentScopeDisclosure mode={scope.mode} areas={scope.areas} />
      <SavedAssessmentResultCard email={accountResult.user?.email} loading={accountResult.loading} error={accountResult.error} savedResult={accountResult.savedResult} onView={viewSavedResult} />
      <div className={styles.startRow}><button className="btn btn-lg" onClick={start}>{answeredCount ? `继续上次进度（${answeredCount}/${total}）` : '开始测评'} →</button><small>{definition.basis}。结果用于自我探索，不作为招聘筛选结论。</small></div>
      <Link href="/tools/assessment" className="btn btn-secondary">← 返回测评中心</Link>
    </div>;
  }

  if (stage === 'quiz') {
    const question = definition.questions[current];
    const response = answers[question.id];
    const selected = answerValue(response);
    const evidence = typeof response === 'object' ? response.evidence || 'none' : 'none';
    const progress = Math.round((answeredCount / total) * 100);
    return <div className={`page ${styles.shell}`} style={{ '--assessment-accent': accent } as CSSProperties}>
      <header className={styles.quizHeader}><div><h1>{definition.shortTitle}</h1><p>按现在真实、稳定的状态作答</p></div><strong>{String(current + 1).padStart(2, '0')} / {total}</strong></header>
      <div className={styles.progress}><span style={{ width: `${progress}%` }} /></div>
      <section className={styles.questionCard}><small>{definition.collectEvidence ? '能力水平' : definition.scoreDirection === 'risk' ? '职业选择状态' : '行为描述'}</small><h2>{question.text}</h2><p>{definition.collectEvidence ? '选择你在真实任务中能够稳定做到的最高水平。' : '没有标准答案，请不要按理想中的自己作答。'}</p></section>
      <div className={styles.options}>{(question.scale || []).map((label, index) => <button key={label} type="button" className={styles.option} data-selected={selected === index + 1} onClick={() => select(index + 1)}><i>{index + 1}</i><span>{label}</span></button>)}</div>
      {definition.collectEvidence && selected > 0 && <section className={styles.evidence}><div><strong>你在哪里证明过这项能力？</strong><p>经历证据不改变能力原始分，但会进入求职材料分析。</p></div><div className={styles.evidenceOptions}>{EVIDENCE_OPTIONS.map(([key, label]) => <button key={key} type="button" data-selected={evidence === key} onClick={() => setEvidence(key)}>{label}</button>)}</div></section>}
      <div className={styles.navRow}><button type="button" className="btn btn-secondary" disabled={current === 0} onClick={() => setCurrent((index) => Math.max(0, index - 1))}>← 上一题</button>{definition.collectEvidence || current < total - 1 ? <button type="button" className="btn" disabled={!selected} onClick={goNext}>{current === total - 1 ? '完成并生成报告' : '下一题 →'}</button> : null}</div>
    </div>;
  }

  const direction = definition.scoreDirection || 'positive';
  const focus = direction === 'risk' ? ranked.slice(0, 2) : [...ranked].sort((a, b) => a.score - b.score).slice(0, 2);
  const top = ranked.slice(0, 3);
  const metrics: AssessmentMetric[] = definition.dimensions.map((item) => ({ key: item.key, label: item.name, shortLabel: item.name, score: scores[item.key] || 0, maxScore: 100, color: item.color }));
  const headline = direction === 'risk' ? `当前主要卡点是${top.slice(0, 2).map((item) => item.name).join('和')}` : `当前突出组合是${top.slice(0, 2).map((item) => item.name).join('和')}`;
  const summary = direction === 'risk' ? '高分表示这个卡点更值得优先处理，不代表能力差。' : '高低分只是当前发展状态，最终需要结合真实经历和岗位环境理解。';
  const action = focus[0]?.action || '选择一个最小行动，在未来72小时内完成。';

  return <div className="page"><div className={reportStyles.report}>
    <section className={reportStyles.hero} style={{ '--report-accent': accent } as CSSProperties}><div className={reportStyles.heroCopy}><span className={reportStyles.eyebrow}>{definition.shortTitle} · 测评报告</span><h1>{headline}</h1><p className={reportStyles.heroLead}>{top[0]?.summary}{top[1]?.summary}</p><span className={reportStyles.heroNote}>{summary} 本结果会与霍兰德、职业价值观等结果一起进入账号职业画像。</span></div><div className={reportStyles.heroRanks}>{top.map((item, index) => <div key={item.key} className={reportStyles.heroRank} style={{ '--rank-color': item.color } as CSSProperties}><span>{index + 1}</span><strong>{item.name}</strong><small>{item.score} · {assessmentBand(item.score, direction)}</small></div>)}</div></section>
    <section className={reportStyles.section}><div className={reportStyles.sectionHeading}><div><h2>{definition.dimensions.length}个维度总览</h2><p>展开维度查看解释和一项可以立刻开始的行动。</p></div><span className={reportStyles.sectionNumber}>01 / OVERVIEW</span></div>{metrics.length <= 8 ? <div className={reportStyles.overviewGrid}><AssessmentRadar metrics={metrics} title={`${definition.title}维度雷达图`} /><ScoreBars metrics={metrics} /></div> : <ScoreBars metrics={metrics} />}</section>
    <section className={reportStyles.section}><div className={reportStyles.sectionHeading}><div><h2>逐项解读</h2><p>{direction === 'risk' ? '优先看高分卡点，再决定需要补信息、改方法还是处理冲突。' : '高分是当前资源，低分是更值得投入的成长空间。'}</p></div><span className={reportStyles.sectionNumber}>02 / DETAILS</span></div><div className={styles.detailList}>{ranked.map((item, index) => <details key={item.key} className={styles.detail} style={{ '--dimension-color': item.color } as CSSProperties} open={index < 2}><summary><strong>{item.name}</strong><div className={styles.bar}><i style={{ width: `${item.score}%` }} /></div><b>{item.score}</b></summary><div className={styles.detailBody}><p>{item.summary}</p><div><span>下一步建议</span><strong>{item.action}</strong></div></div></details>)}</div></section>
    {definition.collectEvidence && <section className={styles.evidenceScore}><div><span>经历证据覆盖度</span><strong>{scores.evidence || 0}%</strong></div><p>能力只有被课程、校园、实习或作品证明，才更容易转化为简历和面试优势。下一步可以优先为高分但缺少证据的能力补一段真实经历。</p></section>}
    <AssessmentCloudStatus email={accountResult.user?.email} saving={accountResult.saving} error={accountResult.error} savedResult={accountResult.savedResult} />
    <AssessmentResultActions assessmentId={definition.id} assessmentName={definition.title} resultName={resultLabel(definition, scores)} headline={headline} summary={summary} action={action} accent={accent} nextStep={{ href: '/tools/assessment/profile', label: '查看综合职业画像', description: '把本次结果与霍兰德、职业价值观和其他求职测评放在一起看。' }} />
    <div style={{ display:'flex', gap:'.65rem', flexWrap:'wrap' }}><button type="button" className="btn btn-secondary" onClick={restart}>重新测评</button><Link href="/tools/assessment" className="btn btn-secondary">返回测评中心</Link></div>
  </div></div>;
}

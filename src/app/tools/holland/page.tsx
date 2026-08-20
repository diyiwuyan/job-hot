'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AssessmentCloudStatus, SavedAssessmentResultCard } from '@/components/AssessmentAccountResult';
import { AssessmentRadar, ScoreBars, type AssessmentMetric } from '@/components/AssessmentRadar';
import { AssessmentResultActions } from '@/components/AssessmentResultActions';
import { AssessmentScopeDisclosure } from '@/components/AssessmentScopeDisclosure';
import reportStyles from '@/components/AssessmentReport.module.css';
import { useAssessmentResult } from '@/hooks/useAssessmentResult';
import { trackEvent } from '@/lib/analytics';
import { captureAssessmentSource } from '@/lib/assessment-source';
import { downloadHollandResultCard } from '@/lib/holland-result-card';
import {
  AI_LEVELS,
  FACET_INFO,
  FACET_ORDER,
  HOLLAND_JOB_CATEGORIES,
  MAJOR_GROUPS,
  QUESTIONS,
  SCALE_OPTIONS,
  TYPE_INFO,
  TYPE_ORDER,
  type AiLevel,
  type HollandFacet,
  type HollandJobCategory,
  type HollandType,
  type MajorGroup,
  type ModernRole,
} from '@/lib/holland-data';

type Stage = 'intro' | 'quiz' | 'result';
type RecommendedCategory = { category: HollandJobCategory; roles: ModernRole[]; score: number };
const RESULT_SCHEMA = 'holland-30-v2';
const TYPE_MAX_SCORE = 30;

function emptyTypeScores(): Record<HollandType, number> {
  return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
}

function calculateBreakdown(answerSet: Record<number, number>) {
  const result: Record<HollandFacet, Record<HollandType, number>> = {
    interest: emptyTypeScores(), ability: emptyTypeScores(), feedback: emptyTypeScores(),
  };
  QUESTIONS.forEach((question) => { result[question.facet][question.type] += answerSet[question.id] ?? 0; });
  return result;
}

function calculateScores(answerSet: Record<number, number>) {
  const breakdown = calculateBreakdown(answerSet);
  const scores = emptyTypeScores();
  TYPE_ORDER.forEach((type) => { scores[type] = FACET_ORDER.reduce((sum, facet) => sum + breakdown[facet][type], 0); });
  return scores;
}

function restoreNumericAnswers(answerSet: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(answerSet)
      .filter(([id, value]) => /^\d+$/.test(id) && typeof value === 'number' && Number(id) <= QUESTIONS.length)
      .map(([id, value]) => [Number(id), value as number])
  );
}

function restoreMajorGroups(value: unknown): MajorGroup[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is MajorGroup => typeof item === 'string' && item in MAJOR_GROUPS).slice(0, 2);
}

function restoreAiLevel(value: unknown): AiLevel {
  return typeof value === 'string' && value in AI_LEVELS ? value as AiLevel : 'exploring';
}

function roleAccessible(role: ModernRole, majors: MajorGroup[], aiLevel: AiLevel) {
  if (role.ai === 'technical' && aiLevel !== 'technical') return false;
  if (role.ai === 'applied' && aiLevel === 'exploring') return false;
  const technicalMajor = majors.some((major) => ['computing', 'engineering', 'science'].includes(major));
  if (role.technical && aiLevel !== 'technical' && !technicalMajor) return false;
  if (!majors.length || !role.majors) return true;
  return role.majors.some((major) => majors.includes(major));
}

function recommendCategories(topTypes: HollandType[], majors: MajorGroup[], aiLevel: AiLevel): RecommendedCategory[] {
  const typeWeights = [8, 5, 3];
  return HOLLAND_JOB_CATEGORIES.map((category) => {
    const roles = category.roles.filter((role) => roleAccessible(role, majors, aiLevel));
    const typeScore = category.types.reduce((sum, type) => {
      const position = topTypes.indexOf(type);
      return sum + (position >= 0 ? typeWeights[position] : 0);
    }, 0);
    const majorMatches = majors.length
      ? roles.filter((role) => role.majors?.some((major) => majors.includes(major))).length
      : 0;
    const profileScore = majorMatches * 1.8 + Math.min(roles.length, 5) * .45;
    const aiScore = category.id === 'data-ai' ? (aiLevel === 'technical' ? 7 : aiLevel === 'applied' ? 5 : 0) : 0;
    const gatePenalty = category.majorGate && (!majors.length || majorMatches === 0) ? 12 : 0;
    return { category, roles, score: typeScore + profileScore + aiScore - gatePenalty };
  })
    .filter((item) => item.roles.length > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, 4);
}

function signalLabel(score: number) {
  if (score >= 23) return '强信号';
  if (score >= 16) return '明显信号';
  if (score >= 9) return '中等信号';
  return '当前较弱';
}

function facetInsight(type: HollandType, breakdown: Record<HollandFacet, Record<HollandType, number>>) {
  const interest = breakdown.interest[type];
  const ability = breakdown.ability[type];
  const feedback = breakdown.feedback[type];
  if (interest - ability >= 3) return '兴趣高于能力自评：值得先用课程、项目或社团体验补足技能证据。';
  if (ability - interest >= 3) return '能力自评高于兴趣：你可能做得到，但要判断是否愿意长期投入。';
  if (feedback >= 7 && interest <= 5) return '职业名称有吸引力，但日常任务兴趣仍需通过真实 JD 和访谈验证。';
  return '兴趣、能力自评与职业偏好相对一致，可优先进入真实岗位探索。';
}

export default function HollandPage() {
  const [stage, setStage] = useState<Stage>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [majorGroups, setMajorGroups] = useState<MajorGroup[]>([]);
  const [aiLevel, setAiLevel] = useState<AiLevel>('exploring');
  const [tableNotice, setTableNotice] = useState('');
  const accountResult = useAssessmentResult('holland');
  const total = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(answeredCount / total * 100);
  const savedIsCurrent = accountResult.savedResult?.answers.__schemaVersion === RESULT_SCHEMA;

  useEffect(() => { captureAssessmentSource(); }, []);

  const scores = useMemo(() => calculateScores(answers), [answers]);
  const ranked = useMemo(() => TYPE_ORDER.map((type) => ({ type, score: scores[type] })).sort((a, b) => b.score - a.score), [scores]);
  const code = ranked.slice(0, 3).map((item) => item.type).join('');

  function toggleMajor(group: MajorGroup) {
    setMajorGroups((currentGroups) => {
      if (currentGroups.includes(group)) return currentGroups.filter((item) => item !== group);
      if (currentGroups.length >= 2) return [currentGroups[1], group];
      return [...currentGroups, group];
    });
  }

  function start() {
    trackEvent('assessment_start', 'holland', { source: captureAssessmentSource(), scoring: RESULT_SCHEMA });
    setStage('quiz');
  }

  function answer(value: number) {
    const question = QUESTIONS[current];
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (current < total - 1) window.setTimeout(() => setCurrent((index) => index + 1), 130);
    else {
      const completedScores = calculateScores(next);
      const completedCode = TYPE_ORDER.map((type) => ({ type, score: completedScores[type] })).sort((a, b) => b.score - a.score).slice(0, 3).map((item) => item.type).join('');
      void accountResult.saveResult({
        resultName: `霍兰德代码 ${completedCode}`,
        answers: { ...next, __schemaVersion: RESULT_SCHEMA, __majorGroups: majorGroups, __aiLevel: aiLevel },
        scores: completedScores,
      });
      window.setTimeout(() => setStage('result'), 180);
    }
  }

  function restart() { setAnswers({}); setCurrent(0); setStage('intro'); }

  function viewSavedResult() {
    if (!accountResult.savedResult || !savedIsCurrent) return;
    setAnswers(restoreNumericAnswers(accountResult.savedResult.answers));
    setMajorGroups(restoreMajorGroups(accountResult.savedResult.answers.__majorGroups));
    setAiLevel(restoreAiLevel(accountResult.savedResult.answers.__aiLevel));
    setCurrent(total - 1); setStage('result'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (stage === 'intro') {
    return (
      <div className="page">
        <div className="page-header"><h1>霍兰德职业兴趣测试</h1><p>兴趣 × 能力自评 × 职业反馈，形成三字母职业探索代码</p></div>
        <section className="card" style={{ marginBottom: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '.9rem', marginTop: 0 }}>
            采用本土化 30 分计分：每种类型的兴趣、能力自评、职业反馈各 10 分，三项相加满分 30 分。结果只比较你自己的六种倾向，不把高分理解为“更优秀”。
          </p>
          <div className="divider" />
          <p style={{ color: 'var(--text-muted)', fontSize: '.8rem', lineHeight: 1.7, marginBottom: 0 }}>共 {total} 题，约 8—10 分钟；每题 0—2 分。题目比上一版多，是为了让三类原始分等权，不再用 40 分的不等量拼接。</p>
        </section>
        <AssessmentScopeDisclosure mode="minimal" areas={['活动兴趣', '自我能力感受', '职业情境反馈']} />

        <section className="card" style={{ marginBottom: '1rem' }}>
          <div className={reportStyles.profileHeader}><div><h2>先补充求职背景（可选）</h2><p>最多选择两个学科方向。它只影响岗位推荐，不改变霍兰德得分。</p></div><span>{majorGroups.length} / 2</span></div>
          <div className={reportStyles.profileOptions}>
            {(Object.keys(MAJOR_GROUPS) as MajorGroup[]).map((group) => (
              <button key={group} type="button" className={majorGroups.includes(group) ? reportStyles.profileOptionActive : reportStyles.profileOption} onClick={() => toggleMajor(group)}>{MAJOR_GROUPS[group].label}</button>
            ))}
          </div>
          <div className="divider" />
          <div className={reportStyles.profileHeader}><div><h2>你的 AI 实践基础</h2><p>用于区分 AI 应用岗位与需要编程/模型基础的技术岗位。</p></div></div>
          <div className={reportStyles.aiOptions}>
            {(Object.keys(AI_LEVELS) as AiLevel[]).map((level) => (
              <button key={level} type="button" className={aiLevel === level ? reportStyles.aiOptionActive : reportStyles.aiOption} onClick={() => setAiLevel(level)}><strong>{AI_LEVELS[level].label}</strong><small>{AI_LEVELS[level].description}</small></button>
            ))}
          </div>
        </section>

        {accountResult.savedResult && !savedIsCurrent && !accountResult.loading && (
          <section className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid #b86f13' }}><strong>检测到旧版 40 分结果</strong><p style={{ color: 'var(--text-muted)', fontSize: '.8rem', lineHeight: 1.7, marginBottom: 0 }}>旧题无法可靠换算成新的三项等权原始分，因此先保留在账号中；完成新版后会用 30 分结果更新，不做伪换算。</p></section>
        )}
        <SavedAssessmentResultCard email={accountResult.user?.email} loading={accountResult.loading} error={accountResult.error} savedResult={savedIsCurrent ? accountResult.savedResult : null} onView={viewSavedResult} />
        <button className="btn btn-lg" onClick={start}>开始测试 →</button>
      </div>
    );
  }

  if (stage === 'quiz') {
    const question = QUESTIONS[current];
    const selected = answers[question.id];
    return (
      <div className="page">
        <div className="page-header"><h1>第 {current + 1} / {total} 题</h1><p>请按大多数时候真实、自然的状态作答</p></div>
        <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 999, overflow: 'hidden', marginBottom: '1.25rem' }}><div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), #8b5cf6)', transition: 'width .25s ease' }} /></div>
        <section className="card" style={{ marginBottom: '1rem' }}><h2 style={{ fontSize: '1.12rem', lineHeight: 1.7, margin: 0 }}>{question.text}</h2></section>
        <div style={{ display: 'grid', gap: '.6rem' }}>
          {SCALE_OPTIONS.map((option) => {
            const active = selected === option.value;
            return <button key={option.value} type="button" className="timeline-card" onClick={() => answer(option.value)} style={{ width: '100%', display: 'flex', gap: '.75rem', textAlign: 'left', cursor: 'pointer', alignItems: 'center', borderColor: active ? 'var(--accent)' : undefined, background: active ? 'var(--accent-muted)' : undefined }}><span style={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', background: active ? 'var(--accent)' : 'var(--bg-elevated)', color: active ? '#fff' : 'var(--text-muted)', fontWeight: 800 }}>{option.value}</span><span>{option.label}</span></button>;
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}><button type="button" className="btn btn-secondary" disabled={current === 0} style={{ opacity: current === 0 ? .5 : 1 }} onClick={() => setCurrent((index) => Math.max(0, index - 1))}>← 上一题</button>{current < total - 1 && <button type="button" className="btn btn-secondary" disabled={selected === undefined} style={{ opacity: selected === undefined ? .5 : 1 }} onClick={() => setCurrent((index) => index + 1)}>下一题 →</button>}</div>
      </div>
    );
  }

  const top3 = ranked.slice(0, 3);
  const topTypes = top3.map((item) => item.type);
  const dominant = TYPE_INFO[topTypes[0]];
  const breakdown = calculateBreakdown(answers);
  const recommendations = recommendCategories(topTypes, majorGroups, aiLevel);
  const topNames = topTypes.map((type) => TYPE_INFO[type].name).join('、');
  const majorLabel = majorGroups.length ? majorGroups.map((group) => MAJOR_GROUPS[group].shortLabel).join('＋') : '未填写（仅按兴趣代码提供宽口径推荐）';
  const boundaryGap = ranked[2].score - ranked[3].score;
  const profileAnalysis = `${code} 表示你当前更突出的三项倾向是${topNames}。它说明你更愿意投入哪些任务，不代表已经具备某个岗位的录用能力。`;
  const conclusion = `你可以先探索“${recommendations.map((item) => item.category.title).join('、')}”等岗位大类，再结合专业课程、作品、实习和真实 JD 缩小范围。`;
  const action = `从“${recommendations[0]?.category.title || '推荐方向'}”中选 3 个校招岗位，分别核对日常任务、专业限制和技能门槛，只保留你既愿意做、又有现实切入路径的方向。`;
  const metricsByType: AssessmentMetric[] = TYPE_ORDER.map((type) => ({ key: type, label: `${type} ${TYPE_INFO[type].name}`, shortLabel: `${type} ${TYPE_INFO[type].name}`, score: scores[type], maxScore: TYPE_MAX_SCORE, color: TYPE_INFO[type].color }));
  const rankedMetrics = ranked.map((item) => metricsByType.find((metric) => metric.key === item.type)!);
  const scoreTableRows = FACET_ORDER.map((facet) => ({ facet, label: `${FACET_INFO[facet].name}（${FACET_INFO[facet].shortName}）`, scores: TYPE_ORDER.map((type) => breakdown[facet][type]) }));

  function plainScoreTable(separator: string) {
    const rows = [['维度', ...TYPE_ORDER.map((type) => `${type} ${TYPE_INFO[type].name}`)], ...scoreTableRows.map((row) => [row.label, ...row.scores.map(String)]), ['总分', ...TYPE_ORDER.map((type) => String(scores[type]))]];
    return rows.map((row) => row.join(separator)).join('\n');
  }
  async function copyScoreTable() {
    const content = `霍兰德代码：${code}\n计分：兴趣10＋能力10＋职业反馈10＝30\n${plainScoreTable('\t')}`;
    try { await navigator.clipboard.writeText(content); setTableNotice('表格已复制'); } catch { window.prompt('请复制下面的表格数据：', content); }
    window.setTimeout(() => setTableNotice(''), 1800);
  }
  function downloadScoreTable() {
    const csv = `\uFEFF霍兰德代码,${code}\n计分口径,兴趣10＋能力10＋职业反馈10＝30\n${plainScoreTable(',')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `霍兰德-${code}-兴趣能力职业反馈.csv`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setTableNotice('CSV 已下载'); window.setTimeout(() => setTableNotice(''), 1800);
  }

  return (
    <div className="page">
      <div className={reportStyles.report}>
        <section className={reportStyles.hero} style={{ '--report-accent': dominant.color } as CSSProperties}>
          <div className={reportStyles.heroCopy}><span className={reportStyles.eyebrow}>Holland RIASEC · 30分本土化简版</span><h1>霍兰德代码 {code}</h1><p className={reportStyles.heroLead}>{profileAnalysis}</p><span className={reportStyles.heroNote}>{boundaryGap <= 1 ? `第3与第4名只差 ${boundaryGap} 分，第三个字母可能随经历变化，建议把 ${ranked[3].type} ${TYPE_INFO[ranked[3].type].name} 一并观察。` : '三个字母是探索线索，不是职业处方。'}</span></div>
          <div className={reportStyles.heroRanks}>{top3.map((item, index) => <div className={reportStyles.heroRank} key={item.type} style={{ '--rank-color': TYPE_INFO[item.type].color } as CSSProperties}><span>{item.type}</span><strong>No.{index + 1} {TYPE_INFO[item.type].name}</strong><small>{item.score} / 30 · {signalLabel(item.score)}</small></div>)}</div>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}><div><h2>六型分布</h2><p>雷达图看整体结构，右侧看相对排序；高分表示本次作答中的倾向更强，不表示能力更高级。</p></div><span className={reportStyles.sectionNumber}>01 / OVERVIEW</span></div>
          <div className={reportStyles.overviewGrid}><AssessmentRadar metrics={metricsByType} title="霍兰德六型雷达图" /><ScoreBars metrics={rankedMetrics} /></div>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}><div><h2>兴趣 · 能力 · 职业反馈</h2><p>每行均由 5 题原始分相加，单行满分 10；三行相加后，每种类型满分 30。</p></div><span className={reportStyles.sectionNumber}>02 / DATA</span></div>
          <div className={reportStyles.tableToolbar}><p>0—3 当前较弱；4—6 中等；7—8 明显；9—10 强信号。它描述倾向强度，没有“及格线”。</p><div><button className="btn btn-secondary" type="button" onClick={copyScoreTable}>复制表格</button><button className="btn btn-secondary" type="button" onClick={downloadScoreTable}>下载 CSV</button></div></div>
          {tableNotice && <div className={reportStyles.tableNotice}>{tableNotice}</div>}
          <div className={reportStyles.scoreTableWrap}><table className={reportStyles.facetTable}><caption className={reportStyles.srOnly}>霍兰德兴趣能力职业反馈六维得分</caption><thead><tr><th>统计维度</th>{TYPE_ORDER.map((type) => <th key={type} className={topTypes.includes(type) ? reportStyles.tableTopType : undefined} style={{ '--type-color': TYPE_INFO[type].color } as CSSProperties}><strong>{type}</strong><small>{TYPE_INFO[type].name}</small></th>)}</tr></thead><tbody>{scoreTableRows.map((row) => <tr key={row.facet}><th><strong>{row.label}</strong><small>满分 10</small></th>{row.scores.map((score, index) => <td key={TYPE_ORDER[index]}>{score}</td>)}</tr>)}<tr className={reportStyles.totalRow}><th><strong>总分</strong><small>满分 30</small></th>{TYPE_ORDER.map((type) => <td key={type}>{scores[type]}</td>)}</tr></tbody></table></div>
          <p className={reportStyles.tableFootnote}>“能力”是自我评价，容易受经验多少与自信程度影响；真正求职时仍要用课程成绩、作品、项目、实习和面试反馈验证。</p>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}><div><h2>三个主要类型</h2><p>只解释前三项，并把三类分数之间的关系转成可行动的提醒。</p></div><span className={reportStyles.sectionNumber}>03 / CODE</span></div>
          <div className={reportStyles.rankGrid}>{top3.map((item, index) => { const info = TYPE_INFO[item.type]; return <article className={reportStyles.rankCard} data-rank={String(index + 1).padStart(2, '0')} key={item.type} style={{ '--rank-color': info.color } as CSSProperties}><div className={reportStyles.rankCardTop}><span className={reportStyles.rankBadge}>{item.type}</span><div><h3>{info.name}</h3><small>{item.score}/30 · {signalLabel(item.score)}</small></div></div><p>{info.summary}</p><div className={reportStyles.cardLabel}>本次三项关系</div><p>{facetInsight(item.type, breakdown)}</p><div className={reportStyles.tagList}>{info.activities.map((activity) => <span key={activity}>{activity}</span>)}</div></article>; })}</div>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}><div><h2>优先探索的岗位大类</h2><p>不是按代码硬套职业名，而是先按 {code} 选择任务大类，再用“{majorLabel}、{AI_LEVELS[aiLevel].label}”过滤明显不现实的入口。</p></div><span className={reportStyles.sectionNumber}>04 / JOBS</span></div>
          <div className={reportStyles.profileSummary}><strong>本次推荐依据</strong><span>专业：{majorLabel}</span><span>AI：{AI_LEVELS[aiLevel].label}</span></div>
          <div className={reportStyles.recommendationGrid}>{recommendations.map((item, index) => <article className={reportStyles.jobCategoryCard} key={item.category.id} style={{ '--item-color': TYPE_INFO[topTypes[index % 3]].color } as CSSProperties}><span className={reportStyles.roleRank}>方向 {String(index + 1).padStart(2, '0')}</span><h3>{item.category.title}</h3><p>{item.category.subtitle}</p><div className={reportStyles.jobTaskList}>{item.category.tasks.map((task) => <span key={task}>{task}</span>)}</div><strong className={reportStyles.jobRoleTitle}>校招中可搜索这些岗位名</strong><div className={reportStyles.jobRoleList}>{item.roles.slice(0, 6).map((role) => <span key={role.title}>{role.title}</span>)}</div></article>)}</div>
          <p className={reportStyles.tableFootnote}>岗位库参考本站校招数据中的新岗位名称，并补充生成式 AI、数字运营等新职业方向。若未填写专业，系统只做宽口径推荐；它不会把“研究型”直接等同于算法工程师。</p>
        </section>

        <div className={reportStyles.analysisBox} style={{ '--analysis-color': dominant.color } as CSSProperties}><span className={reportStyles.analysisMark}>结</span><div><h3>这份结果怎么用</h3><p>{conclusion}</p></div></div>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}><div><h2>计分来源与边界</h2><p>把“参考来源”和“本站采用的计分口径”分开说明，避免把本土化简版误写成官方原版。</p></div><span className={reportStyles.sectionNumber}>METHOD</span></div>
          <div className={reportStyles.methodGrid}><div><strong>原版 SDS 结构</strong><p>PAR 的 Standard SDS 包含活动、能力、职业与两组自我评定，官方样例总分并不是统一 30 分。</p><a href="https://www.parinc.com/products/SDS-STANDARD" target="_blank" rel="noreferrer">查看 PAR 官方说明 ↗</a></div><div><strong>本站 30 分简版</strong><p>参考新精英本土化结果表，将兴趣、能力自评、职业反馈设计为三个等权的 10 分原始分。</p><a href="https://www.xjy.cn/blog/950.html" target="_blank" rel="noreferrer">查看新精英本土化说明 ↗</a></div></div>
        </section>
      </div>

      <AssessmentCloudStatus email={accountResult.user?.email} saving={accountResult.saving} error={accountResult.error} savedResult={accountResult.savedResult} />
      <AssessmentResultActions assessmentId="holland" assessmentName="霍兰德职业兴趣测试" resultName={`霍兰德代码 ${code}`} headline={`三个主要类型：${topNames}；优先探索 ${recommendations.map((item) => item.category.title).join('、')}`} summary={conclusion} action={action} nextStep={{ href: '/tools/values', label: '继续梳理你的职业价值观', description: '兴趣回答“愿意做什么”，职业价值观进一步判断“什么样的工作条件值得长期投入”。' }} accent={dominant.color} onSaveCard={(source) => downloadHollandResultCard({ code, scores, breakdown, categories: recommendations.map((item) => ({ title: item.category.title, roles: item.roles.map((role) => role.title) })), majorLabel, source })} />
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}><button className="btn btn-secondary" onClick={restart}>重新测试</button><Link href="/tools/assessment" className="btn btn-secondary">返回测评中心</Link></div>
      <p style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '1.5rem', lineHeight: 1.7 }}>说明：本测试为原创本土化职业兴趣自测，不是 PAR 授权 SDS，不构成心理诊断、能力鉴定或录用建议。</p>
    </div>
  );
}

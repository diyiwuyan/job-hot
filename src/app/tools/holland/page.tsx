'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { AssessmentCloudStatus, SavedAssessmentResultCard } from '@/components/AssessmentAccountResult';
import { AssessmentResultActions } from '@/components/AssessmentResultActions';
import reportStyles from '@/components/AssessmentReport.module.css';
import { useAssessmentResult } from '@/hooks/useAssessmentResult';
import { trackEvent } from '@/lib/analytics';
import { captureAssessmentSource } from '@/lib/assessment-source';
import {
  QUESTIONS,
  FACET_INFO,
  FACET_ORDER,
  HOLLAND_ROLES,
  TYPE_INFO,
  TYPE_ORDER,
  SCALE_OPTIONS,
  type HollandFacet,
  type HollandType,
} from '@/lib/holland-data';

type Stage = 'intro' | 'quiz' | 'result';

function calculateHollandScores(answerSet: Record<number, number>) {
  const result: Record<HollandType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  for (const question of QUESTIONS) result[question.type] += answerSet[question.id] || 0;
  return result;
}

function calculateHollandBreakdown(answerSet: Record<number, number>) {
  const emptyScores = (): Record<HollandType, number> => ({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
  const result: Record<HollandFacet, Record<HollandType, number>> = {
    interest: emptyScores(),
    ability: emptyScores(),
    feedback: emptyScores(),
  };
  for (const question of QUESTIONS) {
    result[question.facet][question.type] += answerSet[question.id] || 0;
  }
  return result;
}

const FACET_MAX_SCORES = Object.fromEntries(
  FACET_ORDER.map((facet) => [
    facet,
    QUESTIONS.filter((question) => question.facet === facet && question.type === 'R').length * 5,
  ])
) as Record<HollandFacet, number>;

function recommendRoles(types: HollandType[]) {
  const weights = [6, 3, 2];
  return HOLLAND_ROLES.map((role, originalIndex) => {
    const matchScore = role.types.reduce((total, type) => {
      const typeIndex = types.indexOf(type);
      return total + (typeIndex >= 0 ? weights[typeIndex] : 0);
    }, role.types[0] === types[0] ? 1 : 0);
    return { role, matchScore, originalIndex };
  })
    .sort((first, second) => second.matchScore - first.matchScore || first.originalIndex - second.originalIndex)
    .slice(0, 6)
    .map((item) => item.role);
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
  const [tableNotice, setTableNotice] = useState('');
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
  const topTypes = top3.map((item) => item.type);
  const breakdown = calculateHollandBreakdown(answers);
  const recommendedRoles = recommendRoles(topTypes);
  const suggestedActivities = top3.flatMap((item) =>
    TYPE_INFO[item.type].activities.slice(0, 2).map((activity) => ({ type: item.type, activity }))
  );
  const roleHighlights = recommendedRoles.slice(0, 3).map((role) => role.title).join('、');
  const profileAnalysis = `${code} 代表你的前三项职业倾向：${dominant.name}、${secondary.name}和${supporting.name}。求职时可以优先了解 ${roleHighlights} 等方向，再用实习、项目和岗位信息验证。`;
  const careerConclusion = `你可能更适合需要“${dominant.activities[0]}”，同时包含“${secondary.activities[0]}”和“${supporting.activities[0]}”的工作。先把这些方向当作探索清单，不必只凭一次测评决定职业。`;
  const hollandAction = `从推荐岗位中选3个，分别查看日常任务、招聘要求和应届生入口，记录你愿意尝试和需要补齐的部分。`;

  const scoreTableRows = FACET_ORDER.map((facet) => ({
    facet,
    label: `${FACET_INFO[facet].name}（${FACET_INFO[facet].shortName}）`,
    scores: TYPE_ORDER.map((type) => breakdown[facet][type]),
    maxScore: FACET_MAX_SCORES[facet],
  }));

  function plainScoreTable(separator: string) {
    const rows = [
      ['维度', ...TYPE_ORDER.map((type) => `${type} ${TYPE_INFO[type].name}`)],
      ...scoreTableRows.map((row) => [row.label, ...row.scores.map(String)]),
      ['总分', ...TYPE_ORDER.map((type) => String(scores[type]))],
    ];
    return rows.map((row) => row.join(separator)).join('\n');
  }

  async function copyScoreTable() {
    const content = `霍兰德代码：${code}\n${plainScoreTable('\t')}`;
    try {
      await navigator.clipboard.writeText(content);
      setTableNotice('表格已复制');
    } catch {
      window.prompt('请复制下面的表格数据：', content);
      setTableNotice('已打开复制窗口');
    }
    window.setTimeout(() => setTableNotice(''), 1800);
  }

  function downloadScoreTable() {
    const csv = `\uFEFF霍兰德代码,${code}\n${plainScoreTable(',')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `霍兰德测评-${code}-兴趣能力反馈.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setTableNotice('CSV 已下载');
    window.setTimeout(() => setTableNotice(''), 1800);
  }
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
            <span className={reportStyles.heroNote}>三个代码是职业探索起点，不是对能力或职业的最终判断。</span>
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
            <div><h2>兴趣 · 能力 · 职业反馈统计表</h2><p>参考正式测评的结果结构，把48道题拆成三组统计；三行相加就是每个类型的总分。</p></div>
            <span className={reportStyles.sectionNumber}>01 / DATA</span>
          </div>
          <div className={reportStyles.tableToolbar}>
            <p>兴趣、能力各满分15分；职业反馈满分10分；每个类型总分40分。</p>
            <div>
              <button className="btn btn-secondary" type="button" onClick={copyScoreTable}>复制表格</button>
              <button className="btn btn-secondary" type="button" onClick={downloadScoreTable}>下载 CSV</button>
            </div>
          </div>
          {tableNotice && <div className={reportStyles.tableNotice} role="status">{tableNotice}</div>}
          <div className={reportStyles.scoreTableWrap}>
            <table className={reportStyles.facetTable}>
              <caption className={reportStyles.srOnly}>霍兰德兴趣、能力与职业反馈六维得分表</caption>
              <thead>
                <tr>
                  <th scope="col">统计维度</th>
                  {TYPE_ORDER.map((type) => (
                    <th
                      scope="col"
                      key={type}
                      className={topTypes.includes(type) ? reportStyles.tableTopType : undefined}
                      style={{ '--type-color': TYPE_INFO[type].color } as CSSProperties}
                    >
                      <strong>{type}</strong>
                      <small>{TYPE_INFO[type].name}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scoreTableRows.map((row) => (
                  <tr key={row.facet}>
                    <th scope="row"><strong>{row.label}</strong><small>满分 {row.maxScore}</small></th>
                    {row.scores.map((score, index) => <td key={TYPE_ORDER[index]}>{score}</td>)}
                  </tr>
                ))}
                <tr className={reportStyles.totalRow}>
                  <th scope="row"><strong>总分</strong><small>满分 {maxScore}</small></th>
                  {TYPE_ORDER.map((type) => <td key={type}>{scores[type]}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <p className={reportStyles.tableFootnote}>手机端可左右滑动查看六列。分数用于比较你自己的六种倾向，不用于和别人比较；“能力”是自我感受，求职时还要用课程、项目、实习和作品验证。</p>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}>
            <div><h2>你的三个主要类型</h2><p>只保留最重要的三个代码，快速理解你更愿意投入什么样的任务。</p></div>
            <span className={reportStyles.sectionNumber}>02 / CODE</span>
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
                  <div className={reportStyles.cardLabel}>你可能更愿意做</div>
                  <div className={reportStyles.tagList}>{info.activities.map((activity) => <span key={activity}>{activity}</span>)}</div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}>
            <div><h2>适合优先了解的校招岗位</h2><p>根据 {code} 三个代码与岗位任务的重合度生成，先用于扩大和筛选求职方向。</p></div>
            <span className={reportStyles.sectionNumber}>03 / JOBS</span>
          </div>
          <div className={reportStyles.recommendationGrid}>
            {recommendedRoles.map((role, index) => {
              return (
                <article
                  className={reportStyles.roleCard}
                  key={role.title}
                  style={{ '--item-color': TYPE_INFO[topTypes[index % topTypes.length]].color } as CSSProperties}
                >
                  <span className={reportStyles.roleRank}>推荐 {String(index + 1).padStart(2, '0')}</span>
                  <h3>{role.title}</h3>
                  <p>{role.why}</p>
                  <div><strong>常见任务</strong><p>{role.tasks}</p></div>
                  <small>大学生切入：{role.starter}</small>
                </article>
              );
            })}
          </div>
        </section>

        <section className={reportStyles.section}>
          <div className={reportStyles.sectionHeading}>
            <div><h2>你可能更适合做这些事情</h2><p>看任务比只看岗位名称更准确，同一个岗位在不同公司也可能很不一样。</p></div>
            <span className={reportStyles.sectionNumber}>04 / TASKS</span>
          </div>
          <div className={reportStyles.activityGrid}>
            {suggestedActivities.map((item, index) => (
              <article
                className={reportStyles.activityCard}
                key={`${item.type}-${item.activity}`}
                style={{ '--item-color': TYPE_INFO[item.type].color } as CSSProperties}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.activity}</strong>
                <small>{item.type} · {TYPE_INFO[item.type].name}</small>
              </article>
            ))}
          </div>
        </section>

        <div
          className={reportStyles.analysisBox}
          style={{ '--analysis-color': dominant.color } as CSSProperties}
        >
          <span className={reportStyles.analysisMark}>结</span>
          <div><h3>一句话结论</h3><p>{careerConclusion}</p></div>
        </div>
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
        headline={`你的三个主要类型是：${topNames}；可优先了解 ${roleHighlights}`}
        summary={careerConclusion}
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

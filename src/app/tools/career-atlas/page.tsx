"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { familyOrder, getRoleIndustries, industryOrder, roles as seedRoles, type Role } from "./role-data";
import { marketEvidence, marketEvidenceByRole, salaryMethodology } from "./market-evidence";

type Answers = {
  stage: string;
  intent: string;
  interests: string[];
  outputs: string[];
  strengths: string[];
  styles: string[];
  industries: string[];
  constraints: string[];
  experience: string;
};

const interestOptions = [
  ["解决用户问题", "发现真实需求，再把复杂问题变简单"],
  ["用数据找规律", "从数字和证据中找出关键线索"],
  ["创造具体作品", "做出看得见、能被使用的成果"],
  ["研究商业问题", "理解行业、竞争和组织如何运转"],
  ["理解人与内容", "研究人的动机、表达和传播"],
  ["钻研技术系统", "理解并搭建稳定、高效的系统"],
  ["推动事情落地", "协调资源，让计划真正发生"],
] as const;

const outputOptions = [
  ["做出可用的产品或作品", "把想法变成可以被使用、被看见的成果", ["软件与技术", "产品与项目", "设计与研究", "市场与品牌", "制造与工程"]],
  ["把杂乱信息整理成判断", "通过研究、数据、规则或材料，得出清晰结论", ["数据与分析", "财务与审计", "法务与合规", "公共事务与ESG", "教育与科研"]],
  ["让项目、流程或现场顺利运转", "协调人、资源和节奏，解决推进中的问题", ["产品与项目", "运营与客户", "供应链与物流", "人力与行政", "制造与工程"]],
  ["帮助用户或客户解决实际问题", "理解需求、解释方案，并推动服务真正发生", ["运营与客户", "销售与商务", "医疗与医药", "教育与科研", "人力与行政"]],
  ["把复杂内容讲清楚并产生影响", "用文字、内容、表达或方案，让更多人理解并行动", ["市场与品牌", "教育与科研", "公共事务与ESG", "法务与合规", "销售与商务"]],
] as const;

const strengthOptions = ["结构化思考", "沟通协调", "数据分析", "文字表达", "逻辑推理", "洞察用户", "表达呈现", "耐心细致", "快速学习", "执行推进", "研究检索", "工具与技术"];
const styleOptions = [
  ["变化与挑战", "喜欢快速变化、不断解决新问题"],
  ["深度专注", "希望有完整时间钻研一个问题"],
  ["跨团队协作", "从人与人的配合中获得能量"],
  ["清晰有序", "偏好明确目标、稳定节奏和可控流程"],
  ["自主推进", "希望对自己的节奏和方法有较多掌控"],
  ["真实现场", "愿意走进客户、项目、工厂、学校或业务一线"],
] as const;

const stageOptions = ["大一至大二", "大三至研一", "秋招/毕业求职期", "毕业0—3年", "考虑转方向"];
const intentOptions = ["我想先看清自己适合探索什么", "我想把已有经历翻译成可投方向", "我已有目标，想验证是否真的匹配", "我在比较稳定、成长、城市等现实选择"];
const constraintOptions = ["城市与生活半径", "稳定性与明确规则", "收入与成长速度", "工作时间与精力边界", "希望与专业或已有经历相关", "暂时没有明显限制"];
const styleRoleMap: Record<string, string> = { "自主推进": "深度专注", "真实现场": "跨团队协作" };
const emptyAnswers: Answers = { stage: "", intent: "", interests: [], outputs: [], strengths: [], styles: [], industries: [], constraints: [], experience: "" };

function toggleMulti(current: string[], value: string, max: number) {
  if (current.includes(value)) return current.filter((item) => item !== value);
  return current.length >= max ? current : [...current, value];
}

function scoreRole(role: Role, answers: Answers) {
  let score = 18;
  const matchedInterests = answers.interests.filter((item) => role.interests.includes(item));
  score += Math.min(matchedInterests.length * 12, 24);
  const matchedOutputs = answers.outputs.filter((item) => outputOptions.some(([title, , families]) => title === item && (families as readonly string[]).includes(role.family)));
  score += Math.min(matchedOutputs.length * 7, 14);
  const matchedStrengths = answers.strengths.filter((item) => role.strengths.includes(item));
  score += Math.min(matchedStrengths.length * 6, 24);
  const matchedStyles = answers.styles.filter((item) => role.styles.includes(styleRoleMap[item] ?? item));
  score += Math.min(matchedStyles.length * 6, 12);
  const matchedIndustries = answers.industries.filter((item) => getRoleIndustries(role).includes(item));
  score += Math.min(matchedIndustries.length * 6, 12);
  const normalizedExperience = answers.experience.toLowerCase();
  const keywordHits = role.keywords.filter((keyword) => normalizedExperience.includes(keyword)).length;
  score += Math.min(keywordHits * 2, 8);
  const juniorStage = ["大一至大二", "大三至研一", "秋招/毕业求职期", "毕业0—3年"].includes(answers.stage);
  if (juniorStage && ["入门", "初级"].includes(role.seniority)) score += 3;
  const signalCount = [matchedInterests.length, matchedOutputs.length, matchedStrengths.length, matchedStyles.length, matchedIndustries.length, keywordHits].filter(Boolean).length;
  return { score, matchedInterests, matchedOutputs, matchedStrengths, matchedStyles, matchedIndustries, keywordHits, signalCount };
}

function normalizeDatabaseRole(row: Record<string, unknown>): Role {
  return {
    ...(row as unknown as Role),
    coreSkills: (row.core_skills ?? row.coreSkills ?? []) as string[],
    workContext: String(row.work_context ?? row.workContext ?? ""),
  };
}

export default function Home() {
  const [view, setView] = useState<"home" | "assessment" | "results">("home");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [catalogRoles, setCatalogRoles] = useState<Role[]>(seedRoles);
  const [catalogSource, setCatalogSource] = useState<"本地种子" | "Supabase">("本地种子");
  const [roleQuery, setRoleQuery] = useState("");
  const [activeFamily, setActiveFamily] = useState("全部");
  const [activeIndustry, setActiveIndustry] = useState("全部");
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [activeEvidenceSlug, setActiveEvidenceSlug] = useState(marketEvidence[0].roleSlug);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;
    supabase
      .from("career_roles")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled || error || !data?.length) return;
        setCatalogRoles(data.map((row) => normalizeDatabaseRole(row as Record<string, unknown>)));
        setCatalogSource("Supabase");
      });
    return () => { cancelled = true; };
  }, []);

  const rankedRoles = useMemo(() => catalogRoles
    .map((role) => ({ role, ...scoreRole(role, answers) }))
    .sort((a, b) => b.score - a.score), [answers, catalogRoles]);

  const filteredRoles = useMemo(() => {
    const query = roleQuery.trim().toLowerCase();
    return catalogRoles.filter((role) => {
      const familyMatches = activeFamily === "全部" || role.family === activeFamily;
      const industryMatches = activeIndustry === "全部" || getRoleIndustries(role).includes(activeIndustry);
      const textMatches = !query || [role.name, role.english, role.family, role.purpose, ...role.coreSkills, ...getRoleIndustries(role)]
        .join(" ").toLowerCase().includes(query);
      return familyMatches && industryMatches && textMatches;
    });
  }, [activeFamily, activeIndustry, catalogRoles, roleQuery]);

  const comparedRoles = compareSlugs.map((slug) => catalogRoles.find((role) => role.slug === slug)).filter(Boolean) as Role[];
  const activeEvidence = marketEvidence.find((item) => item.roleSlug === activeEvidenceSlug) ?? marketEvidence[0];

  function toggleCompare(slug: string) {
    setCompareSlugs((current) => current.includes(slug)
      ? current.filter((item) => item !== slug)
      : current.length < 3 ? [...current, slug] : current);
  }

  function startAssessment() {
    setAnswers(emptyAnswers);
    setStep(0);
    setView("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextStep() {
    if (step < 6) setStep((current) => current + 1);
    else {
      setView("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const canContinue = [
    Boolean(answers.stage) && Boolean(answers.intent),
    answers.interests.length >= 2,
    answers.outputs.length >= 2,
    answers.strengths.length >= 3,
    answers.experience.trim().length >= 20,
    answers.styles.length >= 2,
    answers.industries.length >= 1
  ][step];

  if (view === "assessment") {
    return (
      <main className="assessment-shell">
        <header className="compact-header">
          <button className="brand-button" onClick={() => setView("home")} aria-label="返回首页">
            <span className="brand-mark">CA</span>
            <span>职业坐标</span>
          </button>
          <span className="step-label">职业探索诊断 · {step + 1}/7</span>
        </header>

        <section className="assessment-card" aria-live="polite">
          <div className="progress-track" aria-label={`诊断进度 ${step + 1}/7`}>
            <span style={{ width: `${((step + 1) / 7) * 100}%` }} />
          </div>

          {step === 0 && (
            <div className="question-panel">
              <p className="eyebrow coral">先看清你正在解决什么</p>
              <h1>你现在处在哪个阶段，最想解决什么问题？</h1>
              <p className="question-note">这两项不会替你决定职业，只帮助我们判断你是在探索、验证，还是准备进入真实求职。</p>
              <div className="option-grid two-columns">
                {stageOptions.map((item) => (
                  <button key={item} className={`choice-card ${answers.stage === item ? "selected" : ""}`} onClick={() => setAnswers({ ...answers, stage: item })}>
                    <span>{item}</span><i>{answers.stage === item ? "已选" : "选择"}</i>
                  </button>
                ))}
              </div>
              <div className="question-subgroup">
                <span>这次诊断，你最想得到什么？</span>
                <div className="option-grid">
                  {intentOptions.map((item) => (
                    <button key={item} className={`choice-card ${answers.intent === item ? "selected" : ""}`} onClick={() => setAnswers({ ...answers, intent: item })}>
                      <span>{item}</span><i>{answers.intent === item ? "已选" : "选择"}</i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="question-panel">
              <p className="eyebrow coral">兴趣不是岗位名，而是你愿意反复面对的问题</p>
              <h1>哪两类问题，最容易让你愿意投入？</h1>
              <p className="question-note">请选择 2 项。不要选“听起来有前途”的，选你会自然产生好奇心、愿意多想一步的。</p>
              <div className="option-grid">
                {interestOptions.map(([title, note]) => (
                  <button key={title} className={`choice-card choice-with-note ${answers.interests.includes(title) ? "selected" : ""}`} onClick={() => setAnswers({ ...answers, interests: toggleMulti(answers.interests, title, 2) })}>
                    <span>{title}</span><small>{note}</small><i>{answers.interests.includes(title) ? "已选" : "最多选2项"}</i>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="question-panel">
              <p className="eyebrow coral">你想把时间花在什么样的成果上</p>
              <h1>哪两种“工作产出”最让你有成就感？</h1>
              <p className="question-note">请选择 2 项。职业选择不只看喜欢什么，也要看你愿意长期为哪类结果负责。</p>
              <div className="option-grid">
                {outputOptions.map(([title, note]) => (
                  <button key={title} className={`choice-card choice-with-note ${answers.outputs.includes(title) ? "selected" : ""}`} onClick={() => setAnswers({ ...answers, outputs: toggleMulti(answers.outputs, title, 2) })}>
                    <span>{title}</span><small>{note}</small><i>{answers.outputs.includes(title) ? "已选" : "最多选2项"}</i>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="question-panel">
              <p className="eyebrow coral">识别已经出现过的能力证据</p>
              <h1>哪些能力不是“你觉得有”，而是曾被需要过？</h1>
              <p className="question-note">至少选 3 项。想想：同学、老师、同事会因为什么来找你？你做过什么能说明它？</p>
              <div className="skill-cloud">
                {strengthOptions.map((item) => {
                  const selected = answers.strengths.includes(item);
                  return (
                    <button key={item} className={selected ? "selected" : ""} onClick={() => setAnswers({
                      ...answers,
                      strengths: toggleMulti(answers.strengths, item, 5)
                    })}>{selected ? "✓ " : "+ "}{item}</button>
                  );
                })}
              </div>
              <p className="selection-note">已选 {answers.strengths.length}/至少3项，最多5项</p>
            </div>
          )}

          {step === 4 && (
            <div className="question-panel">
              <p className="eyebrow coral">把自我判断落到真实经历</p>
              <h1>写一件你做过、愿意反复提起的事</h1>
              <p className="question-note">至少 20 字。写清你当时要解决什么、做了哪些动作、最后有什么结果；不需要写得像简历。</p>
              <label className="experience-field">
                <span>你的一个真实片段</span>
                <textarea value={answers.experience} onChange={(event) => setAnswers({ ...answers, experience: event.target.value })} placeholder="例如：为了提高社团活动报名率，我访谈了6位同学，重新梳理宣传内容并协调设计和运营，最终报名人数比上次更多……" maxLength={360} />
                <small>{answers.experience.length}/360</small>
              </label>
            </div>
          )}

          {step === 5 && (
            <div className="question-panel">
              <p className="eyebrow coral">匹配工作环境</p>
              <h1>什么样的工作方式，更接近你能长期坚持的状态？</h1>
              <p className="question-note">请选择 2 项。适合长期工作的环境，比短期的新鲜感更重要。</p>
              <div className="option-grid two-columns">
                {styleOptions.map(([title, note]) => (
                  <button key={title} className={`choice-card choice-with-note ${answers.styles.includes(title) ? "selected" : ""}`} onClick={() => setAnswers({ ...answers, styles: toggleMulti(answers.styles, title, 2) })}>
                    <span>{title}</span><small>{note}</small><i>{answers.styles.includes(title) ? "已选" : "最多选2项"}</i>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="question-panel">
              <p className="eyebrow coral">最后加入现实条件</p>
              <h1>你愿意优先探索哪些行业？又有哪些边界？</h1>
              <p className="question-note">行业至少选 1 项、最多 3 项。现实条件不会替你筛掉方向，而会成为后续比较岗位时要核对的标准。</p>
              <div className="selection-heading"><span>想优先了解的行业</span><small>{answers.industries.length}/1—3项</small></div>
              <div className="skill-cloud industry-choice-cloud">
                {industryOrder.filter((item) => item !== "全部").map((item) => {
                  const selected = answers.industries.includes(item);
                  return <button key={item} className={selected ? "selected" : ""} onClick={() => setAnswers({ ...answers, industries: toggleMulti(answers.industries, item, 3) })}>{selected ? "✓ " : "+ "}{item}</button>;
                })}
              </div>
              <div className="question-subgroup">
                <div className="selection-heading"><span>你此刻尤其在意的现实条件（可选，最多2项）</span><small>{answers.constraints.length}/2项</small></div>
                <div className="skill-cloud">
                  {constraintOptions.map((item) => {
                    const selected = answers.constraints.includes(item);
                    return <button key={item} className={selected ? "selected" : ""} onClick={() => setAnswers({ ...answers, constraints: toggleMulti(answers.constraints, item, 2) })}>{selected ? "✓ " : "+ "}{item}</button>;
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="assessment-actions">
            <button className="text-button" onClick={() => step === 0 ? setView("home") : setStep((current) => current - 1)}>← 上一步</button>
            <button className="primary-button" disabled={!canContinue} onClick={nextStep}>{step === 6 ? "生成我的探索坐标" : "继续"}<span>→</span></button>
          </div>
        </section>
      </main>
    );
  }

  if (view === "results") {
    const topThree = rankedRoles.slice(0, 3);
    return (
      <main className="results-page">
        <header className="compact-header results-header">
          <button className="brand-button" onClick={() => setView("home")} aria-label="返回首页"><span className="brand-mark">CA</span><span>职业坐标</span></button>
          <button className="outline-button" onClick={startAssessment}>重新诊断</button>
        </header>

        <section className="results-intro">
          <p className="eyebrow mint">你的职业坐标已生成</p>
          <h1>先探索这三个方向</h1>
          <p>这不是一份“你只能做什么”的结论。它把任务兴趣、想做出的成果、能力证据、工作方式、行业线索和真实经历放在一起，帮你缩小下一步值得验证的范围。</p>
          <div className="profile-chips">
            <span>{answers.stage}</span><span>{answers.interests.join(" / ")}</span><span>{answers.industries.slice(0, 2).join(" / ")}</span>
          </div>
          <div className="diagnosis-summary">
            <div><small>你此刻想解决</small><strong>{answers.intent}</strong></div>
            <div><small>已有能力线索</small><strong>{answers.strengths.slice(0, 4).join("、")}</strong></div>
            <div><small>需要继续核对</small><strong>{answers.constraints.length ? answers.constraints.join("、") : "真实岗位任务与进入门槛"}</strong></div>
          </div>
        </section>

        <section className="result-grid" aria-label="岗位推荐结果">
          {topThree.map(({ role, matchedStrengths, matchedInterests, matchedOutputs, matchedStyles, matchedIndustries, keywordHits, signalCount }, index) => (
            <article className={`result-card rank-${index + 1}`} key={role.slug}>
              <div className="rank-row"><span>探索优先级 {String(index + 1).padStart(2, "0")}</span><strong>{signalCount}/6<small> 类线索</small></strong></div>
              <p className="role-family">{role.family}</p>
              <h2>{role.name}</h2>
              <p className="role-purpose">{role.purpose}</p>
              <div className="why-box">
                <span>这条方向为什么值得你继续看</span>
                <p>{matchedStrengths.length ? `你已呈现出${matchedStrengths.slice(0, 2).join("、")}等能力线索；` : "它与你愿意投入的问题和工作产出存在交集；"}{matchedIndustries.length ? `同时落在你愿意探索的${matchedIndustries.slice(0, 2).join("、")}领域。` : "下一步需要用真实JD确认行业场景。"}</p>
                <div className="match-evidence"><i className={matchedInterests.length ? "hit" : ""}>任务兴趣</i><i className={matchedOutputs.length ? "hit" : ""}>工作产出</i><i className={matchedStrengths.length >= 2 ? "hit" : ""}>能力证据</i><i className={matchedStyles.length ? "hit" : ""}>工作方式</i><i className={matchedIndustries.length ? "hit" : ""}>行业线索</i><i className={keywordHits ? "hit" : ""}>经历关键词</i></div>
              </div>
              <div className="result-skills"><small>下一步重点验证</small><p>{role.coreSkills.slice(0, 3).join(" · ")}</p><small>进入方式：{role.entry}</small></div>
              <div className="tag-row">{role.industries.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>
              <button className="card-link" onClick={() => setSelectedRole(role)}>查看岗位全景 <span>↗</span></button>
            </article>
          ))}
        </section>

        <section className="next-step-card">
          <div><p className="eyebrow coral">诊断之后，才进入验证</p><h2>不要把推荐当答案，拿它去接触真实世界。</h2></div>
          <ol><li><b>读 10 份 JD</b><span>圈出重复任务、必备能力和自己愿意长期面对的部分</span></li><li><b>访谈 2 位从业者</b><span>核对实际节奏、进入路径、城市与成长空间</span></li><li><b>完成 1 个小项目</b><span>把今天选出的能力线索，变成一段可被岗位识别的证据</span></li></ol>
        </section>

        <p className="data-disclaimer">本结果是第一轮职业探索，不构成心理诊断、职业定论、录用或薪资承诺。岗位数据会随JD样本和从业者复核持续更新。</p>
        {selectedRole && <RoleDetail role={selectedRole} onClose={() => setSelectedRole(null)} />}
      </main>
    );
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top"><span className="brand-mark">CA</span><span>职业坐标<small>Career Atlas</small></span></a>
        <nav aria-label="主导航"><a href="#how">如何推荐</a><a href="#roles">岗位库</a><a href="#growth">成长路线</a><a href="#market">市场证据</a><a href="#data">数据方法</a></nav>
        <button className="header-action" onClick={startAssessment}>开始诊断 <span>→</span></button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="status-pill"><i /> 职业数据库持续更新中</div>
          <p className="hero-kicker">从“我能做什么”到“我该往哪里走”</p>
          <h1>别只找一份工作，<br />先找到你的<span>职业坐标。</span></h1>
          <p className="hero-lead">用一轮更完整的职业探索，梳理你愿意解决的问题、想做出的成果、能力证据、工作偏好与现实边界；再去验证值得探索的行业岗位。</p>
          <div className="hero-actions"><button className="primary-button large" onClick={startAssessment}>约8分钟开始探索 <span>→</span></button><a href="#roles">先浏览岗位库</a></div>
          <p className="privacy-note">无需注册 · 不上传也能体验 · 结果只保留在当前页面</p>
        </div>
        <div className="atlas-visual" aria-label="职业匹配示意图">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="axis-line horizontal" /><div className="axis-line vertical" />
          <span className="axis-label top">擅长</span><span className="axis-label right">市场需要</span><span className="axis-label bottom">长期价值</span><span className="axis-label left">真正喜欢</span>
          <div className="coordinate-card product"><small>匹配 91%</small><b>产品经理</b><span>问题定义 · 协作推进</span></div>
          <div className="coordinate-card data"><small>匹配 86%</small><b>数据分析师</b><span>逻辑 · 证据 · 洞察</span></div>
          <div className="coordinate-card research"><small>匹配 82%</small><b>用户研究员</b><span>访谈 · 分析 · 共情</span></div>
          <div className="coordinate-dot center"><span>你</span></div>
        </div>
      </section>

      <section className="trust-strip" id="stats">
        <div><strong>{catalogRoles.length}</strong><span>岗位目录</span></div><div><strong>{familyOrder.length - 1}</strong><span>岗位族</span></div><div><strong>{industryOrder.length - 1}</strong><span>行业方向</span></div><div><strong>{catalogSource}</strong><span>主数据来源</span></div>
      </section>

      <section className="how-section" id="how">
        <div className="section-heading"><p className="eyebrow mint">不是性格测试</p><h2>把模糊的“适合”，拆成可以验证的依据</h2><p>推荐结果来自兴趣、能力证据、工作环境偏好和现实约束，而不是一句笼统的性格标签。</p></div>
        <div className="method-grid">
          <article><span>01</span><h3>看见你的起点</h3><p>梳理经历、兴趣、优势和约束，识别已经拥有的可迁移能力。</p><i>个人诊断</i></article>
          <article><span>02</span><h3>缩小探索范围</h3><p>推荐行业内的岗位方向，不把你粗暴地推给某一家企业。</p><i>岗位匹配</i></article>
          <article><span>03</span><h3>看清进入路径</h3><p>对照JD要求、成长路线和薪资结构，形成下一步行动计划。</p><i>差距分析</i></article>
        </div>
      </section>

      <section className="roles-section" id="roles">
        <div className="section-heading split"><div><p className="eyebrow coral">{catalogRoles.length}个岗位 · {familyOrder.length - 1}个岗位族 · {industryOrder.length - 1}个行业</p><h2>先认识工作，再决定方向</h2></div><p>先按岗位族和行业缩小范围，再搜索岗位、技能或场景。最多选择3个方向并排比较。</p></div>
        <div className="library-tools">
          <label className="role-search"><span>⌕</span><input value={roleQuery} onChange={(event) => setRoleQuery(event.target.value)} placeholder="搜索岗位、技能或行业" aria-label="搜索岗位" />{roleQuery && <button onClick={() => setRoleQuery("")} aria-label="清空搜索">×</button>}</label>
          <span className="result-count">找到 {filteredRoles.length} 个岗位</span>
        </div>
        <div className="family-filters" aria-label="岗位族筛选">
          {familyOrder.map((family) => <button key={family} className={activeFamily === family ? "active" : ""} onClick={() => setActiveFamily(family)}>{family}</button>)}
        </div>
        <div className="industry-filter-heading"><span>行业方向</span><small>{activeIndustry === "全部" ? "全部行业" : activeIndustry}</small></div>
        <div className="family-filters industry-filters" aria-label="行业筛选">
          {industryOrder.map((industry) => <button key={industry} className={activeIndustry === industry ? "active" : ""} onClick={() => setActiveIndustry(industry)}>{industry}</button>)}
        </div>
        <div className="role-card-grid">
          {filteredRoles.map((role) => {
            const compared = compareSlugs.includes(role.slug);
            return (
              <article className="library-card" key={role.slug}>
                <div className="library-meta"><span>{role.family}</span><span>{getRoleIndustries(role)[0] ?? "跨行业"}</span><span>{role.seniority}</span>{marketEvidenceByRole.has(role.slug) && <span className="evidence-pilot">有市场证据</span>}<i className={`confidence-dot ${role.confidence === "中" ? "medium" : "low"}`} title={`${role.confidence}置信度`} /></div>
                <h3>{role.name}</h3><p className="english-name">{role.english}</p><p className="library-purpose">{role.purpose}</p>
                <div className="core-skill-row">{role.coreSkills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
                <div className="library-actions">
                  <button className="detail-link" onClick={() => setSelectedRole(role)}>岗位全景 <span>↗</span></button>
                  <button className={`compare-toggle ${compared ? "active" : ""}`} disabled={!compared && compareSlugs.length >= 3} onClick={() => toggleCompare(role.slug)} aria-pressed={compared}>{compared ? "✓ 已选择" : "+ 加入对比"}</button>
                </div>
              </article>
            );
          })}
        </div>
        {!filteredRoles.length && <div className="empty-library"><b>暂时没有匹配岗位</b><p>试试更短的关键词，或切换岗位族与行业筛选。</p><button onClick={() => { setRoleQuery(""); setActiveFamily("全部"); setActiveIndustry("全部"); }}>清除筛选</button></div>}
      </section>

      <section className="growth-section" id="growth">
        <div className="growth-intro"><p className="eyebrow mint">职业不是单行道</p><h2>同时看晋升，也看相邻转岗</h2><p>好的职业选择不只看第一份工作，还要看它能积累什么能力，以及下一步可以去哪里。</p></div>
        <div className="growth-lanes">
          <article><span>产品路线</span><div><b>产品助理</b><i>→</i><b>产品经理</b><i>→</i><b>产品负责人</b></div><p>从执行与文档，逐步升级到方向判断和资源配置。</p></article>
          <article><span>数据路线</span><div><b>数据分析师</b><i>→</i><b>高级分析师</b><i>→</i><b>分析负责人</b></div><p>从回答问题，升级到建立指标、影响决策和经营业务。</p></article>
          <article><span>技术路线</span><div><b>开发工程师</b><i>→</i><b>高级工程师</b><i>→</i><b>专家 / 管理</b></div><p>可以继续走技术深度，也可以转向架构或团队管理。</p></article>
          <article><span>跨职能路线</span><div><b>用户运营</b><i>→</i><b>产品经理</b><i>→</i><b>增长负责人</b></div><p>相邻岗位共享能力，转岗关键是补齐作品和结果证据。</p></article>
        </div>
      </section>

      <section className="market-section" id="market">
        <div className="section-heading split market-heading"><div><p className="eyebrow coral">市场证据试点 · 更新于 2026-07-22</p><h2>把JD共性和薪资样本分开看</h2></div><p>首批覆盖产品、数据、前端和后端。每条薪资都保留城市、年限、行业与合同口径；样本不足时，不给一个看似精确的平均数。</p></div>
        <div className="evidence-tabs" role="tablist" aria-label="选择岗位证据">
          {marketEvidence.map((item) => <button key={item.roleSlug} role="tab" aria-selected={activeEvidenceSlug === item.roleSlug} className={activeEvidenceSlug === item.roleSlug ? "active" : ""} onClick={() => setActiveEvidenceSlug(item.roleSlug)}>{item.roleName}<small>{item.sampleLabel}</small></button>)}
        </div>
        <div className="market-dashboard">
          <article className="jd-panel">
            <div className="panel-topline"><div><span>JD共性</span><h3>{activeEvidence.roleName}</h3></div><i>{activeEvidence.coverage}证据</i></div>
            <p className="coverage-note">{activeEvidence.summary}</p>
            <div className="signal-list">{activeEvidence.jdSignals.map((signal, index) => <div key={signal.label}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{signal.label}</b><p>{signal.note}</p></div></div>)}</div>
            <div className="jd-source-list"><span>本轮JD来源</span>{activeEvidence.jdSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a>)}</div>
          </article>
          <div className="salary-column">
            <div className="salary-column-heading"><div><span>公开薪资观察</span><h3>带上下文，不做伪平均</h3></div><small>{activeEvidence.salaryObservations.length} 条</small></div>
            {activeEvidence.salaryObservations.map((sample) => <article className="salary-sample" key={sample.sourceUrl}>
              <div className="sample-labels"><span>{sample.city}</span><span>{sample.level}</span><span>{sample.employment}</span></div>
              <h4>{sample.title}</h4><strong>{sample.annualRange}</strong><p className="sample-industry">{sample.industry}</p><p className="sample-caveat">{sample.caveat}</p>
              <a href={sample.sourceUrl} target="_blank" rel="noreferrer">查看原始招聘页 · {sample.sourceName} ↗</a>
            </article>)}
            <article className="salary-method-card"><span>薪资方法</span><h4>{salaryMethodology.title}</h4><p>{salaryMethodology.note}</p><div>{salaryMethodology.rules.map((rule) => <i key={rule}>✓ {rule}</i>)}</div><a href={salaryMethodology.sourceUrl} target="_blank" rel="noreferrer">{salaryMethodology.sourceName} ↗</a></article>
          </div>
        </div>
      </section>

      <section className="evidence-section" id="data">
        <div className="evidence-card"><p className="eyebrow ink">数据方法</p><h2>每个结论，都应该知道从哪里来</h2><p>官方分类建立底座，公开技能词表补充结构，JD样本反映市场要求，从业者访谈校准真实工作。Salaryfly等文章只作为研究线索，未经原始样本核验的数据不会直接成为薪资真值。</p><div className="source-tags"><span>职业分类大典</span><span>O*NET</span><span>ESCO</span><span>国家统计局</span><span>公开JD样本</span></div></div>
        <div className="confidence-legend"><h3>置信度不是装饰</h3><div><i className="high" /><span><b>高</b>官方来源或充分样本</span></div><div><i className="medium" /><span><b>中</b>有方法说明但样本有限</span></div><div><i className="low" /><span><b>低</b>编辑种子，等待验证</span></div></div>
      </section>

      <section className="final-cta"><p>你不需要现在就决定一辈子。</p><h2>先找到一个值得验证的方向。</h2><button className="primary-button light" onClick={startAssessment}>开始我的职业诊断 <span>→</span></button></section>

      <footer><a className="brand" href="#top"><span className="brand-mark">CA</span><span>职业坐标<small>Career Atlas</small></span></a><p>帮助每个人做更有依据的职业选择。</p><span>岗位库 v4 · {catalogRoles.length}个岗位 · {industryOrder.length - 1}个行业</span></footer>
      {selectedRole && <RoleDetail role={selectedRole} onClose={() => setSelectedRole(null)} />}
      {compareSlugs.length > 0 && !showComparison && <div className="compare-tray"><div><b>岗位对比</b>{comparedRoles.map((role) => <span key={role.slug}>{role.name}<button onClick={() => toggleCompare(role.slug)} aria-label={`移除${role.name}`}>×</button></span>)}</div><button className="primary-button" disabled={compareSlugs.length < 2} onClick={() => setShowComparison(true)}>对比 {compareSlugs.length} 个岗位</button></div>}
      {showComparison && <ComparisonPanel roles={comparedRoles} onClose={() => setShowComparison(false)} />}
    </main>
  );
}

function RoleDetail({ role, onClose }: { role: Role; onClose: () => void }) {
  const evidence = marketEvidenceByRole.get(role.slug);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="role-modal" role="dialog" aria-modal="true" aria-labelledby="role-detail-title">
        <button className="modal-close" onClick={onClose} aria-label="关闭岗位详情">×</button>
        <p className="eyebrow coral">{role.family} · {role.seniority}</p><h2 id="role-detail-title">{role.name}</h2><p className="modal-english">{role.english}</p><p className="modal-purpose">{role.purpose}</p>
        <div className="modal-section overview-grid"><div><span>典型入口</span><p>{role.entry}</p></div><div><span>工作环境</span><p>{role.workContext}</p></div></div>
        <div className="modal-section"><h3>你会交付什么</h3><ul>{role.outputs.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div className="modal-section"><h3>核心能力</h3><div className="salary-parts">{role.coreSkills.map((item) => <span key={item}>{item}</span>)}</div></div>
        <div className="modal-section"><h3>常见进入要求</h3><ul>{role.requirements.map((item) => <li key={item}>{item}</li>)}</ul><span className={`confidence-badge ${role.confidence === "中" ? "medium" : ""}`}>{role.confidence}置信度编辑内容 · 待JD样本与从业者复核</span></div>
        {evidence && <div className="modal-section modal-evidence"><div><h3>已有市场证据试点</h3><span>{evidence.sampleLabel}</span></div><p>{evidence.summary}</p><a href="#market" onClick={onClose}>查看JD共性和薪资观察 →</a></div>}
        <div className="modal-section"><h3>薪资通常由什么构成</h3><div className="salary-parts">{role.salary.map((item) => <span key={item}>{item}</span>)}</div><p className="modal-note">具体区间受城市、行业、经验和公司阶段影响；当前不展示未经验证的单一平均值。</p></div>
        <div className="modal-section"><h3>典型成长路线</h3><div className="growth-path">{role.growth.map((item, index) => <div key={item}><span>{index + 1}</span><b>{item}</b></div>)}</div></div>
        <div className="modal-section"><h3>相邻转岗方向</h3><div className="salary-parts">{role.adjacent.map((item) => <span key={item}>{item}</span>)}</div></div>
        <div className="modal-section"><h3>进入前可以补什么</h3><ul>{role.gaps.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <button className="primary-button modal-action" onClick={onClose}>收下这份岗位地图</button>
      </section>
    </div>
  );
}

function ComparisonPanel({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
  const rows = [
    ["核心目标", (role: Role) => role.purpose],
    ["核心能力", (role: Role) => role.coreSkills.slice(0, 4).join(" · ")],
    ["工作环境", (role: Role) => role.workContext],
    ["常见行业", (role: Role) => role.industries.join(" · ")],
    ["薪资组成", (role: Role) => role.salary.join(" · ")],
    ["下一步", (role: Role) => role.adjacent.join(" · ")]
  ] as const;
  return (
    <div className="comparison-backdrop" role="presentation">
      <section className="comparison-panel" role="dialog" aria-modal="true" aria-labelledby="comparison-title">
        <div className="comparison-heading"><div><p className="eyebrow coral">岗位对比</p><h2 id="comparison-title">把差异放在一张表里</h2><p>对比的目的不是选出“最好”，而是看清哪一种工作更适合你长期投入。</p></div><button className="modal-close static" onClick={onClose} aria-label="关闭岗位对比">×</button></div>
        <div className="comparison-table" style={{ "--role-count": roles.length } as CSSProperties}>
          <div className="comparison-corner">比较维度</div>{roles.map((role) => <div className="comparison-role" key={role.slug}><small>{role.family}</small><b>{role.name}</b><span>{role.english}</span></div>)}
          {rows.map(([label, render]) => <div className="comparison-row" key={label}><strong>{label}</strong>{roles.map((role) => <p key={role.slug}>{render(role)}</p>)}</div>)}
        </div>
        <div className="comparison-footer"><span>所有岗位内容均保留置信度和数据边界。</span><button className="primary-button" onClick={onClose}>完成对比</button></div>
      </section>
    </div>
  );
}

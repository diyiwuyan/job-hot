export type AutumnDimension = 'G' | 'M' | 'P' | 'S' | 'F';
export type AutumnResultKey = AutumnDimension | 'READY';
export type BasicKey = 'stage' | 'funnel' | 'applications';

export type BasicQuestion = {
  key: BasicKey;
  title: string;
  options: { value: string | number; label: string }[];
};

export type AutumnQuestion = {
  id: string;
  dimension: AutumnDimension;
  text: string;
};

export type AutumnResult = {
  type: string;
  title: string;
  description: string;
  pitfalls: string[];
  action: string;
  color: string;
  nextStep: { href: string; label: string; description: string };
};

export const BASIC_QUESTIONS: BasicQuestion[] = [
  {
    key: 'stage',
    title: '你目前主要处于哪个阶段？',
    options: [
      { value: '27届本科/硕士，准备秋招', label: '27届本科/硕士，准备秋招' },
      { value: '27届，同时准备考研/考公/留学', label: '27届，同时准备考研/考公/留学' },
      { value: '26届，仍在求职', label: '26届，仍在求职' },
      { value: '其他年级，提前了解', label: '其他年级，提前了解' },
      { value: '已工作，考虑新的职业机会', label: '已工作，考虑新的职业机会' },
    ],
  },
  {
    key: 'funnel',
    title: '这轮求职中，你目前走到最远的是哪一步？',
    options: [
      { value: 1, label: '还没有形成岗位清单' },
      { value: 2, label: '已整理岗位或材料，但还没真实投递' },
      { value: 3, label: '已经开始投递，正在等待反馈' },
      { value: 4, label: '已进入测评、笔试或作业环节' },
      { value: 5, label: '已进入面试、终面或录用沟通' },
    ],
  },
  {
    key: 'applications',
    title: '最近14天，你大约完成了多少次真实申请？',
    options: [
      { value: 0, label: '0次' },
      { value: 1, label: '1—3次' },
      { value: 2, label: '4—10次' },
      { value: 3, label: '11—20次' },
      { value: 4, label: '20次以上' },
    ],
  },
];

export const AUTUMN_DIMENSIONS: { key: AutumnDimension; name: string }[] = [
  { key: 'G', name: '目标聚焦' },
  { key: 'M', name: '证据与材料' },
  { key: 'P', name: '机会与投递' },
  { key: 'S', name: '笔面准备' },
  { key: 'F', name: '复盘与节奏' },
];

// 所有题目都按同一方向计分：分数越高，表示这个环节的阻塞越明显。
// 题目聚焦最近14天可观察的求职行为，不测人格，也不推断长期能力。
export const AUTUMN_QUESTIONS: AutumnQuestion[] = [
  { id: 'G01', dimension: 'G', text: '我还说不清主投岗位每天主要做什么、招聘时重点看什么。' },
  { id: 'G02', dimension: 'G', text: '我没有形成1—3个有优先级的主投与备选岗位方向。' },
  { id: 'G03', dimension: 'G', text: '每看到一个新行业或热门岗位，我都容易推翻原来的方向，却没有用真实岗位证据重新比较。' },

  { id: 'M01', dimension: 'M', text: '我很难把课程、社团、项目或实习写成清楚的任务、行动、方法和结果。' },
  { id: 'M02', dimension: 'M', text: '我通常用同一份简历投不同岗位，没有根据岗位要求调整证据重点。' },
  { id: 'M03', dimension: 'M', text: '针对目标岗位的核心能力，我还准备不出2—3段经得住追问的经历或作品证据。' },

  { id: 'P01', dimension: 'P', text: '我没有一张能看清岗位优先级、截止日期、投递状态和下一步的机会清单。' },
  { id: 'P02', dimension: 'P', text: '最近两周，我花在搜索、收藏和看攻略上的时间明显多于真实申请。' },
  { id: 'P03', dimension: 'P', text: '我没有形成每周相对稳定的岗位筛选、投递和跟进节奏。' },

  { id: 'S01', dimension: 'S', text: '我不清楚目标岗位通常会经过哪些测评、笔试、作业或面试环节。' },
  { id: 'S02', dimension: 'S', text: '面对“为什么投这个岗位”和简历关键经历的连续追问，我还难以给出具体、有证据的回答。' },
  { id: 'S03', dimension: 'S', text: '我还没有通过模拟练习、真题或真实面试反馈来检验自己的准备。' },

  { id: 'F01', dimension: 'F', text: '我没有固定复盘简历通过率、笔试面试进展以及各环节停滞原因。' },
  { id: 'F02', dimension: 'F', text: '遇到拒绝或长期没有反馈后，我往往会连续几天回避求职行动。' },
  { id: 'F03', dimension: 'F', text: '我的求职任务常常过大过散，很难确定未来72小时最该完成的一件事或向谁求助。' },
];

export const AUTUMN_RESULTS: Record<AutumnResultKey, AutumnResult> = {
  G: {
    type: '目标聚焦卡点',
    title: '你现在缺的不是更多岗位，而是一组可执行的选择边界',
    description: '你可能接触了不少行业和岗位，但还没有把兴趣、已有证据和现实机会收敛成主投与备选。方向不需要一次决定终身，但必须具体到可以研究、准备和投递。',
    pitfalls: ['把行业、公司和岗位混在同一层比较', '频繁追逐热门方向，却没有研究真实任务', '希望完全确定以后再开始积累反馈'],
    action: '从收藏中选择10个真实岗位，按“愿意投入、已有证据、现实可进入”各打1—5分，形成1个主投方向、1个备选方向和暂不考虑清单。',
    color: '#8b5cf6',
    nextStep: { href: '/tools/assessment/decision-difficulties', label: '继续做职业决策卡点诊断', description: '进一步区分是信息不足、选择方法、动力还是内外冲突让你难以收敛方向。' },
  },
  M: {
    type: '证据材料卡点',
    title: '不是经历不够多，而是岗位还看不见你的能力证据',
    description: '你的核心问题更可能出在经历转译与材料匹配：做过的事情没有被整理成清楚的任务、行动、方法和结果，也还没有根据目标岗位调整证据重点。',
    pitfalls: ['只写参与、协助、负责', '堆岗位关键词却没有事实支撑', '反复改措辞和排版，却没有补强证据'],
    action: '选一个目标岗位和一段最熟悉的经历，用“问题—行动—方法—结果—对应能力”重写，再检查它能否回答岗位的一项核心要求。',
    color: '#0ea5e9',
    nextStep: { href: '/tools/assessment/skills-map', label: '继续完成通用技能画像', description: '把能力水平和课程、项目、校园或实习证据放在一起盘点。' },
  },
  P: {
    type: '机会投递卡点',
    title: '你需要的不是继续收藏，而是一条可以持续运转的投递管道',
    description: '当前问题主要出在机会管理和真实行动：岗位没有被筛选、排序、记录和跟进，信息投入也还没有稳定转化成申请与反馈。',
    pitfalls: ['把收藏数量当成求职进度', '无差别海投或只投最理想岗位', '不记录截止日期、版本和进展状态'],
    action: '从已有信息中整理15个岗位，记录优先级、截止日期、匹配理由、材料版本、当前状态和下一步，并在72小时内完成优先级最高的一次申请。',
    color: '#14b8a6',
    nextStep: { href: '/all', label: '进入招聘机会库', description: '带着明确的筛选条件建立第一版真实岗位清单。' },
  },
  S: {
    type: '笔面准备卡点',
    title: '你已经接近真实筛选环节，现在要把准备变成可检验的表现',
    description: '你可能已经有方向和材料，但对目标岗位的筛选流程、常见任务和追问准备不足。这个环节需要练习、反馈和迭代，而不是只继续阅读攻略。',
    pitfalls: ['只背标准答案，没有准备个人证据', '只看面经，不进行限时练习', '每次失败后从头准备，没有沉淀题库和复盘'],
    action: '选一个高频问题或真实笔试任务，完成一次限时作答并录音或留档；根据内容结构、证据具体度和表达清晰度只改一个变量。',
    color: '#f59e0b',
    nextStep: { href: '/tools/exam', label: '进入笔试训练', description: '用真实练习检验准备程度，并把错题和反馈转成下一轮改进。' },
  },
  F: {
    type: '复盘节奏卡点',
    title: '问题不一定是努力不足，而是求职还没有形成反馈循环',
    description: '拒绝、沉默和不确定性可能正在打乱你的行动。现在要把求职从一组巨大任务，改造成“设定目标—采取行动—读取反馈—调整策略”的小循环。',
    pitfalls: ['只统计投递数量，不看各环节转化', '一次调整太多变量，无法判断什么有效', '受挫后独自硬扛，直到完全停摆'],
    action: '回看最近5次申请或求职动作，记录岗位匹配、材料版本、进展和停滞环节；只选择一个变量进入下一轮，并约一位可信的人进行15分钟复盘。',
    color: '#ef4444',
    nextStep: { href: '/tools/assessment/job-readiness', label: '继续完成求职行动准备度', description: '更完整地检查目标、岗位研究、材料、面试、投递和支持系统。' },
  },
  READY: {
    type: '行动循环已启动',
    title: '你已经进入真实求职循环，下一步是提高反馈质量',
    description: '你在五个环节都没有特别明显的单一卡点，并且已经开始真实申请。现在不需要回到起点反复做准备，而要利用投递、测评和面试反馈持续校准。',
    pitfalls: ['只追求投递数量，不区分岗位质量', '同时修改方向、简历和面试策略', '拿到进展后停止记录，无法复制有效动作'],
    action: '回看最近5次申请，记录岗位匹配、材料版本、进展和停滞环节；保留有效做法，只选择一个最值得优化的变量进入下一轮。',
    color: '#22c55e',
    nextStep: { href: '/all', label: '继续推进高优先级岗位', description: '保持真实行动，用新的岗位反馈验证并微调当前策略。' },
  },
};

export type AutumnCalculation = {
  scores: Record<AutumnDimension, number>;
  primary: AutumnResultKey;
  secondary: AutumnDimension | null;
  confidence: string;
};

export function calculateAutumnResult(
  answers: Record<string, number>,
  basics: Partial<Record<BasicKey, string | number>>,
): AutumnCalculation {
  const scores: Record<AutumnDimension, number> = { G: 0, M: 0, P: 0, S: 0, F: 0 };
  for (const question of AUTUMN_QUESTIONS) scores[question.dimension] += answers[question.id] ?? 0;

  const ranked = AUTUMN_DIMENSIONS
    .map(({ key }) => ({ key, score: scores[key] }))
    .sort((a, b) => b.score - a.score);
  const maxBlocker = ranked[0].score;
  const isReady = maxBlocker <= 7 && Number(basics.funnel ?? 0) >= 3 && Number(basics.applications ?? 0) >= 1;
  const primary: AutumnResultKey = isReady ? 'READY' : ranked[0].key;
  const secondary = !isReady && ranked[1].score >= 8 && ranked[0].score - ranked[1].score <= 2 ? ranked[1].key : null;

  let confidence = '当前最高优先级比较清晰';
  if (isReady) confidence = '五个环节暂时没有明显单一卡点';
  else if (maxBlocker <= 7 && Number(basics.funnel ?? 0) < 3) confidence = '自评卡点不高，但尚未进入真实投递，建议用一次行动校准';
  else if (secondary) confidence = '两个环节可能正在相互影响';

  return { scores, primary, secondary, confidence };
}

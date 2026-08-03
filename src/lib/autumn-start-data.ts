export type AutumnDimension = 'D' | 'E' | 'R' | 'A' | 'I' | 'T';
export type BasicKey = 'stage' | 'direction' | 'resume' | 'action';

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
  camp: string;
  color: string;
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
    key: 'direction',
    title: '你对当前主投方向的清晰程度？',
    options: [
      { value: 1, label: '完全没有方向' },
      { value: 2, label: '有很多想法，但没有优先级' },
      { value: 3, label: '有1—3个候选方向，仍在比较' },
      { value: 4, label: '已有主投和备选方向' },
      { value: 5, label: '方向明确，并已有实践或投递反馈' },
    ],
  },
  {
    key: 'resume',
    title: '你目前的简历状态？',
    options: [
      { value: 1, label: '还没有开始整理' },
      { value: 2, label: '有经历素材，但没有完整初稿' },
      { value: 3, label: '已有一版简历初稿' },
      { value: 4, label: '已针对不同方向准备版本' },
      { value: 5, label: '已根据真实投递反馈持续修改' },
    ],
  },
  {
    key: 'action',
    title: '你最近两周的求职行动状态？',
    options: [
      { value: 1, label: '基本没有开始' },
      { value: 2, label: '主要在收藏岗位和攻略' },
      { value: 3, label: '已建立岗位清单或开始准备材料' },
      { value: 4, label: '已经开始真实投递' },
      { value: 5, label: '已进入测评/笔试/面试并持续复盘' },
    ],
  },
];

export const AUTUMN_DIMENSIONS: { key: AutumnDimension; name: string }[] = [
  { key: 'D', name: '方向摇摆' },
  { key: 'E', name: '经历未转化' },
  { key: 'R', name: '简历失焦' },
  { key: 'A', name: '行动拖延' },
  { key: 'I', name: '信息过载' },
  { key: 'T', name: '目标冲刺' },
];

export const AUTUMN_QUESTIONS: AutumnQuestion[] = [
  { id: 'D01', dimension: 'D', text: '我看过不少岗位，但仍说不清自己的主投方向和备选方向。' },
  { id: 'D02', dimension: 'D', text: '每看到一个新行业或岗位，我都容易重新动摇。' },
  { id: 'D03', dimension: 'D', text: '我不清楚应该用哪些标准判断一个方向是否适合自己。' },
  { id: 'E01', dimension: 'E', text: '一想到写简历，我常觉得自己“没有什么值得写的经历”。' },
  { id: 'E02', dimension: 'E', text: '我能说出自己做过什么，但说不清具体动作、方法和结果。' },
  { id: 'E03', dimension: 'E', text: '我不知道课程、社团、项目或实习经历能证明哪些岗位能力。' },
  { id: 'R01', dimension: 'R', text: '我通常用同一份简历投不同岗位，只做很少调整。' },
  { id: 'R02', dimension: 'R', text: '我不清楚目标岗位最看重哪些经历、能力或关键词。' },
  { id: 'R03', dimension: 'R', text: '我改简历时更容易纠结排版和措辞，却不知道内容重点是否匹配岗位。' },
  { id: 'A01', dimension: 'A', text: '我常想等方向和简历更完善以后，再开始真实投递。' },
  { id: 'A02', dimension: 'A', text: '越担心投了没有结果，我越容易回避查看岗位或提交申请。' },
  { id: 'A03', dimension: 'A', text: '我制定过不少求职计划，但过去一周真正完成的动作很少。' },
  { id: 'I01', dimension: 'I', text: '我收藏了很多岗位和攻略，但没有形成可持续更新的机会清单。' },
  { id: 'I02', dimension: 'I', text: '面对大量信息，我很难判断什么重要、什么可以暂时放下。' },
  { id: 'I03', dimension: 'I', text: '我花在搜索和收藏上的时间，经常多于申请和复盘。' },
  { id: 'T01', dimension: 'T', text: '我已经有相对清楚的主投方向，并开始采取真实行动。' },
  { id: 'T02', dimension: 'T', text: '我已经有简历或投递记录，现在更需要高质量反馈和迭代。' },
  { id: 'T03', dimension: 'T', text: '我更需要提升投递、面试和复盘效率，而不是重新从零寻找方向。' },
];

export const AUTUMN_RESULTS: Record<AutumnDimension, AutumnResult> = {
  D: {
    type: '方向摇摆型',
    title: '不是选择太少，而是缺少一套筛选标准',
    description: '你可能看过不少行业和岗位，但每出现一个新选择，就容易重新动摇。现在最需要的不是寻找“唯一正确答案”，而是形成主投、备选与暂缓方向。',
    pitfalls: ['把所有感兴趣的岗位放在同一优先级', '希望一次选择就永久正确', '只看岗位名称，不研究真实任务和招聘要求'],
    action: '从收藏中选出10个真实岗位，分别按“愿意投入、已有证据、现实可进入”各打1—5分，先选出1个主投方向、1个备选方向和1个暂缓方向。',
    camp: '训练营中可继续完成优势筹码盘点、方向初筛和30天验证计划。',
    color: '#8b5cf6',
  },
  E: {
    type: '经历未转化型',
    title: '不是没有经历，而是经历还没有变成能力证据',
    description: '你可能做过课程、社团、项目、志愿活动或实习，但还没有把真实经历拆成岗位看得懂的动作、方法和结果。',
    pitfalls: ['只写“参与、协助、负责”', '用抽象品质代替真实证据', '因为没有大厂实习而忽略课程和项目'],
    action: '选一段最熟悉的经历，写下四句话：当时要解决什么问题、你具体做了什么、用了什么方法、留下了什么结果或反馈。',
    camp: '训练营中可继续完成优势筹码地图、方向连接和简历问题识别。',
    color: '#0ea5e9',
  },
  R: {
    type: '简历失焦型',
    title: '不是写得不够多，而是岗位看不见重点',
    description: '你可能已经有一份简历，但不同经历都挤在一起，目标岗位看不出与你的连接。现在要先理解岗位，再决定哪些证据应该被放大。',
    pitfalls: ['一份简历投所有岗位', '堆关键词却没有经历支撑', '反复改排版，没有检查岗位匹配'],
    action: '选一个真实目标岗位，圈出5个高频要求；再给每项要求匹配一段自己的经历证据，没有证据的地方先标为空缺。',
    camp: '训练营中可继续完成简历问题标签、优化优先级和岗位版本规划。',
    color: '#f59e0b',
  },
  A: {
    type: '行动拖延型',
    title: '你可能不是懒，而是在等待一个不会到来的完美状态',
    description: '担心选错、投了没结果或材料不够好，让你反复推迟真实行动。现在最重要的是定义“什么程度已经可以开始”。',
    pitfalls: ['把准备当成行动', '一次列出太多任务', '用自责催促自己，反而更难开始'],
    action: '设定一份申请的最低启动标准，选一个风险较低的真实岗位，在72小时内完成并提交一次申请，然后记录感受和结果。',
    camp: '训练营中可继续识别求职行动风格、拆小任务并建立连续反馈节奏。',
    color: '#ef4444',
  },
  I: {
    type: '信息过载型',
    title: '你缺的不是更多信息，而是一张自己的机会清单',
    description: '你可能收藏了很多岗位、群消息和攻略，但信息如果没有被筛选、排序并进入行动，就只会增加压力。',
    pitfalls: ['把收藏数量当成准备进度', '没有记录截止日期和投递状态', '频繁切换信息源，却没有固定复盘'],
    action: '暂停新增收藏24小时，从已有信息中整理15个岗位，只保留公司、岗位、地点、截止日期、匹配理由、下一步和投递状态。',
    camp: '训练营中可继续建立主投方向、机会池和未来30天投递节奏。',
    color: '#14b8a6',
  },
  T: {
    type: '目标冲刺型',
    title: '你已经开始了，接下来需要的是反馈和迭代',
    description: '你已经有相对清楚的方向和材料，也开始真实行动。现在要从投递、测评、笔面试和反馈中识别有效动作。',
    pitfalls: ['只看投递数量，不区分岗位质量', '没有记录版本和停滞环节', '每次面试都重新准备，没有沉淀复盘'],
    action: '回看最近5次申请或求职动作，记录岗位匹配、简历版本、是否有反馈和停滞环节，只选择一个变量进入下一轮测试。',
    camp: '若仍需把复盘机制和30天计划做扎实，适合训练营；若能稳定执行，可考虑专项支持。',
    color: '#22c55e',
  },
};

export type AutumnCalculation = {
  scores: Record<AutumnDimension, number>;
  primary: AutumnDimension;
  secondary: AutumnDimension | null;
  confidence: string;
};

export function calculateAutumnResult(
  answers: Record<string, number>,
  basics: Partial<Record<BasicKey, string | number>>,
): AutumnCalculation {
  const scores: Record<AutumnDimension, number> = { D: 0, E: 0, R: 0, A: 0, I: 0, T: 0 };
  for (const question of AUTUMN_QUESTIONS) {
    scores[question.dimension] += answers[question.id] ?? 0;
  }

  const blockerKeys: AutumnDimension[] = ['D', 'E', 'R', 'A', 'I'];
  const maxBlocker = Math.max(...blockerKeys.map((key) => scores[key]));
  const isSprint =
    scores.T >= 12 &&
    Number(basics.direction ?? 0) >= 4 &&
    Number(basics.resume ?? 0) >= 3 &&
    Number(basics.action ?? 0) >= 4 &&
    maxBlocker <= 11;

  const ranked = blockerKeys
    .map((key) => ({ key, score: scores[key] }))
    .sort((a, b) => b.score - a.score);
  const primary: AutumnDimension = isSprint ? 'T' : ranked[0].key;
  const secondary = !isSprint && ranked[0].score - ranked[1].score <= 2 ? ranked[1].key : null;

  let confidence = '当前主卡点比较清晰';
  if (!isSprint && maxBlocker <= 8) confidence = '当前没有特别突出的单一卡点，建议结合真实行动继续观察';
  else if (secondary) confidence = '你可能同时存在两个相互影响的卡点';

  return { scores, primary, secondary, confidence };
}


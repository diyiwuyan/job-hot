export type ValueKey = 'growth' | 'autonomy' | 'stability' | 'impact' | 'connection' | 'balance';

export type ValueInfo = {
  key: ValueKey;
  name: string;
  color: string;
  summary: string;
  signals: string;
  jobQuestions: string[];
  conditions: string[];
  watchout: string;
};

export const VALUE_ORDER: ValueKey[] = ['growth', 'autonomy', 'stability', 'impact', 'connection', 'balance'];

export const VALUE_INFO: Record<ValueKey, ValueInfo> = {
  growth: { key: 'growth', name: '成长与学习', color: '#2563eb', summary: '你会在持续学习、能力升级和解决更难问题中获得投入感。', signals: '有反馈、有挑战、能接触新方法或更强的同伴。', jobQuestions: ['新人前三个月会参与什么任务？', '这个岗位的学习与反馈机制是什么？'], conditions: ['有明确成长曲线', '能接触复杂问题或新技能'], watchout: '别只因“能学东西”忽略带教、工作边界和实际任务质量。' },
  autonomy: { key: 'autonomy', name: '自主与掌控', color: '#7c3aed', summary: '你更在意自己能否理解目标、安排节奏，并对结果拥有真实的影响力。', signals: '目标清楚、方法可协商、能独立负责一部分成果。', jobQuestions: ['目标如何确定，过程里有多少自主空间？', '我能独立负责哪一块结果？'], conditions: ['目标清晰而非事无巨细', '授权与责任相匹配'], watchout: '自主不是“没人管”；新人阶段仍需要必要的协作与校准。' },
  stability: { key: 'stability', name: '稳定与保障', color: '#059669', summary: '你希望工作有清晰预期、相对可靠的规则与收入保障，能让生活安排更可控。', signals: '组织规则清楚、业务基本面稳、薪酬与发展机制可理解。', jobQuestions: ['试用期、绩效和薪酬构成如何说明？', '团队近一年的人员与业务变化大吗？'], conditions: ['制度透明', '节奏和风险可预期'], watchout: '稳定是风险管理，不等于岗位不会变化；仍要看能力是否能积累。' },
  impact: { key: 'impact', name: '影响与成就', color: '#dc2626', summary: '你更容易被看得见的目标、成果和影响他人的机会驱动。', signals: '成果可衡量、能推动项目、努力与结果之间有连接。', jobQuestions: ['这个岗位用什么指标判断做好了？', '新人能在哪些项目里看到自己的贡献？'], conditions: ['成果可见', '有承担与推动空间'], watchout: '不要只追逐头衔或光环；先确认成果归因和可获得的资源。' },
  connection: { key: 'connection', name: '关系与贡献', color: '#db2777', summary: '你重视合作氛围、被信任的感受，以及工作能否对他人或团队产生积极意义。', signals: '协作方式健康、沟通直接、服务对象与工作意义可感知。', jobQuestions: ['团队通常如何协作和反馈？', '这个岗位服务的对象是谁，最重要的价值是什么？'], conditions: ['可获得支持与连接', '工作对象和意义较清楚'], watchout: '氛围好不等于没有压力；也要确认职责、回报和成长空间。' },
  balance: { key: 'balance', name: '生活边界与平衡', color: '#ea580c', summary: '你会把可持续的工作节奏、身心状态和个人生活的留白放在重要位置。', signals: '节奏可预期、加班与出差边界明确、休息能被尊重。', jobQuestions: ['业务高峰期和日常节奏分别怎样？', '加班、出差和调休通常如何安排？'], conditions: ['节奏可持续', '边界和补偿机制清楚'], watchout: '平衡并非没有高峰期；关键是高峰是否有边界、是否长期化。' },
};

export type ValuesQuestion = { id: number; key: ValueKey; text: string };

export const VALUES_QUESTIONS: ValuesQuestion[] = [
  { id: 1, key: 'growth', text: '即使任务有难度，我也愿意为了掌握新能力持续投入。' },
  { id: 2, key: 'growth', text: '我会特别留意一份工作能让我积累什么可迁移的能力。' },
  { id: 3, key: 'growth', text: '有高质量反馈和带教，会显著提升我对工作的期待。' },
  { id: 4, key: 'growth', text: '我希望一年后能清楚说出自己比现在强在哪里。' },
  { id: 5, key: 'growth', text: '重复做熟悉的事很久，会让我缺少投入感。' },
  { id: 6, key: 'autonomy', text: '当目标明确时，我希望能自己决定完成任务的大部分方法。' },
  { id: 7, key: 'autonomy', text: '我在能独立负责一块结果的工作中更有动力。' },
  { id: 8, key: 'autonomy', text: '我会在意自己的建议能否被认真讨论和采纳。' },
  { id: 9, key: 'autonomy', text: '过度细碎的指令会明显消耗我的工作热情。' },
  { id: 10, key: 'autonomy', text: '我希望对自己的时间和优先级有一定安排空间。' },
  { id: 11, key: 'stability', text: '我会把收入、制度和业务的可靠性作为求职的重要条件。' },
  { id: 12, key: 'stability', text: '我更安心于职责、考核和发展路径比较清楚的岗位。' },
  { id: 13, key: 'stability', text: '我会优先评估一份工作是否能支持我稳定地安排生活。' },
  { id: 14, key: 'stability', text: '面对选择时，我倾向于先了解风险和最坏情况。' },
  { id: 15, key: 'stability', text: '频繁、不可预测的变化会让我很难长期投入。' },
  { id: 16, key: 'impact', text: '我希望自己的工作成果能被看见，并对结果产生影响。' },
  { id: 17, key: 'impact', text: '能推动一件事从想法走到落地，会让我很有成就感。' },
  { id: 18, key: 'impact', text: '我愿意承担有挑战的目标，并为结果负责。' },
  { id: 19, key: 'impact', text: '我会在意这份工作是否让我拥有更大的影响范围。' },
  { id: 20, key: 'impact', text: '当努力和成果之间的连接清楚时，我会更愿意投入。' },
  { id: 21, key: 'connection', text: '我很在意团队是否愿意互相支持、坦诚协作。' },
  { id: 22, key: 'connection', text: '帮助同事、客户或服务对象解决问题，会让我感到有意义。' },
  { id: 23, key: 'connection', text: '我更愿意在尊重差异、沟通直接的环境里工作。' },
  { id: 24, key: 'connection', text: '我希望自己的工作能对他人或社会产生一点积极作用。' },
  { id: 25, key: 'connection', text: '缺少信任和合作感，会显著降低我留下来的意愿。' },
  { id: 26, key: 'balance', text: '我会认真考虑一份工作是否能长期维持健康的节奏。' },
  { id: 27, key: 'balance', text: '我希望工作之外仍能留出稳定的休息和个人生活。' },
  { id: 28, key: 'balance', text: '我会在意加班、出差等安排是否透明且有合理边界。' },
  { id: 29, key: 'balance', text: '短期冲刺可以接受，但我不愿把透支当作常态。' },
  { id: 30, key: 'balance', text: '我希望工作节奏能让我持续保持专注和精力。' },
];

export const VALUES_SCALE = [
  { value: 1, label: '很不符合' },
  { value: 2, label: '比较不符合' },
  { value: 3, label: '一般' },
  { value: 4, label: '比较符合' },
  { value: 5, label: '非常符合' },
];

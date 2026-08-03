/** 求职底牌自测表 - 数据定义 */

export type CardType = 'buffer' | 'info' | 'trial' | 'family';

export interface Question {
  id: number;
  type: CardType;
  text: string;
}

export interface CardInfo {
  type: CardType;
  name: string;
  emoji: string;
  description: string;
  action: string;
  questions: [number, number, number]; // 题号范围 (0-indexed)
}

export const CARDS: CardInfo[] = [
  {
    type: 'buffer',
    name: '缓冲地带',
    emoji: '🛡️',
    description: '你遇到挫折时，有没有人能帮你兜底？',
    action: '列出3位你愿意求助的人，今天先联系其中1位，具体询问一个方向、简历或投递问题。',
    questions: [0, 1, 2],
  },
  {
    type: 'info',
    name: '信息密度',
    emoji: '📡',
    description: '你知道"该查什么"吗？还是连关键词都不知道？',
    action: '选一个目标岗位，找到3份真实JD，记录反复出现的工作任务和能力要求。',
    questions: [3, 4, 5],
  },
  {
    type: 'trial',
    name: '试错能力',
    emoji: '🧪',
    description: '你敢不敢用低成本去试方向？还是总想一次做对？',
    action: '为一个感兴趣但不确定的方向设计一次低成本尝试：做任务样例、访谈从业者或参加一次真实项目。',
    questions: [6, 7, 8],
  },
  {
    type: 'family',
    name: '家庭期待管理',
    emoji: '🏠',
    description: '你能在父母的声音里，守住自己的判断吗？',
    action: '写一页选择备忘录：我在考虑什么、依据是什么、最小试错成本是什么，再选择一个合适时间沟通。',
    questions: [9, 10, 11],
  },
];

export const QUESTIONS: Question[] = [
  // 缓冲地带 1-3
  { id: 0, type: 'buffer', text: '在做职业方向选择时，我身边至少有一个能给我靠谱建议的人可以随时问。' },
  { id: 1, type: 'buffer', text: '如果我现在连续投简历没有回音，我知道该找谁帮我分析问题出在哪。' },
  { id: 2, type: 'buffer', text: '我认识至少一个在我目标行业里实际工作的人，并且跟 TA 有过交流。' },
  // 信息密度 4-6
  { id: 3, type: 'info', text: '我能说出我想去的行业里，至少 3 个岗位的日常实际工作内容（不是百度百科那种描述）。' },
  { id: 4, type: 'info', text: '我知道"秋招提前批""正式秋招""春招"分别什么时候开始，以及它们之间的节奏关系。' },
  { id: 5, type: 'info', text: '除了 BOSS 直聘和智联招聘，我还知道至少 2 个其他找实习/找工作的有效渠道。' },
  // 试错能力 7-9
  { id: 6, type: 'trial', text: '大学期间，我主动尝试过至少 2 个不同方向的实习、项目或实践（不一定有工资，但让我实际了解了那个方向）。' },
  { id: 7, type: 'trial', text: '当我对一个方向感兴趣但不确定时，我的第一反应通常是"先花点时间试试看"，而不是"万一不适合就浪费了"。' },
  { id: 8, type: 'trial', text: '我在过去一年里，主动学过一门跟我本专业课程无关的新东西（网课、工具、技能都可以）。' },
  // 家庭期待管理 10-12
  { id: 9, type: 'family', text: '在职业选择这件事上，我和父母的看法基本一致，或者即使不一致，我也能平和沟通。' },
  { id: 10, type: 'family', text: '如果父母强烈反对我的职业选择，我仍然有信心坚持自己的判断并执行下去。' },
  { id: 11, type: 'family', text: '除了父母，我身边有其他能在我做出重要职业决定时给我支持的人。' },
];

export type DiagLevel = 'critical' | 'moderate' | 'solid';

export interface DiagResult {
  level: DiagLevel;
  emoji: string;
  label: string;
  advice: string;
}

export function getDiagForScore(score: number): DiagResult {
  if (score <= 5) {
    return {
      level: 'critical',
      emoji: '🔵',
      label: '当前优先补牌',
      advice: '这张牌当前资源偏少，先完成一个最小动作',
    };
  }
  if (score <= 10) {
    return {
      level: 'moderate',
      emoji: '🟡',
      label: '有基础待稳定',
      advice: '已经有一些基础，再主动做一两个动作会更稳',
    };
  }
  return {
    level: 'solid',
    emoji: '🟢',
    label: '比较扎实',
      advice: '这是你当前的支持资源，可以继续保持和使用',
  };
}

export interface ProfileResult {
  name: string;
  description: string;
  suggestion: string;
}

export function getProfile(scores: Record<CardType, number>): ProfileResult | null {
  const { buffer, info, trial, family } = scores;

  // 画像2：裸奔型（同时满足两个条件，优先级最高）
  if (buffer <= 5 && info <= 5) {
    return {
      name: '资源起步型',
      description: '当前既缺少可以请教的人，也缺少稳定的信息来源。',
      suggestion: '先不要急着海投，同时补一个支持者和一个可靠信息源，把求职从独自摸索变成可验证的行动。',
    };
  }

  // 画像3：孤军奋战型
  if (family <= 5 && buffer <= 5) {
    return {
      name: '支持待建立型',
      description: '家庭沟通和外部支持都比较有限，很多压力只能自己承担。',
      suggestion: '先找到一位可以讨论真实问题的同伴、老师或从业者，重要决定不必只靠一个人反复内耗。',
    };
  }

  // 画像1：信息孤岛型
  if (info <= 5 && buffer > 5 && trial > 5 && family > 5) {
    return {
      name: '信息待补型',
      description: '你不是不努力，是不知道要查什么。',
      suggestion: '最紧急的是补信息源——关注行业公众号、加入求职群、找学长聊天。',
    };
  }

  // 画像4：就差临门一脚型
  const allScores = [buffer, info, trial, family];
  const above5 = allScores.filter((s) => s > 5 && s <= 10);
  const below6 = allScores.filter((s) => s <= 5);
  if (below6.length === 1 && above5.length >= 2) {
    return {
      name: '重点补一张牌型',
      description: '你已经有一些积累，目前有一张牌更值得优先补。',
      suggestion: '补上最弱的那张牌，就能拉开差距。集中精力解决那一个短板。',
    };
  }

  return {
    name: '底牌基础型',
    description: '四张牌目前没有特别突出的单一短板，但仍需要结合真实求职行动持续验证。',
    suggestion: '选出得分最低的一张牌，先完成一个最小补牌动作；不要把一次自测当成对自己的固定结论。',
  };
}

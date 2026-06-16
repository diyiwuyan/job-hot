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
  questions: [number, number, number]; // 题号范围 (0-indexed)
}

export const CARDS: CardInfo[] = [
  {
    type: 'buffer',
    name: '缓冲地带',
    emoji: '🛡️',
    description: '你遇到挫折时，有没有人能帮你兜底？',
    questions: [0, 1, 2],
  },
  {
    type: 'info',
    name: '信息密度',
    emoji: '📡',
    description: '你知道"该查什么"吗？还是连关键词都不知道？',
    questions: [3, 4, 5],
  },
  {
    type: 'trial',
    name: '试错能力',
    emoji: '🧪',
    description: '你敢不敢用低成本去试方向？还是总想一次做对？',
    questions: [6, 7, 8],
  },
  {
    type: 'family',
    name: '家庭期待管理',
    emoji: '🏠',
    description: '你能在父母的声音里，守住自己的判断吗？',
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
      emoji: '🔴',
      label: '严重缺失',
      advice: '这张牌是你的最大短板，毕业前必须补',
    };
  }
  if (score <= 10) {
    return {
      level: 'moderate',
      emoji: '🟡',
      label: '有基础但不稳',
      advice: '方向对了，再主动做一两个动作就能拉上来',
    };
  }
  return {
    level: 'solid',
    emoji: '🟢',
    label: '比较扎实',
    advice: '继续保持，别掉以轻心',
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
      name: '裸奔型',
      description: '既没人兜底，也没信息。',
      suggestion: '毕业前最容易踩坑的就是你。建议同时补「人脉」和「信息源」，先从一个靠谱的求职社群开始。',
    };
  }

  // 画像3：孤军奋战型
  if (family <= 5 && buffer <= 5) {
    return {
      name: '孤军奋战型',
      description: '家里不支持，外面又没人帮你。',
      suggestion: '最容易内耗，也最容易放弃。先找到一个支持你的同伴或导师，哪怕只是线上的。',
    };
  }

  // 画像1：信息孤岛型
  if (info <= 5 && buffer > 5 && trial > 5 && family > 5) {
    return {
      name: '信息孤岛型',
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
      name: '就差临门一脚型',
      description: '你其实已经有积累，就差最后一张牌没攒齐。',
      suggestion: '补上最弱的那张牌，就能拉开差距。集中精力解决那一个短板。',
    };
  }

  return null;
}

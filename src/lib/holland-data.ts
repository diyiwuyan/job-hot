// 霍兰德职业兴趣测试（RIASEC）数据
// 六个维度：R 现实型 / I 研究型 / A 艺术型 / S 社会型 / E 企业型 / C 常规型

export type HollandType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface HollandQuestion {
  id: number;
  type: HollandType;
  text: string;
}

export interface HollandTypeInfo {
  type: HollandType;
  name: string;
  alias: string;
  color: string;
  summary: string;
  traits: string[];
  careers: string[];
  majors: string[];
}

export const TYPE_INFO: Record<HollandType, HollandTypeInfo> = {
  R: {
    type: 'R',
    name: '现实型',
    alias: 'Realistic · 实干家',
    color: '#2f855a',
    summary: '喜欢动手操作、与工具机械或自然打交道，务实、踏实、注重结果，不爱抽象理论和过多社交。',
    traits: ['动手能力强', '务实稳重', '喜欢户外或机械', '逻辑清晰', '不善言辞但靠谱'],
    careers: ['工程师', '机械/电气技术员', '建筑施工', '运维/网络工程师', '农林牧渔', '飞行员/驾驶员', '制造业岗位'],
    majors: ['机械工程', '土木工程', '电气工程', '自动化', '农学', '车辆工程'],
  },
  I: {
    type: 'I',
    name: '研究型',
    alias: 'Investigative · 思考者',
    color: '#2b6cb0',
    summary: '喜欢观察、分析、探究事物原理，好奇心强、独立思考，享受解决复杂问题，偏好理性和数据。',
    traits: ['爱钻研', '逻辑分析强', '独立', '好奇心旺盛', '追求精确'],
    careers: ['科研人员', '数据分析师', '算法/AI 工程师', '医生', '高校教师', '产品研究', '咨询分析师'],
    majors: ['计算机', '数学', '物理', '生物', '医学', '统计学', '经济学'],
  },
  A: {
    type: 'A',
    name: '艺术型',
    alias: 'Artistic · 创造者',
    color: '#b7791f',
    summary: '富有想象力和审美，喜欢自由表达与创作，不喜欢循规蹈矩，重视个性和情感表达。',
    traits: ['想象力丰富', '审美敏锐', '追求个性', '情感细腻', '厌恶束缚'],
    careers: ['设计师（UI/平面/工业）', '内容创作/编辑', '广告创意', '影视/动画', '音乐/表演', '建筑设计', '品牌策划'],
    majors: ['设计学', '美术', 'music/表演', '广告学', '新闻传播', '建筑学', '数字媒体'],
  },
  S: {
    type: 'S',
    name: '社会型',
    alias: 'Social · 助人者',
    color: '#c53030',
    summary: '热心、善于沟通与共情，喜欢帮助、教导、服务他人，重视人际关系与团队协作。',
    traits: ['善于沟通', '富有同理心', '乐于助人', '团队意识强', '有亲和力'],
    careers: ['教师', 'HR/招聘', '心理咨询', '社工/公益', '医护', '培训师', '客户成功/运营'],
    majors: ['教育学', '心理学', '社会工作', '护理', '人力资源管理', '汉语言/师范'],
  },
  E: {
    type: 'E',
    name: '企业型',
    alias: 'Enterprising · 影响者',
    color: '#6b46c1',
    summary: '有领导欲和说服力，喜欢组织、管理、影响他人，目标导向、敢于冒险，擅长抓住机会。',
    traits: ['有领导力', '善于说服', '目标导向', '敢冒险', '精力充沛'],
    careers: ['销售/商务', '市场营销', '管理/创业', '产品经理', '投资/金融', '公关', '项目管理'],
    majors: ['工商管理', '市场营销', '金融', '国际贸易', '法学', '管理科学'],
  },
  C: {
    type: 'C',
    name: '常规型',
    alias: 'Conventional · 组织者',
    color: '#4a5568',
    summary: '细心、有条理、责任心强，喜欢按规则和流程处理事务，擅长数据、文书和系统化工作。',
    traits: ['细致严谨', '有条理', '责任心强', '遵守规则', '执行力高'],
    careers: ['会计/审计', '财务', '行政/文秘', '银行业务', '数据录入/管理', '公务员', '法务专员'],
    majors: ['会计学', '财务管理', '审计', '行政管理', '信息管理', '统计'],
  },
};

export const TYPE_ORDER: HollandType[] = ['R', 'I', 'A', 'S', 'E', 'C'];

// 每个维度 8 题，共 48 题
export const QUESTIONS: HollandQuestion[] = [
  // R 现实型
  { id: 1, type: 'R', text: '我喜欢动手组装、修理或制作东西' },
  { id: 2, type: 'R', text: '比起坐在办公室，我更喜欢户外或操作设备的工作' },
  { id: 3, type: 'R', text: '我对机械、工具或电子设备很感兴趣' },
  { id: 4, type: 'R', text: '我愿意学习驾驶、操作机器等实操技能' },
  { id: 5, type: 'R', text: '我喜欢能看到具体成果的体力或技术性工作' },
  { id: 6, type: 'R', text: '我做事踏实，更相信亲手验证而非空谈' },
  { id: 7, type: 'R', text: '我对运动、园艺、手工等活动有兴趣' },
  { id: 8, type: 'R', text: '我更愿意解决实际问题而不是抽象理论' },

  // I 研究型
  { id: 9, type: 'I', text: '我喜欢钻研问题、弄清楚事物背后的原理' },
  { id: 10, type: 'I', text: '我享受做实验、分析数据或调查研究' },
  { id: 11, type: 'I', text: '我对科学、数学或技术原理充满好奇' },
  { id: 12, type: 'I', text: '遇到难题时我愿意花很多时间独立思考' },
  { id: 13, type: 'I', text: '我喜欢阅读专业书籍、论文或研究报告' },
  { id: 14, type: 'I', text: '我倾向于用逻辑和证据来做判断' },
  { id: 15, type: 'I', text: '我喜欢探索新知识，哪怕短期没有实用价值' },
  { id: 16, type: 'I', text: '我擅长把复杂问题拆解分析' },

  // A 艺术型
  { id: 17, type: 'A', text: '我喜欢绘画、写作、音乐或其他创作活动' },
  { id: 18, type: 'A', text: '我有较强的想象力和审美能力' },
  { id: 19, type: 'A', text: '我不喜欢被固定的规则和流程束缚' },
  { id: 20, type: 'A', text: '我喜欢表达自己独特的想法和风格' },
  { id: 21, type: 'A', text: '我对设计、艺术、影视等领域很感兴趣' },
  { id: 22, type: 'A', text: '我享受自由发挥、富有创造性的工作' },
  { id: 23, type: 'A', text: '我比较情感丰富、感受敏锐' },
  { id: 24, type: 'A', text: '我喜欢欣赏并创造美的事物' },

  // S 社会型
  { id: 25, type: 'S', text: '我喜欢帮助别人解决问题或困难' },
  { id: 26, type: 'S', text: '我擅长与人沟通、能体会他人的感受' },
  { id: 27, type: 'S', text: '我喜欢教别人、分享知识或经验' },
  { id: 28, type: 'S', text: '在团队中我乐于协调和照顾他人' },
  { id: 29, type: 'S', text: '我愿意从事服务、关怀他人的工作' },
  { id: 30, type: 'S', text: '别人遇到烦恼时常会找我倾诉' },
  { id: 31, type: 'S', text: '我重视人际关系和团队氛围' },
  { id: 32, type: 'S', text: '帮助他人成长会让我很有成就感' },

  // E 企业型
  { id: 33, type: 'E', text: '我喜欢带领团队、组织活动或项目' },
  { id: 34, type: 'E', text: '我善于说服别人、推销想法或产品' },
  { id: 35, type: 'E', text: '我有明确的目标，并愿意为之拼搏' },
  { id: 36, type: 'E', text: '我喜欢竞争，也敢于承担风险' },
  { id: 37, type: 'E', text: '我希望未来能担任管理或领导角色' },
  { id: 38, type: 'E', text: '我对创业、做生意或商业机会感兴趣' },
  { id: 39, type: 'E', text: '我精力充沛，喜欢主导和影响局面' },
  { id: 40, type: 'E', text: '我擅长在人群中表达观点、争取支持' },

  // C 常规型
  { id: 41, type: 'C', text: '我做事细致、有条理，喜欢按计划进行' },
  { id: 42, type: 'C', text: '我喜欢整理数据、文档或账目' },
  { id: 43, type: 'C', text: '我能严格遵守规则和流程' },
  { id: 44, type: 'C', text: '我做事认真负责，注重细节和准确' },
  { id: 45, type: 'C', text: '我喜欢结构清晰、安排明确的工作' },
  { id: 46, type: 'C', text: '我擅长处理重复性、需要耐心的事务' },
  { id: 47, type: 'C', text: '我倾向于稳定、可预期的工作环境' },
  { id: 48, type: 'C', text: '我会把东西分类归档、保持井井有条' },
];

// 5 级李克特量表
export const SCALE_OPTIONS = [
  { value: 1, label: '很不符合' },
  { value: 2, label: '比较不符合' },
  { value: 3, label: '一般' },
  { value: 4, label: '比较符合' },
  { value: 5, label: '非常符合' },
];

// 霍兰德职业兴趣测试（RIASEC）数据
// 六个维度：R 现实型 / I 研究型 / A 艺术型 / S 社会型 / E 企业型 / C 常规型

export type HollandType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type HollandFacet = 'interest' | 'ability' | 'feedback';

export interface HollandQuestion {
  id: number;
  type: HollandType;
  facet: HollandFacet;
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
  activities: string[];
  majors: string[];
  workSignals: string;
  verifyQuestion: string;
  reminder: string;
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
    activities: ['动手制作或调试设备', '解决现场与实操问题', '把方案变成可见成果'],
    majors: ['机械工程', '土木工程', '电气工程', '自动化', '农学', '车辆工程'],
    workSignals: '能动手解决真实问题、成果可见、设备或现场反馈及时。',
    verifyQuestion: '这个岗位日常有多少时间在操作、调试、现场解决问题？',
    reminder: '喜欢动手不等于只适合技术岗，还要结合能力基础与岗位训练方式。',
  },
  I: {
    type: 'I',
    name: '研究型',
    alias: 'Investigative · 思考者',
    color: '#2b6cb0',
    summary: '喜欢观察、分析、探究事物原理，好奇心强、独立思考，享受解决复杂问题，偏好理性和数据。',
    traits: ['爱钻研', '逻辑分析强', '独立', '好奇心旺盛', '追求精确'],
    careers: ['科研人员', '数据分析师', '算法/AI 工程师', '医生', '高校教师', '产品研究', '咨询分析师'],
    activities: ['分析数据与证据', '拆解复杂问题', '研究原理并验证假设'],
    majors: ['计算机', '数学', '物理', '生物', '医学', '统计学', '经济学'],
    workSignals: '问题有挑战、可以分析证据、允许深入拆解和持续学习。',
    verifyQuestion: '这个岗位需要解决的核心问题是什么，分析和研究占多大比重？',
    reminder: '喜欢研究不代表只适合学术路径，业务分析、产品研究同样需要这类倾向。',
  },
  A: {
    type: 'A',
    name: '艺术型',
    alias: 'Artistic · 创造者',
    color: '#b7791f',
    summary: '富有想象力和审美，喜欢自由表达与创作，不喜欢循规蹈矩，重视个性和情感表达。',
    traits: ['想象力丰富', '审美敏锐', '追求个性', '情感细腻', '厌恶束缚'],
    careers: ['设计师（UI/平面/工业）', '内容创作/编辑', '广告创意', '影视/动画', '音乐/表演', '建筑设计', '品牌策划'],
    activities: ['提出创意与新表达', '完成视觉或内容作品', '用审美和叙事改善体验'],
    majors: ['设计学', '美术', 'music/表演', '广告学', '新闻传播', '建筑学', '数字媒体'],
    workSignals: '可表达观点、有创作空间、审美或叙事会影响成果质量。',
    verifyQuestion: '这个岗位有哪些部分需要提出新想法、表达或创作？',
    reminder: '创意岗位也有流程和协作，兴趣要与作品、技能和商业任务一起验证。',
  },
  S: {
    type: 'S',
    name: '社会型',
    alias: 'Social · 助人者',
    color: '#c53030',
    summary: '热心、善于沟通与共情，喜欢帮助、教导、服务他人，重视人际关系与团队协作。',
    traits: ['善于沟通', '富有同理心', '乐于助人', '团队意识强', '有亲和力'],
    careers: ['教师', 'HR/招聘', '心理咨询', '社工/公益', '医护', '培训师', '客户成功/运营'],
    activities: ['理解并回应他人需求', '促进沟通与团队协作', '帮助他人学习和成长'],
    majors: ['教育学', '心理学', '社会工作', '护理', '人力资源管理', '汉语言/师范'],
    workSignals: '需要理解他人、促进协作、支持成长或解决服务对象的问题。',
    verifyQuestion: '这个岗位主要服务谁，日常如何与人协作和建立信任？',
    reminder: '愿意帮助人不等于要承担所有情绪劳动，也要看边界和专业要求。',
  },
  E: {
    type: 'E',
    name: '企业型',
    alias: 'Enterprising · 影响者',
    color: '#6b46c1',
    summary: '有领导欲和说服力，喜欢组织、管理、影响他人，目标导向、敢于冒险，擅长抓住机会。',
    traits: ['有领导力', '善于说服', '目标导向', '敢冒险', '精力充沛'],
    careers: ['销售/商务', '市场营销', '管理/创业', '产品经理', '投资/金融', '公关', '项目管理'],
    activities: ['推动项目和资源落地', '表达观点并影响决策', '围绕目标组织协作'],
    majors: ['工商管理', '市场营销', '金融', '国际贸易', '法学', '管理科学'],
    workSignals: '目标清晰、需要推动资源或影响他人、成果与业务结果有关。',
    verifyQuestion: '这个岗位需要推动哪些人或资源，结果通常如何衡量？',
    reminder: '喜欢影响不等于一定要做管理，先从项目推进、表达和协商能力开始积累。',
  },
  C: {
    type: 'C',
    name: '常规型',
    alias: 'Conventional · 组织者',
    color: '#4a5568',
    summary: '细心、有条理、责任心强，喜欢按规则和流程处理事务，擅长数据、文书和系统化工作。',
    traits: ['细致严谨', '有条理', '责任心强', '遵守规则', '执行力高'],
    careers: ['会计/审计', '财务', '行政/文秘', '银行业务', '数据录入/管理', '公务员', '法务专员'],
    activities: ['整理数据与信息', '维护流程和质量标准', '让任务有序、准确地运行'],
    majors: ['会计学', '财务管理', '审计', '行政管理', '信息管理', '统计'],
    workSignals: '规则明确、流程清晰、细节准确会直接影响质量和效率。',
    verifyQuestion: '这个岗位有哪些关键流程、标准或需要长期维护的系统？',
    reminder: '偏好秩序不等于喜欢机械重复，也可以在运营、项目管理等岗位发挥。',
  },
};

export const TYPE_ORDER: HollandType[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export const FACET_INFO: Record<HollandFacet, { name: string; shortName: string; description: string }> = {
  interest: {
    name: '你感兴趣的活动',
    shortName: '兴趣',
    description: '你愿不愿意主动接近、持续投入这类活动。',
  },
  ability: {
    name: '你擅长的活动',
    shortName: '能力',
    description: '你对自己完成这类任务的把握和能力感受。',
  },
  feedback: {
    name: '你喜欢的职业反馈',
    shortName: '职业反馈',
    description: '你希望在工作中获得怎样的任务、环境和结果反馈。',
  },
};

export const FACET_ORDER: HollandFacet[] = ['interest', 'ability', 'feedback'];

export interface HollandRole {
  title: string;
  types: HollandType[];
  why: string;
  tasks: string;
  starter: string;
}

// 面向大学生求职的岗位方向库。推荐只用于生成探索清单，不等于岗位匹配结论。
export const HOLLAND_ROLES: HollandRole[] = [
  { title: '数据分析师', types: ['I', 'C', 'E'], why: '需要从数据中发现问题，并把结论转成业务建议。', tasks: '数据清洗、指标分析、可视化、结论汇报', starter: '完成一份公开数据分析作品' },
  { title: '软件 / 算法工程师', types: ['I', 'R', 'C'], why: '兼顾逻辑研究、动手实现与持续调试。', tasks: '需求拆解、编码、测试、性能优化', starter: '用课程或开源项目证明实现能力' },
  { title: '硬件 / 测试工程师', types: ['R', 'I', 'C'], why: '适合喜欢设备、实验和可验证结果的人。', tasks: '测试方案、设备调试、故障定位、报告记录', starter: '整理实验、竞赛或硬件项目经历' },
  { title: '运维 / 网络工程师', types: ['R', 'C', 'I'], why: '需要按流程维护系统，也要快速解决现场问题。', tasks: '系统监控、故障排查、配置维护、应急处理', starter: '搭建个人实验环境并记录排障过程' },
  { title: '生产 / 质量工程师', types: ['R', 'C', 'I'], why: '关注流程、现场和产品质量，成果反馈直接。', tasks: '流程改进、质量检查、问题复盘、标准维护', starter: '突出工程训练与问题解决案例' },
  { title: '工业 / 产品设计师', types: ['A', 'R', 'I'], why: '把审美、用户需求与可制造的方案连接起来。', tasks: '用户观察、草图建模、原型制作、设计验证', starter: '准备包含过程说明的作品集' },
  { title: '行业研究 / 咨询分析', types: ['I', 'E', 'C'], why: '需要研究信息、形成判断并清楚表达建议。', tasks: '资料研究、访谈、模型分析、报告呈现', starter: '拆解一个行业并形成结构化报告' },
  { title: '用户研究', types: ['I', 'S', 'A'], why: '通过访谈和分析理解用户，并影响产品体验。', tasks: '访谈设计、用户观察、信息归纳、洞察输出', starter: '完成一次小型访谈研究' },
  { title: 'UI / UX 设计师', types: ['A', 'I', 'S'], why: '需要创意表达，也要理解用户和验证方案。', tasks: '交互设计、视觉设计、原型、可用性测试', starter: '准备2—3个完整设计案例' },
  { title: '内容策划 / 新媒体运营', types: ['A', 'E', 'S'], why: '用内容连接用户，并通过数据持续优化传播。', tasks: '选题、创作、发布运营、数据复盘', starter: '运营一个主题账号或内容栏目' },
  { title: '品牌 / 市场营销', types: ['E', 'A', 'S'], why: '需要理解人群、提出创意并推动传播结果。', tasks: '市场调研、活动策划、内容传播、效果分析', starter: '复盘一次校园活动或品牌案例' },
  { title: '视频 / 视觉设计', types: ['A', 'R', 'C'], why: '既需要创作表达，也需要熟练工具和交付标准。', tasks: '脚本分镜、拍摄制作、视觉包装、版本交付', starter: '建立可直接查看的作品集' },
  { title: '产品经理', types: ['E', 'I', 'S'], why: '需要研究问题、理解用户并推动多方协作。', tasks: '需求分析、方案设计、项目推进、效果复盘', starter: '完成一份产品分析或校园项目案例' },
  { title: '项目运营 / 项目管理', types: ['E', 'C', 'S'], why: '适合目标感强、愿意协调资源并保证落地的人。', tasks: '计划制定、跨部门协作、进度管理、复盘', starter: '量化呈现社团、比赛或实习项目成果' },
  { title: '销售 / 商务拓展', types: ['E', 'S', 'C'], why: '需要建立关系、理解需求并推动结果达成。', tasks: '客户沟通、方案呈现、商务谈判、目标管理', starter: '准备一段影响他人或达成目标的经历' },
  { title: '人力资源 / 招聘', types: ['S', 'E', 'C'], why: '连接人与组织，同时要求沟通、判断和流程意识。', tasks: '人才沟通、面试协同、招聘运营、数据跟踪', starter: '积累组织活动和沟通协调案例' },
  { title: '客户成功 / 用户运营', types: ['S', 'E', 'C'], why: '需要理解用户、解决问题并维护长期关系。', tasks: '需求沟通、使用支持、用户活动、续约增长', starter: '突出服务、社群或用户沟通经历' },
  { title: '培训 / 学习发展', types: ['S', 'E', 'A'], why: '通过内容设计和现场沟通帮助他人成长。', tasks: '需求调研、课程设计、授课运营、效果评估', starter: '设计并试讲一个15分钟微课程' },
  { title: '教育 / 咨询服务', types: ['S', 'I', 'A'], why: '需要理解个体问题、提供方法并建立信任。', tasks: '需求访谈、方案建议、教学辅导、跟进反馈', starter: '积累助教、志愿服务或咨询类实践' },
  { title: '财务 / 审计', types: ['C', 'I', 'E'], why: '重视准确、规则和基于数据的判断。', tasks: '账务处理、数据核对、风险检查、报告输出', starter: '准备证书、课程项目和严谨性案例' },
  { title: '数据运营', types: ['C', 'I', 'E'], why: '在稳定的数据流程中发现并推动业务改进。', tasks: '指标维护、报表、异常分析、运营优化', starter: '用Excel或SQL完成一份运营分析' },
  { title: '供应链 / 计划管理', types: ['C', 'R', 'E'], why: '需要协调真实资源、维护计划并处理变化。', tasks: '需求计划、库存跟踪、供应协同、流程优化', starter: '理解供应链流程并准备项目案例' },
  { title: '合规 / 法务助理', types: ['C', 'I', 'E'], why: '需要研究规则、识别风险并形成清楚记录。', tasks: '资料检索、合同审核、风险记录、流程支持', starter: '突出法规检索和文字分析能力' },
];

// 每个维度 8 题，共 48 题
export const QUESTIONS: HollandQuestion[] = [
  // R 现实型
  { id: 1, type: 'R', facet: 'interest', text: '我喜欢动手组装、修理或制作东西' },
  { id: 2, type: 'R', facet: 'interest', text: '比起只讨论概念，我更喜欢操作设备或接触真实现场' },
  { id: 3, type: 'R', facet: 'interest', text: '我对机械、工具、电子设备或手工活动很感兴趣' },
  { id: 4, type: 'R', facet: 'ability', text: '我能较快学会工具、设备或实操步骤的使用方法' },
  { id: 5, type: 'R', facet: 'feedback', text: '我希望工作成果是具体、可见并能被实际检验的' },
  { id: 6, type: 'R', facet: 'ability', text: '遇到实际问题时，我通常能边动手边找到解决办法' },
  { id: 7, type: 'R', facet: 'feedback', text: '工程、制造、运维、实验或现场类岗位会吸引我了解' },
  { id: 8, type: 'R', facet: 'ability', text: '我擅长把想法变成可操作的步骤或具体成果' },

  // I 研究型
  { id: 9, type: 'I', facet: 'interest', text: '我喜欢钻研问题、弄清楚事物背后的原理' },
  { id: 10, type: 'I', facet: 'interest', text: '我享受做实验、分析数据或调查研究' },
  { id: 11, type: 'I', facet: 'interest', text: '我对科学、数学、技术或社会规律充满好奇' },
  { id: 12, type: 'I', facet: 'ability', text: '遇到难题时，我能长时间独立思考并持续追问' },
  { id: 13, type: 'I', facet: 'feedback', text: '需要阅读资料、分析证据和形成结论的工作会吸引我' },
  { id: 14, type: 'I', facet: 'ability', text: '我擅长用逻辑、数据和证据来做判断' },
  { id: 15, type: 'I', facet: 'feedback', text: '我希望工作能让我持续学习并解决越来越复杂的问题' },
  { id: 16, type: 'I', facet: 'ability', text: '我擅长把复杂问题拆成几个可以分析的小问题' },

  // A 艺术型
  { id: 17, type: 'A', facet: 'interest', text: '我喜欢绘画、写作、音乐、影像或其他创作活动' },
  { id: 18, type: 'A', facet: 'interest', text: '我会主动关注设计、艺术、影视或内容创作' },
  { id: 19, type: 'A', facet: 'interest', text: '我喜欢能够自由表达想法和个人风格的活动' },
  { id: 20, type: 'A', facet: 'ability', text: '我能用文字、视觉、声音或故事清楚表达想法' },
  { id: 21, type: 'A', facet: 'ability', text: '我对画面、语言、情绪或体验中的细微差别比较敏感' },
  { id: 22, type: 'A', facet: 'ability', text: '面对开放问题时，我通常能提出有新意的方案' },
  { id: 23, type: 'A', facet: 'feedback', text: '别人会认可我的创意、审美或表达方式' },
  { id: 24, type: 'A', facet: 'feedback', text: '设计、内容、品牌、影视等创意类岗位会吸引我了解' },

  // S 社会型
  { id: 25, type: 'S', facet: 'interest', text: '我喜欢帮助别人解决问题或困难' },
  { id: 26, type: 'S', facet: 'ability', text: '我擅长与人沟通，也能理解对方没有直接说出的需要' },
  { id: 27, type: 'S', facet: 'interest', text: '我喜欢教别人、分享知识或支持他人成长' },
  { id: 28, type: 'S', facet: 'ability', text: '在团队中，我能协调不同意见并促进合作' },
  { id: 29, type: 'S', facet: 'interest', text: '我愿意参加服务、教育、咨询或公益类活动' },
  { id: 30, type: 'S', facet: 'ability', text: '别人遇到烦恼或协作问题时，常愿意来找我沟通' },
  { id: 31, type: 'S', facet: 'feedback', text: '我希望工作中有健康的人际关系和真实的团队协作' },
  { id: 32, type: 'S', facet: 'feedback', text: '能帮助用户、同事或学生获得进步，会让我有成就感' },

  // E 企业型
  { id: 33, type: 'E', facet: 'interest', text: '我喜欢带领团队、组织活动或推动项目' },
  { id: 34, type: 'E', facet: 'ability', text: '我能清楚表达观点，并争取别人支持一个方案' },
  { id: 35, type: 'E', facet: 'ability', text: '面对目标时，我能主动规划并持续推动结果' },
  { id: 36, type: 'E', facet: 'interest', text: '我喜欢有挑战、有竞争或需要快速决策的任务' },
  { id: 37, type: 'E', facet: 'feedback', text: '我希望未来能负责项目、业务或一部分团队成果' },
  { id: 38, type: 'E', facet: 'interest', text: '我对创业、商业机会、市场或资源整合感兴趣' },
  { id: 39, type: 'E', facet: 'ability', text: '局面不清楚时，我通常敢于站出来组织和推进' },
  { id: 40, type: 'E', facet: 'feedback', text: '能影响决策、推动资源并看到目标达成会让我有成就感' },

  // C 常规型
  { id: 41, type: 'C', facet: 'interest', text: '我喜欢把任务安排得清楚、有序并按计划完成' },
  { id: 42, type: 'C', facet: 'interest', text: '我愿意整理数据、文档、账目或信息系统' },
  { id: 43, type: 'C', facet: 'interest', text: '规则和流程清楚的任务会让我更容易进入状态' },
  { id: 44, type: 'C', facet: 'ability', text: '我做事认真负责，通常能发现细节中的差错' },
  { id: 45, type: 'C', facet: 'feedback', text: '我希望岗位职责、评价标准和工作安排比较明确' },
  { id: 46, type: 'C', facet: 'ability', text: '我能耐心处理重复、细致并要求准确的事务' },
  { id: 47, type: 'C', facet: 'feedback', text: '稳定、可预期并能持续积累经验的工作会吸引我' },
  { id: 48, type: 'C', facet: 'ability', text: '我擅长分类归档、维护记录并让信息井井有条' },
];

// 5 级李克特量表
export const SCALE_OPTIONS = [
  { value: 1, label: '很不符合' },
  { value: 2, label: '比较不符合' },
  { value: 3, label: '一般' },
  { value: 4, label: '比较符合' },
  { value: 5, label: '非常符合' },
];

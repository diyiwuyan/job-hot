// 霍兰德职业兴趣自测（RIASEC）
// 参考 SDS 结构与新精英结果表设计的本土化简版，不是 PAR 授权版 SDS。

export type HollandType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type HollandFacet = 'interest' | 'ability' | 'feedback';
export type MajorGroup = 'humanities' | 'media_arts' | 'law_public' | 'business' | 'social_education' | 'computing' | 'engineering' | 'science' | 'health' | 'agri_environment';
export type AiLevel = 'exploring' | 'applied' | 'technical';

export interface HollandQuestion { id: number; type: HollandType; facet: HollandFacet; text: string; }
export interface HollandTypeInfo {
  type: HollandType; name: string; alias: string; color: string; summary: string;
  traits: string[]; activities: string[]; workSignals: string;
}

export const TYPE_INFO: Record<HollandType, HollandTypeInfo> = {
  R: { type: 'R', name: '现实型', alias: 'Realistic · 实践者', color: '#25845d', summary: '更容易被真实场景、工具、设备和可见成果吸引，喜欢通过行动、操作与现场反馈解决问题。', traits: ['务实', '行动导向', '重视可见成果'], activities: ['动手制作与调试', '处理现场问题', '把方案变成真实成果'], workSignals: '任务有明确对象和现场反馈，成果能够被实际检验。' },
  I: { type: 'I', name: '研究型', alias: 'Investigative · 探究者', color: '#2868b2', summary: '更愿意追问原因、研究证据并拆解复杂问题，通常享受独立思考、学习和形成判断的过程。', traits: ['好奇', '分析导向', '重视证据'], activities: ['研究信息与证据', '拆解复杂问题', '提出并验证假设'], workSignals: '问题值得深入研究，可以基于资料、数据或访谈形成判断。' },
  A: { type: 'A', name: '艺术型', alias: 'Artistic · 创作者', color: '#b86f13', summary: '更重视创意、审美和个性表达，喜欢借助文字、视觉、声音、表演或体验设计传递观点。', traits: ['想象力', '审美敏感', '表达导向'], activities: ['创作内容与表达', '设计体验与视觉', '提出非标准化方案'], workSignals: '有表达空间，创意、叙事或审美能够影响最终成果。' },
  S: { type: 'S', name: '社会型', alias: 'Social · 连接者', color: '#c03c3c', summary: '更关注人的需要、成长与协作，愿意通过沟通、服务、教育或支持来帮助他人解决问题。', traits: ['同理心', '沟通协作', '服务意识'], activities: ['理解并回应需求', '促进沟通与协作', '支持他人学习成长'], workSignals: '需要理解人、建立信任，并能看到服务对象或团队发生积极变化。' },
  E: { type: 'E', name: '企业型', alias: 'Enterprising · 推动者', color: '#7650bd', summary: '更容易被目标、机会和影响力吸引，喜欢表达主张、整合资源并推动团队或业务取得结果。', traits: ['目标感', '影响他人', '资源整合'], activities: ['推动项目落地', '表达并影响决策', '围绕目标组织资源'], workSignals: '目标清晰，需要推动人和资源，成果与项目或业务结果直接相关。' },
  C: { type: 'C', name: '常规型', alias: 'Conventional · 组织者', color: '#556173', summary: '更偏好清晰规则、稳定流程和准确记录，擅长把信息、任务和资源整理得有条不紊。', traits: ['细致', '有条理', '重视规范'], activities: ['整理数据与信息', '维护流程与标准', '让任务准确有序运行'], workSignals: '流程和标准明确，细节准确会直接影响效率、质量或风险。' },
};

export const TYPE_ORDER: HollandType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
export const FACET_ORDER: HollandFacet[] = ['interest', 'ability', 'feedback'];
export const FACET_INFO: Record<HollandFacet, { name: string; shortName: string; description: string }> = {
  interest: { name: '你感兴趣的活动', shortName: '兴趣', description: '你是否愿意主动接近和持续投入这类活动。' },
  ability: { name: '你擅长的活动', shortName: '能力', description: '你对自己完成这类任务的把握；这是能力自评，不等于客观能力测验。' },
  feedback: { name: '你偏好的职业', shortName: '职业反馈', description: '你是否愿意进一步了解和尝试具有这类任务特征的职业。' },
};

export const MAJOR_GROUPS: Record<MajorGroup, { label: string; shortLabel: string }> = {
  humanities: { label: '人文、语言、历史哲学', shortLabel: '人文语言' },
  media_arts: { label: '新闻传播、艺术、戏剧影视与设计', shortLabel: '传播艺术' },
  law_public: { label: '法学、政治学与公共管理', shortLabel: '法政公共' },
  business: { label: '经济、金融、管理与商科', shortLabel: '经管商科' },
  social_education: { label: '社会学、教育学与心理学', shortLabel: '社科教育' },
  computing: { label: '计算机、电子信息与人工智能', shortLabel: '计算机信息' },
  engineering: { label: '工程、制造、建筑与交通', shortLabel: '工程制造' },
  science: { label: '数学、统计与自然科学', shortLabel: '数理科学' },
  health: { label: '医学、药学与健康', shortLabel: '医药健康' },
  agri_environment: { label: '农林、环境、地理与生态', shortLabel: '农林环境' },
};

export const AI_LEVELS: Record<AiLevel, { label: string; description: string }> = {
  exploring: { label: '刚开始接触', description: '暂不把 AI 作为岗位门槛' },
  applied: { label: '能用 AI 完成任务', description: '可探索 AI 内容、研究、运营与产品应用' },
  technical: { label: '有编程或模型实践', description: '可进一步考虑 AI 技术与数据岗位' },
};

type QuestionBank = Record<HollandType, Record<HollandFacet, string[]>>;
const QUESTION_BANK: QuestionBank = {
  R: {
    interest: ['动手组装、修理或制作东西会让我投入。', '我愿意接触设备、工具、材料或真实工作现场。', '比起只讨论概念，我更喜欢边做边解决问题。', '我会主动了解机械、硬件、建筑、制造或自然环境。', '有明确操作步骤和可见成果的活动会吸引我。'],
    ability: ['我能较快学会工具、设备或实操流程。', '遇到现场问题时，我能通过观察和尝试找到原因。', '我擅长把想法转成可以执行的步骤。', '我能耐心完成调试、测量、制作或重复练习。', '在实践任务中，我通常能把安全、质量和结果兼顾好。'],
    feedback: ['我愿意了解工程实施、设备应用或技术支持类工作。', '我愿意了解制造、质量、供应链现场或空间建造类工作。', '我愿意了解实验操作、生态环境或户外实践类工作。', '我希望工作不只停留在文档和会议，也能接触真实对象。', '能亲手完成并看到成果，会让我对一份职业更有兴趣。'],
  },
  I: {
    interest: ['我喜欢追问一件事为什么会发生。', '阅读资料、分析数据或调查问题会让我投入。', '我愿意长时间研究一个复杂问题。', '我会主动关注科学、技术、社会或商业规律。', '发现证据之间的联系会让我有成就感。'],
    ability: ['我能把复杂问题拆成几个可分析的小问题。', '我擅长比较信息来源并判断证据是否可靠。', '面对新领域时，我能通过学习快速建立基本框架。', '我能从数据、文本或访谈中提炼关键结论。', '我通常能发现表面现象背后的原因或模式。'],
    feedback: ['我愿意了解行业研究、政策研究或咨询分析类工作。', '我愿意了解数据分析、用户研究或商业分析类工作。', '我愿意了解科研、实验、技术研究或知识服务类工作。', '我希望工作允许我持续学习并形成独立判断。', '需要研究证据并解决未知问题的职业会吸引我。'],
  },
  A: {
    interest: ['写作、影像、音乐、表演、绘画或设计会让我投入。', '我喜欢用不同方式表达自己的观点和感受。', '我会主动关注作品的叙事、画面、语言或体验。', '面对开放问题时，我喜欢提出与众不同的想法。', '我愿意把普通信息改造成更有吸引力的表达。'],
    ability: ['我能用文字、视觉、声音或表演清楚传达想法。', '我对画面、语言、情绪或体验中的细微差别较敏感。', '我通常能为一个主题提出多个创意方向。', '我能根据受众和场景调整表达方式。', '我能把零散素材组织成有完整感的作品或方案。'],
    feedback: ['我愿意了解内容策划、编辑、编导或新媒体工作。', '我愿意了解品牌创意、广告传播或公共文化类工作。', '我愿意了解视觉设计、交互体验、动画游戏或舞台影视工作。', '我希望职业中有一定的创作和表达空间。', '作品被理解、传播或产生体验影响，会让我有成就感。'],
  },
  S: {
    interest: ['我喜欢帮助别人理解问题或克服困难。', '我愿意倾听不同人的经历和真实需要。', '教学、分享、辅导或志愿服务会让我投入。', '我喜欢促进团队沟通并建立合作关系。', '看到他人因为我的支持获得成长会让我开心。'],
    ability: ['我能耐心听懂对方真正关心的问题。', '我能用对方容易理解的方式解释复杂信息。', '在团队中，我能协调不同意见并推动合作。', '别人需要支持时，我通常能给出合适的回应。', '我能在服务他人的同时维持清楚的边界和节奏。'],
    feedback: ['我愿意了解教育培训、人才发展或咨询服务类工作。', '我愿意了解用户运营、客户成功或社区服务类工作。', '我愿意了解公共事务、公益项目或健康服务类工作。', '我希望工作中有真实的人际互动和团队协作。', '帮助用户、学生、同事或公众取得进展会让我有成就感。'],
  },
  E: {
    interest: ['我喜欢组织活动、推动项目或带领小组。', '我愿意表达主张并争取别人支持一个方案。', '有目标、有挑战并需要快速行动的任务会吸引我。', '我会主动关注商业机会、市场变化或资源配置。', '把一个想法推动成结果会让我兴奋。'],
    ability: ['我能清楚表达观点并根据对象调整说服方式。', '面对不确定局面时，我通常敢于站出来推进。', '我能围绕目标安排优先级和协调资源。', '我善于发现合作机会并建立行动共识。', '遇到阻力时，我能继续沟通并寻找替代方案。'],
    feedback: ['我愿意了解市场营销、商务拓展或销售策略类工作。', '我愿意了解产品、项目管理或组织运营类工作。', '我愿意了解创业、投资、品牌或公共关系类工作。', '我希望职业成果能被目标、增长或项目影响衡量。', '能够影响决策并推动资源落地的职业会吸引我。'],
  },
  C: {
    interest: ['我喜欢把信息、文件或任务整理得清楚有序。', '规则明确、步骤清晰的活动让我更容易进入状态。', '我愿意核对数据、记录细节并维护准确性。', '制定计划、清单和流程会让我感到踏实。', '让一套系统稳定高效地运行会让我有成就感。'],
    ability: ['我通常能发现数据、文字或流程中的小差错。', '我能耐心处理重复、细致且要求准确的事务。', '我擅长分类归档并长期维护记录。', '我能按规则推进任务，同时处理必要的例外情况。', '面对多项任务时，我能安排顺序并按时交付。'],
    feedback: ['我愿意了解财务、审计、合规、法务支持类工作。', '我愿意了解组织运营、行政、人力运营或项目支持类工作。', '我愿意了解数据治理、供应链计划或质量管理类工作。', '我希望岗位职责、流程与评价标准比较清楚。', '准确、稳定并能持续积累专业经验的职业会吸引我。'],
  },
};

export const QUESTIONS: HollandQuestion[] = FACET_ORDER.flatMap((facet) => TYPE_ORDER.flatMap((type) => QUESTION_BANK[type][facet].map((text) => ({ type, facet, text })))).map((question, index) => ({ ...question, id: index + 1 }));
export const SCALE_OPTIONS = [{ value: 0, label: '不符合' }, { value: 1, label: '有些符合' }, { value: 2, label: '符合' }];

export type ModernRole = { title: string; majors?: MajorGroup[]; ai?: 'applied' | 'technical'; technical?: boolean; };
export type HollandJobCategory = { id: string; title: string; subtitle: string; types: HollandType[]; tasks: string[]; roles: ModernRole[]; majorGate?: boolean; };

// 结合本站校招数据常见岗位名与人社部门发布的新职业整理。推荐大类，不代表录用资格。
export const HOLLAND_JOB_CATEGORIES: HollandJobCategory[] = [
  { id: 'research-insight', title: '研究与洞察', subtitle: '从信息、数据和访谈中形成判断', types: ['I', 'C', 'S'], tasks: ['资料与数据研究', '访谈调研', '形成报告与建议'], roles: [
    { title: '行业研究 / 咨询分析', majors: ['business', 'law_public', 'science', 'humanities'] }, { title: '政策研究 / 智库项目助理', majors: ['law_public', 'humanities', 'social_education'] }, { title: '用户研究 / 消费者洞察', majors: ['social_education', 'media_arts', 'business', 'humanities'] }, { title: '商业分析 / 经营分析', majors: ['business', 'science', 'computing'] }, { title: '舆情分析 / 传播研究', majors: ['media_arts', 'law_public', 'social_education'] }, { title: 'AI 研究助理 / 评测运营', ai: 'applied' }, { title: '数据分析', majors: ['business', 'science', 'computing'], technical: true },
  ] },
  { id: 'content-creative', title: '内容与创意', subtitle: '用内容、设计和叙事创造影响', types: ['A', 'E', 'S'], tasks: ['选题与内容生产', '品牌表达', '视觉或体验创作'], roles: [
    { title: '内容策划 / 编辑 / 新媒体运营', majors: ['media_arts', 'humanities', 'law_public', 'business'] }, { title: '品牌内容 / 整合营销', majors: ['media_arts', 'business', 'humanities'] }, { title: '短视频编导 / 节目策划', majors: ['media_arts', 'humanities'] }, { title: '游戏文案 / 叙事策划', majors: ['media_arts', 'humanities'] }, { title: '公共文化 / 展陈活动策划', majors: ['media_arts', 'humanities', 'law_public'] }, { title: '生成式 AI 内容策划', majors: ['media_arts', 'humanities', 'business'], ai: 'applied' }, { title: '视觉 / 交互 / 动效设计', majors: ['media_arts'], technical: true },
  ] },
  { id: 'people-public', title: '用户、教育与公共服务', subtitle: '理解人的需要并促进成长与协作', types: ['S', 'I', 'E'], tasks: ['需求沟通', '服务与支持', '教育或公共项目协作'], roles: [
    { title: '公共事务 / 政府事务助理', majors: ['law_public', 'humanities', 'business'] }, { title: '教育产品运营 / 学习项目运营', majors: ['social_education', 'humanities', 'media_arts'] }, { title: '用户运营 / 社区运营' }, { title: '客户成功 / 客户体验' }, { title: '人才发展 / 招聘运营', majors: ['social_education', 'business', 'humanities'] }, { title: '公益项目 / 社会服务', majors: ['social_education', 'law_public', 'humanities'] }, { title: 'AI 培训运营 / AI 素养讲师', ai: 'applied' },
  ] },
  { id: 'product-project', title: '产品、项目与数字运营', subtitle: '连接需求、方案与多方协作', types: ['E', 'I', 'C'], tasks: ['需求拆解', '项目推进', '运营与复盘'], roles: [
    { title: '产品运营 / 平台运营' }, { title: '项目助理 / 项目运营' }, { title: '策略运营 / 增长运营', majors: ['business', 'media_arts', 'computing', 'science'] }, { title: '产品经理', majors: ['business', 'computing', 'media_arts', 'social_education'] }, { title: '数字化项目实施 / 解决方案顾问', majors: ['business', 'computing', 'engineering'] }, { title: 'AI 产品运营 / 知识库运营', ai: 'applied' }, { title: '跨境电商运营', majors: ['business', 'media_arts', 'humanities'] },
  ] },
  { id: 'market-business', title: '市场与商业增长', subtitle: '连接市场机会、用户与业务结果', types: ['E', 'S', 'A'], tasks: ['市场调研', '商务沟通', '渠道与增长推进'], roles: [
    { title: '市场营销 / 品牌营销' }, { title: '商务拓展 / 生态合作' }, { title: '销售运营 / 商业化运营' }, { title: '海外市场 / 国际业务', majors: ['business', 'humanities', 'media_arts'] }, { title: '电商运营 / 直播运营' }, { title: '雇主品牌 / 校园招聘', majors: ['business', 'social_education', 'media_arts'] },
  ] },
  { id: 'data-ai', title: '数据与 AI 应用', subtitle: '用数据和智能工具解决业务问题', types: ['I', 'C', 'R'], tasks: ['数据与模型评估', 'AI 工作流设计', '数字工具应用'], roles: [
    { title: 'AI 应用运营 / AI 解决方案助理', ai: 'applied' }, { title: '模型评测 / 数据标注质检', ai: 'applied' }, { title: 'AI 内容生产 / 工作流运营', majors: ['media_arts', 'humanities', 'business'], ai: 'applied' }, { title: '知识库运营 / 智能客服运营', ai: 'applied' }, { title: '数据产品助理', majors: ['business', 'computing', 'science'], technical: true }, { title: '生成式 AI 系统测试', majors: ['computing', 'science'], ai: 'technical', technical: true }, { title: '算法 / AI 工程', majors: ['computing', 'science'], ai: 'technical', technical: true },
  ] },
  { id: 'engineering-field', title: '工程、制造与现场实践', subtitle: '把技术方案转化为可靠的真实成果', types: ['R', 'I', 'C'], tasks: ['工程设计与实施', '设备与质量管理', '现场问题解决'], majorGate: true, roles: [
    { title: '研发 / 工艺 / 质量工程', majors: ['engineering', 'science'], technical: true }, { title: '设备 / 自动化 / 运维工程', majors: ['engineering', 'computing'], technical: true }, { title: '建筑 / 交通 / 工程项目', majors: ['engineering'], technical: true }, { title: '供应链计划 / 生产管理', majors: ['engineering', 'business'], technical: true }, { title: '环境工程 / 双碳技术', majors: ['agri_environment', 'engineering', 'science'], technical: true }, { title: '无人机应用 / 机器人现场应用', majors: ['engineering', 'computing'], technical: true },
  ] },
  { id: 'operations-risk', title: '组织运营、规则与风险', subtitle: '用流程、规则和准确性保障组织运行', types: ['C', 'E', 'I'], tasks: ['流程与数据维护', '风险检查', '组织支持'], roles: [
    { title: '人力运营 / 组织运营' }, { title: '行政项目 / 采购运营' }, { title: '法务助理 / 合规运营', majors: ['law_public', 'business'] }, { title: '财务 / 审计 / 风控', majors: ['business', 'law_public'] }, { title: '数据治理 / 业务流程运营', majors: ['business', 'computing', 'science'] }, { title: '档案与知识管理', majors: ['humanities', 'law_public'] },
  ] },
];

export type PrepSourceKind = 'official-jd' | 'official-process' | 'candidate-experience' | 'experience-summary';

export interface PrepEvidence {
  id: string;
  kind: PrepSourceKind;
  company: string;
  roleIds: string[];
  title: string;
  period: string;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  topics: string[];
}

export interface RolePrepProfile {
  id: string;
  name: string;
  shortName: string;
  description: string;
  keywords: string[];
  jdSignals: string[];
  writtenFocus: string[];
  interviewFocus: string[];
  evidenceIds: string[];
}

export const PREP_EVIDENCE: PrepEvidence[] = [
  {
    id: 'meituan-ba-jd', kind: 'official-jd', company: '美团', roleIds: ['data-analysis'], period: '当前官网', sourceName: '美团招聘官网',
    title: '商业分析师（BA/DS）应届岗位说明', sourceUrl: 'https://zhaopin.meituan.com/web/position/detail?highlightType=campus&jobUnionId=1619180248',
    summary: '官方职责强调业务规划、经营分析、商业问题拆解、数据洞察与实验决策；任职要求明确分析能力、商业兴趣及数据科学基础。',
    topics: ['经营分析', '指标体系', '实验设计', '商业问题拆解', '数据工具'],
  },
  {
    id: 'jd-da-2024', kind: 'candidate-experience', company: '京东', roleIds: ['data-analysis'], period: '2024 春招', sourceName: '牛客公开面经',
    title: '京东数据分析师公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/618399414385709056',
    summary: '求职者记录的流程包含行为面、技术业务面和 HR 面；重点围绕实习深挖、电商指标、业务分析、SQL 窗口函数和辛普森悖论。',
    topics: ['电商指标', 'SQL窗口函数', '辛普森悖论', '业务分析', '经历深挖'],
  },
  {
    id: 'byte-ds-2024', kind: 'candidate-experience', company: '字节跳动', roleIds: ['data-analysis', 'algorithm'], period: '2024', sourceName: '牛客公开面经',
    title: '字节跳动数据科学公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/595574221514821632',
    summary: '公开记录集中在 A/B 实验、统计检验、回归与分类、SQL 窗口函数、机器学习模型比较以及留存下降分析。',
    topics: ['A/B实验', '统计检验', '机器学习', 'SQL', '留存分析'],
  },
  {
    id: 'meituan-ba-2022', kind: 'candidate-experience', company: '美团', roleIds: ['data-analysis'], period: '2023 届校招', sourceName: '牛客公开面经',
    title: '美团商业分析师公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/421760287096717312',
    summary: '多轮记录反复出现商业分析与数据分析区别、实验结果解释、异常指标归因、指标拆解体系和商业判断等主题。',
    topics: ['商业分析', '实验归因', '指标拆解', '业务沟通', '项目深挖'],
  },
  {
    id: 'tencent-pm-2025', kind: 'candidate-experience', company: '腾讯', roleIds: ['product'], period: '2025 校招', sourceName: '牛客公开面经',
    title: '腾讯产品经理培训生群面与单面记录', sourceUrl: 'https://www.nowcoder.com/discuss/658256692651520000',
    summary: '公开记录包含方案型群面、限时 PPT 汇报、方案互评、ROI 估算和产品方向动机；流程与题型可能随事业群变化。',
    topics: ['方案群面', 'PPT汇报', 'ROI估算', '产品判断', '答辩追问'],
  },
  {
    id: 'tencent-pm-2024', kind: 'candidate-experience', company: '腾讯', roleIds: ['product'], period: '2024 春招', sourceName: '牛客公开面经',
    title: '腾讯产品经理公开一面记录', sourceUrl: 'https://www.nowcoder.com/discuss/606497941880160256',
    summary: '围绕实习项目、需求优先级、研发协作、岗位动机和工作城市展开，适合作为产品岗项目深挖的准备依据。',
    topics: ['项目深挖', '需求管理', '研发协作', '岗位动机', '优先级'],
  },
  {
    id: 'meituan-pm-2024', kind: 'candidate-experience', company: '美团', roleIds: ['product'], period: '2024 校招', sourceName: '牛客公开面经',
    title: '美团策略产品经理公开一面记录', sourceUrl: 'https://www.nowcoder.com/discuss/642743033032679424',
    summary: '记录重点为岗位职责理解、项目贡献、困难处理、产品能力与数据工作经验，未披露固定笔试范围。',
    topics: ['岗位理解', '项目贡献', '困难复盘', '数据意识', '产品能力'],
  },
  {
    id: 'byte-pm-2023', kind: 'candidate-experience', company: '字节跳动', roleIds: ['product', 'operations'], period: '2023 届秋招', sourceName: '牛客公开面经',
    title: '字节生活服务产品经理公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/465244222220705792',
    summary: '公开记录围绕本地生活业务、POI 信息结构、竞品差异、用户体验、供给与履约展开，体现强业务场景深挖。',
    topics: ['本地生活', '竞品分析', '信息架构', '供给履约', '用户体验'],
  },
  {
    id: 'byte-backend-2025', kind: 'candidate-experience', company: '字节跳动', roleIds: ['backend', 'ai-agent'], period: '2025 实习', sourceName: '牛客公开面经',
    title: '字节豆包后端开发公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/731895855627759616',
    summary: '三轮公开记录强调项目和基础知识深挖，包含网络协议、关系型数据库解释、算法与后端工程能力。',
    topics: ['项目深挖', '计算机网络', '数据库', '算法', '后端工程'],
  },
  {
    id: 'mt-tencent-backend-2024', kind: 'candidate-experience', company: '美团 / 腾讯', roleIds: ['backend'], period: '2024 春招', sourceName: '牛客公开面经',
    title: '美团与腾讯后台开发公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/602919518117064704',
    summary: '腾讯云后台记录涉及进程线程、I/O、epoll、网络协议、Redis、数据结构与算法；同帖包含美团业务组面试记录。',
    topics: ['操作系统', 'I/O与epoll', '计算机网络', 'Redis', '算法'],
  },
  {
    id: 'tencent-backend-2024', kind: 'candidate-experience', company: '腾讯', roleIds: ['backend'], period: '2024 秋招', sourceName: '牛客公开面经',
    title: '腾讯 TEG 后端公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/661610651382558720',
    summary: '公开记录标注事业群、时间线与多轮技术面，可用于核对腾讯后台岗位常见的项目、基础与编程考察结构。',
    topics: ['事业群匹配', '后端基础', '项目深挖', '编程题', '多轮技术面'],
  },
  {
    id: 'frontend-multi-2024', kind: 'candidate-experience', company: '腾讯 / 美团 / 米哈游', roleIds: ['frontend'], period: '2024 春招实习', sourceName: '牛客公开面经',
    title: '多家企业前端实习公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/605107379000061952',
    summary: '记录覆盖 Web 安全、HTTP 缓存、React、Vite/Webpack、SSR、项目深挖和算法，能区分通用前端基础与公司业务追问。',
    topics: ['Web安全', 'HTTP缓存', 'React', '工程化', 'SSR'],
  },
  {
    id: 'byte-campus-2027', kind: 'official-process', company: '字节跳动', roleIds: ['ai-agent', 'algorithm', 'backend'], period: '2027 校招', sourceName: '字节跳动校园招聘官网',
    title: '前沿技术与 Seed 大模型校招方向及笔试说明', sourceUrl: 'https://jobs.bytedance.com/campus/page-6272Gc',
    summary: '官网列出大模型应用、AI Coding、AIGC、搜索推荐广告、AI Safety、机器学习系统等方向，并明确笔试按岗位邀约、岗位不同考察范围不同。',
    topics: ['大模型应用', 'AI Coding', '机器学习系统', '搜索推荐广告', '按岗笔试'],
  },
  {
    id: 'baidu-campus-ai', kind: 'official-jd', company: '百度', roleIds: ['ai-agent', 'algorithm'], period: '2027 校招', sourceName: '百度校园招聘官网',
    title: '百度校招 AI 岗位方向说明', sourceUrl: 'https://talent.baidu.com/jobs/campus',
    summary: '官网列出应用模型研发、基础模型研发等校招方向，强调后训练、调优、多模态应用方案与基础模型研究。',
    topics: ['应用模型研发', '基础模型', '后训练', '多模态', 'AI应用落地'],
  },
  {
    id: 'byte-agent-2026', kind: 'candidate-experience', company: '字节跳动', roleIds: ['ai-agent', 'backend'], period: '2026-08', sourceName: '牛客公开面经',
    title: '字节 AI Agent 岗公开一面记录', sourceUrl: 'https://www.nowcoder.com/discuss/917530373293105152',
    summary: '公开记录同时出现 Agent 架构、记忆、工具调用、上下文压缩与 Java 线程池、MySQL、JVM 等后端基础，说明该岗并非只考 Prompt。',
    topics: ['Agent架构', '记忆系统', '工具调用', '上下文压缩', '后端基础'],
  },
  {
    id: 'tencent-ai-app-2026', kind: 'candidate-experience', company: '腾讯', roleIds: ['ai-agent', 'backend'], period: '2026', sourceName: '牛客公开面经',
    title: '腾讯 AI 应用开发公开一面记录', sourceUrl: 'https://www.nowcoder.com/discuss/872811983836372992',
    summary: '公开记录集中在文档解析、分块、检索、重排、向量索引、增量更新和引用回填，侧重可落地的 RAG 工程。',
    topics: ['RAG', '文档分块', '检索重排', '向量索引', '增量更新'],
  },
  {
    id: 'byte-llm-2025', kind: 'candidate-experience', company: '字节跳动', roleIds: ['algorithm', 'ai-agent'], period: '2025 实习', sourceName: '牛客公开面经',
    title: '字节大模型算法公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/724319940982898688',
    summary: '三轮记录围绕 SFT/DPO、训练数据、模型结构、评测、RAG、对比学习及算法手撕，明显偏模型与算法深度。',
    topics: ['SFT与DPO', '训练数据', '模型评测', 'RAG', '算法手撕'],
  },
  {
    id: 'ai-infra-2025', kind: 'candidate-experience', company: '美团 / 阿里 / 快手 / 百度', roleIds: ['algorithm', 'backend'], period: '2025 春招实习', sourceName: '牛客公开面经',
    title: '多家企业 AI Infra 公开面试汇总', sourceUrl: 'https://www.nowcoder.com/discuss/736868736837173248',
    summary: '公开时间线和岗位记录覆盖推理引擎、CUDA、Transformer、量化、分布式训练、系统优化、C++ 与算法，适合 AI Infra 方向核对准备深度。',
    topics: ['推理引擎', 'CUDA', '模型量化', '分布式训练', '系统优化'],
  },
  {
    id: 'pg-process', kind: 'official-process', company: '宝洁 P&G', roleIds: ['operations', 'supply-chain', 'finance-consulting'], period: '当前官网', sourceName: '宝洁招聘官网',
    title: '宝洁招聘流程与测评说明', sourceUrl: 'https://www.pgcareers.com/global/en/hiring-process',
    summary: '官方页面说明招聘流程；测评页面另行说明部分岗位可能包含 Peak Performance Assessment 与 Interactive Assessment，实际组合因岗位而异。',
    topics: ['在线申请', '行为倾向', '互动测评', '结构化面试', '按岗变化'],
  },
  {
    id: 'pg-it-experience', kind: 'candidate-experience', company: '宝洁 P&G', roleIds: ['backend', 'operations'], period: '校招公开记录', sourceName: '牛客公开面经',
    title: '宝洁 IT 研发岗公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/353157536431939584',
    summary: '公开记录包含中英文自我介绍、团队合作、冲突、挑战目标、流程改进、技术快问快答与情境题。',
    topics: ['行为深挖', '团队冲突', '流程改进', '技术基础', '中英文表达'],
  },
  {
    id: 'pg-supply-experience', kind: 'candidate-experience', company: '宝洁 P&G', roleIds: ['supply-chain', 'operations'], period: '校招公开记录', sourceName: '牛客公开面经',
    title: '宝洁供应链公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/353157535333031936',
    summary: '公开记录包含领导力经历深挖、全英文二面、改进方法说服和多任务优先级情境，题目随面试官与批次变化。',
    topics: ['领导力', '英文面试', '影响他人', '优先级', '供应链动机'],
  },
  {
    id: 'boc-2026-written', kind: 'official-process', company: '中国银行', roleIds: ['finance-consulting'], period: '2026 校招', sourceName: '中国银行官网',
    title: '中国银行统一笔试公告', sourceUrl: 'https://www.boc.cn/aboutboc/bi4/202603/t20260311_25654053.html',
    summary: '官方公告可核对统一笔试安排，并明确中国银行未出版或授权任何考试参考资料，因此第三方内容不应宣称为官方题库。',
    topics: ['统一笔试', '官方通知', '反诈骗提示', '无授权题库', '以邀约为准'],
  },
  {
    id: 'deloitte-process', kind: 'official-process', company: '德勤', roleIds: ['finance-consulting'], period: '当前官网', sourceName: '德勤中国招聘官网',
    title: '德勤中国招聘流程说明', sourceUrl: 'https://www.deloitte.com/cn/zh/careers/explore-your-fit/find-your-possible/our-recruitment-process.html',
    summary: '官网公开在线测试与面试流程方向，可用来核对认知能力、职业性格及面试日安排；具体组合随岗位变化。',
    topics: ['认知能力', '职业性格', '群面', '单面', '数字化认知'],
  },
  {
    id: 'ey-2023-experience', kind: 'candidate-experience', company: '安永 EY', roleIds: ['finance-consulting'], period: '2023 秋招', sourceName: '牛客公开面经',
    title: '安永秋招公开群面与经理面记录', sourceUrl: 'https://www.nowcoder.com/discuss/412273907049267200',
    summary: '公开记录包含市场进入类案例、个人阅读、小组讨论、英文展示与经理面，并说明案例细节因保密未完整披露。',
    topics: ['市场进入案例', '群面', '英文展示', '经理面', '时间管理'],
  },
  {
    id: 'mars-supply-experience', kind: 'candidate-experience', company: '玛氏 Mars', roleIds: ['supply-chain', 'operations'], period: '校招公开记录', sourceName: '牛客公开面经',
    title: '玛氏供应链管培生公开面试记录', sourceUrl: 'https://www.nowcoder.com/discuss/385916463184457728',
    summary: '公开记录覆盖 AI 面、供应链商业案例、群面、业务面与工厂终面，重点包括行业变化、流程选择、复盘和岗位适配。',
    topics: ['供应链趋势', '群面案例', '业务面', '工厂终面', '岗位适配'],
  },
  {
    id: 'nestle-trainee-experience', kind: 'candidate-experience', company: '雀巢 Nestlé', roleIds: ['operations', 'supply-chain'], period: '秋招公开记录', sourceName: '牛客公开面经',
    title: '雀巢管培生公开面试复盘', sourceUrl: 'https://www.nowcoder.com/discuss/386658971187245056',
    summary: '公开记录包括网申测评、英文视频、电话面试、AC 群面、展示和终面，体现英文表达、商业案例和岗位认知。',
    topics: ['英文视频', '电话面试', 'AC群面', '商业展示', '岗位认知'],
  },
];

export const ROLE_PREP_PROFILES: RolePrepProfile[] = [
  {
    id: 'data-analysis', name: '数据分析 / 商业分析', shortName: '数据分析',
    description: '从 SQL 和统计基础走到指标体系、实验与业务决策，避免只会工具不会解释业务。',
    keywords: ['数据分析', '商业分析', '经营分析', '数据科学', 'business analyst', 'data analyst', 'ba/ds', 'bi分析', '策略分析'],
    jdSignals: ['SQL与数据处理', '指标体系与数据口径', '经营或用户分析', '实验设计与策略评估', '跨团队推动决策'],
    writtenFocus: ['SQL查询与窗口函数', '概率统计与假设检验', '资料分析', '业务数据判断', 'Python或数据工具'],
    interviewFocus: ['项目和实习深挖', '指标异常归因', 'A/B实验', '业务问题拆解', '分析结论落地'],
    evidenceIds: ['meituan-ba-jd', 'jd-da-2024', 'byte-ds-2024', 'meituan-ba-2022'],
  },
  {
    id: 'product', name: '产品经理 / 策略产品', shortName: '产品经理',
    description: '核心不是背产品术语，而是理解用户、业务、数据和研发约束后做出可验证的取舍。',
    keywords: ['产品经理', '产品策划', '产品运营', '数据产品', '策略产品', '用户产品', '产品培训生', 'product manager'],
    jdSignals: ['用户与场景研究', '需求和优先级管理', '产品方案与原型', '数据分析与效果评估', '跨职能协作'],
    writtenFocus: ['逻辑与资料分析', '产品场景判断', '商业常识', '数据理解', '部分岗位编程或专业测试'],
    interviewFocus: ['项目深挖', '产品分析', '业务场景题', '需求优先级', '群面与方案展示'],
    evidenceIds: ['tencent-pm-2025', 'tencent-pm-2024', 'meituan-pm-2024', 'byte-pm-2023'],
  },
  {
    id: 'backend', name: '后端 / 服务端开发', shortName: '后端开发',
    description: '校招通常同时考察算法、计算机基础、项目真实性和工程排障，不宜只刷八股。',
    keywords: ['后端', '后台开发', '服务端', 'java', 'golang', 'go开发', 'c++开发', '软件开发', '研发工程师', 'server'],
    jdSignals: ['至少一门主力语言', '数据结构与算法', '数据库和缓存', '网络与操作系统', '高并发或分布式工程'],
    writtenFocus: ['编程算法', '语言基础', '计算机网络', '数据库', '操作系统'],
    interviewFocus: ['项目逐层追问', '基础原理', '算法手撕', '系统设计', '故障排查'],
    evidenceIds: ['byte-backend-2025', 'mt-tencent-backend-2024', 'tencent-backend-2024', 'pg-it-experience'],
  },
  {
    id: 'frontend', name: '前端 / Web 开发', shortName: '前端开发',
    description: '从 JavaScript、浏览器和网络基础延伸到框架、工程化、性能与真实项目权衡。',
    keywords: ['前端', 'web开发', 'web前端', 'javascript', 'react', 'vue', '客户端开发'],
    jdSignals: ['JavaScript与浏览器基础', '主流框架', '网络与Web安全', '工程化与性能', '跨端或服务端渲染'],
    writtenFocus: ['JavaScript', '数据结构与算法', '浏览器与网络', '代码阅读', '框架基础'],
    interviewFocus: ['项目深挖', '框架原理', '工程化', '性能优化', '手写代码'],
    evidenceIds: ['frontend-multi-2024'],
  },
  {
    id: 'ai-agent', name: 'AI Agent / 大模型应用', shortName: 'AI Agent',
    description: '这类岗位通常是“大模型应用 + 后端工程”，要同时证明效果、稳定性、评测与成本意识。',
    keywords: ['ai agent', 'agent开发', '智能体', '大模型应用', 'llm应用', 'rag', 'ai coding', '生成式ai', 'aigc', '全栈开发(ai)'],
    jdSignals: ['RAG与检索', 'Agent规划和工具调用', '上下文与记忆', '模型评测与安全', '服务化、延迟与成本'],
    writtenFocus: ['Python或后端基础', '算法编程', 'LLM基础', 'RAG与向量检索', '系统设计'],
    interviewFocus: ['Agent项目深挖', '坏案例与评测', '工具失败处理', '记忆和上下文', '工程稳定性'],
    evidenceIds: ['byte-campus-2027', 'baidu-campus-ai', 'byte-agent-2026', 'tencent-ai-app-2026', 'byte-backend-2025'],
  },
  {
    id: 'algorithm', name: '算法 / 大模型 / AI Infra', shortName: '算法与模型',
    description: '按研究、应用算法和 AI Infra 区分准备深度，重点核对岗位到底需要模型、系统还是业务算法。',
    keywords: ['算法工程师', '机器学习', '深度学习', '推荐算法', '搜索算法', '大模型算法', 'ai infra', '推理引擎', '模型研发', '计算机视觉', '自然语言处理'],
    jdSignals: ['机器学习与深度学习', '算法与数学基础', '训练或推理系统', '论文和项目复现', '业务指标或性能优化'],
    writtenFocus: ['算法编程', '概率统计', '机器学习基础', '深度学习', '数学推导'],
    interviewFocus: ['论文与项目深挖', '模型原理', '训练评测', '算法手撕', '业务或系统优化'],
    evidenceIds: ['byte-campus-2027', 'baidu-campus-ai', 'byte-llm-2025', 'ai-infra-2025', 'byte-ds-2024'],
  },
  {
    id: 'operations', name: '运营 / 市场 / 增长', shortName: '运营市场',
    description: '需要把内容、用户、渠道或品牌动作落到目标人群、转化漏斗、预算与复盘证据。',
    keywords: ['运营', '市场营销', '品牌', '增长', '用户运营', '内容运营', '电商运营', '营销管培', '客户发展'],
    jdSignals: ['用户与市场洞察', '活动和内容策划', '渠道与转化', '数据复盘', '跨团队执行'],
    writtenFocus: ['逻辑和资料分析', '商业常识', '英文材料', '情境判断', '基础数据分析'],
    interviewFocus: ['项目结果深挖', '活动复盘', '消费者洞察', '增长方案', '行为面试'],
    evidenceIds: ['byte-pm-2023', 'pg-process', 'pg-it-experience', 'pg-supply-experience', 'nestle-trainee-experience', 'mars-supply-experience'],
  },
  {
    id: 'finance-consulting', name: '金融 / 审计 / 咨询', shortName: '金融咨询',
    description: '先分清银行统一笔试、专业服务测评和案例面试，所有“官方题库”说法都要谨慎。',
    keywords: ['银行', '金融', '财务', '审计', '咨询', '税务', '风险管理', '投行', '证券', '会计'],
    jdSignals: ['经济金融或会计基础', '数据和逻辑分析', '合规与风险', '客户沟通', '商业案例'],
    writtenFocus: ['行测与资料分析', '经济金融', '英语', '专业知识', '情境判断'],
    interviewFocus: ['求职动机', '案例分析', '行业理解', '合规判断', '客户沟通'],
    evidenceIds: ['boc-2026-written', 'deloitte-process', 'ey-2023-experience', 'pg-process'],
  },
  {
    id: 'supply-chain', name: '供应链 / 采购 / 制造运营', shortName: '供应链',
    description: '围绕计划、采购、库存、质量、交付与跨部门协同准备，回答要体现数据和现场约束。',
    keywords: ['供应链', '采购', '物流', '计划', '生产管理', '质量管理', '制造运营', '仓储', '交付'],
    jdSignals: ['需求与供应计划', '库存和交付', '供应商管理', '质量与风险', '流程改善'],
    writtenFocus: ['数量与资料分析', '逻辑判断', '供应链基础', '英语', '情境判断'],
    interviewFocus: ['流程改善', '多任务优先级', '供应中断', '影响他人', '跨团队协同'],
    evidenceIds: ['pg-process', 'pg-supply-experience', 'mars-supply-experience', 'nestle-trainee-experience'],
  },
];

const companyAliases: Array<{ name: string; aliases: string[] }> = [
  { name: '字节跳动', aliases: ['字节跳动', '字节', '抖音', '豆包'] },
  { name: '腾讯', aliases: ['腾讯', '鹅厂'] },
  { name: '美团', aliases: ['美团', '大众点评'] },
  { name: '京东', aliases: ['京东'] },
  { name: '百度', aliases: ['百度'] },
  { name: '宝洁 P&G', aliases: ['宝洁', 'p&g'] },
  { name: '中国银行', aliases: ['中国银行', '中行'] },
  { name: '德勤', aliases: ['德勤', 'deloitte'] },
];

export function matchRoleProfiles(text: string): RolePrepProfile[] {
  const normalized = text.toLowerCase();
  return ROLE_PREP_PROFILES
    .map(profile => ({ profile, score: profile.keywords.reduce((score, keyword) => score + (normalized.includes(keyword.toLowerCase()) ? 1 : 0), 0) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(item => item.profile);
}

export function matchCompanyName(text: string): string | null {
  const normalized = text.toLowerCase();
  return companyAliases.find(company => company.aliases.some(alias => normalized.includes(alias.toLowerCase())))?.name ?? null;
}

export function evidenceForRole(profile: RolePrepProfile, company?: string | null): PrepEvidence[] {
  const records = profile.evidenceIds
    .map(id => PREP_EVIDENCE.find(item => item.id === id))
    .filter((item): item is PrepEvidence => Boolean(item));
  if (!company) return records;
  const companyRecords = records.filter(item => item.company.includes(company) || company.includes(item.company));
  return companyRecords.length ? [...companyRecords, ...records.filter(item => !companyRecords.includes(item))] : records;
}

export function sourceKindLabel(kind: PrepSourceKind): string {
  if (kind === 'official-jd') return '官方 JD';
  if (kind === 'official-process') return '官方流程';
  if (kind === 'candidate-experience') return '求职者公开面经';
  return '公开面经汇总';
}

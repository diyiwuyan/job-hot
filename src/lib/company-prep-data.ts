export type CompanyInterviewQuestion = {
  id: string;
  dimension: string;
  prompt: string;
  framework: string[];
  followups: string[];
};

export type CompanyPrepProfile = {
  id: string;
  name: string;
  shortName: string;
  sector: '快消' | '专业服务';
  accent: string;
  roles: string[];
  process: string[];
  writtenFocus: string[];
  interviewFocus: string[];
  questions: CompanyInterviewQuestion[];
  casePractice: {
    title: string;
    prompt: string;
    deliverable: string;
    timebox: string;
  };
  officialUrl: string;
  experienceUrl: string;
  sourceNote: string;
};

const commonBoundary = '流程按官网公开说明和公开面经归纳，会随地区、岗位与招聘批次变化；练习问题和案例均为本站原创，不是企业内部题库。';

export const COMPANY_PREP_PROFILES: CompanyPrepProfile[] = [
  {
    id: 'pg', name: '宝洁 P&G', shortName: '宝洁', sector: '快消', accent: '#173f8a',
    roles: ['市场', '客户生意发展', '供应链', '财务', '人力资源', '研发'],
    process: ['在线申请与岗位问卷', 'Peak Performance / Interactive Assessment（视岗位）', '行为面试或岗位专项面试', 'Offer'],
    writtenFocus: ['工作态度与行为倾向', '数理计算', '规则与路径推理', '短时记忆与注意力', '岗位情境判断'],
    interviewFocus: ['领导力与主动性', '挑战性目标', '分析与决策', '协作与冲突', '事实说服', '创新', '优先级', '快速学习与应用'],
    questions: [
      { id: 'pg-1', dimension: '高目标与执行', prompt: '讲一次你主动设定了明显高于常规要求的目标，并最终交付结果的经历。', framework: ['说明为什么目标足够高', '拆解障碍和阶段计划', '突出你的关键行动', '用数据说明结果和代价'], followups: ['目标是你制定的还是别人给的？', '中途哪个判断最关键？', '如果没达成你会怎样复盘？'] },
      { id: 'pg-2', dimension: '领导力', prompt: '讲一次你没有正式权力，却推动多人共同完成重要任务的经历。', framework: ['建立共同目标', '识别成员动机与阻力', '说明你如何影响而非命令', '呈现团队结果'], followups: ['谁最不认同你？', '你做了什么让他改变？', '团队成员如何评价你的贡献？'] },
      { id: 'pg-3', dimension: '分析决策', prompt: '描述一次信息混乱、时间有限时，你如何找到关键问题并做出决定。', framework: ['明确决策目标', '区分事实、假设和未知', '比较选项与风险', '说明结果和后续校准'], followups: ['你放弃了哪些信息？', '判断错了会造成什么影响？', '有没有更低成本的验证？'] },
      { id: 'pg-4', dimension: '事实说服', prompt: '讲一次你用数据或事实让原本不同意的人接受方案的经历。', framework: ['还原分歧', '理解对方利益和顾虑', '选择有效证据', '说明最终共识与结果'], followups: ['对方最初为什么反对？', '数据来源可靠吗？', '如果事实仍说服不了对方怎么办？'] },
      { id: 'pg-5', dimension: '创新与学习', prompt: '讲一次你快速学会新技能，并把它转化成实际成果的经历。', framework: ['说明真实任务和技能缺口', '展示学习路径', '描述第一次应用和反馈', '量化最终贡献'], followups: ['为什么不用旧方法？', '你如何验证自己真的学会了？', '这项技能后来还能复用吗？'] },
      { id: 'pg-6', dimension: '有效协作', prompt: '讲一次你与工作方式明显不同的人合作，并共同完成重要结果的经历。', framework: ['说明差异造成的具体摩擦', '识别彼此优势与约束', '调整分工和沟通机制', '用共同结果收尾'], followups: ['你自己做了哪些妥协？', '有没有正面冲突？', '如果重来如何更早建立协作？'] },
      { id: 'pg-7', dimension: '创新贡献', prompt: '讲一次你提出的新想法对项目成功产生了关键贡献的经历。', framework: ['说明旧方法的限制', '解释创意从哪里产生', '展示验证与推动过程', '量化创新带来的变化'], followups: ['别人为什么没有想到？', '创意失败的风险是什么？', '结果来自创意还是执行？'] },
      { id: 'pg-8', dimension: '优先级管理', prompt: '讲一次你同时面对多项重要任务，如何集中精力处理最关键事项。', framework: ['列出任务和硬约束', '建立影响与紧急度标准', '说明取舍和授权', '呈现结果及被延后事项'], followups: ['你放弃了什么？', '谁不同意你的排序？', '如何防止紧急但不重要的事占满时间？'] },
    ],
    casePractice: { title: '校园新品试用计划', prompt: '某日化新品希望在三个月内进入大学生人群，预算80万元。现有校园社团、内容达人、线下快闪、电商券和试用装五类资源，请制定人群、渠道、预算和效果评估方案。', deliverable: '8分钟陈述：消费者洞察、资源分配、核心指标、风险与两周验证计划。', timebox: '阅读15分钟 · 准备25分钟 · 陈述8分钟 · 追问10分钟' },
    officialUrl: 'https://www.pgcareers.com/global/en/hiring-process',
    experienceUrl: 'https://www.nowcoder.com/discuss/353158088947605504',
    sourceNote: commonBoundary,
  },
  {
    id: 'unilever', name: '联合利华 Unilever', shortName: '联合利华', sector: '快消', accent: '#1769aa',
    roles: ['市场', '客户发展', '供应链', '财务', '人力资源', '研发'],
    process: ['在线申请（不同项目可能含开放题）', '在线测评 / 视频面试（视项目）', 'Assessment Centre：群面、角色扮演或个人案例', '单面与Offer'],
    writtenFocus: ['数理与数据素养', '英文商业材料', '情境判断', '市场份额与利润', '供应链案例'],
    interviewFocus: ['商业意识', '消费者与客户理解', '长英文材料提炼', '跨团队协作', '可持续发展', '英文表达'],
    questions: [
      { id: 'u-1', dimension: '商业分析', prompt: '某品牌销量增长但利润下降，你会如何定位问题并提出优先动作？', framework: ['拆价格、销量、渠道和促销', '区分收入与增量利润', '识别短期与长期影响', '提出验证顺序'], followups: ['先看哪三张表？', '如果是渠道补贴导致怎么办？', '如何避免只追求短期销量？'] },
      { id: 'u-2', dimension: '消费者洞察', prompt: '请选择一个你熟悉的日常消费品，说明一个被忽视的用户需求。', framework: ['限定具体人群和场景', '描述行为与矛盾', '给出证据来源', '提出最小验证'], followups: ['这是真需求还是你的想象？', '消费者现在如何替代解决？', '愿意为它付多少钱？'] },
      { id: 'u-3', dimension: '协作与分歧', prompt: '讲一次你在团队讨论方向明显偏离时提出反对意见并推动修正的经历。', framework: ['说明偏离造成的风险', '先复述已有观点', '用标准或证据提出异议', '形成团队结果'], followups: ['你为什么没有更早说？', '别人如何回应？', '你会不会过于强势？'] },
      { id: 'u-4', dimension: '英文案例', prompt: '如果给你20页英文商业材料和25分钟，你会怎样完成阅读、判断和展示？', framework: ['先看任务与交付', '建立问题树', '标记关键数字和假设', '预留结论与风险'], followups: ['读不完怎么办？', '如何分工？', '遇到矛盾数据怎么处理？'] },
      { id: 'u-5', dimension: '可持续商业', prompt: '环保包装成本更高，你如何判断它是否值得上线？', framework: ['明确法规与消费者价值', '测算全生命周期成本', '比较品牌与渠道收益', '设计小规模验证'], followups: ['消费者不愿付费怎么办？', '如何避免漂绿？', '有哪些护栏指标？'] },
    ],
    casePractice: { title: '区域客户增长方案', prompt: '一个成熟清洁品牌在华东大卖场渠道份额下降3个百分点，电商增长但利润较低。团队可投入100万元用于促销、门店陈列、会员运营或新品试销。', deliverable: '提交渠道诊断、资源排序、客户谈判要点和90天指标。', timebox: '个人阅读20分钟 · 小组讨论30分钟 · 汇报6分钟' },
    officialUrl: 'https://careers.unilever.com/early-careers',
    experienceUrl: 'https://www.nowcoder.com/creation/subject/c981425334224fa59f4bbbd35885fb42',
    sourceNote: commonBoundary,
  },
  {
    id: 'loreal', name: '欧莱雅 L’Oréal', shortName: '欧莱雅', sector: '快消', accent: '#b88935',
    roles: ['市场', '电商', '销售', '数字化', '供应链', '管培生'],
    process: ['在线申请与作品/开放任务（视项目）', '在线测评或数字化任务', '群面 / 商业案例 / Presentation', '业务面与Offer'],
    writtenFocus: ['消费者洞察', '营销数据', '电商漏斗', '创意商业题', '英文表达'],
    interviewFocus: ['Marketing Sense', '品牌与产品理解', '审美和趋势敏感度', '商业落地', '创新表达', '多任务管理'],
    questions: [
      { id: 'lo-1', dimension: 'Marketing Sense', prompt: '选择一个你认为近期做得好的美妆营销案例，说明它为什么有效。', framework: ['目标人群与场景', '核心洞察与信息', '渠道和创意机制', '业务指标与局限'], followups: ['如果预算减半怎么改？', '哪里可能只是热度？', '竞品可以复制吗？'] },
      { id: 'lo-2', dimension: '产品推荐', prompt: '向一个从不护肤的同学推荐一款产品，你会怎么做？', framework: ['先问需求而非直接推销', '限定场景和痛点', '用易懂证据解释价值', '处理价格和风险顾虑'], followups: ['他不相信功效怎么办？', '为什么不是竞品？', '如何衡量推荐成功？'] },
      { id: 'lo-3', dimension: '商业创意', prompt: '如何让一款普通商品在原有基础上创造更高价值？', framework: ['定义人群与场景', '重组产品或服务体验', '设计收入与成本', '提出验证实验'], followups: ['新增价值来自哪里？', '消费者会付费吗？', '最先验证哪个假设？'] },
      { id: 'lo-4', dimension: '消费者冲突', prompt: '讲一次你面对难以合作的人，仍然完成共同目标的经历。', framework: ['描述具体行为差异', '识别对方动机', '调整沟通和分工', '呈现结果与边界'], followups: ['你自己有什么责任？', '有没有正面冲突？', '下次还会合作吗？'] },
      { id: 'lo-5', dimension: '优先级', prompt: '你同时面对达人临时退出、直播数据异常和新品发布会三项任务，会怎样处理？', framework: ['比较影响和不可逆性', '明确谁能并行处理', '先止损再优化', '设置升级和复盘'], followups: ['只能亲自做一件事呢？', '如何向负责人汇报？', '哪些可以延后？'] },
    ],
    casePractice: { title: '校园美妆新品上市', prompt: '一个主打敏感肌的新品面向18—24岁消费者，预算120万元，需要在内容平台、电商、校园活动和门店之间分配。品牌认知低，但试用满意度高。', deliverable: '给出人群洞察、核心信息、渠道组合、创意概念和首月指标。', timebox: '准备30分钟 · 提案8分钟 · 追问12分钟' },
    officialUrl: 'https://careers.loreal.com/',
    experienceUrl: 'https://www.nowcoder.com/discuss/386209294163750912',
    sourceNote: commonBoundary,
  },
  {
    id: 'nestle', name: '雀巢 Nestlé', shortName: '雀巢', sector: '快消', accent: '#6e4a31',
    roles: ['销售', '市场', '供应链', '生产', '研发', '财务'],
    process: ['在线申请与简历筛选', '初步沟通', '认知测评 / 案例 / 实操（视岗位）', '招聘经理与团队面试', 'Offer'],
    writtenFocus: ['数理与逻辑', '职业情境判断', '食品质量与安全', '渠道销售', '供应链'],
    interviewFocus: ['动机与岗位理解', '尊重与协作', '商业和质量意识', '执行与韧性', '英文表达'],
    questions: [
      { id: 'ne-1', dimension: '销售动机', prompt: '为什么选择一线销售或客户岗位？请结合真实经历回答。', framework: ['说明你理解的日常任务', '连接经历中的证据', '谈压力和现实约束', '说明成长目标'], followups: ['如何看待业绩压力？', '能否接受区域轮岗？', '你最不喜欢销售的什么？'] },
      { id: 'ne-2', dimension: '质量意识', prompt: '发现一批产品可能存在质量风险，但业务希望按时发货，你会怎么做？', framework: ['先控制潜在风险', '核实事实与影响范围', '按流程升级并保留记录', '提出业务替代方案'], followups: ['如果最后证明是误报呢？', '谁来承担损失？', '如何对客户沟通？'] },
      { id: 'ne-3', dimension: '渠道分析', prompt: '某区域销量增长但门店覆盖率下降，你如何解释并继续分析？', framework: ['拆单店产出与覆盖', '区分渠道和品类', '检查促销与库存', '提出增长质量判断'], followups: ['增长可持续吗？', '先拓店还是提单店？', '需要哪些外部数据？'] },
      { id: 'ne-4', dimension: '韧性', prompt: '讲一次你在连续受挫后仍然调整方法完成任务的经历。', framework: ['说明真实挫折', '识别原方法问题', '改变行动而非只讲心态', '呈现结果和边界'], followups: ['什么时候想过放弃？', '向谁求助？', '什么结果仍不满意？'] },
      { id: 'ne-5', dimension: '跨文化沟通', prompt: '如果需要用英文向不了解中国市场的同事解释本地消费者差异，你会如何准备？', framework: ['一句话结论', '选择少量关键证据', '解释文化和商业含义', '检查对方理解'], followups: ['如何避免刻板印象？', '没有完整数据怎么办？', '对方仍不认同呢？'] },
    ],
    casePractice: { title: '早餐产品区域增长', prompt: '某早餐产品在一线城市增长放缓，低线城市认知低。你有经销商培训、试吃、电商内容和便利店合作四类资源，预算有限。', deliverable: '选择目标城市与渠道，制定试点、资源分配和衡量指标。', timebox: '阅读15分钟 · 讨论30分钟 · 汇报5分钟' },
    officialUrl: 'https://www.nestle.com/jobs/recruitment-journey',
    experienceUrl: 'https://www.nowcoder.com/discuss/386658971187245056',
    sourceNote: commonBoundary,
  },
  {
    id: 'mars', name: '玛氏 Mars', shortName: '玛氏', sector: '快消', accent: '#c33b2b',
    roles: ['销售', '市场', '供应链', '财务', '管培生'],
    process: ['在线申请', '能力或英语测评（视项目）', '视频/电话面试', '群面或Assessment Centre', '业务面与Offer'],
    writtenFocus: ['英语阅读与听力', '数理逻辑', '图形推理', '工作情境', '优先级案例'],
    interviewFocus: ['结果导向', '协作与责任', '商业意识', '英文沟通', '轮岗与地域适应'],
    questions: [
      { id: 'ma-1', dimension: '结果导向', prompt: '讲一次你必须对明确业务或项目结果负责的经历。', framework: ['目标和衡量口径', '你的决策与行动', '中途偏差和修正', '最终结果与复盘'], followups: ['结果有多少是外部因素？', '你承担了什么责任？', '失败预案是什么？'] },
      { id: 'ma-2', dimension: '渠道商业', prompt: '经销商希望压低价格，但品牌不希望破坏长期价格体系，你会如何谈判？', framework: ['理解双方利益', '量化利润和销量', '设计非价格交换条件', '明确底线和试点'], followups: ['客户威胁转投竞品呢？', '什么可以让步？', '如何评估谈判结果？'] },
      { id: 'ma-3', dimension: '英文沟通', prompt: '请用英文思路介绍一次你在不确定环境下做决定的经历。', framework: ['结论先行', '用STAR保持结构', '控制专业词汇', '强调判断和结果'], followups: ['What assumption did you make?', 'What would you change?', 'How did others react?'] },
      { id: 'ma-4', dimension: '地域适应', prompt: '如果管培项目要求跨城市轮岗，你会如何判断和准备？', framework: ['说明真实约束', '连接岗位成长价值', '给出适应行动', '坦诚边界'], followups: ['家人反对怎么办？', '最难适应什么？', '多久能进入状态？'] },
      { id: 'ma-5', dimension: '团队复盘', prompt: '群面结束后，请评价自己对团队结果最有效和最需要改进的贡献。', framework: ['用可观察行为回答', '连接团队交付', '承认真实不足', '给出下一次具体改变'], followups: ['谁表现比你好？', '你影响了哪项结论？', '有没有打断别人？'] },
    ],
    casePractice: { title: '零食渠道资源排序', prompt: '新品首发有商超、电商、便利店、校园和内容达人五个渠道，但库存只能支持三个。每个渠道在覆盖、毛利、回款和品牌建设上各有优劣。', deliverable: '建立评价标准，选出三个渠道并给出库存、预算和风险预案。', timebox: '个人阅读8分钟 · 小组讨论35分钟 · 汇报3分钟' },
    officialUrl: 'https://careers.mars.com/global/en/students-graduates',
    experienceUrl: 'https://www.nowcoder.com/discuss/385916463184457728',
    sourceNote: commonBoundary,
  },
  {
    id: 'deloitte', name: '德勤 Deloitte', shortName: '德勤', sector: '专业服务', accent: '#78be20',
    roles: ['审计与鉴证', '咨询', '税务', '风险咨询', '财务顾问'],
    process: ['在线申请', '认知能力、职业性格与数智认知测试', '德勤面试日：群面与单面', 'Offer'],
    writtenFocus: ['图形与逻辑推理', '商业数理', '职业性格', 'AI与数智认知', '专业基础'],
    interviewFocus: ['英文材料分析', '逻辑与创新', '团队协作', '专业判断', '简历深挖', '行业与生成式AI观点'],
    questions: [
      { id: 'de-1', dimension: '专业动机', prompt: '为什么选择专业服务，而不是进入企业做内部职能？', framework: ['说明对工作方式的理解', '连接项目经历', '谈学习强度与客户服务', '说明长期方向'], followups: ['如何看待加班和出差？', '为什么是这个业务线？', '两年后想获得什么？'] },
      { id: 'de-2', dimension: '风险判断', prompt: '客户要求你忽略一项看似金额不大的异常，你会如何处理？', framework: ['区分金额和性质重要性', '核验证据', '记录专业判断', '按项目治理升级'], followups: ['客户因此投诉你怎么办？', '什么时候需要扩大测试？', '如何兼顾关系？'] },
      { id: 'de-3', dimension: 'GAI观点', prompt: '生成式AI会怎样改变审计或咨询初级岗位？', framework: ['先拆可自动化任务', '说明新的风险和责任', '指出人类判断价值', '给出个人准备行动'], followups: ['哪些任务不能交给AI？', '如何验证输出？', '初级员工还学什么？'] },
      { id: 'de-4', dimension: '群面贡献', prompt: '讲一次你帮助团队从大量材料中快速形成共同结论的经历。', framework: ['建立结构与分工', '提取关键证据', '管理分歧与时间', '形成交付'], followups: ['你是Leader吗？', '漏掉了什么？', '如何确保别人参与？'] },
      { id: 'de-5', dimension: '客户沟通', prompt: '客户不认同你的分析结论并在会上直接质疑，你会怎么回应？', framework: ['确认问题和口径', '用来源与假设解释', '承认不确定性', '提出下一步核验'], followups: ['如果你确实算错了呢？', '如何保护团队信任？', '会后做什么？'] },
    ],
    casePractice: { title: '制造企业数字化转型', prompt: '一家传统制造企业计划投入3000万元建设AI质检、供应链预测或客户服务平台，只能先选一个。现有数据不完整，管理层目标也不一致。', deliverable: '建立选择标准、推荐项目、测算价值并给出实施风险。', timebox: '阅读20分钟 · 小组讨论30分钟 · 汇报6分钟' },
    officialUrl: 'https://www.deloitte.com/cn/zh/careers/explore-your-fit/find-your-possible/our-recruitment-process.html',
    experienceUrl: 'https://www.nowcoder.com/discuss/353159156179869696',
    sourceNote: commonBoundary,
  },
  {
    id: 'pwc', name: '普华永道 PwC', shortName: '普华永道', sector: '专业服务', accent: '#d04a02',
    roles: ['审计', '咨询', '税务', '风险及控制', '交易服务'],
    process: ['在线申请', '认知能力测试与职业性格问卷', 'PwC Superday：商业模拟、讨论、展示与面试', 'Offer'],
    writtenFocus: ['限时认知能力', '数理和逻辑', '职业性格', '商业理解', '专业情境'],
    interviewFocus: ['PwC Professional能力', '英文案例', 'Presentation', '简历与职业动机', '客户沟通', '诚信判断'],
    questions: [
      { id: 'pwc-1', dimension: '职业动机', prompt: '为什么申请审计、咨询或税务中的这个具体方向？', framework: ['说明业务线工作内容', '连接课程和经历', '承认挑战', '给出成长目标'], followups: ['为什么不是另外两条线？', '你理解的忙季是什么？', '客户价值在哪里？'] },
      { id: 'pwc-2', dimension: '诚信判断', prompt: '你发现团队底稿存在可能影响结论的错误，但截止时间临近，会怎么做？', framework: ['立即标记和核验', '判断影响范围', '透明同步负责人', '修正并保留记录'], followups: ['如果错误是你造成的？', '会导致延期怎么办？', '如何防止再发生？'] },
      { id: 'pwc-3', dimension: '商业模拟', prompt: '如何在10分钟内向客户解释一项复杂分析并获得下一步确认？', framework: ['先给结论和影响', '只保留关键证据', '说明假设与选项', '明确客户决策点'], followups: ['客户没有专业背景怎么办？', '只能用一页PPT呢？', '对方拒绝建议呢？'] },
      { id: 'pwc-4', dimension: '团队协作', prompt: '讲一次你与专业背景完全不同的人合作解决问题的经历。', framework: ['说明认知差异', '建立共同语言', '调整分工和沟通', '呈现协同结果'], followups: ['最大的误解是什么？', '你学到了什么？', '谁做了关键决定？'] },
      { id: 'pwc-5', dimension: '合伙人面', prompt: '如果让你向合伙人说明自己未来三年能为团队带来什么，你会怎么回答？', framework: ['第一年可靠交付', '第二年形成专业积累', '第三年承担客户与团队责任', '连接真实优势'], followups: ['你的差异化是什么？', '如何证明能做到？', '如果方向变化呢？'] },
    ],
    casePractice: { title: '零售企业盈利改善', prompt: '一家区域零售商收入增长但利润连续下降。材料显示门店、人效、库存、线上渠道和促销均有变化，需要在六个月内改善盈利。', deliverable: '诊断利润驱动、提出三项优先措施、估算影响并说明风险。', timebox: '阅读15分钟 · 讨论30分钟 · 展示8分钟' },
    officialUrl: 'https://www.pwccn.com/en/careers/students.html',
    experienceUrl: 'https://www.nowcoder.com/discuss/353155940142751744',
    sourceNote: commonBoundary,
  },
  {
    id: 'ey', name: '安永 EY', shortName: '安永', sector: '专业服务', accent: '#ffe600',
    roles: ['审计', '咨询', '税务', '战略与交易', '金融服务'],
    process: ['在线申请', '在线测评', '面试或Assessment Centre（安排随岗位）', 'Offer'],
    writtenFocus: ['数理逻辑', '职业判断', '英文阅读', '商业情境', '专业基础'],
    interviewFocus: ['个人故事与优势', '行业观点', '团队合作', '数字化与技术', '客户服务', '职业动机'],
    questions: [
      { id: 'ey-1', dimension: '个人故事', prompt: '哪段经历最能说明你会在安永申请的岗位上成功？', framework: ['先说岗位关键能力', '选择高相关经历', '突出个人判断与行动', '连接未来贡献'], followups: ['为什么选这段？', '结果可验证吗？', '你的短板是什么？'] },
      { id: 'ey-2', dimension: '行业观点', prompt: '选择一个正在改变你所申请业务线的趋势，并说明客户影响。', framework: ['定义趋势', '分析客户机会与风险', '说明专业服务切入点', '给出个人观点'], followups: ['谁会受损？', '有什么反例？', '两年内会发生什么？'] },
      { id: 'ey-3', dimension: '学习敏捷', prompt: '讲一次你必须快速掌握陌生专业知识并交付成果的经历。', framework: ['明确知识缺口', '建立学习地图', '用任务验证', '寻求专家反馈'], followups: ['如何判断资料可信？', '学错方向怎么办？', '最终沉淀了什么？'] },
      { id: 'ey-4', dimension: '客户服务', prompt: '如果客户提出超出项目范围但很紧急的需求，你会如何处理？', framework: ['理解真实紧急性', '评估范围和风险', '与负责人确认资源', '给客户清晰选项'], followups: ['客户坚持免费怎么办？', '会影响原交付呢？', '如何保留关系？'] },
      { id: 'ey-5', dimension: '团队冲突', prompt: '讲一次你与团队成员对质量标准理解不同，最后如何处理。', framework: ['对齐交付定义', '拿出样例或标准', '协商检查机制', '说明结果'], followups: ['谁的标准更合理？', '时间不够怎么办？', '关系受影响了吗？'] },
    ],
    casePractice: { title: '金融机构客户体验改造', prompt: '一家银行希望通过AI客服降低成本，但投诉集中在复杂业务无法解决、隐私担忧和转人工困难。', deliverable: '提出目标、用户分层、流程改造、技术边界与衡量指标。', timebox: '准备20分钟 · 陈述6分钟 · 追问10分钟' },
    officialUrl: 'https://www.ey.com/en_cn/careers/student-programs-in-chinese-mainland',
    experienceUrl: 'https://www.nowcoder.com/discuss/412273907049267200',
    sourceNote: commonBoundary,
  },
  {
    id: 'kpmg', name: '毕马威 KPMG', shortName: '毕马威', sector: '专业服务', accent: '#00338d',
    roles: ['审计', '咨询', '税务', '交易与重组', '技术与数据'],
    process: ['在线申请', 'Assessment Tests', '群面 / 经理面 / 合伙人面（视岗位）', 'Offer'],
    writtenFocus: ['数理逻辑', '英语商业材料', '职业判断', '数据分析', '专业基础'],
    interviewFocus: ['快速学习', '案例分析', '英文展示', '团队贡献', '职业动机', '专业诚信'],
    questions: [
      { id: 'kp-1', dimension: '快速学习', prompt: '证明你能在很短时间内进入陌生行业并形成有价值的判断。', framework: ['建立行业结构', '优先一手和权威来源', '访谈或交叉验证', '输出结论与局限'], followups: ['你用了多长时间？', '哪个判断后来错了？', '如何向非专业者解释？'] },
      { id: 'kp-2', dimension: '案例分析', prompt: '客户利润下滑，你会如何在没有完整数据时开始诊断？', framework: ['利润树拆解', '列关键假设', '确定最小数据需求', '安排验证优先级'], followups: ['如果收入没变呢？', '先访谈谁？', '一周内交付什么？'] },
      { id: 'kp-3', dimension: '英文展示', prompt: '如何准备一份全英文案例展示，确保逻辑和表达都可靠？', framework: ['结论先行', '每页一个信息', '数字口径一致', '提前准备追问'], followups: ['忘词怎么办？', '听不懂问题怎么办？', '团队如何分工？'] },
      { id: 'kp-4', dimension: '专业诚信', prompt: '经理的判断与你看到的证据不一致，你会怎么做？', framework: ['复核自己的事实', '选择合适时机沟通', '用标准和证据表达', '必要时按治理机制升级'], followups: ['担心得罪经理吗？', '如果你错了？', '什么情况必须升级？'] },
      { id: 'kp-5', dimension: '产品推荐', prompt: '根据一次简短沟通，为面试官推荐一项服务或产品，你会如何完成？', framework: ['先提问了解需求', '总结关键约束', '匹配价值而非堆功能', '说明选择理由'], followups: ['信息不足怎么办？', '为什么不推荐更贵的？', '对方拒绝呢？'] },
    ],
    casePractice: { title: '新能源企业海外扩张', prompt: '一家新能源零部件企业考虑进入三个海外市场。材料包含市场规模、政策、汇率、供应链、客户集中度和合规风险。', deliverable: '建立市场选择模型，推荐进入顺序并给出前100天计划。', timebox: '阅读25分钟 · 小组讨论30分钟 · 英文展示6分钟' },
    officialUrl: 'https://kpmg.com/cn/en/careers/campus/graduate-applications.html',
    experienceUrl: 'https://www.nowcoder.com/discuss/353156922431971328',
    sourceNote: commonBoundary,
  },
];

export const COMPANY_INTERVIEW_QUESTION_COUNT = COMPANY_PREP_PROFILES.reduce((total, company) => total + company.questions.length, 0);

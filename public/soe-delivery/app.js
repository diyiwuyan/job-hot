const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const industryRoles = {
  能源电力: ["电气工程", "新能源开发", "生产运维", "安全环保", "项目管理", "财务审计"],
  通信与电子信息: ["软件开发", "网络优化", "信息安全", "数据分析", "产品运营", "技术支持"],
  军工航天: ["系统设计", "研发测试", "质量可靠性", "工艺制造", "保密合规", "供应链管理"],
  交通运输: ["运输组织", "工程建设", "信息化", "设备检修", "物流运营", "市场商务"],
  建筑基建: ["工程管理", "造价合约", "设计咨询", "施工技术", "安全管理", "投融资"],
  装备制造: ["机械设计", "工艺工程", "质量管理", "设备管理", "供应链", "智能制造"],
  金融投资: ["管培生", "投融资", "风控合规", "财务审计", "数据分析", "客户经理"],
  商贸物流: ["供应链运营", "采购招采", "国际业务", "仓储物流", "市场拓展", "财务管理"],
  农业食品: ["食品质量", "供应链", "生产管理", "品牌营销", "农林技术", "财务管理"],
  医药健康: ["研发注册", "质量管理", "医学事务", "产品运营", "供应链", "财务合规"],
  文化传媒: ["编辑出版", "新媒体运营", "品牌宣传", "版权商务", "活动策划", "党建宣传"],
  "综合服务/科研平台": ["咨询研究", "职能管理", "项目运营", "人力行政", "法务合规", "信息化"]
};

const prepPatterns = {
  能源电力: {
    written: "行测/综合能力、企业文化、电气或能源专业知识，电网类常见专业课考查更重。",
    interview: "半结构化面试较常见，会问稳定性、项目经历、是否接受基层轮岗和现场岗位。",
    coach: "训练学生用课程、实验、实习、竞赛证明“能下现场、能做运维、能长期稳定”。"
  },
  通信与电子信息: {
    written: "行测、计算机/通信基础、编程或网络知识，部分技术岗会有在线测评或专业笔试。",
    interview: "技术面会追问项目细节、系统设计、网络安全或数据处理；运营商还会看沟通表达。",
    coach: "让学生准备 2 个可讲深的项目，并把技术难点、个人贡献、结果指标讲清楚。"
  },
  军工航天: {
    written: "专业课、数学逻辑、英语和综合测评较常见，研发岗会看课程基础和科研经历。",
    interview: "更看稳定性、保密意识、抗压与长期投入，技术面会从课题和实验细节切入。",
    coach: "强调政治可靠、工程严谨、愿意长期深耕；避免只谈薪资和城市舒适度。"
  },
  金融投资: {
    written: "行测、经济金融、英语、性格测评，银行和保险常见统一机考。",
    interview: "无领导小组、半结构化、案例分析较常见，会追问实习、风控意识和客户沟通。",
    coach: "让学生准备宏观认知、金融业务理解、数字敏感度和风险意识案例。"
  },
  建筑基建: {
    written: "行测、工程基础、企业文化、安全生产和项目管理常识。",
    interview: "会问项目经历、能否接受外派、现场条件、施工节奏和职业稳定性。",
    coach: "必须提前确认外派/项目制接受度，并把吃苦耐劳讲成可验证的经历。"
  },
  交通运输: {
    written: "行测、岗位基础、英语和企业文化，轨交/航空/港航岗位会考行业常识。",
    interview: "看服务意识、纪律性、排班接受度、突发问题处理和城市稳定性。",
    coach: "适合准备“安全意识、流程意识、跨部门协作”的具体故事。"
  },
  文化传媒: {
    written: "写作、编辑、新闻传播基础、时政热点、综合能力，部分岗位要求作品集。",
    interview: "会看内容判断、选题能力、表达风格、政治敏感度和抗压修稿能力。",
    coach: "带学生整理作品集、公众号/视频数据、活动案例和一篇现场命题写作模板。"
  },
  装备制造: {
    written: "机械、电气、材料、制造基础和综合能力，研发岗更看专业课。",
    interview: "技术面会围绕毕业设计、实习工艺、质量问题处理和制造现场理解展开。",
    coach: "让学生准备“问题-分析-改进-结果”的工程案例，别只罗列课程名称。"
  },
  商贸物流: {
    written: "行测、英语、供应链/国贸基础、商务数据分析。",
    interview: "常问国际业务、客户沟通、采购谈判、跨部门协同和抗压。",
    coach: "外语、跨境项目、商务谈判、数据分析经历都要转成岗位证据。"
  },
  农业食品: {
    written: "行测、食品/农学基础、质量安全、企业文化。",
    interview: "重视质量意识、生产现场理解、供应链稳定性和区域接受度。",
    coach: "适合强调食品安全、质量管理、基层轮岗和长期主义。"
  },
  医药健康: {
    written: "医药基础、法规注册、质量体系、综合能力。",
    interview: "会追问实验/课题、GMP/质量意识、医学沟通和合规边界。",
    coach: "研发型学生讲课题深度，运营型学生讲合规沟通和产品理解。"
  },
  "综合服务/科研平台": {
    written: "行测、申论式写作、时政、专业基础或岗位案例。",
    interview: "半结构化较常见，会问组织协调、政策理解、稳定性和材料写作。",
    coach: "适合整理材料写作、项目统筹、政策研究和组织协调证据。"
  }
};

const DISPLAY_LIMIT = 7;

const rolePlaybooks = [
  {
    key: "software",
    match: /软件|开发|算法|数据|信息化|信创|系统|产品运营|数据分析/,
    majorIds: ["cs", "telecom", "finance"],
    names: ["信息技术岗", "软件开发工程师", "数据分析岗", "数字化项目管理岗", "信创适配岗"],
    written: ["行测/综合能力", "计算机基础：操作系统、数据库、网络", "编程题或伪代码题", "企业文化与行业常识"],
    questions: [
      "介绍一个你最能讲深的项目，你负责哪一块？",
      "项目里遇到过什么性能、稳定性或数据质量问题？怎么定位？",
      "数据库索引、事务、锁、缓存这些概念你怎么理解？",
      "如果业务部门提出一个模糊的信息化需求，你会怎么拆解？",
      "为什么不去互联网公司，而选择央国企的信息技术岗？"
    ],
    evidence: "课程项目、实习系统、算法/数据竞赛、GitHub 或作品链接、可量化的项目结果。",
    caution: "央国企技术岗常常不是纯写代码，可能包含需求沟通、供应商协同和项目管理。"
  },
  {
    key: "network",
    match: /网络|通信|信息安全|安全|嵌入式|硬件|测试|系统集成|网络优化/,
    majorIds: ["telecom", "cs", "electric"],
    names: ["通信网络工程师", "网络安全岗", "系统集成岗", "硬件测试岗", "运维支撑岗"],
    written: ["通信原理/计算机网络", "网络安全基础", "Linux/脚本/数据库基础", "行测与英语"],
    questions: [
      "TCP/IP、路由、交换、DNS、HTTPS 的基本流程是什么？",
      "做过哪些通信、嵌入式、网络或安全相关项目？",
      "一次线上故障或实验异常，你是怎么排查的？",
      "你如何理解运营商/央企的网络安全责任？",
      "是否接受省分公司、地市公司或一线网络岗位轮岗？"
    ],
    evidence: "通信实验、网络配置、安全攻防练习、证书、竞赛、实习中的故障处理案例。",
    caution: "这类岗位很看专业基础和现场支撑意愿，咨询时要确认学生是否接受值班和区域分配。"
  },
  {
    key: "electrical",
    match: /电气|电网|新能源|电力|储能|设备|运维|调度|电力电子/,
    majorIds: ["electric", "mechanical"],
    names: ["电气工程师", "电网运检岗", "新能源开发岗", "设备管理岗", "电力建设项目岗"],
    written: ["电路、电机、电力系统分析", "继电保护/高电压/电力电子基础", "行测与企业文化", "安全生产常识"],
    questions: [
      "电力系统潮流、短路、继电保护的基本概念是什么？",
      "你的毕业设计或实习项目里有哪些电气专业证据？",
      "你怎么看待基层站所、检修、现场运维工作？",
      "新能源并网、储能、智能电网你了解哪些趋势？",
      "如果现场出现设备异常，你会按什么流程处理？"
    ],
    evidence: "电气课程、实验、竞赛、实习、毕业设计、CAD/仿真/PLC/电力软件经历。",
    caution: "电气类好机会多，但总部/省公司竞争强，地市公司、施工单位和设备企业要一起配。"
  },
  {
    key: "finance",
    match: /财务|审计|投融资|风控|合规|客户经理|管培|经营分析|保险|银行/,
    majorIds: ["finance", "law", "cs"],
    names: ["财务管理岗", "审计风控岗", "投融资岗", "银行管培生", "保险核保/理赔岗"],
    written: ["行测、英语、性格测评", "会计/财管/金融基础", "经济金融热点", "材料分析或案例题"],
    questions: [
      "为什么选择银行/保险/产业集团财务，而不是事务所或券商？",
      "讲一个你做过的数据分析、审计、财务或投资案例。",
      "如何理解风险控制和业务发展的平衡？",
      "如果客户或业务部门提出不合规需求，你怎么处理？",
      "你对这家企业的主营业务和财务特点有什么理解？"
    ],
    evidence: "财务实习、审计底稿、建模分析、证书、商业分析报告、金融竞赛。",
    caution: "金融类名额多但筛选强，普通院校学生要增加区域分支机构和产业集团财务岗。"
  },
  {
    key: "law",
    match: /法务|合规|纪检|合同|知识产权|风险控制|招采合规/,
    majorIds: ["law", "finance"],
    names: ["法务合规岗", "合同管理岗", "纪检监察岗", "招采合规岗", "知识产权岗"],
    written: ["行测/申论式写作", "民商法、公司法、劳动法基础", "合规与内控案例", "时政与企业文化"],
    questions: [
      "你做过哪些合同审查、法律检索或争议解决案例？",
      "如何理解央国企合规、纪检和风险防控的关系？",
      "遇到业务效率和合规要求冲突时怎么办？",
      "请评价一个你关注过的公司治理或合规事件。",
      "为什么愿意做企业法务，而不是律所或考公？"
    ],
    evidence: "律所/法务实习、合同审查样例、法律检索、模拟法庭、法律职业资格证进度。",
    caution: "法务岗名额少，建议同时看合规、风控、纪检、招采和行政综合岗位。"
  },
  {
    key: "engineering",
    match: /工程|项目|施工|造价|合约|设计|安全管理|建筑|基建/,
    majorIds: ["civil", "electric", "mechanical"],
    names: ["工程管理岗", "施工技术岗", "造价合约岗", "设计咨询岗", "安全管理岗"],
    written: ["工程基础", "项目管理/造价/安全生产", "行测与企业文化", "专业案例分析"],
    questions: [
      "你是否接受项目制、外派和施工现场？",
      "讲一个工程课程设计、实习或项目管理经历。",
      "现场进度、质量、安全发生冲突时如何排序？",
      "对 EPC、总包、监理、设计咨询有什么理解？",
      "为什么选择央企工程单位，而不是地产或设计院？"
    ],
    evidence: "工程实习、课程设计、BIM/CAD/造价软件、项目现场经历、证书。",
    caution: "这类岗位机会多，但要提前把地域、现场、出差、轮岗接受度问清楚。"
  },
  {
    key: "manufacturing",
    match: /机械|工艺|质量|制造|车辆|汽车|材料|研发测试|设备管理|供应链技术/,
    majorIds: ["mechanical", "chem", "electric"],
    names: ["机械设计岗", "工艺工程师", "质量管理岗", "设备工程师", "研发测试岗"],
    written: ["机械/材料/电气基础", "制造工艺与质量管理", "行测与英语", "工程案例题"],
    questions: [
      "你的毕业设计或实习项目解决了什么工程问题？",
      "如何理解质量、成本、交付之间的平衡？",
      "遇到设备故障或质量波动，你会怎么排查？",
      "是否接受生产基地、车间轮岗或制造现场？",
      "你对这家企业的核心产品和产业链位置了解多少？"
    ],
    evidence: "毕业设计、制造实习、CAD/CAE、工艺改进、质量分析、竞赛和专利。",
    caution: "装备制造适合工科学生，但咨询时要区分研发岗、工艺岗、生产管理岗的强度。"
  },
  {
    key: "media",
    match: /宣传|新媒体|编辑|品牌|出版|内容|舆情|活动|党建宣传/,
    majorIds: ["media", "law"],
    names: ["党建宣传岗", "品牌传播岗", "新媒体运营岗", "编辑出版岗", "舆情管理岗"],
    written: ["公文/新闻写作", "时政热点", "传播学基础", "命题策划或材料改写"],
    questions: [
      "请展示一个你做过的内容作品或活动策划案例。",
      "如何把企业业务写成公众能看懂的内容？",
      "遇到负面舆情或敏感话题，你会如何处理？",
      "你怎么看央国企宣传岗的政治性和服务业务属性？",
      "如果现场给一个主题，30 分钟内你怎么出选题框架？"
    ],
    evidence: "公众号、视频号、小红书、新闻稿、活动策划、作品集和数据表现。",
    caution: "文科生适配这类岗位，但要拿作品说话，不能只说自己文字好。"
  },
  {
    key: "supply",
    match: /供应链|采购|招采|物流|国际|商务|市场|客户|运营/,
    majorIds: ["supply", "finance", "media"],
    names: ["供应链运营岗", "采购招采岗", "国际业务岗", "市场拓展岗", "客户运营岗"],
    written: ["行测、英语", "供应链/国贸基础", "商务数据分析", "案例分析"],
    questions: [
      "你如何理解这家企业的上下游和供应链位置？",
      "讲一次采购、商务沟通、客户运营或跨部门协作经历。",
      "如果供应商交付延期，你怎么协调？",
      "你是否接受出差、驻外或港口/仓储现场？",
      "你的英语或小语种能力能支持什么业务场景？"
    ],
    evidence: "国贸/物流实习、商务竞赛、外语成绩、跨境项目、数据分析和客户沟通案例。",
    caution: "这类岗位专业包容度高，很适合作为非强对口学生的机会扩展口。"
  },
  {
    key: "general",
    match: /.*/,
    majorIds: ["generic"],
    names: ["综合管理岗", "人力行政岗", "项目运营岗", "管培生", "党务综合岗"],
    written: ["行测/综合能力", "公文写作", "时政与企业文化", "结构化表达"],
    questions: [
      "为什么选择央国企？你看重什么？",
      "讲一个组织协调、沟通推动或解决冲突的经历。",
      "你如何理解稳定性和成长性的关系？",
      "如果入职后被安排到基层轮岗，你怎么看？",
      "你对这家企业的主业、区域和岗位职责了解多少？"
    ],
    evidence: "学生工作、项目统筹、实习、文字材料、活动组织和稳定求职动机。",
    caution: "综合岗看似门槛宽，但竞争很杂，必须准备清楚的求职动机和岗位理解。"
  }
];

const industryRules = [
  { industry: "交通运输", test: /中国航空集团|东方航空|南方航空|民航|航空油料|航空器材|远洋海运|物流|港|机场|地铁|轨道|交通投资|高速|铁路|铁道|中车/ },
  { industry: "建筑基建", test: /建筑|建设|建材|工程|安能|南水北调|城投|开发投资|交建|铁建|电力建设|能源建设|副中心|城市建设/ },
  { industry: "军工航天", test: /核工业|航天|航空工业|船舶|兵器|航空发动机|商用飞机|电子科技|卫星网络/ },
  { industry: "通信与电子信息", test: /电信|联通|移动|电子信息|信息通信|通信信号|互联网络|工信|网络/ },
  { industry: "能源电力", test: /电网|华能|大唐|华电|电力|能源|三峡|雅江|石油|石化|海洋石油|管网|煤|焦煤|广核|电气装备|申能|延长石油/ },
  { industry: "金融投资", test: /银行|保险|金融|投资|国债|融资|担保|信达|东方资产|长城资产|中信|光大|国新|国投|诚通|渝富|控股|资本运营|基金|建银|银河/ },
  { industry: "医药健康", test: /医药|健康|卫生|药|白药|中医/ },
  { industry: "农业食品", test: /中粮|储备粮|农业|林业|农垦|茅台|食品|水产/ },
  { industry: "文化传媒", test: /出版|传媒|报|电视|电影|文化|旅游|图书|书店|出版社|动漫|新闻|广电|作家|摄影|文联|紫荆/ },
  { industry: "商贸物流", test: /招商局|华润|通用技术|旅游|商贸|象屿|供应链|检验认证|贸易|南光|市场/ },
  { industry: "装备制造", test: /汽车|一汽|东风|长安|机械|电气|装备|重工|钢|铝|矿|稀土|有色|中化|化学|材料|有研|矿冶|哈电|东方电气|一重|宝武|铜|海螺/ }
];

const prestigeNames = [
  "国家电网",
  "中国移动",
  "中国电信",
  "中国石油",
  "中国石化",
  "中国海洋石油",
  "中国航天科技",
  "中国航天科工",
  "中国航空工业",
  "中国电子科技",
  "中国中信",
  "国家开发银行",
  "中国工商银行",
  "中国建设银行",
  "中国银行",
  "中国农业银行",
  "中国国家铁路"
];

const cityHints = ["北京", "上海", "广州", "深圳", "杭州", "南京", "成都", "重庆", "天津", "武汉", "西安", "宁波", "厦门", "青岛", "苏州"];

function inferIndustry(name, fallback = "综合服务/科研平台") {
  const hit = industryRules.find((rule) => rule.test.test(name));
  return hit ? hit.industry : fallback;
}

function inferRegion(name, given = "全国") {
  if (given) return given;
  const hit = cityHints.find((city) => name.includes(city));
  return hit || "全国";
}

function prestigeScore(name, scope, industry) {
  if (prestigeNames.some((item) => name.includes(item))) return 5;
  if (scope === "中央金融企业" && /银行|中信|光大|保险|投资/.test(name)) return 5;
  if (scope === "实业类央企" && ["军工航天", "能源电力", "通信与电子信息"].includes(industry)) return 4;
  if (scope === "行政/财政部出资企业") return 4;
  if (scope === "地方国企" && /上海|深圳|广州|浙江|江苏|山东|四川|重庆|北京|天津|茅台|上汽|能源|地铁|高速|港/.test(name)) return 4;
  if (scope === "中央文化企业") return 3;
  return 3;
}

function buildCompanies() {
  const industrial = SOE_DATA.centralIndustrialNames.map((name) => {
    const industry = inferIndustry(name);
    return {
      name,
      scope: "实业类央企",
      industry,
      region: "全国",
      prestige: prestigeScore(name, "实业类央企", industry)
    };
  });

  const finance = SOE_DATA.centralFinanceCompanies.map((name) => ({
    name,
    scope: "中央金融企业",
    industry: "金融投资",
    region: "全国",
    prestige: prestigeScore(name, "中央金融企业", "金融投资")
  }));

  const admin = SOE_DATA.administrativeCompanies.map((name) => {
    const industry = inferIndustry(name);
    return {
      name,
      scope: "行政/财政部出资企业",
      industry,
      region: "全国",
      prestige: prestigeScore(name, "行政/财政部出资企业", industry)
    };
  });

  const culture = SOE_DATA.centralCultureCompanies.map((name) => ({
    name,
    scope: "中央文化企业",
    industry: "文化传媒",
    region: "全国",
    prestige: prestigeScore(name, "中央文化企业", "文化传媒")
  }));

  const localFromSamples = SOE_DATA.localCompanySamples.map((item) => ({
    ...item,
    scope: "地方国企",
    region: inferRegion(item.name, item.region),
    prestige: prestigeScore(item.name, "地方国企", item.industry)
  }));

  const localFromRegions = (SOE_DATA.localSoeRegionalMap || []).flatMap((region) =>
    region.companies.map((name) => {
      const industry = inferIndustry(name, region.industries[0] || "综合服务/科研平台");
      return {
        name,
        scope: "地方国企",
        industry,
        region: region.region,
        prestige: prestigeScore(name, "地方国企", industry)
      };
    })
  );

  const localByName = new Map();
  [...localFromRegions, ...localFromSamples].forEach((company) => {
    localByName.set(company.name, company);
  });
  const local = [...localByName.values()];

  return [...industrial, ...finance, ...admin, ...culture, ...local].map((company, index) => ({
    id: `c${index + 1}`,
    roles: industryRoles[company.industry] || industryRoles["综合服务/科研平台"],
    ...company
  }));
}

const companies = buildCompanies();
let currentMatches = [];
let resumeAutoAnalysis = null;

function getInputs() {
  const activeScopes = $$('input[name="scope"]:checked').map((item) => item.value);
  const industryChecks = $$('input[name="industry"]:checked').map((item) => item.value);
  const activeIndustries = industryChecks.includes("all") ? [] : industryChecks;
  return {
    major: $("#majorInput").value.trim(),
    degree: $("#degreeInput").value,
    school: $("#schoolInput").value,
    city: $("#cityInput").value.trim(),
    priority: $("#priorityInput").value,
    activeScopes,
    activeIndustries
  };
}

function findProfile(major) {
  const normalized = major.toLowerCase();
  const profile = SOE_DATA.majorProfiles.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
  );
  if (profile) return profile;
  return {
    id: "generic",
    label: major || "通用专业",
    keywords: [],
    industries: Object.keys(industryRoles),
    roles: ["管培生", "职能管理", "项目运营", "财务行政", "市场商务", "数据支持"],
    advice: "暂未识别到细分专业，建议先按学生的课程、实习和职业偏好二次定位，再从职能岗、管培岗和区域国企打开机会池。"
  };
}

function schoolPower(school) {
  return {
    "985": 28,
    "211": 22,
    first: 16,
    second: 10,
    overseas: 18
  }[school] || 14;
}

function degreePower(degree) {
  return {
    doctor: 12,
    master: 8,
    bachelor: 3,
    college: -6
  }[degree] || 0;
}

function priorityBonus(company, priority) {
  const industry = company.industry;
  const scope = company.scope;
  const map = {
    stable: scope.includes("央企") || scope.includes("行政") ? 8 : 4,
    salary: ["金融投资", "通信与电子信息", "能源电力"].includes(industry) ? 8 : 2,
    growth: ["通信与电子信息", "军工航天", "装备制造", "能源电力"].includes(industry) ? 8 : 2,
    hukou: company.region === "全国" || ["北京", "上海"].includes(company.region) ? 7 : 3,
    light: ["文化传媒", "综合服务/科研平台"].includes(industry) || ["中央文化企业", "行政/财政部出资企业"].includes(scope) ? 7 : 1
  };
  return map[priority] || 0;
}

function cityBonus(company, city) {
  if (!city) return 2;
  if (company.region.includes(city) || company.name.includes(city)) return 10;
  if (company.region === "全国") return 5;
  return 0;
}

function getRolePlaybook(role) {
  return rolePlaybooks.find((item) => item.match.test(role)) || rolePlaybooks[rolePlaybooks.length - 1];
}

function roleFitScore(role, profile, company) {
  const playbook = getRolePlaybook(role);
  let score = 42;
  if (profile.roles.includes(role)) score += 34;
  if (playbook.majorIds.includes(profile.id)) score += 26;
  if (profile.industries.includes(company.industry)) score += 16;
  if (profile.keywords.some((keyword) => role.includes(keyword) || company.industry.includes(keyword))) score += 8;
  return Math.max(20, Math.min(98, score));
}

function roleFitLabel(score) {
  if (score >= 82) return "高";
  if (score >= 66) return "中高";
  if (score >= 52) return "中";
  return "弱";
}

function buildRoleInsights(company, profile) {
  return company.roles
    .map((role) => {
      const playbook = getRolePlaybook(role);
      const score = roleFitScore(role, profile, company);
      return {
        role,
        score,
        label: roleFitLabel(score),
        playbook
      };
    })
    .sort((a, b) => b.score - a.score);
}

function buildRoleMatchSummary(company, profile) {
  const insights = buildRoleInsights(company, profile);
  const top = insights[0];
  const backup = insights.slice(1, 3).map((item) => item.role).join("、");
  return {
    label: top.label,
    score: top.score,
    primaryRole: top.role,
    backupRoles: backup,
    text: `岗位匹配${top.label}：优先看「${top.role}」${backup ? `，同时可备选「${backup}」` : ""}。`
  };
}

function scoreCompany(company, profile, inputs) {
  let score = 36;
  const industryIndex = profile.industries.indexOf(company.industry);
  const industryHit = industryIndex >= 0;
  if (industryHit) {
    score += Math.max(16, 36 - industryIndex * 7);
  }
  if (profile.roles.some((role) => company.roles.includes(role))) score += 10;
  if (profile.keywords.some((keyword) => company.name.includes(keyword) || company.industry.includes(keyword))) score += 6;
  score += priorityBonus(company, inputs.priority);
  score += cityBonus(company, inputs.city);

  if (inputs.degree === "doctor" && ["军工航天", "综合服务/科研平台", "医药健康"].includes(company.industry)) score += 7;
  if (inputs.degree === "college" && company.prestige >= 5) score -= 12;
  if (inputs.school === "second" && company.prestige >= 5) score -= 9;
  if (company.scope === "地方国企" && inputs.city && (company.region.includes(inputs.city) || company.name.includes(inputs.city))) score += 4;

  const capacity = schoolPower(inputs.school) + degreePower(inputs.degree) + (industryHit ? 18 : 0);
  const competition = company.prestige * 11 + (company.scope === "中央金融企业" ? 8 : 0) + (company.scope === "实业类央企" ? 4 : 0);
  let tier = "补充";
  if (score >= 72 && competition - capacity <= 8) tier = "重点";
  if (score >= 70 && competition - capacity > 8) tier = "冲刺";
  if (score >= 82 && company.prestige >= 5) tier = "冲刺";
  if (score >= 78 && company.scope === "地方国企" && inputs.city && cityBonus(company, inputs.city) >= 10) tier = "重点";
  if (score < 58) tier = "补充";

  return {
    ...company,
    score: Math.max(1, Math.min(99, Math.round(score))),
    tier,
    roleMatch: buildRoleMatchSummary(company, profile),
    reason: buildReason(company, profile, inputs, tier)
  };
}

function buildReason(company, profile, inputs, tier) {
  const schoolText = {
    "985": "985/强双一流",
    "211": "211/双一流",
    first: "普通一本/省重点",
    second: "普通本科",
    overseas: "海外院校"
  }[inputs.school];
  const degreeText = {
    doctor: "博士",
    master: "硕士",
    bachelor: "本科",
    college: "专科"
  }[inputs.degree];
  const industryFit = profile.industries.includes(company.industry)
    ? `专业与${company.industry}高度相关`
    : `可从职能或通用岗位切入${company.industry}`;
  const tierAdvice = {
    冲刺: "适合重点准备，但要提醒竞争强、筛选更看学历/项目/实习证据。",
    重点: "匹配度和可达性较均衡，建议放入主投递清单。",
    补充: "可作为扩大机会池的备选，重点看区域、岗位和稳定性是否匹配。"
  }[tier];
  return `${degreeText} ${schoolText} 背景下，${industryFit}；${tierAdvice}`;
}

function applyFilters() {
  const inputs = getInputs();
  const profile = findProfile(inputs.major);
  currentMatches = companies
    .filter((company) => inputs.activeScopes.includes(company.scope))
    .filter((company) => inputs.activeIndustries.length === 0 || inputs.activeIndustries.includes(company.industry))
    .map((company) => scoreCompany(company, profile, inputs))
    .filter((company) => company.score >= 48)
    .sort((a, b) => b.score - a.score || b.prestige - a.prestige);

  renderAll(inputs, profile);
}

function renderAll(inputs, profile) {
  renderSummary(inputs, profile);
  renderRecommendations();
  renderIndustryMap();
  renderLibrary();
  renderRecruitment2026();
  renderEvidenceForm();
  renderEvidenceResult();
  renderRegionalCatalog();
  renderPrepSelect();
  renderSources();
}

function renderSummary(inputs, profile) {
  const degreeText = $("#degreeInput").selectedOptions[0].textContent;
  const schoolText = $("#schoolInput").selectedOptions[0].textContent;
  $("#profileTitle").textContent = `${profile.label} · ${degreeText} · ${schoolText}`;
  $("#profileAdvice").textContent = profile.advice;
  $("#totalMatches").textContent = currentMatches.length;
  $("#stretchCount").textContent = currentMatches.filter((item) => item.tier === "冲刺").length;
  $("#coreCount").textContent = currentMatches.filter((item) => item.tier === "重点").length;
  $("#backupCount").textContent = currentMatches.filter((item) => item.tier === "补充").length;
}

function renderRecommendations() {
  const groups = {
    冲刺: $("#stretchList"),
    重点: $("#coreList"),
    补充: $("#backupList")
  };
  Object.values(groups).forEach((node) => (node.innerHTML = ""));
  Object.entries(groups).forEach(([tier, node]) => {
    const allItems = currentMatches.filter((item) => item.tier === tier);
    const items = allItems.slice(0, DISPLAY_LIMIT);
    if (!items.length) {
      node.innerHTML = `<div class="empty-state">当前筛选下暂无${tier}企业，可放宽行业或企业范围。</div>`;
      return;
    }
    const footer =
      allItems.length > DISPLAY_LIMIT
        ? `<div class="list-note">当前展示前 ${DISPLAY_LIMIT} 家 / 共 ${allItems.length} 家；完整清单可到「企业库」检索。</div>`
        : "";
    node.innerHTML = items.map(renderCompanyCard).join("") + footer;
  });
}

function renderCompanyCard(company) {
  const tierClass = company.tier === "冲刺" ? "tier-stretch" : company.tier === "重点" ? "tier-core" : "tier-backup";
  const roles = company.roles
    .slice(0, 4)
    .map((role) => {
      const fit = buildRoleInsights(company, findProfile($("#majorInput").value.trim())).find((item) => item.role === role);
      const className = fit && fit.score >= 66 ? "role-good" : "";
      return `<span class="${className}">${role}</span>`;
    })
    .join("");
  return `
    <article class="company-card">
      <header>
        <h4>${company.name}</h4>
        <span class="score-badge" title="匹配分：综合专业行业相关度、学历院校可达性、城市偏好、求职优先级和企业竞争强度。"><small>匹配分</small>${company.score}</span>
      </header>
      <div class="tags">
        <span class="tag scope">${company.scope}</span>
        <span class="tag">${company.industry}</span>
        <span class="tag">${company.region}</span>
        <span class="tag ${tierClass}">${company.tier}</span>
      </div>
      <p>${company.reason}</p>
      <p class="role-match">${company.roleMatch.text}</p>
      <div class="mini-title">常见可投岗位</div>
      <div class="role-list">${roles}</div>
    </article>
  `;
}

function renderIndustryMap() {
  const counts = currentMatches.reduce((acc, company) => {
    acc[company.industry] = (acc[company.industry] || 0) + 1;
    return acc;
  }, {});
  const max = Math.max(1, ...Object.values(counts));
  const rows = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([industry, count]) => {
      const width = Math.max(8, Math.round((count / max) * 100));
      const roles = (industryRoles[industry] || industryRoles["综合服务/科研平台"]).slice(0, 3).join(" / ");
      return `
        <div class="industry-row">
          <strong>${industry}</strong>
          <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
          <span>${count} 家 · ${roles}</span>
        </div>
      `;
    })
    .join("");
  $("#industryMap").innerHTML = rows || `<div class="empty-state">暂无行业结果。</div>`;
}

function renderLibrary() {
  const query = ($("#librarySearch").value || "").trim().toLowerCase();
  const mode = $("#libraryMode")?.value || "recommended";
  const industrySelect = $("#libraryIndustryFilter");
  const currentIndustry = industrySelect?.value || "all";
  const libraryIndustries = [...new Set(companies.map((company) => company.industry))].sort();
  if (industrySelect) {
    industrySelect.innerHTML = `<option value="all">全部行业</option>${libraryIndustries
      .map((industry) => `<option value="${industry}">${industry}</option>`)
      .join("")}`;
    industrySelect.value = libraryIndustries.includes(currentIndustry) ? currentIndustry : "all";
  }
  const recruitNames = new Set((SOE_DATA.recruitment2026Records || []).map((item) => item.company));
  const matchByName = new Map(currentMatches.map((item) => [item.name, item]));
  let base = companies;
  if (mode === "recommended") base = currentMatches;
  if (mode === "central") base = companies.filter((company) => company.scope !== "地方国企");
  if (mode === "local") base = companies.filter((company) => company.scope === "地方国企");
  if (mode === "recruit2026") {
    base = companies.filter((company) =>
      [...recruitNames].some((name) => name.includes(company.name) || company.name.includes(name))
    );
  }
  const visible = base
    .filter((company) => {
      const haystack = `${company.name}${company.scope}${company.industry}${company.region}${company.roles.join("")}`.toLowerCase();
      const queryOk = !query || haystack.includes(query);
      const industryOk = !industrySelect || industrySelect.value === "all" || company.industry === industrySelect.value;
      return queryOk && industryOk;
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0) || b.prestige - a.prestige);

  const centralCount = visible.filter((company) => company.scope !== "地方国企").length;
  const localCount = visible.filter((company) => company.scope === "地方国企").length;
  const recruitCount = visible.filter((company) =>
    [...recruitNames].some((name) => name.includes(company.name) || company.name.includes(name))
  ).length;

  $("#enterpriseStats").innerHTML = [
    { title: "当前结果", value: visible.length, note: "按企业范围、行业和搜索词筛选" },
    { title: "总库企业", value: companies.length, note: "央企/中央企业/地方国企去重后总量" },
    { title: "中央企业", value: centralCount, note: "央企、中央金融、文化和行政类" },
    { title: "地方国企", value: localCount, note: "省市重点样例池" },
    { title: "26届记录", value: recruitCount, note: "已接入招聘库的企业" }
  ]
    .map(
      (item) => `
      <article class="metric-block">
        <span>${item.title}</span>
        <strong>${item.value}</strong>
        <small>${item.note}</small>
      </article>
    `
    )
    .join("");

  $("#libraryList").className = "enterprise-list";
  $("#libraryList").innerHTML = visible.length
    ? visible
        .map((company) => {
          const match = matchByName.get(company.name) || company;
          const hasRecruit = [...recruitNames].some((name) => name.includes(company.name) || company.name.includes(name));
          const tier = match.tier ? `<span class="tag tier-core">${match.tier}</span>` : "";
          const score = match.score ? `<span class="score-chip">匹配分 ${match.score}</span>` : "";
          return `
            <article class="enterprise-card">
              <header>
                <h3>${company.name}</h3>
                ${score}
              </header>
              <div class="tags">
                <span class="tag scope">${company.scope}</span>
                <span class="tag">${company.industry}</span>
                <span class="tag">${company.region}</span>
                ${tier}
                ${hasRecruit ? `<span class="tag source">26届有记录</span>` : ""}
              </div>
              <p>${match.reason || `常见切入口：${company.roles.slice(0, 3).join("、")}。`}</p>
              <div class="role-list">${company.roles.slice(0, 5).map((role) => `<span>${role}</span>`).join("")}</div>
            </article>
          `;
        })
        .join("")
    : `<div class="empty-state">当前条件下暂无企业，可换关键词或切换企业范围。</div>`;

  renderLocalSoeMap();
}

function renderPrepSelect() {
  const select = $("#prepCompanySelect");
  const options = currentMatches.slice(0, 80).map((company) => `<option value="${company.id}">${company.name}</option>`).join("");
  select.innerHTML = options || companies.slice(0, 80).map((company) => `<option value="${company.id}">${company.name}</option>`).join("");
  renderPrepPanel();
}

function renderPrepPanel() {
  const id = $("#prepCompanySelect").value;
  const company = currentMatches.find((item) => item.id === id) || companies.find((item) => item.id === id) || companies[0];
  const profile = findProfile($("#majorInput").value.trim());
  const pattern = prepPatterns[company.industry] || prepPatterns["综合服务/科研平台"];
  const roleInsights = buildRoleInsights(company, profile).slice(0, 4);
  const primaryRole = roleInsights[0]?.role || company.roles[0];
  const queryBase = `${company.name} ${primaryRole} 校招 笔试 面试经验`;
  const encoded = encodeURIComponent(queryBase);
  const roleCards = roleInsights
    .map((item) => {
      const q = item.playbook.questions.map((question) => `<li>${question}</li>`).join("");
      const written = item.playbook.written.map((point) => `<span>${point}</span>`).join("");
      return `
        <article class="role-card">
          <header>
            <div>
              <h4>${item.role}</h4>
              <p>历年常见岗位名：${item.playbook.names.join("、")}</p>
            </div>
            <strong>${item.label}匹配 · ${item.score}</strong>
          </header>
          <div class="role-focus">${written}</div>
          <div class="question-block">
            <b>面试高频问题</b>
            <ol>${q}</ol>
          </div>
          <p><b>学生证据：</b>${item.playbook.evidence}</p>
          <p><b>咨询提醒：</b>${item.playbook.caution}</p>
        </article>
      `;
    })
    .join("");
  const searchLinks = roleInsights
    .slice(0, 3)
    .map((item) => {
      const query = `${company.name} ${item.role} 校招 面试经验`;
      return `<a target="_blank" rel="noreferrer" href="https://www.baidu.com/s?wd=${encodeURIComponent(query)}">百度：${query}</a>`;
    })
    .join("");
  $("#prepPanel").innerHTML = `
    <div class="prep-main">
      <h3>${company.name}</h3>
      <div class="tags">
        <span class="tag scope">${company.scope}</span>
        <span class="tag">${company.industry}</span>
        <span class="tag">${company.region}</span>
      </div>
      <div class="prep-explain">
        <strong>岗位优先级判断</strong>
        <span>基于当前输入专业「${profile.label}」与企业行业/岗位簇的匹配度排序。先准备高匹配岗位，再把中匹配岗位作为补充口。</span>
      </div>
      <div class="role-card-grid">${roleCards}</div>
      <ul class="prep-list">
        <li><strong>笔试题型线索</strong><span>${pattern.written}</span></li>
        <li><strong>面试经验线索</strong><span>${pattern.interview}</span></li>
        <li><strong>咨询辅导提示</strong><span>${pattern.coach}</span></li>
        <li><strong>适合追问学生</strong><span>是否接受地域/轮岗/项目制，是否有与 ${roleInsights.map((item) => item.role).join("、")} 对应的课程、实习或项目证据。</span></li>
      </ul>
    </div>
    <aside class="prep-side">
      <h3>全网检索包</h3>
      <div class="query-box">
        <a target="_blank" rel="noreferrer" href="https://www.baidu.com/s?wd=${encoded}">百度：${queryBase}</a>
        <a target="_blank" rel="noreferrer" href="https://www.nowcoder.com/search?type=post&query=${encoded}">牛客：${queryBase}</a>
        <a target="_blank" rel="noreferrer" href="https://www.yingjiesheng.com/so.php?word=${encoded}">应届生：${queryBase}</a>
        <a target="_blank" rel="noreferrer" href="https://www.google.com/search?q=${encoded}">Google：${queryBase}</a>
        ${searchLinks}
      </div>
      <div class="mini-title">建议整理成三类材料</div>
      <p>历年题型、面试流程、学生可复用故事。公开平台内容不要原文搬运，辅导时用结构化总结即可。</p>
      <div class="mini-title">咨询师使用建议</div>
      <p>先问学生是否有岗位证据，再决定是否把企业放进主投递清单。企业好不等于岗位适合，岗位适合也不等于学生愿意接受城市和轮岗。</p>
    </aside>
  `;
}

function renderSources() {
  $("#sourceList").innerHTML = SOE_DATA.sourceLinks
    .map(
      (source) => `
      <article class="source-card">
        <h3>${source.title}</h3>
        <p>${source.date} · ${source.note}</p>
        ${source.url ? `<a href="${source.url}" target="_blank" rel="noreferrer">${source.url}</a>` : ""}
      </article>
    `
    )
    .join("");
}

function renderRecruitment2026() {
  const recordsAll = SOE_DATA.recruitment2026Records || [];
  const coverageAll = buildRecruitCoverage();
  const officialCount = recordsAll.filter((item) => item.sourceLevel === "官方核验").length;
  const refinedCount = coverageAll.filter((item) => item.status === "已整理详情").length;
  const pendingCoverageCount = coverageAll.length - refinedCount;
  const disclosedCount = recordsAll.filter((item) => /约|\d/.test(item.jobCount) && !/需逐|分批|平台|未披露/.test(item.jobCount)).length;
  const overview = [
    { title: "覆盖企业", value: coverageAll.length, note: "来自企业地图全量库，作为26届招聘复盘补齐范围" },
    { title: "已精修复盘", value: refinedCount, note: `已整理成招聘表；其中 ${officialCount} 条为官方核验` },
    { title: "待补齐核验", value: pendingCoverageCount, note: "已列入底表，可按企业官网/招聘平台继续补录" },
    { title: "明确规模披露", value: disclosedCount, note: "公开口径写明人数或规模的精修记录" }
  ];
  $("#recruitOverview").innerHTML = overview
    .map(
      (item) => `
      <article class="metric-block">
        <span>${item.title}</span>
        <strong>${item.value}</strong>
        <small>${item.note}</small>
      </article>
    `
    )
    .join("");

  $("#recruitPortals").innerHTML = (SOE_DATA.recruitment2026Portals || [])
    .map(
      (portal) => `
      <article class="portal-card">
        <header>
          <h3>${portal.name}</h3>
          <span>${portal.type}</span>
        </header>
        <p>${portal.use}</p>
        <p><b>注意：</b>${portal.caution}</p>
        <a href="${portal.url}" target="_blank" rel="noreferrer">打开入口</a>
      </article>
    `
    )
    .join("");

  const industryFilter = $("#recruitIndustryFilter");
  const industries = [...new Set(recordsAll.map((item) => item.industry))].sort();
  const currentIndustry = industryFilter.value || "all";
  industryFilter.innerHTML = `<option value="all">全部行业</option>${industries
    .map((industry) => `<option value="${industry}">${industry}</option>`)
    .join("")}`;
  industryFilter.value = industries.includes(currentIndustry) ? currentIndustry : "all";

  const sourceFilter = $("#recruitSourceFilter").value || "all";
  const query = ($("#recruitSearch").value || "").trim().toLowerCase();
  const records = recordsAll.filter((item) => {
    const haystack = `${item.company}${item.scope}${item.industry}${item.batch}${item.period}${item.jobCount}${item.education}${item.majors.join("")}${item.cities.join("")}${item.roles.join("")}${item.note}`.toLowerCase();
    const industryOk = industryFilter.value === "all" || item.industry === industryFilter.value;
    const sourceOk = sourceFilter === "all" || item.sourceLevel === sourceFilter;
    return industryOk && sourceOk && (!query || haystack.includes(query));
  });

  $("#recruitList").innerHTML = records.length
    ? renderRecruitTable(records)
    : `<div class="empty-state">当前筛选下暂无 26 届招聘记录，可换关键词或行业。</div>`;
  renderRecruitCoverage();
}

function renderRecruitTable(records) {
  return `
    <div class="recruit-row recruit-head">
      <span>企业</span>
      <span>类型</span>
      <span>招聘规模</span>
      <span>时间 / 阶段</span>
      <span>重点方向</span>
      <span>岗位地点</span>
      <span>备注</span>
    </div>
    ${records.map(renderRecruitRecord).join("")}
  `;
}

function renderRecruitRecord(item) {
  const sourceClass =
    item.sourceLevel === "官方核验" ? "source-ok" : item.sourceLevel === "第三方整理" ? "source-mid" : "source-wait";
  const difficulty = getRecruitDifficulty(item);
  const scaleStatus = getScaleStatus(item.jobCount);
  const stage = getRecruitStage(item);
  const typeLabel = getEnterpriseTypeLabel(item.scope);
  const roleText = item.roles.slice(0, 5).join("、");
  const majorText = item.majors.slice(0, 7).join("、");
  const cityText = item.cities.slice(0, 8).join("、");
  return `
    <article class="recruit-row recruit-entry">
      <div class="recruit-company-cell" data-label="企业">
        <h3>${item.company}</h3>
        <p>${item.industry}</p>
        <span class="source-status ${sourceClass}">${item.sourceLevel}</span>
      </div>
      <div data-label="类型"><span class="type-pill">${typeLabel}</span></div>
      <div class="recruit-scale" data-label="招聘规模">
        <strong>${item.jobCount}</strong>
        <small>${scaleStatus}</small>
      </div>
      <div data-label="时间 / 阶段">
        <strong>${item.period}</strong>
        <small>${stage}</small>
      </div>
      <div data-label="重点方向">
        <strong>${roleText}</strong>
        <small>${majorText}</small>
      </div>
      <div data-label="岗位地点">
        <span>${cityText}</span>
        <small>${item.education}</small>
      </div>
      <div class="recruit-note" data-label="备注">
        <p>${getRecruitMarketNote(item, difficulty)}</p>
        <a class="source-link" href="${item.url}" target="_blank" rel="noreferrer">查看来源</a>
      </div>
    </article>
  `;
}

function getRecruitStage(item) {
  const text = `${item.batch}${item.period}`;
  const hasAutumn = /秋招|2025\.0?9|2025-0?9|2025年9/.test(text);
  const hasSpring = /春招|2026\.0?[1-6]|2026-0?[1-6]|2026年[1-6]/.test(text);
  if (hasAutumn && hasSpring) return "秋招+春招";
  if (hasAutumn) return "秋招";
  if (hasSpring) return "春招";
  if (/多批|批次|分批/.test(text)) return "多批次";
  return item.batch;
}

function getEnterpriseTypeLabel(scope) {
  if (scope.includes("金融")) return "中央金融";
  if (scope.includes("文化")) return "中央文化";
  if (scope.includes("地方")) return "地方国企";
  if (scope.includes("行政")) return "财政/行政";
  if (scope.includes("央企")) return "央企";
  return scope;
}

function getRecruitMarketNote(item, difficulty) {
  const offerHint = getOfferTimingHint(item);
  return `${difficulty}；${offerHint}。${item.note}`;
}

function getOfferTimingHint(item) {
  const text = `${item.period}${item.batch}`;
  if (/秋招.*春招|春招.*秋招|2025\.09-2026\.06/.test(text)) {
    return "录用节奏通常为秋招11-12月、春招4-6月滚动推进，具体以当批通知为准";
  }
  if (/春招|2026/.test(text)) return "录用/offer 多随春招批次滚动推进，以企业通知为准";
  if (/秋招|2025/.test(text)) return "录用/offer 多在秋招笔面试后分批推进，以企业通知为准";
  return "录用节奏需回到当批公告或学生反馈继续核验";
}

function getRecruitDifficulty(item) {
  const hardSignals = ["总部", "硕士", "硕博", "研发", "金融", "军工", "研究所", "总行", "资本运营", "基金"];
  const easierSignals = ["基层", "地市", "县区", "项目地", "生产", "网点", "分公司", "全国项目地"];
  const hard = hardSignals.filter((word) => `${item.education}${item.roles.join("")}${item.note}${item.company}`.includes(word)).length;
  const easier = easierSignals.filter((word) => `${item.cities.join("")}${item.roles.join("")}${item.note}`.includes(word)).length;
  if (hard >= 3 && easier <= 1) return "高：适合强背景冲刺";
  if (hard >= 2) return "中高：需岗位证据";
  if (easier >= 2) return "中：看地域和接受度";
  return "中：按岗位细分判断";
}

function getScaleStatus(jobCount) {
  if (/约|\d/.test(jobCount) && !/需逐|分批|平台|未披露/.test(jobCount)) return "披露规模";
  if (/分批|逐单位|逐批|分公司|子公司/.test(jobCount)) return "分批披露";
  return "待补齐";
}

function matchRecruitRecord(company) {
  const aliases = {
    中国铁路工程集团有限公司: ["中国中铁股份有限公司", "中国中铁"],
    中国铁道建筑集团有限公司: ["中国铁建股份有限公司", "中国铁建"],
    中国交通建设集团有限公司: ["中国交建"],
    中国建筑集团有限公司: ["中国建筑股份有限公司", "中国建筑"],
    中国电力建设集团有限公司: ["中国电建"],
    中国能源建设集团有限公司: ["中国能建"]
  };
  const companyAliases = aliases[company.name] || [];
  return (SOE_DATA.recruitment2026Records || []).find(
    (record) =>
      record.company.includes(company.name) ||
      company.name.includes(record.company) ||
      companyAliases.some((alias) => record.company.includes(alias) || alias.includes(record.company))
  );
}

function buildRecruitCoverage() {
  return companies.map((company) => {
    const detail = matchRecruitRecord(company);
    const status = detail ? "已整理详情" : "待检索核验";
    return {
      ...company,
      status,
      detail,
      jobCount: detail?.jobCount || "待检索：需回到企业官网/招聘平台核验",
      difficulty: detail ? getRecruitDifficulty(detail) : inferCoverageDifficulty(company),
      searchQuery: `${company.name} 2026 校园招聘 招聘公告 岗位 人数`
    };
  });
}

function inferCoverageDifficulty(company) {
  if (company.prestige >= 5 || ["中央金融企业", "实业类央企"].includes(company.scope) && ["军工航天", "金融投资", "通信与电子信息"].includes(company.industry)) {
    return "待核验：预计竞争较高";
  }
  if (company.scope === "地方国企") return "待核验：看地域与岗位";
  return "待核验：按岗位判断";
}

function renderRecruitCoverage() {
  const query = ($("#recruitSearch").value || "").trim().toLowerCase();
  const industryValue = $("#recruitIndustryFilter")?.value || "all";
  const statusValue = $("#coverageStatusFilter")?.value || "all";
  const rows = buildRecruitCoverage()
    .filter((item) => {
      const haystack = `${item.name}${item.scope}${item.industry}${item.region}${item.status}${item.jobCount}${item.difficulty}${item.roles.join("")}`.toLowerCase();
      const queryOk = !query || haystack.includes(query);
      const industryOk = industryValue === "all" || item.industry === industryValue;
      const statusOk = statusValue === "all" || item.status === statusValue;
      return queryOk && industryOk && statusOk;
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "已整理详情" ? -1 : 1;
      return b.prestige - a.prestige || a.name.localeCompare(b.name, "zh-Hans-CN");
    });

  const maxRows = 160;
  $("#recruitCoverageList").innerHTML = `
    <div class="coverage-summary">
      <strong>${rows.length}</strong>
      <span>家企业符合当前筛选；${rows.length > maxRows ? `先展示前 ${maxRows} 家，可继续搜索缩小范围。` : "已全部展示。"}</span>
    </div>
    ${rows
      .slice(0, maxRows)
      .map((item) => renderCoverageRow(item))
      .join("")}
  `;
}

function renderCoverageRow(item) {
  const encoded = encodeURIComponent(item.searchQuery);
  const statusClass = item.status === "已整理详情" ? "source-ok" : "source-wait";
  return `
    <article class="coverage-row">
      <div>
        <h4>${item.name}</h4>
        <div class="tags">
          <span class="tag scope">${item.scope}</span>
          <span class="tag">${item.industry}</span>
          <span class="tag">${item.region}</span>
          <span class="source-status ${statusClass}">${item.status}</span>
        </div>
      </div>
      <p><b>26届招聘信息：</b>${item.jobCount}</p>
      <p><b>难度判断：</b>${item.difficulty}</p>
      <div class="coverage-links">
        ${item.detail ? `<a href="${item.detail.url}" target="_blank" rel="noreferrer">已整理来源</a>` : ""}
        <a href="https://www.baidu.com/s?wd=${encoded}" target="_blank" rel="noreferrer">百度检索</a>
        <a href="https://www.iguopin.com/search?keyword=${encoded}" target="_blank" rel="noreferrer">国聘检索</a>
        <a href="https://www.google.com/search?q=${encoded}" target="_blank" rel="noreferrer">Google检索</a>
      </div>
    </article>
  `;
}

function renderEvidenceForm() {
  const node = $("#evidenceForm");
  if (node.dataset.ready === "true") return;
  node.innerHTML = (SOE_DATA.evidenceRubric || [])
    .map(
      (item) => `
      <label class="evidence-item">
        <span>${item.label}<small>${item.guide}</small></span>
        <input type="range" min="0" max="${item.max}" value="${item.defaultValue}" data-evidence="${item.id}" />
        <b><output id="evidence-${item.id}">${item.defaultValue}</output> / ${item.max}</b>
      </label>
    `
    )
    .join("");
  node.dataset.ready = "true";
  $$("[data-evidence]").forEach((input) => {
    input.addEventListener("input", renderEvidenceResult);
  });
}

function renderEvidenceResult() {
  const rubric = SOE_DATA.evidenceRubric || [];
  let total = 0;
  const details = rubric.map((item) => {
    const input = $(`[data-evidence="${item.id}"]`);
    const value = input ? Number(input.value) : item.defaultValue;
    const output = $(`#evidence-${item.id}`);
    if (output) output.textContent = value;
    total += value;
    return { ...item, value, ratio: value / item.max };
  });

  const level =
    total >= 82 ? "冲刺条件较强" : total >= 68 ? "主投递条件较稳" : total >= 52 ? "需要补证据" : "先补基础材料";
  const weak = details
    .filter((item) => item.ratio < 0.6)
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 3);
  const advice =
    total >= 82
      ? "可以配置 20%-30% 冲刺企业，同时保留重点投递池。"
      : total >= 68
        ? "适合以重点投递为主，少量冲刺，补充岗位证据。"
        : total >= 52
          ? "先把项目、实习、笔试和岗位理解补齐，再扩展投递。"
          : "暂不建议大量投递高竞争央企，先做简历、证据和笔试基础。";

  $("#evidenceResult").innerHTML = `
    <div class="score-ring">
      <span>总分</span>
      <strong>${total}</strong>
      <small>${level}</small>
    </div>
    <p>${advice}</p>
    ${
      resumeAutoAnalysis
        ? `
      <div class="auto-analysis">
        <div class="mini-title">简历自动评估依据</div>
        <p>${resumeAutoAnalysis.summary}</p>
        <ul>
          ${resumeAutoAnalysis.reasons.map((reason) => `<li>${reason}</li>`).join("")}
        </ul>
      </div>
    `
        : ""
    }
    <div class="mini-title">优先补强</div>
    <ul class="evidence-actions">
      ${
        weak.length
          ? weak.map((item) => `<li><b>${item.label}</b><span>${item.guide}</span></li>`).join("")
          : "<li><b>证据较均衡</b><span>可以开始做企业分层和岗位专项准备。</span></li>"
      }
    </ul>
    <div class="mini-title">咨询师判断口径</div>
    <p>80 分以上可冲总部/强平台；65-80 分主投二级公司、省公司和优质地方国企；50-65 分重点补证据；50 分以下先做求职基础工程。</p>
  `;
}

function countHits(text, words) {
  return words.reduce((count, word) => count + (text.includes(word.toLowerCase()) ? 1 : 0), 0);
}

function clampScore(value, max) {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function setEvidenceScores(scores) {
  Object.entries(scores).forEach(([id, value]) => {
    const input = $(`[data-evidence="${id}"]`);
    if (input) input.value = value;
  });
  renderEvidenceResult();
}

function analyzeResumeText(text) {
  const normalized = text.toLowerCase();
  const profile = findProfile($("#majorInput").value.trim());
  const majorHits = countHits(normalized, [...profile.keywords, ...profile.roles, ...profile.industries]);
  const projectHits = countHits(normalized, ["实习", "项目", "课题", "竞赛", "论文", "专利", "毕业设计", "研发", "实验", "调研", "数据分析", "建模"]);
  const certHits = countHits(normalized, ["cet", "英语六级", "英语四级", "六级", "四级", "雅思", "托福", "cpa", "法考", "证券", "基金", "计算机二级", "python", "sql", "java", "cad", "bim"]);
  const locationHits = countHits(normalized, ["全国", "出差", "驻场", "基层", "轮岗", "项目现场", "地市", "县区", "服从调剂", "可接受调剂", "海外"]);
  const motivationHits = countHits(normalized, ["央企", "国企", "稳定", "长期", "责任", "能源", "电网", "银行", "运营商", "基建", "服务国家", "产业"]);
  const numberHits = (normalized.match(/\d+%|\d+人|\d+万|\d+次|\d+项|\d+个月|\d+年/g) || []).length;
  const actionHits = countHits(normalized, ["负责", "主导", "参与", "完成", "优化", "提升", "设计", "搭建", "推进", "协调", "产出"]);
  const schoolHits = countHits(normalized, ["985", "211", "双一流", "硕士", "博士", "研究生", "一等奖", "国家级", "省级"]);

  const scores = {
    majorFit: clampScore(8 + majorHits * 2.4, 20),
    schoolDegree: clampScore(6 + schoolHits * 2 + (["985", "211"].includes($("#schoolInput").value) ? 3 : 0) + ($("#degreeInput").value === "master" ? 2 : $("#degreeInput").value === "doctor" ? 4 : 0), 15),
    projectIntern: clampScore(6 + projectHits * 2.1 + Math.min(numberHits, 4), 20),
    writtenReadiness: clampScore(5 + certHits * 1.6, 15),
    locationFlex: clampScore(3 + locationHits * 1.8, 10),
    motivation: clampScore(4 + motivationHits * 1.3, 10),
    communication: clampScore(4 + Math.min(numberHits, 5) * 0.9 + Math.min(actionHits, 6) * 0.8 + (text.length > 1200 ? 1 : 0), 10)
  };

  const reasons = [
    `专业相关线索 ${majorHits} 个，项目/实习/课题线索 ${projectHits} 个。`,
    `证书与笔试准备线索 ${certHits} 个，地域/轮岗接受度线索 ${locationHits} 个。`,
    `求稳或行业动机线索 ${motivationHits} 个，量化表达 ${numberHits} 处，行动动词 ${actionHits} 个。`
  ];
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const summary =
    total >= 78
      ? "简历证据较完整，可进入企业分层与岗位专项准备。"
      : total >= 62
        ? "简历有一定基础，但还需要补强岗位证据和面试故事。"
        : "简历证据偏薄，建议先补项目、实习、证书或岗位理解。";
  return { scores, reasons, summary };
}

function analyzeResumeFromText() {
  const text = ($("#resumeText").value || "").trim();
  if (!text) {
    resumeAutoAnalysis = {
      summary: "还没有读取到简历文本。请先粘贴简历正文，或上传 txt/md 文件。",
      reasons: ["纯静态网页暂不直接解析 PDF/Word；可以把 PDF/Word 文字复制出来粘贴。"]
    };
    renderEvidenceResult();
    return;
  }
  resumeAutoAnalysis = analyzeResumeText(text);
  setEvidenceScores(resumeAutoAnalysis.scores);
}

function handleResumeFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    $("#resumeText").value = String(reader.result || "");
    analyzeResumeFromText();
  };
  reader.onerror = () => {
    resumeAutoAnalysis = {
      summary: "文件读取失败。",
      reasons: ["建议把简历内容复制为纯文本后粘贴到文本框。"]
    };
    renderEvidenceResult();
  };
  reader.readAsText(file, "utf-8");
}

function renderLocalSoeMap() {
  const query = ($("#librarySearch")?.value || "").trim().toLowerCase();
  const mode = $("#libraryMode")?.value || "recommended";
  const regions = (SOE_DATA.localSoeRegionalMap || []).filter((item) => {
    const haystack = `${item.region}${item.source}${item.companies.join("")}${item.industries.join("")}${item.status}`.toLowerCase();
    if (mode !== "all" && mode !== "local" && query.length === 0) return ["北京", "上海", "广东", "江苏", "浙江", "山东", "四川", "重庆"].includes(item.region);
    return !query || haystack.includes(query);
  });
  $("#localSoeMap").innerHTML = regions.length
    ? regions.slice(0, mode === "local" || query ? 31 : 8).map(renderLocalRegion).join("")
    : `<div class="empty-state">当前关键词下暂无地方国企记录。</div>`;
}

function renderLocalRegion(region) {
  return `
    <article class="local-card">
      <header>
        <div>
          <h3>${region.region}</h3>
          <p>${region.source} · ${region.status}</p>
        </div>
        <a href="${region.url}" target="_blank" rel="noreferrer">国资委入口</a>
      </header>
      <div class="tags">${region.industries.map((industry) => `<span class="tag">${industry}</span>`).join("")}</div>
      <div class="local-companies">
        ${region.companies.map((company) => `<span>${company}</span>`).join("")}
      </div>
    </article>
  `;
}

function buildRegionalCatalog() {
  const byRegion = new Map();
  const add = (region, entry) => {
    if (!region || region.includes("全国") || region.includes("项目") || region.includes("分行") || region.includes("分公司")) return;
    const key = region.replace(/省|市|自治区|特别行政区/g, "");
    if (!byRegion.has(key)) byRegion.set(key, []);
    const list = byRegion.get(key);
    if (!list.some((item) => item.name === entry.name && item.type === entry.type)) {
      list.push(entry);
    }
  };

  (SOE_DATA.recruitment2026Records || []).forEach((record) => {
    record.cities.forEach((city) => {
      add(city, {
        name: record.company,
        type: record.scope,
        industry: record.industry,
        reason: record.roles.slice(0, 3).join("、"),
        source: "26届招聘记录"
      });
    });
  });

  (SOE_DATA.localSoeRegionalMap || []).forEach((region) => {
    region.companies.forEach((company) => {
      add(region.region, {
        name: company,
        type: "地方国企",
        industry: region.industries.slice(0, 2).join("、"),
        reason: region.source,
        source: "地方国企样例"
      });
    });
  });

  return [...byRegion.entries()]
    .map(([region, entries]) => ({ region, entries }))
    .sort((a, b) => b.entries.length - a.entries.length);
}

function renderRegionalCatalog() {
  const query = ($("#regionSearch")?.value || "").trim().toLowerCase();
  const catalog = buildRegionalCatalog().filter((item) => {
    const haystack = `${item.region}${item.entries.map((entry) => `${entry.name}${entry.type}${entry.industry}${entry.reason}`).join("")}`.toLowerCase();
    return !query || haystack.includes(query);
  });
  $("#regionCatalog").innerHTML = catalog.length
    ? catalog
        .map(
          (group) => `
        <article class="region-card">
          <header>
            <div>
              <h3>${group.region}</h3>
              <p>${group.entries.length} 家可咨询企业 · 含央企/中央金融/地方国企</p>
            </div>
          </header>
          <div class="region-enterprises">
            ${group.entries
              .slice(0, 18)
              .map(
                (entry) => `
              <div class="region-enterprise">
                <strong>${entry.name}</strong>
                <span>${entry.type} · ${entry.industry}</span>
                <small>${entry.source} · ${entry.reason}</small>
              </div>
            `
              )
              .join("")}
          </div>
          ${group.entries.length > 18 ? `<div class="list-note">已展示前 18 家，可搜索企业名继续缩小范围。</div>` : ""}
        </article>
      `
        )
        .join("")
    : `<div class="empty-state">当前关键词下暂无地域企业记录。</div>`;
}

function copySummary() {
  const profile = $("#profileTitle").textContent;
  const topStretch = currentMatches
    .filter((item) => item.tier === "冲刺")
    .slice(0, 5)
    .map((item) => item.name)
    .join("、");
  const topCore = currentMatches
    .filter((item) => item.tier === "重点")
    .slice(0, 5)
    .map((item) => item.name)
    .join("、");
  const text = [
    `学生画像：${profile}`,
    `咨询判断：${$("#profileAdvice").textContent}`,
    `冲刺企业：${topStretch || "暂无"}`,
    `重点投递：${topCore || "暂无"}`,
    "提醒：具体投递仍需以当年校招公告、岗位 JD 和学生城市/轮岗接受度复核。"
  ].join("\n");
  navigator.clipboard
    ?.writeText(text)
    .then(() => {
      $("#exportBtn").textContent = "已复制";
      setTimeout(() => ($("#exportBtn").textContent = "复制咨询摘要"), 1200);
    })
    .catch(() => window.prompt("复制下面的咨询摘要：", text));
}

function bindEvents() {
  ["#majorInput", "#degreeInput", "#schoolInput", "#cityInput", "#priorityInput"].forEach((selector) => {
    $(selector).addEventListener("input", applyFilters);
    $(selector).addEventListener("change", applyFilters);
  });
  $$('input[name="scope"], input[name="industry"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      if (event.target.name === "industry" && event.target.value !== "all" && event.target.checked) {
        $('input[name="industry"][value="all"]').checked = false;
      }
      if (event.target.name === "industry" && event.target.value === "all" && event.target.checked) {
        $$('input[name="industry"]').forEach((item) => {
          if (item.value !== "all") item.checked = false;
        });
      }
      applyFilters();
    });
  });
  $$(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".tab").forEach((item) => item.classList.remove("active"));
      $$(".view").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      $(`#${button.dataset.view}View`).classList.add("active");
    });
  });
  $("#librarySearch").addEventListener("input", renderLibrary);
  $("#libraryMode").addEventListener("change", renderLibrary);
  $("#libraryIndustryFilter").addEventListener("change", renderLibrary);
  $("#recruitSearch").addEventListener("input", renderRecruitment2026);
  $("#recruitIndustryFilter").addEventListener("change", renderRecruitment2026);
  $("#recruitSourceFilter").addEventListener("change", renderRecruitment2026);
  $("#coverageStatusFilter").addEventListener("change", renderRecruitCoverage);
  $("#regionSearch").addEventListener("input", renderRegionalCatalog);
  $("#resetEvidenceBtn").addEventListener("click", () => {
    resumeAutoAnalysis = null;
    (SOE_DATA.evidenceRubric || []).forEach((item) => {
      const input = $(`[data-evidence="${item.id}"]`);
      if (input) input.value = item.defaultValue;
    });
    renderEvidenceResult();
  });
  $("#resumeFileInput").addEventListener("change", handleResumeFile);
  $("#analyzeResumeBtn").addEventListener("click", analyzeResumeFromText);
  $("#clearResumeBtn").addEventListener("click", () => {
    $("#resumeText").value = "";
    resumeAutoAnalysis = null;
    renderEvidenceResult();
  });
  $("#prepCompanySelect").addEventListener("change", renderPrepPanel);
  $("#exportBtn").addEventListener("click", copySummary);
  $("#resetBtn").addEventListener("click", () => {
    $("#majorInput").value = "电气工程";
    $("#degreeInput").value = "master";
    $("#schoolInput").value = "985";
    $("#cityInput").value = "北京";
    $("#priorityInput").value = "stable";
    $$('input[name="scope"]').forEach((item) => (item.checked = true));
    $$('input[name="industry"]').forEach((item) => (item.checked = item.value === "all"));
    $("#librarySearch").value = "";
    applyFilters();
  });
}

bindEvents();
applyFilters();

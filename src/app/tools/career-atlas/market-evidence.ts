export type SalaryObservation = {
  title: string;
  city: string;
  level: string;
  industry: string;
  annualRange: string;
  employment: string;
  sourceName: string;
  sourceUrl: string;
  caveat: string;
};
export type JdSignal = {
  label: string;
  note: string;
};

export type MarketEvidence = {
  roleSlug: string;
  roleName: string;
  sampleLabel: string;
  updatedAt: string;
  coverage: "试点";
  summary: string;
  jdSignals: JdSignal[];
  salaryObservations: SalaryObservation[];
  jdSources: Array<{ name: string; url: string }>;
};

export const marketEvidence: MarketEvidence[] = [
  {
    roleSlug: "product-manager",
    roleName: "产品经理",
    sampleLabel: "3份公开JD · 2条可比薪资观察",
    updatedAt: "2026-07-22",
    coverage: "试点",
    summary: "样本集中在上海、广州的资深或细分产品岗位，适合观察能力要求，不适合推导初级产品经理的市场中位数。",
    jdSignals: [
      { label: "产品全生命周期", note: "从需求、规划到上线与迭代，对结果负责。" },
      { label: "跨团队推进", note: "需要协调研发、设计、销售或业务团队。" },
      { label: "数据与用户反馈", note: "用指标、研究或客户反馈验证方向。" },
      { label: "行业理解", note: "AI、工业设备等细分岗位会把行业知识列为硬门槛。" },
    ],
    salaryObservations: [
      {
        title: "AI产品经理", city: "广州", level: "3年以上", industry: "AI / Agent", annualRange: "50–60万元/年", employment: "Base×12 + 奖金",
        sourceName: "Michael Page · JN-072026-7054650", sourceUrl: "https://www.michaelpage.com.cn/job-detail/ai%E4%BA%A7%E5%93%81%E7%BB%8F%E7%90%86/ref/jn-072026-7054650",
        caveat: "细分AI岗位的单条招聘样本，不代表通用产品经理薪资。",
      },
      {
        title: "工业设备产品经理", city: "上海", level: "5–8年", industry: "工业 / 制造", annualRange: "43.2–48万元/年", employment: "全职",
        sourceName: "Michael Page · JN-072026-7055345", sourceUrl: "https://www.michaelpage.com.cn/en/job-detail/product-manager-industrial-equipment/ref/jn-072026-7055345?lang=zh-hans",
        caveat: "有明确行业经验门槛，不能与互联网初级产品岗位直接比较。",
      },
    ],
    jdSources: [
      { name: "AI产品经理 · 广州", url: "https://www.michaelpage.com.cn/job-detail/ai%E4%BA%A7%E5%93%81%E7%BB%8F%E7%90%86/ref/jn-072026-7054650" },
      { name: "工业设备产品经理 · 上海", url: "https://www.michaelpage.com.cn/en/job-detail/product-manager-industrial-equipment/ref/jn-072026-7055345?lang=zh-hans" },
      { name: "产品负责人 · 北京", url: "https://www.michaelpage.com.cn/job-detail/%E4%BA%A7%E5%93%81%E8%B4%9F%E8%B4%A3%E4%BA%BA/ref/jn-022026-6940009" },
    ],
  },
  {
    roleSlug: "data-analyst",
    roleName: "数据分析师",
    sampleLabel: "3份公开JD · 1条可比薪资观察",
    updatedAt: "2026-07-22",
    coverage: "试点",
    summary: "样本覆盖旅游、金融等不同业务场景。共同要求比工具清单更稳定：先理解问题，再保证数据质量，最后把结论转成决策。",
    jdSignals: [
      { label: "SQL / Python", note: "用于数据提取、清洗和分析，具体工具随团队而变。" },
      { label: "报表与可视化", note: "需要把复杂数据转成易读的图表、看板或报告。" },
      { label: "业务问题拆解", note: "从业务痛点、指标或风险问题出发，而非只做取数。" },
      { label: "数据质量", note: "准确性、完整性、校验与口径一致性被反复强调。" },
      { label: "沟通协作", note: "需要与业务、风险或技术团队确认需求并解释结论。" },
    ],
    salaryObservations: [
      {
        title: "数据分析师（埋点方向）", city: "上海", level: "5年以上", industry: "旅游 / 消费服务", annualRange: "37.8–46.2万元/年", employment: "灵活用工",
        sourceName: "Michael Page · JN-022026-6939953", sourceUrl: "https://www.michaelpage.com.cn/en/job-detail/data-analyst-event-tracking-famous-brand/ref/jn-022026-6939953",
        caveat: "资深且为灵活用工样本，不能直接外推到应届或全职岗位。",
      },
    ],
    jdSources: [
      { name: "数据分析师（埋点方向）· 上海", url: "https://www.michaelpage.com.cn/en/job-detail/data-analyst-event-tracking-famous-brand/ref/jn-022026-6939953" },
      { name: "银行数据分析顾问 · 北京", url: "https://www.michaelpage.com.cn/en/job-detail/international-bank-data-analyst-9-month-contractor/ref/jn-052026-7017219?lang=zh-hans" },
      { name: "数据分析师职位列表", url: "https://www.michaelpage.com.cn/jobs/%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90%E5%B8%88" },
    ],
  },
  {
    roleSlug: "frontend-engineer",
    roleName: "前端工程师",
    sampleLabel: "2份公开JD · 1条高阶薪资观察",
    updatedAt: "2026-07-22",
    coverage: "试点",
    summary: "公开可见样本偏技术负责人，适合确认技术成长上限的要求；初级岗位薪资仍需补充同城市、同年限样本。",
    jdSignals: [
      { label: "JavaScript与主流框架", note: "React、Vue、Angular等框架能力是常见筛选项。" },
      { label: "组件与架构", note: "中高阶岗位强调可维护性、复用和技术方案设计。" },
      { label: "性能与体验", note: "页面速度、稳定性和用户体验需要共同权衡。" },
      { label: "工程协作", note: "版本管理、规范、评审和跨端协作构成日常工作。" },
    ],
    salaryObservations: [
      {
        title: "前端技术总监", city: "广州", level: "技术负责人", industry: "互联网 / 软件", annualRange: "64.8–79.2万元/年", employment: "全职",
        sourceName: "Michael Page · JN-042026-6998829", sourceUrl: "https://www.michaelpage.com.cn/job-detail/%E5%89%8D%E7%AB%AF%E6%8A%80%E6%9C%AF%E6%80%BB%E7%9B%91/ref/jn-042026-6998829",
        caveat: "管理与架构职责并重的高阶样本，不应视为普通前端工程师区间。",
      },
    ],
    jdSources: [
      { name: "前端技术总监 · 广州", url: "https://www.michaelpage.com.cn/job-detail/%E5%89%8D%E7%AB%AF%E6%8A%80%E6%9C%AF%E6%80%BB%E7%9B%91/ref/jn-042026-6998829" },
      { name: "全栈开发岗位说明", url: "https://www.michaelpage.com.cn/advice/job-description/technology/fullstack-developer" },
    ],
  },
  {
    roleSlug: "backend-engineer",
    roleName: "后端工程师",
    sampleLabel: "2份公开JD · 1条资深薪资观察",
    updatedAt: "2026-07-22",
    coverage: "试点",
    summary: "岗位说明与招聘样本都强调语言、数据库、API和系统可靠性；可见薪资样本为上海资深岗位，不能代表初级市场。",
    jdSignals: [
      { label: "服务端语言", note: "至少熟练掌握一种后端语言，并理解其工程生态。" },
      { label: "数据库与API", note: "关系型或非关系型数据库、接口设计是基础能力。" },
      { label: "性能与可靠性", note: "需要关注扩展性、安全、稳定性和故障处理。" },
      { label: "云与分布式系统", note: "在资深岗位中成为明显的进阶要求。" },
      { label: "协作与交付", note: "需要和前端、产品、测试共同完成持续交付。" },
    ],
    salaryObservations: [
      {
        title: "资深后端工程师", city: "上海", level: "资深", industry: "互联网 / 软件", annualRange: "50–90万元/年", employment: "全职",
        sourceName: "Michael Page · JN-042026-6989220", sourceUrl: "https://www.michaelpage.com.cn/en/job-detail/senior-backend-engineer-china/ref/jn-042026-6989220",
        caveat: "资深岗位跨度较大，反映公司和职责差异，不是市场平均值。",
      },
    ],
    jdSources: [
      { name: "后端开发岗位说明", url: "https://www.michaelpage.com.cn/advice/job-description/technology/backend-developer" },
      { name: "资深后端工程师 · 上海", url: "https://www.michaelpage.com.cn/en/job-detail/senior-backend-engineer-china/ref/jn-042026-6989220" },
    ],
  },
];

export const marketEvidenceByRole = new Map(marketEvidence.map((item) => [item.roleSlug, item]));

export const salaryMethodology = {
  title: "为什么不直接给一个平均数",
  note: "招聘页面中的薪资会被城市、经验、行业、合同类型和奖金口径显著影响。本站只展示带完整上下文的公开观察样本，不把单条样本包装成市场中位数。",
  sourceName: "Michael Page 薪资比较工具方法说明",
  sourceUrl: "https://www.michaelpage.com.cn/salary-comparison-tool",
  rules: ["先对齐城市与经验", "区分固定工资、奖金与长期激励", "区分全职与灵活用工", "样本不足时明确留白"],
};

export type InterviewCategory = 'behavioral' | 'product' | 'technical' | 'data' | 'hr';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: InterviewCategory;
  categoryLabel: string;
  roles: string[];
  companies: string[];
  difficulty: '基础' | '进阶' | '挑战';
  intent: string;
  framework: string[];
  followups: string[];
}

export interface GroupCase {
  id: string;
  title: string;
  type: string;
  roles: string[];
  duration: string;
  groupSize: string;
  prompt: string;
  deliverable: string;
  dimensions: string[];
  process: string[];
  observerNotes: string[];
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'behavior-01', category: 'behavioral', categoryLabel: '经历深挖', roles: ['通用'], companies: ['通用'], difficulty: '基础',
    question: '请选一段与你申请岗位最相关的经历，用两分钟说明你具体解决了什么问题。',
    intent: '判断候选人能否抓住岗位相关性，并分清团队成果和个人贡献。',
    framework: ['一句话交代背景和目标', '明确自己承担的角色', '说明关键判断与行动', '用证据呈现结果', '补充对目标岗位的迁移价值'],
    followups: ['如果没有你，结果会有什么不同？', '当时最难的判断是什么？', '这段经历中你会重做哪一步？'],
  },
  {
    id: 'behavior-02', category: 'behavioral', categoryLabel: '经历深挖', roles: ['通用'], companies: ['字节跳动', '腾讯', '阿里巴巴', '美团'], difficulty: '进阶',
    question: '讲一次你主动发现问题并推动他人共同解决的经历。',
    intent: '考察主动性、影响力和跨团队推进，而不是只听“我很自驱”的评价。',
    framework: ['问题原本为何容易被忽略', '你用什么证据确认问题', '利益相关者分别关心什么', '如何推动达成行动', '结果与复盘'],
    followups: ['谁一开始不支持？', '你做了哪些让步？', '结果如何被验证？'],
  },
  {
    id: 'behavior-03', category: 'behavioral', categoryLabel: '经历深挖', roles: ['通用'], companies: ['通用'], difficulty: '进阶',
    question: '讲一次结果没有达到预期的项目。你承担什么责任，之后做了什么？',
    intent: '考察事实意识、责任边界、复盘能力和面对失败时的稳定性。',
    framework: ['目标与实际差距', '不要甩锅，说明自己的判断', '定位一至两个根因', '采取的补救动作', '形成了什么机制改变'],
    followups: ['当时有哪些预警信号？', '如果再来一次你会在哪个节点干预？', '团队如何评价你的处理？'],
  },
  {
    id: 'behavior-04', category: 'behavioral', categoryLabel: '经历深挖', roles: ['通用'], companies: ['华为', '银行央国企'], difficulty: '进阶',
    question: '资源和时间都不足时，你如何保证一个重要任务按期交付？',
    intent: '考察优先级、风险管理、沟通和交付意识。',
    framework: ['明确不能妥协的交付标准', '拆分任务和关键路径', '识别可删减范围', '提前同步风险与资源请求', '设置检查点'],
    followups: ['你放弃了什么？', '如何判断质量足够？', '如果关键成员临时缺席怎么办？'],
  },
  {
    id: 'behavior-05', category: 'behavioral', categoryLabel: '经历深挖', roles: ['通用'], companies: ['外企快消', '腾讯'], difficulty: '挑战',
    question: '讲一次你和能力很强但观点完全不同的人合作的经历。',
    intent: '考察倾听、冲突处理和以共同目标推进工作的能力。',
    framework: ['分歧是什么，不做人身判断', '双方依据和利益点', '寻找共同评价标准', '如何验证或组合方案', '合作结果'],
    followups: ['对方最有价值的观点是什么？', '你最终改变了什么判断？', '如果无法达成一致如何升级？'],
  },
  {
    id: 'behavior-06', category: 'behavioral', categoryLabel: '经历深挖', roles: ['通用'], companies: ['通用'], difficulty: '基础',
    question: '大学期间哪件事最能代表你的成长？不要只讲获奖结果。',
    intent: '观察候选人的自我认知、选择标准和学习路径。',
    framework: ['为什么选择这件事', '原来的能力或认知缺口', '经历中的关键转折', '具体改变', '改变如何延续到现在'],
    followups: ['这个成长如何被他人观察到？', '你现在仍有哪些不足？', '它和目标岗位有什么关系？'],
  },
  {
    id: 'behavior-07', category: 'behavioral', categoryLabel: '经历深挖', roles: ['通用'], companies: ['字节跳动', '美团'], difficulty: '挑战',
    question: '请举例说明你如何用数据或事实改变了原有判断。',
    intent: '考察候选人是否愿意被证据纠正，而不是只会用数据包装结论。',
    framework: ['原判断和依据', '出现了什么反常信号', '如何补充数据或验证', '判断发生怎样的变化', '后续行动和结果'],
    followups: ['数据有什么局限？', '有没有与数据相反的定性证据？', '如何避免只挑支持自己的数据？'],
  },
  {
    id: 'behavior-08', category: 'behavioral', categoryLabel: '经历深挖', roles: ['通用'], companies: ['银行央国企', '华为'], difficulty: '进阶',
    question: '讲一次你发现流程或数据存在风险，并坚持提出问题的经历。',
    intent: '考察底线意识、风险识别和有建设性的沟通方式。',
    framework: ['风险事实与潜在影响', '如何核实而不是猜测', '向谁、以什么方式沟通', '提出替代方案', '最终处理'],
    followups: ['如果负责人不接受怎么办？', '如何避免过度升级？', '你的判断有没有可能是错的？'],
  },

  {
    id: 'product-01', category: 'product', categoryLabel: '产品运营', roles: ['产品', '运营'], companies: ['腾讯', '字节跳动', '阿里巴巴'], difficulty: '基础',
    question: '选择一款你高频使用的产品，说出一个真正值得解决的问题。',
    intent: '考察问题发现、用户视角和避免“为改而改”的能力。',
    framework: ['明确用户与场景', '描述行为证据而非个人喜好', '说明问题影响', '分析可能根因', '提出最小验证方法'],
    followups: ['有多少用户可能遇到？', '为什么现在解决？', '什么指标证明改善？'],
  },
  {
    id: 'product-02', category: 'product', categoryLabel: '产品运营', roles: ['产品', '运营'], companies: ['字节跳动', '美团'], difficulty: '挑战',
    question: '某新功能使用率很高，但用户留存下降，你会如何分析？',
    intent: '考察指标体系、相关与因果区分、分群和实验意识。',
    framework: ['先检查口径和同期变化', '按渠道、用户、版本和场景分群', '建立使用功能与留存的路径假设', '查看护栏指标和用户反馈', '设计实验或回滚验证'],
    followups: ['什么情况下高使用率反而是坏信号？', '如何排除渠道质量变化？', '多长时间能得出结论？'],
  },
  {
    id: 'product-03', category: 'product', categoryLabel: '产品运营', roles: ['产品'], companies: ['腾讯', '阿里巴巴'], difficulty: '进阶',
    question: '研发资源只够做一个需求，你会如何在三个业务方之间确定优先级？',
    intent: '考察目标对齐、评价标准、证据意识和利益相关者沟通。',
    framework: ['统一业务目标', '定义影响、覆盖、确定性、成本与风险', '让各方使用同一信息模板', '评估依赖与可逆性', '透明记录决定和复盘点'],
    followups: ['最高层要求插单怎么办？', '无法量化的战略需求怎么评？', '被延后的业务方如何沟通？'],
  },
  {
    id: 'product-04', category: 'product', categoryLabel: '产品运营', roles: ['运营', '市场'], companies: ['京东', '美团', '外企快消'], difficulty: '进阶',
    question: '给一款校园新产品设计首月冷启动方案。',
    intent: '考察目标用户、供给与需求、渠道、内容和可验证目标的完整性。',
    framework: ['定义最小目标用户和核心价值', '判断先做供给还是需求', '设计种子用户获取', '安排首批内容或服务', '设定周度漏斗和退出条件'],
    followups: ['预算只有5000元怎么办？', '首批用户从哪里来？', '什么数据说明应停止？'],
  },
  {
    id: 'product-05', category: 'product', categoryLabel: '产品运营', roles: ['运营', '产品'], companies: ['字节跳动', '腾讯'], difficulty: '挑战',
    question: '平台出现热点谣言并快速传播，作为值班运营你会如何处理？',
    intent: '考察危机响应、事实核验、跨团队协作和用户沟通。',
    framework: ['判断事件级别和影响', '并行核验事实与保全证据', '联动内容、法务、公关和技术', '采取分级处置而非一刀切', '发布透明说明并持续监测'],
    followups: ['信息暂时无法证实时怎么办？', '如何平衡速度和准确？', '事后需要补什么机制？'],
  },
  {
    id: 'product-06', category: 'product', categoryLabel: '产品运营', roles: ['产品', '商业分析'], companies: ['阿里巴巴', '京东', '美团'], difficulty: '挑战',
    question: '估算一所五万人的大学一天产生多少份外卖订单。',
    intent: '考察结构化拆解、合理假设、数量级和校验意识，不追求唯一答案。',
    framework: ['定义口径和时间范围', '按住宿、用餐场景或人群拆分', '给出每层假设与计算', '用供给侧或常识做交叉校验', '指出敏感变量'],
    followups: ['雨天会怎样变化？', '如何用三项真实数据校准？', '订单不是人数，如何避免重复计算？'],
  },
  {
    id: 'product-07', category: 'product', categoryLabel: '产品运营', roles: ['产品', '运营'], companies: ['通用'], difficulty: '进阶',
    question: '如何判断一个上线三个月的功能应该继续投入、维持还是下线？',
    intent: '考察目标、增量价值、用户分层、成本和机会成本。',
    framework: ['回到功能原始目标', '看使用、留存与任务完成', '识别关键少数用户价值', '比较维护成本和替代方案', '用实验或渐进下线验证'],
    followups: ['使用人数少一定要下线吗？', '内部用户和外部用户如何权衡？', '下线如何降低影响？'],
  },
  {
    id: 'product-08', category: 'product', categoryLabel: '产品运营', roles: ['运营', '市场'], companies: ['外企快消', '京东'], difficulty: '进阶',
    question: '一次促销活动销售额明显增长，但活动结束后复购下降，你如何复盘？',
    intent: '考察增量、用户质量、利润和长期价值，而不是只报漂亮数字。',
    framework: ['明确实验基线与对照', '拆分新老用户和渠道', '计算补贴后利润', '分析活动吸引的需求类型', '形成下一轮人群与机制调整'],
    followups: ['如何识别薅羊毛用户？', '没有对照组怎么办？', '哪些护栏指标应提前设置？'],
  },

  {
    id: 'tech-01', category: 'technical', categoryLabel: '技术研发', roles: ['后端', '研发'], companies: ['华为', '美团', '腾讯', '阿里巴巴'], difficulty: '基础',
    question: '从浏览器输入一个网址到页面出现，中间发生了什么？',
    intent: '综合考察网络、操作系统、浏览器和服务端基础，并观察能否由浅入深。',
    framework: ['DNS与连接建立', 'TLS和HTTP请求', '网关、负载均衡与服务处理', '数据库与缓存', '浏览器解析、渲染和资源加载'],
    followups: ['HTTP/2有什么变化？', 'DNS缓存在哪里？', '首屏慢如何定位？'],
  },
  {
    id: 'tech-02', category: 'technical', categoryLabel: '技术研发', roles: ['后端', '研发'], companies: ['美团', '阿里巴巴'], difficulty: '进阶',
    question: '你的项目为什么使用Redis？如果缓存和数据库不一致怎么办？',
    intent: '从简历项目出发判断候选人是否理解技术选择和代价。',
    framework: ['业务读写特点和性能目标', '选择的数据结构', '更新与失效策略', '穿透、击穿和雪崩处理', '监控与降级'],
    followups: ['为什么不用本地缓存？', '删除缓存失败怎么办？', '热点Key如何处理？'],
  },
  {
    id: 'tech-03', category: 'technical', categoryLabel: '技术研发', roles: ['后端', '研发'], companies: ['腾讯', '华为'], difficulty: '基础',
    question: '进程和线程有什么区别？在什么场景下你会关心这个区别？',
    intent: '不只考定义，还考察资源隔离、通信、调度和工程选择。',
    framework: ['资源与地址空间', '调度和切换成本', '通信与同步', '故障隔离', '结合具体服务举例'],
    followups: ['协程解决什么问题？', '线程越多吞吐越高吗？', '如何排查死锁？'],
  },
  {
    id: 'tech-04', category: 'technical', categoryLabel: '技术研发', roles: ['后端', '数据开发'], companies: ['阿里巴巴', '京东', '美团'], difficulty: '进阶',
    question: '数据库索引为什么能加速查询？什么情况下建了索引仍然很慢？',
    intent: '考察数据结构、执行计划、选择性和SQL使用方式。',
    framework: ['B+树与减少扫描', '联合索引与最左前缀', '选择性和回表', '函数、类型转换与范围条件', '用执行计划验证'],
    followups: ['为什么不用普通二叉树？', '覆盖索引是什么？', '索引越多越好吗？'],
  },
  {
    id: 'tech-05', category: 'technical', categoryLabel: '技术研发', roles: ['后端', '研发'], companies: ['字节跳动', '腾讯'], difficulty: '挑战',
    question: '一个接口平均延迟正常，但P99突然上升，你会如何排查？',
    intent: '考察监控指标、分层定位、长尾意识和系统性排障。',
    framework: ['确认口径、时间和影响范围', '按实例、地域、请求类型拆分', '看依赖、GC、锁、慢查询和队列', '关联发布与流量变化', '复现、缓解并建立监控'],
    followups: ['平均值为什么会掩盖问题？', '没有链路追踪怎么办？', '先扩容是否合理？'],
  },
  {
    id: 'tech-06', category: 'technical', categoryLabel: '技术研发', roles: ['前端', '研发'], companies: ['腾讯', '字节跳动', '美团'], difficulty: '进阶',
    question: '一个复杂页面首屏加载很慢，你会如何定位并优化？',
    intent: '考察性能指标、网络与渲染分析、优先级和验证。',
    framework: ['明确LCP等用户指标', '使用Performance与Network定位', '资源体积、请求瀑布和缓存', '主线程任务与渲染阻塞', '小步优化并用真实用户数据验证'],
    followups: ['SSR一定更快吗？', '图片如何优化？', '第三方脚本怎么治理？'],
  },
  {
    id: 'tech-07', category: 'technical', categoryLabel: '技术研发', roles: ['后端', '研发'], companies: ['通用'], difficulty: '挑战',
    question: '设计一个支持十万人同时抢一万张券的系统，你会关注什么？',
    intent: '考察容量、并发控制、一致性、防刷、降级和可观测性。',
    framework: ['明确峰值与一致性要求', '入口限流和资格校验', '库存原子扣减与幂等', '异步化和削峰', '防刷、降级、监控与补偿'],
    followups: ['如何避免超卖？', '消息重复消费怎么办？', '活动失败如何补偿用户？'],
  },
  {
    id: 'tech-08', category: 'technical', categoryLabel: '技术研发', roles: ['研发', '测试'], companies: ['华为', '京东'], difficulty: '进阶',
    question: '你会如何为一个登录接口设计测试用例？',
    intent: '考察边界意识、分层测试、安全与异常场景。',
    framework: ['正常流程与不同身份', '输入边界和错误凭证', '频率限制与并发', '会话、过期和多端', '安全、日志和依赖故障'],
    followups: ['短信验证码如何测试？', '如何避免测试污染数据？', '哪些用例适合自动化？'],
  },

  {
    id: 'data-01', category: 'data', categoryLabel: '数据算法', roles: ['数据分析', '算法'], companies: ['字节跳动', '美团', '阿里巴巴'], difficulty: '进阶',
    question: 'A、B两个地区的转化率都上升，但合并后的总转化率下降，可能是什么原因？',
    intent: '考察辛普森悖论、分组权重和数据口径。',
    framework: ['写出总转化率是加权结果', '检查各地区样本占比变化', '识别难度不同的人群迁移', '分层比较并控制混杂变量', '说明业务解释'],
    followups: ['如何用一个简单例子说明？', '应该相信分组还是总体？', '实验设计如何避免？'],
  },
  {
    id: 'data-02', category: 'data', categoryLabel: '数据算法', roles: ['数据分析', '产品'], companies: ['通用'], difficulty: '基础',
    question: '如果只能用三个指标描述一款内容产品的健康度，你会选什么？',
    intent: '考察目标拆解和指标之间的平衡，不追求固定答案。',
    framework: ['先定义产品核心价值', '选择规模或活跃指标', '选择用户价值或留存指标', '选择生态或风险护栏', '说明口径与冲突'],
    followups: ['为什么不只看DAU？', '创作者侧如何体现？', '短期和长期指标冲突怎么办？'],
  },
  {
    id: 'data-03', category: 'data', categoryLabel: '数据算法', roles: ['数据分析', '算法'], companies: ['字节跳动', '腾讯'], difficulty: '挑战',
    question: 'A/B测试结果显著，但上线后效果消失，可能有哪些原因？',
    intent: '考察实验质量、外推、长期效应和工程落地。',
    framework: ['检查样本和分流', '新奇效应与实验时长', '人群、季节和流量结构变化', '多重检验和指标选择', '实现差异与系统干扰'],
    followups: ['统计显著等于业务显著吗？', '如何设置护栏指标？', '什么时候应停止实验？'],
  },
  {
    id: 'data-04', category: 'data', categoryLabel: '数据算法', roles: ['算法', '研发'], companies: ['阿里巴巴', '字节跳动'], difficulty: '进阶',
    question: '模型离线AUC提高，但线上业务指标下降，你会如何分析？',
    intent: '考察离线指标与业务目标错位、数据漂移和线上系统。',
    framework: ['确认离线样本与标签', '检查训练和线上特征一致性', '看人群与场景分层', '分析排序指标与业务目标差异', '回滚并设计在线实验'],
    followups: ['AUC不能说明什么？', '可能存在什么反馈回路？', '如何监控数据漂移？'],
  },
  {
    id: 'data-05', category: 'data', categoryLabel: '数据算法', roles: ['数据分析'], companies: ['美团', '京东'], difficulty: '进阶',
    question: '某城市订单量下降10%，请给出你的分析树。',
    intent: '考察能否由指标到供需、漏斗和外部因素系统拆解。',
    framework: ['先核对口径和同期', '需求侧：用户、频次、转化', '供给侧：商家、商品、运力', '按区域、时段、品类、渠道分层', '外部事件与竞品活动', '形成验证顺序'],
    followups: ['只能查三张表先查什么？', '如何区分短期波动？', '分析结束后如何形成行动？'],
  },
  {
    id: 'data-06', category: 'data', categoryLabel: '数据算法', roles: ['算法', '数据分析'], companies: ['通用'], difficulty: '挑战',
    question: '数据中正样本只有1%，你会如何训练和评估分类模型？',
    intent: '考察类别不平衡、采样、损失和评价指标选择。',
    framework: ['理解业务误判成本', '分层划分避免泄漏', '重采样或类别权重', '使用PR-AUC、召回、精确率等', '阈值选择与线上校准'],
    followups: ['为什么准确率会误导？', '过采样有什么风险？', '阈值如何与成本关联？'],
  },

  {
    id: 'hr-01', category: 'hr', categoryLabel: '动机与HR', roles: ['通用'], companies: ['通用'], difficulty: '基础',
    question: '为什么选择这个岗位，而不是与你专业更直接相关的方向？',
    intent: '判断动机是否经过验证、能力是否可迁移以及选择是否稳定。',
    framework: ['说明对岗位真实工作的理解', '连接经历中的持续兴趣', '给出可迁移能力证据', '说明已做过的验证行动', '承认并补齐差距'],
    followups: ['如果实际工作和预期不同怎么办？', '你为转向付出了什么？', '还在申请哪些方向？'],
  },
  {
    id: 'hr-02', category: 'hr', categoryLabel: '动机与HR', roles: ['通用'], companies: ['字节跳动', '腾讯', '华为', '美团'], difficulty: '进阶',
    question: '为什么选择我们，而不是同类型的另一家公司？',
    intent: '考察准备程度、业务理解和双向匹配，避免空泛品牌崇拜。',
    framework: ['岗位具体工作', '业务阶段或问题', '团队需要与个人证据', '个人希望学习和贡献什么', '保持真实，不贬低竞品'],
    followups: ['你从哪里了解到这些？', '公司目前最大的挑战是什么？', '如果被调到不同业务呢？'],
  },
  {
    id: 'hr-03', category: 'hr', categoryLabel: '动机与HR', roles: ['通用'], companies: ['通用'], difficulty: '基础',
    question: '你未来三年的职业规划是什么？',
    intent: '判断候选人的成长逻辑与岗位是否一致，不要求预测职位名称。',
    framework: ['第一阶段熟悉业务和交付', '第二阶段独立负责完整问题', '第三阶段形成专业深度或协作影响', '说明衡量成长的标准', '保留根据反馈调整的空间'],
    followups: ['如果晋升没有预期快怎么办？', '你最想补的能力是什么？', '管理和专业路线如何选？'],
  },
  {
    id: 'hr-04', category: 'hr', categoryLabel: '动机与HR', roles: ['通用'], companies: ['银行央国企', '华为'], difficulty: '进阶',
    question: '你手上还有哪些机会？选择Offer时最看重什么？',
    intent: '了解求职进展、稳定性和真实决策标准。',
    framework: ['如实说明阶段而非虚构Offer', '给出三项以内决策标准', '解释标准与长期目标的关系', '说明该岗位的匹配点', '不做不必要的薪资博弈'],
    followups: ['如果薪资低于另一家呢？', '城市和岗位哪个更重要？', '你需要多久决定？'],
  },
  {
    id: 'hr-05', category: 'hr', categoryLabel: '动机与HR', roles: ['通用'], companies: ['通用'], difficulty: '挑战',
    question: '你的最大缺点是什么？它最近一次造成了什么实际影响？',
    intent: '考察自我认知和真实改进，而不是包装成优点。',
    framework: ['选择与岗位不致命但真实的缺口', '给出最近事实', '说明影响和反馈', '已经采取的具体机制', '当前改善证据和仍有风险'],
    followups: ['为什么到现在还没完全解决？', '同事会如何描述这个缺点？', '我们如何帮助你？'],
  },
  {
    id: 'hr-06', category: 'hr', categoryLabel: '动机与HR', roles: ['通用'], companies: ['外企快消', '银行央国企'], difficulty: '挑战',
    question: '当合规要求与业务目标发生冲突时，你会如何处理？',
    intent: '考察底线、风险判断和在规则内解决问题的能力。',
    framework: ['确认规则和事实', '评估影响和不可逆风险', '及时与负责人或专业部门沟通', '在规则内寻找替代方案', '记录决定和后续改进'],
    followups: ['如果上级要求你直接执行？', '什么时候需要升级？', '如何避免用合规做拖延借口？'],
  },
];

export const GROUP_CASES: GroupCase[] = [
  {
    id: 'group-01', title: '校园招聘宣讲会资源排序', type: '资源排序', roles: ['管培', '职能', '运营'], duration: '35分钟', groupSize: '6–8人',
    prompt: '你们是校园招聘项目组，预算只够保留10项方案中的5项：行业嘉宾、校友分享、模拟面试、简历门诊、企业展位、线上直播、交通补贴、技术工作坊、无障碍支持、会后社群。请形成统一排序、预算原则和执行重点。',
    deliverable: '给出前5项、三条选择标准、预算分配原则和一项风险预案。',
    dimensions: ['标准建立', '信息取舍', '团队协作', '时间控制', '总结表达'],
    process: ['3分钟独立阅读并形成排序', '每人60秒陈述核心标准', '18分钟讨论并统一方案', '5分钟检查遗漏与风险', '3分钟总结陈词'],
    observerNotes: ['是否先建立共同标准再争具体选项', '能否吸收不同意见而非重复自己', '是否主动推动团队形成可交付结果'],
  },
  {
    id: 'group-02', title: '内容平台突发舆情处置', type: '危机处理', roles: ['产品', '运营', '公关'], duration: '30分钟', groupSize: '6–8人',
    prompt: '某内容平台出现未经证实的校园安全事件，相关内容一小时增长20倍，同时服务器负载升高。请作为跨职能小组制定前2小时处置方案。',
    deliverable: '输出事件分级、前30分钟动作、跨团队分工、用户沟通原则和事后复盘项。',
    dimensions: ['风险判断', '并行推进', '事实意识', '角色协作', '压力反应'],
    process: ['2分钟审题', '5分钟个人方案', '15分钟合并与排序', '5分钟形成时间线', '3分钟汇报'],
    observerNotes: ['是否区分已知事实和假设', '能否兼顾内容风险与系统稳定', '冲突时是否回到共同目标'],
  },
  {
    id: 'group-03', title: '校园外卖新业务冷启动', type: '商业策划', roles: ['产品', '运营', '商业分析'], duration: '40分钟', groupSize: '6–10人',
    prompt: '一所五万人的大学允许新平台进入，但预算只有10万元、首月合作商家不超过30家。请制定首月冷启动方案。',
    deliverable: '明确目标用户、供需策略、预算分配、四周节奏和核心指标。',
    dimensions: ['用户洞察', '商业逻辑', '数据意识', '创新性', '可执行性'],
    process: ['5分钟独立分析', '8分钟提出关键假设', '17分钟形成方案', '5分钟压力测试', '5分钟汇报'],
    observerNotes: ['方案是否满足预算和供给约束', '是否提出可验证而非宏大口号', '能否对他人观点做有效补充'],
  },
  {
    id: 'group-04', title: '研发项目功能优先级', type: '优先级决策', roles: ['产品', '研发', '项目管理'], duration: '35分钟', groupSize: '6–8人',
    prompt: '一款校园协作工具距发布只剩三周，团队只能完成下列两项：实时协作、移动端离线、权限审计、模板市场、数据看板、第三方登录。请确定优先级并处理各业务方的反对意见。',
    deliverable: '输出评价标准、优先两项、放弃理由、风险和后续路线。',
    dimensions: ['目标对齐', '优先级框架', '说服能力', '冲突处理', '结果意识'],
    process: ['3分钟阅读', '7分钟确定标准', '15分钟评估选项', '5分钟形成路线', '5分钟汇报'],
    observerNotes: ['是否区分用户问题和解决方案', '是否考虑依赖与不可逆风险', '是否尊重并回应反对意见'],
  },
  {
    id: 'group-05', title: '零售门店利润改善方案', type: '经营分析', roles: ['零售', '运营', '管培'], duration: '40分钟', groupSize: '6–8人',
    prompt: '某校园门店客流增长12%，但利润下降15%。已知折扣力度、损耗率、用工成本和线上订单均有变化。请提出分析顺序和90天改善计划。',
    deliverable: '给出利润树、优先核查数据、三项行动和护栏指标。',
    dimensions: ['结构化分析', '商业敏感度', '证据意识', '执行节奏', '协作'],
    process: ['5分钟拆利润树', '10分钟提出假设', '15分钟选择行动', '5分钟设指标', '5分钟汇报'],
    observerNotes: ['是否先验证数据而不是直接开药方', '能否区分收入增长和价值增长', '是否设置副作用指标'],
  },
  {
    id: 'group-06', title: '银行网点适老化改造', type: '公共服务', roles: ['银行', '央国企', '职能'], duration: '35分钟', groupSize: '6–10人',
    prompt: '某银行计划用50万元改造一处网点，候选措施包括人工引导、界面大字版、无障碍坡道、反诈课堂、上门服务、远程视频柜员和家属授权流程。请形成一期方案。',
    deliverable: '选择措施、说明服务对象与风险、分配预算并给出效果指标。',
    dimensions: ['服务意识', '合规风险', '资源配置', '同理心', '总结'],
    process: ['4分钟独立选择', '16分钟讨论需求和风险', '8分钟预算', '4分钟检查合规', '3分钟汇报'],
    observerNotes: ['是否避免把老年用户视为单一群体', '是否平衡便利与账户安全', '是否给出可衡量的服务结果'],
  },
  {
    id: 'group-07', title: 'AI校园助手伦理边界', type: '观点辩论', roles: ['产品', '技术', '管培'], duration: '35分钟', groupSize: '6–8人',
    prompt: '学校计划上线AI学习助手，可读取课程、作业和校园活动数据。有人支持个性化推荐，也有人担心隐私、依赖和不公平。请制定是否上线及其边界。',
    deliverable: '给出立场、允许与禁止场景、用户授权机制、试点范围和退出条件。',
    dimensions: ['多方视角', '伦理判断', '边界设计', '倾听协商', '逻辑表达'],
    process: ['4分钟个人立场', '10分钟利益相关者分析', '12分钟边界设计', '5分钟形成共识', '4分钟汇报'],
    observerNotes: ['能否理解对立观点中的合理部分', '是否把价值判断转成具体机制', '是否提出可逆试点'],
  },
  {
    id: 'group-08', title: '新消费品牌进入校园', type: '市场策略', roles: ['市场', '运营', '快消'], duration: '40分钟', groupSize: '6–8人',
    prompt: '一个无糖饮料品牌希望三个月内进入10所高校，预算80万元。请设计定位、渠道、活动和衡量方案，同时避免一次性促销带来的虚假增长。',
    deliverable: '目标人群、价值主张、渠道组合、预算、里程碑和长期指标。',
    dimensions: ['市场洞察', '策略完整性', '预算意识', '数据衡量', '团队推进'],
    process: ['5分钟独立构思', '10分钟统一人群和定位', '15分钟渠道与预算', '5分钟指标', '5分钟汇报'],
    observerNotes: ['是否有清晰目标人群而非“所有学生”', '渠道和定位是否一致', '是否区分试饮、购买和复购'],
  },
  {
    id: 'group-09', title: '供应链中断应急分配', type: '资源分配', roles: ['供应链', '运营', '管培'], duration: '35分钟', groupSize: '6–8人',
    prompt: '突发天气使仓库可用库存只能满足60%的订单。客户包括医院、普通消费者、长期企业客户和促销订单。请制定24小时分配与沟通方案。',
    deliverable: '分配原则、客户顺序、替代方案、沟通模板要点和复盘机制。',
    dimensions: ['原则一致性', '风险意识', '客户沟通', '资源协调', '压力决策'],
    process: ['3分钟审题', '8分钟确定原则', '14分钟分配', '6分钟沟通与补偿', '4分钟汇报'],
    observerNotes: ['是否先说明原则再分配', '是否考虑生命健康与合同风险', '是否给出恢复和补偿计划'],
  },
  {
    id: 'group-10', title: '毕业生就业服务项目设计', type: '方案设计', roles: ['职能', '人力资源', '公共服务'], duration: '40分钟', groupSize: '6–10人',
    prompt: '学校有20万元预算提升困难毕业生的就业结果。候选服务包括岗位推荐、技能训练、心理支持、企业参访、导师辅导、交通补贴和短期实习。请设计一个学期项目。',
    deliverable: '服务对象识别、组合方案、预算、过程指标、结果指标和公平机制。',
    dimensions: ['问题定义', '用户分层', '资源配置', '社会责任', '结果导向'],
    process: ['5分钟定义对象', '10分钟评估措施', '15分钟形成项目', '5分钟指标与风险', '5分钟汇报'],
    observerNotes: ['是否避免标签化服务对象', '是否把过程参与和就业结果分开', '是否提出持续反馈机制'],
  },
];

export const INTERVIEW_SOURCES = [
  { title: '教育部：结构化面试与无领导小组讨论', url: 'https://www.ncss.cn/ncss/zd/ms/202405/20240520/2293292659.html' },
  { title: '清华大学职业发展中心：无领导小组评价观察', url: 'https://career.tsinghua.edu.cn/info/1052/3563.htm' },
  { title: '华为校园招聘：公开招聘流程说明', url: 'https://career.huawei.com/reccampportal/next/mini/index_h5.html' },
  { title: '字节跳动校园招聘：岗位流程与在线笔试说明', url: 'https://jobs.bytedance.com/campus' },
  { title: '牛客公开面经：用于归纳常见考察主题', url: 'https://www.nowcoder.com/interview/center' },
];

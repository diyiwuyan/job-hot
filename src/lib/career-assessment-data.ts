export const DEFAULT_SCALE = ['非常不符合', '比较不符合', '有些不确定', '比较符合', '非常符合'] as const;
export const SKILL_SCALE = ['刚接触', '能在指导下完成', '能独立完成', '能处理复杂任务', '能指导别人'] as const;
export const READINESS_SCALE = ['还没开始', '知道要做但未行动', '正在准备', '基本完成', '能持续复盘优化'] as const;

export type EvidenceKey = 'none' | 'course' | 'campus' | 'internship' | 'project';
export type CareerAssessmentAnswer = number | { value: number; evidence?: EvidenceKey };

export type CareerAssessmentQuestion = {
  id: string;
  text: string;
  dimension: string;
  reverse?: boolean;
  scale?: readonly string[];
};

export type CareerDimension = {
  key: string;
  name: string;
  summary: string;
  action: string;
  color: string;
};

export type CareerAssessmentDefinition = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  question: string;
  description: string;
  basis: string;
  duration: string;
  stage: string;
  icon: string;
  gradient: string;
  tags: string[];
  collectEvidence?: boolean;
  scoreDirection?: 'positive' | 'risk';
  questions: CareerAssessmentQuestion[];
  dimensions: CareerDimension[];
};

function questions(prefix: string, rows: Array<[string, string, boolean?]>, scale: readonly string[] = DEFAULT_SCALE) {
  return rows.map(([text, dimension, reverse], index) => ({ id: `${prefix}-${index + 1}`, text, dimension, reverse, scale }));
}

const WORK_STYLE_QUESTIONS = questions('work-style', [
  ['在集体活动里，我常常能带动现场气氛。', 'extraversion'],
  ['我很少关心别人的处境。', 'agreeableness', true],
  ['开始一项任务前，我通常已经做好了准备。', 'conscientiousness'],
  ['我很容易感到压力过大。', 'stability', true],
  ['我拥有丰富的词汇和表达方式。', 'openness'],
  ['大多数时候，我不太爱说话。', 'extraversion', true],
  ['我对了解别人很感兴趣。', 'agreeableness'],
  ['我经常把物品随手乱放。', 'conscientiousness', true],
  ['多数时候，我的心态比较放松。', 'stability'],
  ['我较难理解抽象概念。', 'openness', true],
  ['与人相处时，我通常感觉自在。', 'extraversion'],
  ['情绪上来时，我可能会说出伤人的话。', 'agreeableness', true],
  ['我会留意任务中的细节。', 'conscientiousness'],
  ['我经常为各种事情担心。', 'stability', true],
  ['我的想象力比较丰富。', 'openness'],
  ['在人群中，我更愿意待在不显眼的位置。', 'extraversion', true],
  ['我能够体会别人的感受。', 'agreeableness'],
  ['我有时会把事情弄得一团糟。', 'conscientiousness', true],
  ['我很少长时间陷入低落。', 'stability'],
  ['我对抽象或理论性的话题兴趣不大。', 'openness', true],
  ['我会主动开启一段对话。', 'extraversion'],
  ['我通常不太关注别人的烦恼。', 'agreeableness', true],
  ['该做的日常任务，我一般会尽快完成。', 'conscientiousness'],
  ['小事也可能明显干扰我的情绪。', 'stability', true],
  ['我经常能提出不错的新点子。', 'openness'],
  ['在讨论中，我常常不知道该说什么。', 'extraversion', true],
  ['面对需要帮助的人，我通常会心软。', 'agreeableness'],
  ['我经常忘记把东西放回原处。', 'conscientiousness', true],
  ['我比较容易感到烦闷。', 'stability', true],
  ['我觉得自己的想象力不算丰富。', 'openness', true],
  ['参加聚会时，我会和不同的人交流。', 'extraversion'],
  ['我对别人本身没有太多兴趣。', 'agreeableness', true],
  ['我喜欢让事情保持井然有序。', 'conscientiousness'],
  ['我的情绪变化比较频繁。', 'stability', true],
  ['面对新知识，我通常能较快抓住重点。', 'openness'],
  ['我不喜欢让自己成为注意力中心。', 'extraversion', true],
  ['即使自己很忙，我也愿意为别人留出时间。', 'agreeableness'],
  ['遇到麻烦的职责时，我有时会逃避。', 'conscientiousness', true],
  ['我的心情经常起伏不定。', 'stability', true],
  ['我能够理解并使用比较复杂的表达。', 'openness'],
  ['成为人群关注的中心不会让我不自在。', 'extraversion'],
  ['我能敏锐察觉别人的情绪。', 'agreeableness'],
  ['我通常能按照计划推进事情。', 'conscientiousness'],
  ['我比较容易变得烦躁。', 'stability', true],
  ['我会花时间深入思考一件事。', 'openness'],
  ['面对陌生人时，我通常比较安静。', 'extraversion', true],
  ['我能让身边的人感到放松。', 'agreeableness'],
  ['我对自己的工作质量要求比较严格。', 'conscientiousness'],
  ['我经常感到低落。', 'stability', true],
  ['我的脑海里常常有新的想法。', 'openness'],
]);

const SKILLS_QUESTIONS = questions('skills-map', [
  ['把复杂内容写成结构清晰、重点明确的文字。', 'communication'],
  ['在课堂汇报、面试或会议中清楚表达观点。', 'communication'],
  ['听懂对方真正的需求，并确认自己的理解。', 'communication'],
  ['根据对象调整表达方式，而不是使用同一套说法。', 'communication'],
  ['用案例、数据或逻辑说服他人。', 'communication'],
  ['快速找到可信的信息，并判断来源质量。', 'thinking'],
  ['把一个模糊问题拆成可以处理的具体问题。', 'thinking'],
  ['比较多个方案的收益、成本和风险。', 'thinking'],
  ['从数据或反馈中发现规律。', 'thinking'],
  ['把新知识迁移到一个没做过的任务里。', 'thinking'],
  ['使用表格软件整理数据、公式和基础图表。', 'digital'],
  ['使用AI工具辅助检索、写作、分析或编程，并核验结果。', 'digital'],
  ['使用在线文档、项目看板等工具协同工作。', 'digital'],
  ['理解常见数据指标，并能说明它们代表什么。', 'digital'],
  ['保护账号、文件和个人信息，识别常见信息风险。', 'digital'],
  ['把目标拆成任务、负责人和截止时间。', 'execution'],
  ['同时处理多项任务时安排优先级。', 'execution'],
  ['持续跟踪进度，并在偏离时及时调整。', 'execution'],
  ['交付前主动检查细节、格式和完整性。', 'execution'],
  ['根据反馈快速迭代，而不是停留在第一版。', 'execution'],
  ['在团队里明确分工并同步关键信息。', 'collaboration'],
  ['出现分歧时讨论问题本身，而不是回避或攻击个人。', 'collaboration'],
  ['理解不同角色的目标，并找到共同推进方式。', 'collaboration'],
  ['主动提供和接收具体、可执行的反馈。', 'collaboration'],
  ['在陌生团队中快速建立可靠的合作关系。', 'collaboration'],
  ['推动一件没有明确负责人但很重要的事情。', 'influence'],
  ['组织一次活动、项目或小组任务并推动落地。', 'influence'],
  ['识别用户、客户或同学尚未说清楚的需求。', 'influence'],
  ['在资源有限时协调他人支持自己的目标。', 'influence'],
  ['把自己的经历转化成让别人容易理解的成果故事。', 'influence'],
], SKILL_SCALE);

const ADAPTABILITY_QUESTIONS = questions('career-adaptability', [
  ['我会认真考虑未来一两年自己希望进入怎样的工作状态。', 'concern'],
  ['我能把较远的职业目标拆成这个学期可以推进的小步骤。', 'concern'],
  ['做学习或实习选择时，我会考虑它对下一阶段发展的影响。', 'concern'],
  ['听取别人建议后，我仍能为自己的职业选择作出决定。', 'control'],
  ['如果选择的结果不理想，我会主动调整，而不是只归因于环境。', 'control'],
  ['即使信息不完整，我也能先确定一个可以验证的下一步。', 'control'],
  ['我愿意主动了解自己原本不熟悉的行业和岗位。', 'curiosity'],
  ['比较职业方向时，我会研究真实任务和工作环境，而不只看名称。', 'curiosity'],
  ['我会通过访谈、项目、比赛或实习验证自己对职业的想象。', 'curiosity'],
  ['遇到没做过的职业任务时，我相信自己能找到学习方法和资源。', 'confidence'],
  ['求职计划受阻后，我通常还能设计出新的路径继续推进。', 'confidence'],
  ['我能向别人说明自己的优势、差距，以及正在采取的改进行动。', 'confidence'],
]);

const DECISION_QUESTIONS = questions('decision-difficulties', [
  ['想到要选择职业方向时，我常常缺少真正开始行动的动力。', 'motivation'],
  ['即使知道选择很重要，我也容易把它一直往后拖。', 'motivation'],
  ['目前我不太愿意投入时间处理职业选择这件事。', 'motivation'],
  ['面对几个都还可以的选项，我往往很难作出取舍。', 'indecisiveness'],
  ['即使是日常选择，我也经常需要别人替我确认。', 'indecisiveness'],
  ['作出决定后，我很容易反复怀疑并重新推翻它。', 'indecisiveness'],
  ['我觉得只有找到唯一正确的职业，未来才不会后悔。', 'beliefs'],
  ['我希望一次选择就能解决未来很多年的职业问题。', 'beliefs'],
  ['如果一个方向不能同时满足所有期待，我就很难接受它。', 'beliefs'],
  ['我担心选错一次就会彻底失去其他可能。', 'beliefs'],
  ['我不清楚应该按什么顺序完成职业决策。', 'process'],
  ['我不知道比较不同职业方向时应该重点看哪些标准。', 'process'],
  ['我拥有不少信息，但不知道怎样把它们转成结论。', 'process'],
  ['我还说不清自己真正看重的工作体验是什么。', 'selfKnowledge'],
  ['我不确定哪些能力是自己的稳定优势。', 'selfKnowledge'],
  ['我难以判断自己的短板会不会影响目标岗位。', 'selfKnowledge'],
  ['不同情境下的我差别很大，因此我很难形成清晰的自我认识。', 'selfKnowledge'],
  ['我对目标岗位每天实际做什么了解得不够。', 'occupationKnowledge'],
  ['我不清楚目标岗位通常需要哪些入门能力和经历。', 'occupationKnowledge'],
  ['我对不同行业的工作节奏、发展路径和风险缺少了解。', 'occupationKnowledge'],
  ['除了少数热门岗位，我不知道还有哪些可探索的选择。', 'occupationKnowledge'],
  ['我不知道去哪里获得可信的一手职业信息。', 'sources'],
  ['我不太会通过校友、从业者或实践机会验证网上的信息。', 'sources'],
  ['面对大量招聘信息，我不知道怎样高效筛选和整理。', 'sources'],
  ['关于同一职业，不同来源给出的说法经常相互矛盾。', 'reliability'],
  ['我难以判断网上的职业经验是否适用于自己的情况。', 'reliability'],
  ['岗位描述与真实从业反馈差距较大，让我更难判断。', 'reliability'],
  ['我想要的工作内容与期待的收入或稳定性之间存在冲突。', 'internalConflict'],
  ['我的兴趣方向与目前最有把握的能力并不一致。', 'internalConflict'],
  ['我在城市、成长、收入和生活等目标之间难以排序。', 'internalConflict'],
  ['理性分析的方向和我内心真正想尝试的方向不一致。', 'internalConflict'],
  ['家人对我职业选择的期待与我的想法差别较大。', 'externalConflict'],
  ['几位对我重要的人给出了彼此冲突的建议。', 'externalConflict'],
  ['我担心坚持自己的选择会影响与家人或重要他人的关系。', 'externalConflict'],
]);

const EMPLOYABILITY_QUESTIONS = questions('employability', [
  ['我能说清楚现阶段想重点探索的职业方向。', 'career'],
  ['我会定期回顾能力差距并调整学习计划。', 'career'],
  ['我能够主动寻找导师、校友或行业人士获取反馈。', 'career'],
  ['我能把长期职业目标拆成下一学期可以完成的行动。', 'career'],
  ['我能根据沟通对象选择合适的表达重点和渠道。', 'communication'],
  ['我能够简洁说明一个问题、结论和下一步。', 'communication'],
  ['我会先确认对方需求，再给出回应。', 'communication'],
  ['重要沟通后，我会确认各方理解一致。', 'communication'],
  ['遇到模糊任务时，我会先定义问题和判断标准。', 'critical'],
  ['我会区分事实、观点和未经验证的假设。', 'critical'],
  ['做决定前，我能够比较不同方案的后果。', 'critical'],
  ['发现原方案不奏效时，我会根据证据调整方向。', 'critical'],
  ['团队开始任务时，我会推动明确目标、分工和节点。', 'teamwork'],
  ['我能可靠完成自己的部分，并及时暴露风险。', 'teamwork'],
  ['与我意见不同的人合作时，我仍能保持有效沟通。', 'teamwork'],
  ['我愿意补位，也会避免长期承担模糊责任。', 'teamwork'],
  ['没有人推动时，我愿意先提出可执行的下一步。', 'leadership'],
  ['我能调动团队成员的优势，而不是包办所有事情。', 'leadership'],
  ['面对压力和不确定性时，我能够稳定团队节奏。', 'leadership'],
  ['做错决定时，我愿意承担责任并推动修正。', 'leadership'],
  ['我会遵守承诺，并提前沟通无法按时完成的风险。', 'professionalism'],
  ['我能区分私人情绪和工作责任。', 'professionalism'],
  ['交付任务时，我会对准确性、格式和细节负责。', 'professionalism'],
  ['面对不熟悉的职场规则，我会主动确认而不是猜测。', 'professionalism'],
  ['我会选择合适的数字工具提升效率。', 'technology'],
  ['我能够判断AI生成内容是否可靠，并进行必要核验。', 'technology'],
  ['我能用数据或可视化帮助别人理解问题。', 'technology'],
  ['接触新工具时，我能通过文档和实践快速上手。', 'technology'],
  ['我会留意不同背景的人是否拥有平等的表达机会。', 'inclusion'],
  ['我能够尊重与自己不同的工作方式和生活经验。', 'inclusion'],
  ['发现刻板印象时，我愿意提出更客观的视角。', 'inclusion'],
  ['我能在跨专业、跨文化或远程团队中调整协作方式。', 'inclusion'],
]);

const JOB_READINESS_QUESTIONS = questions('job-readiness', [
  ['我已经明确1—3个重点投递的岗位方向。', 'target'],
  ['我能解释为什么选择这些方向，而不是只因为热门。', 'target'],
  ['我知道自己暂时不考虑哪些岗位，以及原因。', 'target'],
  ['目标岗位与当前时间、地域和学历条件基本匹配。', 'target'],
  ['我研究过目标岗位每天实际要做的工作。', 'research'],
  ['我整理过目标岗位反复出现的能力和关键词。', 'research'],
  ['我了解目标行业的主要公司、业务模式和近期变化。', 'research'],
  ['我至少和一位真实从业者交流过岗位情况。', 'research'],
  ['我的简历针对目标岗位调整过重点和关键词。', 'resume'],
  ['每段核心经历都写清了行动、难点和结果。', 'resume'],
  ['简历中的重要能力都有项目、作品或数据证据。', 'resume'],
  ['我的简历能在一分钟内让人看懂方向和优势。', 'resume'],
  ['我准备了自我介绍，并针对不同岗位做过调整。', 'interview'],
  ['我准备了至少6个行为面试案例。', 'interview'],
  ['我能解释简历中的关键数据、决策和个人贡献。', 'interview'],
  ['我做过模拟面试，并根据反馈进行过修改。', 'interview'],
  ['我建立了公司、岗位、日期和进展清晰的投递表。', 'application'],
  ['我会根据岗位优先级分配时间，而不是无差别海投。', 'application'],
  ['收到拒绝或长期无反馈后，我会分析原因并调整。', 'application'],
  ['我能保持稳定的投递和复盘节奏。', 'application'],
  ['我知道哪些老师、同学、校友可以提供帮助。', 'support'],
  ['请求帮助时，我会说明具体问题，而不是只问有没有工作。', 'support'],
  ['面对连续受挫时，我有恢复状态的方法。', 'support'],
  ['遇到重要选择时，我能找到可信的人讨论并保留自己的判断。', 'support'],
], READINESS_SCALE);

const D = (key: string, name: string, summary: string, action: string, color: string): CareerDimension => ({ key, name, summary, action, color });

export const CAREER_ASSESSMENTS: CareerAssessmentDefinition[] = [
  {
    id: 'work-style', slug: 'work-style', title: '职业工作风格', shortTitle: '工作风格', question: '我在工作中通常怎么行动？',
    description: '从五个稳定倾向理解你的沟通、协作、执行、压力反应与学习方式。', basis: '50题 IPIP 大五人格公版题项', duration: '约9分钟', stage: '01 认识自己', icon: '◉', gradient: 'linear-gradient(135deg,#2563eb,#7c3aed)', tags: ['工作方式', 'IPIP-50', '完整报告'], questions: WORK_STYLE_QUESTIONS,
    dimensions: [
      D('extraversion','主动表达','你在社交刺激、主动沟通和公开表达中的自然倾向。','为高频沟通场景准备自己的节奏，不必强迫自己成为最外向的人。','#3b82f6'),
      D('agreeableness','协作共情','你理解他人、建立信任和处理关系的自然方式。','练习在保持合作的同时清楚表达边界和不同意见。','#14b8a6'),
      D('conscientiousness','规划执行','你在组织、可靠交付和持续推进方面的倾向。','把责任心转化为可展示的项目证据和稳定工作流程。','#f59e0b'),
      D('stability','压力稳定','你在压力、变化和负面反馈下保持状态的倾向。','提前准备恢复机制，并区分短期紧张与长期消耗。','#8b5cf6'),
      D('openness','学习创新','你对新知识、抽象问题和不同可能性的开放程度。','把好奇心沉淀为作品、实验和可解释的学习成果。','#ec4899'),
    ],
  },
  {
    id: 'skills-map', slug: 'skills-map', title: '通用技能画像', shortTitle: '技能画像', question: '我会什么，哪些能力有真实证据？',
    description: '同时评估能力水平和经历证据，找到最值得写进简历、继续强化的可迁移技能。', basis: '原创30项技能行为量表 · 参考 O*NET 能力框架', duration: '约10分钟', stage: '02 盘点实力', icon: '▦', gradient: 'linear-gradient(135deg,#0284c7,#0f766e)', tags: ['可迁移技能', '经历证据', '岗位能力'], questions: SKILLS_QUESTIONS, collectEvidence: true,
    dimensions: [
      D('communication','沟通表达','把信息理解清楚并让别人准确接收的能力。','选择一段经历，用结论—证据—行动结构重新讲述。','#38bdf8'),
      D('thinking','分析解决','发现问题、判断信息并形成方案的能力。','用一个真实问题练习定义、拆解、验证和复盘。','#6366f1'),
      D('digital','数字与AI','使用数据、协作软件和AI工具完成任务的能力。','建立一个可展示的数字化作品，并记录人工核验过程。','#06b6d4'),
      D('execution','计划交付','把目标转化为进度、质量和结果的能力。','给当前项目设置里程碑、风险点和交付标准。','#f59e0b'),
      D('collaboration','团队协作','在多人环境中分工、反馈和处理分歧的能力。','复盘一次合作，把贡献和改进点写成具体行为。','#22c55e'),
      D('influence','推动影响','主动发起、协调资源并推动事情发生的能力。','选择一件小事，从提出方案到交付结果完整推动。','#f97316'),
    ],
  },
  {
    id: 'career-adaptability', slug: 'career-adaptability', title: '职业适应力', shortTitle: '适应力', question: '面对变化、实习和求职挫折，我能否调整？',
    description: '从未来关注、自主控制、探索好奇与应对信心四类资源，找到面对变化时的支点。', basis: '原创12题发展版 · 参考生涯适应力4C理论框架', duration: '约4分钟', stage: '03 找到卡点', icon: '↻', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', tags: ['变化应对', '职业转型', '12题'], questions: ADAPTABILITY_QUESTIONS,
    dimensions: [
      D('concern','未来关注','你是否会把职业未来放进当前视野，并提前进行准备。','写下未来一年想验证的三个职业假设。','#f59e0b'),
      D('control','自主控制','你为职业选择承担责任，并在不确定中推进下一步的能力。','为一个一直等待确认的问题作出阶段性决定。','#ef4444'),
      D('curiosity','探索好奇','你主动接触不同职业可能，并用真实体验修正想象的程度。','本周完成一次从业者访谈或岗位体验。','#8b5cf6'),
      D('confidence','应对信心','你面对陌生任务、阻碍和反馈时继续解决问题的信心。','选一个能力缺口，设计七天小练习。','#14b8a6'),
    ],
  },
  {
    id: 'decision-difficulties', slug: 'decision-difficulties', title: '职业决策卡点', shortTitle: '决策卡点', question: '我为什么一直选不定方向？',
    description: '区分动力、方法、信息和冲突等十类卡点，先解决真正阻碍决定的环节。', basis: '原创34题发展版 · 参考职业决策困难分类框架', duration: '约7分钟', stage: '03 找到卡点', icon: '⌁', gradient: 'linear-gradient(135deg,#dc2626,#be185d)', tags: ['方向选择', '十类卡点', '风险型计分'], questions: DECISION_QUESTIONS, scoreDirection: 'risk',
    dimensions: [
      D('motivation','启动动力','职业选择的重要性已被看见，但行动仍迟迟没有开始。','把任务缩小为20分钟，只完成一份岗位清单。','#ef4444'),
      D('indecisiveness','反复犹豫','你可能在比较、确认和推翻选择中消耗较多精力。','给决定设置期限和最低信息标准。','#f97316'),
      D('beliefs','完美选择期待','唯一正确、一次定终身的期待提高了决策压力。','把问题改成“哪个最值得先验证三个月”。','#f59e0b'),
      D('process','决策方法','你可能缺少把选项、标准和信息变成结论的方法。','建立必须满足、希望满足、可以妥协三列标准。','#eab308'),
      D('selfKnowledge','自我信息','你对兴趣、能力、限制和偏好的认识还不足以支持选择。','整理三项优势证据和三项不能妥协的条件。','#84cc16'),
      D('occupationKnowledge','职业信息','你对岗位任务、门槛和发展路径的了解仍不具体。','完成10份JD归纳和一次从业者访谈。','#22c55e'),
      D('sources','信息渠道','你可能缺少稳定获取高质量职业信息的方法。','建立招聘JD、官网、访谈、实习四类信息源。','#14b8a6'),
      D('reliability','信息可靠性','相互矛盾或不适配的信息正在干扰判断。','为重要结论寻找两类独立来源。','#06b6d4'),
      D('internalConflict','内部冲突','兴趣、能力、收入、城市或生活方式之间存在拉扯。','给五项标准强制排序，明确真正不能放弃的部分。','#8b5cf6'),
      D('externalConflict','外部期待','家人或重要他人的期待可能与你自己的方向不一致。','区分对方担心的风险和希望你选择的答案。','#ec4899'),
    ],
  },
  {
    id: 'employability', slug: 'employability', title: '大学生就业胜任力', shortTitle: '就业胜任力', question: '我离企业需要的职场新人还有多远？',
    description: '用校园和实习中的可观察行为，评估进入职场的八项关键能力。', basis: '原创32题行为量表 · 参考国际职业准备框架', duration: '约8分钟', stage: '02 盘点实力', icon: '✦', gradient: 'linear-gradient(135deg,#7c3aed,#2563eb)', tags: ['职场新人', '八项能力', '行为证据'], questions: EMPLOYABILITY_QUESTIONS,
    dimensions: [
      D('career','职业发展','主动认识自己、探索方向并持续升级能力的表现。','把未来三个月的职业目标转成三项可验证成果。','#8b5cf6'),
      D('communication','沟通表达','理解信息、组织观点并确认共识的表现。','用结论—证据—行动结构复述一段经历。','#38bdf8'),
      D('critical','批判思考','用证据定义问题、比较方案和调整判断的表现。','下一次决策时写下假设、证据和备选方案。','#6366f1'),
      D('teamwork','团队合作','可靠交付、同步信息并与不同观点合作的表现。','复盘一次真实合作并提炼面试案例。','#22c55e'),
      D('leadership','领导影响','在不确定中提出方向、调动他人并承担结果的表现。','主动负责一个范围清晰的小项目。','#f97316'),
      D('professionalism','职业素养','守信、负责、尊重规则并稳定交付的表现。','建立自己的交付检查表。','#f59e0b'),
      D('technology','技术应用','选择、学习和负责任使用数字技术的表现。','用一个工具重构真实流程并量化提升。','#06b6d4'),
      D('inclusion','多元协作','与不同背景、观点和工作方式合作的表现。','下一次讨论时主动邀请不同意见。','#ec4899'),
    ],
  },
  {
    id: 'job-readiness', slug: 'job-readiness', title: '求职行动准备度', shortTitle: '行动准备度', question: '我现在真正缺的是简历、面试还是投递？',
    description: '从目标、岗位研究、材料、面试、投递和支持系统六个环节定位下一步。', basis: '原创24题行为清单', duration: '约6分钟', stage: '04 开始行动', icon: '✓', gradient: 'linear-gradient(135deg,#059669,#0ea5e9)', tags: ['行动清单', '求职漏斗', '72小时建议'], questions: JOB_READINESS_QUESTIONS,
    dimensions: [
      D('target','目标清晰度','你对目标岗位边界、优先级和现实条件的清晰程度。','把目标收敛到1—3个岗位并写下理由。','#8b5cf6'),
      D('research','岗位研究','你对岗位任务、行业环境和真实从业情况的理解程度。','完成一次JD归纳和从业者访谈。','#06b6d4'),
      D('resume','材料证据','你的简历和作品是否能快速证明岗位所需能力。','优先重写最重要的一段经历。','#3b82f6'),
      D('interview','面试准备','你把经历组织成可信回答并应对追问的准备程度。','录制一次模拟面试并复盘。','#f59e0b'),
      D('application','投递运营','你管理岗位优先级、节奏和反馈迭代的成熟程度。','建立投递看板，每周只调整一个变量。','#22c55e'),
      D('support','支持与恢复','你调用关系资源、处理挫折并维持节奏的能力。','列出三位可求助的人并安排固定恢复时间。','#ec4899'),
    ],
  },
];

export const CAREER_ASSESSMENT_BY_SLUG = new Map(CAREER_ASSESSMENTS.map((item) => [item.slug, item]));

export function answerValue(answer: CareerAssessmentAnswer | undefined) {
  return typeof answer === 'number' ? answer : Number(answer?.value || 0);
}

export function scoreCareerAssessment(definition: CareerAssessmentDefinition, answers: Record<string, CareerAssessmentAnswer>): Record<string, number> {
  const buckets = Object.fromEntries(definition.dimensions.map((dimension) => [dimension.key, [] as number[]]));
  let evidenceCount = 0;
  definition.questions.forEach((question) => {
    const answer = answers[question.id];
    const value = answerValue(answer);
    if (!value) return;
    const max = question.scale?.length || 5;
    const adjusted = question.reverse ? max + 1 - value : value;
    buckets[question.dimension].push(((adjusted - 1) / (max - 1)) * 100);
    if (typeof answer === 'object' && answer.evidence && answer.evidence !== 'none') evidenceCount += 1;
  });
  const dimensions: Record<string, number> = Object.fromEntries(Object.entries(buckets).map(([key, values]) => [key, values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0]));
  const values = Object.values(dimensions);
  return {
    overall: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0,
    ...dimensions,
    ...(definition.collectEvidence ? { evidence: Math.round((evidenceCount / definition.questions.length) * 100) } : {}),
  };
}

export function assessmentBand(score: number, direction: 'positive' | 'risk' = 'positive') {
  if (direction === 'risk') {
    if (score >= 70) return '优先处理';
    if (score >= 50) return '需要关注';
    if (score >= 30) return '轻度卡点';
    return '障碍较少';
  }
  if (score >= 80) return '明显优势';
  if (score >= 65) return '发展良好';
  if (score >= 45) return '正在形成';
  return '优先提升';
}

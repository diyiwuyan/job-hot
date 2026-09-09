/**
 * Public recruitment sources that JOBHOT monitors or links to.
 *
 * These are deliberately kept separate from the feed records: an official
 * recruitment portal is a source directory entry, not a claim that every job
 * on that portal is currently open. The feed cards generated from this list
 * always say “官方入口，以官网实时职位为准”.
 */
export type RecruitmentSourceKind = 'official' | 'aggregator' | 'campus-info';

export interface RecruitmentSource {
  id: string;
  name: string;
  kind: RecruitmentSourceKind;
  url: string;
  focus: string;
  coverage: string;
  category: 'internet' | 'foreign' | 'game' | 'auto_ic' | 'finance' | 'security' | 'other';
  /** Last date we manually verified the public URL and its role. */
  verifiedAt: string;
}

export const RECRUITMENT_SOURCES: RecruitmentSource[] = [
  { id: 'bytedance', name: '字节跳动校园招聘', kind: 'official', url: 'https://jobs.bytedance.com/campus', focus: '研发、算法、产品、运营、设计与前沿技术校招', coverage: '官方岗位与招聘 FAQ', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'tencent', name: '腾讯校招', kind: 'official', url: 'https://join.qq.com/', focus: '技术、产品、市场、设计、职能与 AI 岗位', coverage: '应届生、实习生、青云计划', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'alibaba', name: '阿里巴巴校园招聘', kind: 'official', url: 'https://campus-talent.alibaba.com/', focus: '阿里集团及业务线校招、实习', coverage: '岗位列表与招聘项目', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'baidu', name: '百度校园招聘', kind: 'official', url: 'https://talent.baidu.com/jobs/list', focus: '技术、算法、产品与 AI 相关岗位', coverage: '校招与实习职位列表', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'meituan', name: '美团招聘', kind: 'official', url: 'https://zhaopin.meituan.com/web/campus', focus: '技术、产品、运营、设计、金融与职能', coverage: '应届生、转正实习、日常实习', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'xiaohongshu', name: '小红书校园招聘', kind: 'official', url: 'https://job.xiaohongshu.com/campus', focus: '社区、电商、推荐、算法与 AI 应用', coverage: '校招岗位与 REDstar 专项', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'jd', name: '京东招聘', kind: 'official', url: 'https://zhaopin.jd.com/', focus: '采销、物流、技术、产品、运营与管理培训生', coverage: '校园招聘与实习入口', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'kuaishou', name: '快手招聘', kind: 'official', url: 'https://zhaopin.kuaishou.cn/', focus: '研发、算法、产品、运营与内容岗位', coverage: '校园招聘与实习入口', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'bilibili', name: '哔哩哔哩招聘', kind: 'official', url: 'https://jobs.bilibili.com/campus', focus: '技术、内容、产品、运营与设计', coverage: '校园招聘入口', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'netease', name: '网易校园招聘', kind: 'official', url: 'https://campus.163.com/', focus: '技术、AI、产品、运营与职能', coverage: '网易与游戏业务校招', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'xiaomi', name: '小米招聘', kind: 'official', url: 'https://hr.xiaomi.com/website/campus.html', focus: 'AI 大模型、软硬件、汽车、产品与设计', coverage: '全球校园招聘项目', category: 'auto_ic', verifiedAt: '2026-09-09' },
  { id: 'huawei', name: '华为招聘', kind: 'official', url: 'https://career.huawei.com/cn/campus-recruitment', focus: '研发、技术、产品与综合岗位', coverage: '应届生、实习生与专项招聘', category: 'auto_ic', verifiedAt: '2026-09-09' },
  { id: 'oppo', name: 'OPPO 校园招聘', kind: 'official', url: 'https://careers.oppo.com/campus', focus: '研发、产品、设计与供应链', coverage: '校园招聘入口', category: 'auto_ic', verifiedAt: '2026-09-09' },
  { id: 'vivo', name: 'vivo 校园招聘', kind: 'official', url: 'https://hr.vivo.com/campus', focus: '研发、产品、设计与营销', coverage: '校园招聘入口', category: 'auto_ic', verifiedAt: '2026-09-09' },
  { id: 'netease-games', name: '网易游戏雷火校招', kind: 'official', url: 'https://leihuo.163.com/campus/', focus: '游戏研发、策划、美术与运营', coverage: '游戏专项校招', category: 'game', verifiedAt: '2026-09-09' },
  { id: 'yingjiesheng', name: '应届生求职网', kind: 'aggregator', url: 'https://www.yingjiesheng.com/', focus: '宣讲会、校招公告与实习信息', coverage: '高校宣讲会与公开招聘信息', category: 'other', verifiedAt: '2026-09-09' },
  { id: 'nowcoder', name: '牛客网', kind: 'aggregator', url: 'https://www.nowcoder.com/jobs/school/schedule', focus: '校招进度、岗位与求职经验', coverage: '企业校招日程与公开岗位', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'deepoffer', name: 'DeepOffer', kind: 'aggregator', url: 'https://deepoffer.cn/', focus: '应届生、实习与 AI 岗位', coverage: '结构化职位 API', category: 'internet', verifiedAt: '2026-09-09' },
  { id: 'guopin', name: '国聘', kind: 'aggregator', url: 'https://www.iguopin.com/', focus: '央国企、事业单位与大型企业', coverage: '公开职位与招聘公告', category: 'finance', verifiedAt: '2026-09-09' },
];

export const OFFICIAL_RECRUITMENT_SOURCES = RECRUITMENT_SOURCES.filter(source => source.kind === 'official');


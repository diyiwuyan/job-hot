export type Channel = 'all' | 'campus' | 'intern' | 'talk';

export type Category =
  | 'all'
  | 'internet'    // 互联网/AI
  | 'foreign'     // 外企
  | 'game'        // 游戏
  | 'auto_ic'     // 车企/IC
  | 'finance'     // 金融/国企
  | 'security'    // 安全/云服务
  | 'other';      // 其他

export type CompanyType = 'all' | 'foreign' | 'state' | 'private' | 'bank' | 'institution';

// 专业大类（按学科门类口径，靠岗位名/行业关键词推断）
export type Major =
  | 'all'         // 全部专业（不筛选）
  | 'unlimited'   // 不限专业（独立分类：明确专业不限或通用岗）
  | 'cs'          // 计算机/软件
  | 'ee'          // 电子/通信/集成电路
  | 'auto'        // 自动化/控制
  | 'mech'        // 机械/制造
  | 'civil'       // 土木/建筑/交通
  | 'material'    // 材料/化工/能源
  | 'math'        // 数学/统计
  | 'physics'     // 物理/光学
  | 'bio'         // 生物/医药/化学
  | 'medical'     // 临床/医学/护理
  | 'finance'     // 财经/会计/金融
  | 'management'  // 经管/工商/人力
  | 'law'         // 法学/法律
  | 'literature'  // 语言/文学/新闻传播
  | 'art'         // 艺术/设计/传媒
  | 'agri'        // 农林/食品/环境
  | 'education';  // 师范/教育/心理

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceAvatar?: string;
  sourceHandle?: string;
  channel: Channel;
  category: Category;
  companyType?: CompanyType; // 外企/央国企/民企/银行/事业单位
  location?: string;          // 工作城市
  deadline?: string;          // 截止日期 (e.g. "2026/05/24" or "尽快投递")
  tags: string[];
  score: number;
  featured?: boolean;
  images?: string[];
  createdAt: string; // ISO date string
}

export interface FeedDay {
  date: string; // e.g. "5月9日"
  items: FeedItem[];
}

export interface PaginatedFeed {
  days: FeedDay[];
  currentPage: number;
  totalPages: number;
}

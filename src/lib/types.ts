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

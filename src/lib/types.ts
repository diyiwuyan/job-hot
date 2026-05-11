export type Channel = 'all' | 'campus' | 'intern';

export type Category =
  | 'all'
  | 'internet'    // 互联网/AI
  | 'foreign'     // 外企
  | 'game'        // 游戏
  | 'auto_ic'     // 车企/IC
  | 'finance'     // 金融/国企
  | 'security'    // 安全/云服务
  | 'other';      // 其他

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

export type Channel = 'all' | 'official' | 'news' | 'social';

export type Category = 'all' | 'interview' | 'resume' | 'industry' | 'salary' | 'internship' | 'tips';

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

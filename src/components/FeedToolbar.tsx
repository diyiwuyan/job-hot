import Link from 'next/link';
import { Channel, Category } from '@/lib/types';

interface FeedToolbarProps {
  currentChannel: Channel;
  currentCategory: Category;
  currentQuery: string;
  basePath: string;
}

const channels: { value: Channel; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'campus', label: '校招' },
  { value: 'intern', label: '实习' },
];

const categories: { value: Category; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'internet', label: '互联网/AI' },
  { value: 'foreign', label: '外企' },
  { value: 'game', label: '游戏' },
  { value: 'auto_ic', label: '车企/IC' },
  { value: 'finance', label: '金融/国企' },
  { value: 'security', label: '安全/云服务' },
  { value: 'other', label: '其他' },
];

function buildFilterUrl(basePath: string, channel: Channel, category: Category): string {
  const params = new URLSearchParams();
  params.set('page', '1');
  if (channel !== 'all') params.set('channel', channel);
  if (category !== 'all') params.set('category', category);
  return `${basePath}?${params.toString()}`;
}

export function FeedToolbar({ currentChannel, currentCategory, currentQuery, basePath }: FeedToolbarProps) {
  return (
    <div className="page-header">
      <div style={{ marginBottom: '1rem' }}>
        <h1>全部求职动态</h1>
        <p>大学生求职相关资讯全量信息流</p>
      </div>

      <div className="divider" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Channel Filter */}
        <div className="segmented" aria-label="频道筛选">
          {channels.map((ch) => (
            <Link
              key={ch.value}
              href={buildFilterUrl(basePath, ch.value, currentCategory)}
              className={`seg-item${currentChannel === ch.value ? ' seg-item-active' : ''}`}
              aria-current={currentChannel === ch.value ? 'page' : undefined}
            >
              {ch.label}
            </Link>
          ))}
        </div>

        {/* Category Filter */}
        <div className="segmented" aria-label="分类筛选">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              href={buildFilterUrl(basePath, currentChannel, cat.value)}
              className={`seg-item${currentCategory === cat.value ? ' seg-item-active' : ''}`}
              aria-current={currentCategory === cat.value ? 'page' : undefined}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Search Form */}
        <form className="filter-form" action={basePath} method="get">
          <input
            type="text"
            name="q"
            placeholder="搜索标题/摘要…"
            className="field"
            defaultValue={currentQuery}
          />
          <input type="hidden" name="page" value="1" />
          {currentChannel !== 'all' && (
            <input type="hidden" name="channel" value={currentChannel} />
          )}
          {currentCategory !== 'all' && (
            <input type="hidden" name="category" value={currentCategory} />
          )}
          <button type="submit" className="btn">搜索</button>
        </form>
      </div>
    </div>
  );
}

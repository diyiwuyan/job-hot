import { FeedItem, FeedDay, PaginatedFeed, Channel, Category } from './types';
import { feedItems } from './data';

const ITEMS_PER_PAGE = 10;

/**
* Format a date string to Chinese format like "5月9日" or "2025年7月20日" (if not current year)
*/
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (date.getFullYear() !== now.getFullYear()) {
    return `${date.getFullYear()}年${month}月${day}日`;
  }
  return `${month}月${day}日`;
}

/**
 * Check if a date is today
 */
function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Check if a date is yesterday
 */
function isYesterday(dateString: string): boolean {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
}

/**
 * Get display label for a date
 */
function getDateLabel(dateString: string): string {
  if (isToday(dateString)) {
    return '今天';
  }
  if (isYesterday(dateString)) {
    return '昨天';
  }
  return formatDate(dateString);
}

/**
 * Filter items by channel
 */
function filterByChannel(items: FeedItem[], channel: Channel): FeedItem[] {
  if (channel === 'all') {
    return items;
  }
  return items.filter((item) => item.channel === channel);
}

/**
 * Filter items by category
 */
function filterByCategory(items: FeedItem[], category: Category): FeedItem[] {
  if (category === 'all') {
    return items;
  }
  return items.filter((item) => item.category === category);
}

/**
 * Filter items by search query
 */
function filterByQuery(items: FeedItem[], query: string): FeedItem[] {
  if (!query || query.trim() === '') {
    return items;
  }
  const lowerQuery = query.toLowerCase().trim();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.summary.toLowerCase().includes(lowerQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      item.source.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Sort items by score (descending) and then by createdAt (descending)
 */
function sortItems(items: FeedItem[]): FeedItem[] {
  return [...items].sort((a, b) => {
    // Featured items first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // Then by score
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    
    // Then by date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Group items by date
 */
function groupByDate(items: FeedItem[]): FeedDay[] {
  const groups = new Map<string, FeedItem[]>();
  
  // Sort items by date (newest first) within each group
  const sortedByDate = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  for (const item of sortedByDate) {
    const dateKey = formatDate(item.createdAt);
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(item);
  }
  
  // Convert to array and sort by date
  const days: FeedDay[] = [];
  groups.forEach((items, date) => {
    days.push({ date, items });
  });
  
  // Sort days by date (newest first)
  days.sort((a, b) => {
    const dateA = new Date(a.items[0].createdAt);
    const dateB = new Date(b.items[0].createdAt);
    return dateB.getTime() - dateA.getTime();
  });
  
  return days;
}

/**
 * Get paginated feed with filtering
 */
export function getFeed(params: {
  page?: number;
  channel?: Channel;
  category?: Category;
  query?: string;
}): PaginatedFeed {
  const { page = 1, channel = 'all', category = 'all', query = '' } = params;
  
  // Apply filters
  let filteredItems = feedItems;
  filteredItems = filterByChannel(filteredItems, channel);
  filteredItems = filterByCategory(filteredItems, category);
  filteredItems = filterByQuery(filteredItems, query);
  
  // Sort items
  filteredItems = sortItems(filteredItems);
  
  // Calculate pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  // Get paginated items
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  
  // Group by date
  const days = groupByDate(paginatedItems);
  
  return {
    days,
    currentPage: validPage,
    totalPages,
  };
}

/**
 * Get a single feed item by ID
 */
export function getFeedItemById(id: string): FeedItem | undefined {
  return feedItems.find((item) => item.id === id);
}

/**
 * Get featured items
 */
export function getFeaturedItems(limit: number = 5): FeedItem[] {
  return feedItems
    .filter((item) => item.featured)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get items by tag
 */
export function getItemsByTag(tag: string, limit?: number): FeedItem[] {
  const items = feedItems
    .filter((item) => item.tags.includes(tag))
    .sort((a, b) => b.score - a.score);
  
  return limit ? items.slice(0, limit) : items;
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  feedItems.forEach((item) => {
    item.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Get all unique sources
 */
export function getAllSources(): string[] {
  const sources = new Set<string>();
  feedItems.forEach((item) => sources.add(item.source));
  return Array.from(sources).sort();
}

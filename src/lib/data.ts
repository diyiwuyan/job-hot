import { FeedItem } from './types';
import campusData from './campus-data.json';
import nowcoderData from './nowcoder-data.json';

// Merge all data sources and deduplicate by id
const allItems: FeedItem[] = [
  ...(campusData as FeedItem[]),
  ...(nowcoderData as FeedItem[]),
];

// Deduplicate: if same company appears in multiple sources, keep the higher-scored one
const seen = new Map<string, FeedItem>();
for (const item of allItems) {
  const existing = seen.get(item.id);
  if (!existing || item.score > existing.score) {
    seen.set(item.id, item);
  }
}

export const feedItems: FeedItem[] = [...seen.values()].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

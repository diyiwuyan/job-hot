import { FeedItem } from './types';
import campusData from './campus-data.json';
import nowcoderData from './nowcoder-data.json';
import deepofferData from './deepoffer-data.json';
import guopinData from './guopin-data.json';
import yingjieshengData from './yingjiesheng-data.json';

// Only keep items from 2026-01-01 onwards
const cutoffDate = new Date('2026-01-01T00:00:00Z');

function isRecent(item: FeedItem): boolean {
  return new Date(item.createdAt) >= cutoffDate;
}

// Merge all data sources, filter expired, and deduplicate by id
const allItems: FeedItem[] = [
  ...(campusData as FeedItem[]),
  ...(nowcoderData as FeedItem[]),
  ...(deepofferData as FeedItem[]),
  ...(guopinData as FeedItem[]),
  ...(yingjieshengData as FeedItem[]),
].filter(isRecent);

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

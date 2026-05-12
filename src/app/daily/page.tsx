'use client';

import { useEffect, useState } from 'react';
import { FeedItem } from '@/lib/types';
import { DailyAccordion } from '@/components/DailyAccordion';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/job-hot';

interface DailyDay {
  date: string;
  label: string;
  items: FeedItem[];
}

export default function DailyPage() {
  const [days, setDays] = useState<DailyDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${basePath}/api/feed/daily-digest.json`)
      .then(res => res.json())
      .then((data: DailyDay[]) => {
        // Runtime guard: filter out future-dated items
        const nowStr = new Date().toISOString();
        const filtered = data.map(day => ({
          ...day,
          items: day.items.filter((item: FeedItem) => item.createdAt <= nowStr),
        })).filter(day => day.items.length > 0);
        setDays(filtered);
        setLoading(false);
      })
      .catch(() => {
        setDays([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>求职日报</h1>
        <p>每日精选校招/实习动态，快速掌握最新招聘信息</p>
      </div>

      {loading ? (
        <div className="empty-state" style={{ marginTop: '1.5rem' }}>
          <div className="empty-state-title">加载中...</div>
        </div>
      ) : (
        <DailyAccordion days={days} />
      )}
    </div>
  );
}

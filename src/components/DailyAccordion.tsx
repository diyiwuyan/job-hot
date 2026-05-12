'use client';

import { useState } from 'react';
import { FeedItem } from '@/lib/types';

function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 50) return 'score-mid';
  return 'score-muted';
}

interface DailyDay {
  date: string;
  label: string;
  items: FeedItem[];
}

export function DailyAccordion({ days }: { days: DailyDay[] }) {
  const [expandedDay, setExpandedDay] = useState<string>(days[0]?.date || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
      {days.map((day) => (
        <div key={day.date} className="timeline-card" style={{ cursor: 'pointer' }}>
          <div
            className="timeline-card-head"
            onClick={() => setExpandedDay(expandedDay === day.date ? '' : day.date)}
            style={{ marginBottom: expandedDay === day.date ? '0.75rem' : 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>{day.label}</span>
              <span className="tag">{day.items.length} 条动态</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {expandedDay === day.date ? '收起 ▲' : '展开 ▼'}
            </span>
          </div>

          {expandedDay === day.date && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {day.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-elevated)',
                    borderRadius: '0.5rem',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--text)',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
                    </a>
                    <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag" style={{ fontSize: '0.625rem' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={`timeline-score ${getScoreClass(item.score)}`}>
                    {item.score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {days.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>暂无日报数据</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>数据源更新后将自动生成日报</p>
        </div>
      )}
    </div>
  );
}

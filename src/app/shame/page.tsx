'use client';

import { useState, useMemo } from 'react';
import shameData from '@/lib/shame-data.json';

interface ShameEntry {
  id: string;
  company: string;
  event: string;
  year: string;
  date?: string;
  link?: string;
  type: 'shame' | 'safe';
}

const entries = shameData as ShameEntry[];

/** Render event text, converting markdown links [text](url) to real <a> tags */
function EventText({ text }: { text: string }) {
  // Split on markdown link pattern, keeping captures
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/);
  return (
    <>
      {parts.map((part, i) => {
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          return (
            <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer">
              {linkMatch[1]}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function ShamePage() {
  const [tab, setTab] = useState<'shame' | 'safe'>('shame');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const shameEntries = useMemo(() => entries.filter((e) => e.type === 'shame'), []);
  const safeEntries = useMemo(() => entries.filter((e) => e.type === 'safe'), []);
  const years = useMemo(() => ['all', ...new Set(shameEntries.map((e) => e.year))], [shameEntries]);

  const currentEntries = tab === 'shame' ? shameEntries : safeEntries;

  const filtered = useMemo(() => {
    let result = currentEntries;
    if (tab === 'shame' && selectedYear !== 'all') {
      result = result.filter((e) => e.year === selectedYear);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) => e.company.toLowerCase().includes(q) || e.event.toLowerCase().includes(q)
      );
    }
    return result;
  }, [currentEntries, tab, selectedYear, search]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>校招避雷</h1>
        <p>
          数据来源：
          <a href="https://github.com/forthespada/CampusShame" target="_blank" rel="noopener noreferrer">
            CampusShame
          </a>
          {' '}— 记录校招中毁约、违规等污点行为的公司名单
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
        <button
          className={`seg-item ${tab === 'shame' ? 'seg-item-active' : ''}`}
          onClick={() => { setTab('shame'); setSelectedYear('all'); }}
        >
          污点公司 ({shameEntries.length})
        </button>
        <button
          className={`seg-item ${tab === 'safe' ? 'seg-item-active' : ''}`}
          onClick={() => setTab('safe')}
        >
          无污点公司 ({safeEntries.length})
        </button>
      </div>

      {/* Year filter (shame tab only) */}
      {tab === 'shame' && (
        <div className="segmented" style={{ marginBottom: '0.75rem' }}>
          {years.map((y) => (
            <button
              key={y}
              className={`seg-item${selectedYear === y ? ' seg-item-active' : ''}`}
              onClick={() => setSelectedYear(y)}
            >
              {y === 'all' ? '全部届' : y}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        className="field"
        placeholder="搜索公司名称或事件..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: '400px', marginBottom: '1rem' }}
      />

      {/* Result count */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        共 {filtered.length} 条记录
      </p>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map((entry) => (
          <div key={entry.id} className="timeline-card" style={{ padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>
                  {entry.company}
                </span>
                <span
                  className="tag"
                  style={{
                    background: entry.type === 'shame' ? 'rgba(248, 81, 73, 0.15)' : 'rgba(63, 185, 80, 0.15)',
                    color: entry.type === 'shame' ? 'var(--danger)' : 'var(--success)',
                    borderColor: entry.type === 'shame' ? 'var(--danger)' : 'var(--success)',
                  }}
                >
                  {entry.type === 'shame' ? '污点' : '无污点'}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {entry.year}
                {entry.date ? ` · ${entry.date}` : ''}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              <EventText text={entry.event} />
            </p>
            {entry.link && (
              <a
                href={entry.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.75rem', marginTop: '0.375rem', display: 'inline-block' }}
              >
                查看详情 →
              </a>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <p>未找到匹配的公司</p>
          </div>
        )}
      </div>
    </div>
  );
}

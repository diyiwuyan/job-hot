'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Bookmark {
  id: string;
  feed_item_id: string;
  title: string | null;
  url: string | null;
  source: string | null;
  created_at: string;
}

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!user || !supabase) {
      setLoading(false);
      return;
    }

    async function fetchBookmarks() {
      const { data, error } = await supabase!
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBookmarks(data);
      }
      setLoading(false);
    }

    fetchBookmarks();
  }, [user, authLoading]);

  async function removeBookmark(id: string) {
    if (!supabase) return;
    setRemoving((prev) => new Set(prev).add(id));
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);
    if (!error) {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    }
    setRemoving((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="timeline-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem' }}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>我的收藏</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            登录后即可使用收藏功能，跨设备云端同步。
          </p>
          <Link href="/login" className="btn" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            去登录
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading || authLoading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>加载中...</p>
      </div>
    );
  }

  // No bookmarks
  if (bookmarks.length === 0) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="timeline-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem' }}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>还没有收藏</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            浏览求职信息时点击收藏按钮，感兴趣的职位会出现在这里。
          </p>
        </div>
      </div>
    );
  }

  // With bookmarks
  return (
    <div className="page">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>我的收藏</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          共 {bookmarks.length} 条收藏
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {bookmarks.map((bm) => (
          <div key={bm.id} className="timeline-card bookmark-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {bm.url ? (
                <a href={bm.url} target="_blank" rel="noopener noreferrer" className="item-title" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                  {bm.title || '未命名'}
                </a>
              ) : (
                <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{bm.title || '未命名'}</span>
              )}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '0.75rem' }}>
                {bm.source && <span>{bm.source}</span>}
                <span>{new Date(bm.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
            <button
              type="button"
              className="sidebar-logout"
              title="取消收藏"
              disabled={removing.has(bm.id)}
              onClick={() => removeBookmark(bm.id)}
              style={{ opacity: removing.has(bm.id) ? 0.4 : 1 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

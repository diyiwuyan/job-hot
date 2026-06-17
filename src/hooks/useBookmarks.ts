'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';
import { FeedItem } from '@/lib/types';

/**
 * Bookmark hook:
 * - If user is logged in: reads/writes from Supabase cloud
 * - If user is not logged in: returns 'login' prompt
 */
export function useBookmarks() {
  const { user, loading: authLoading } = useAuth();
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);

  // Fetch bookmarks when user is available
  useEffect(() => {
    if (authLoading) return;

    if (!user || !supabase) {
      setBookmarkIds(new Set());
      setLoadingBookmarks(false);
      return;
    }

    async function fetchIds() {
      const { data } = await supabase!
        .from('bookmarks')
        .select('feed_item_id');

      if (data) {
        setBookmarkIds(new Set(data.map((r) => r.feed_item_id)));
      }
      setLoadingBookmarks(false);
    }

    fetchIds();
  }, [user, authLoading]);

  /**
   * Toggle bookmark. Returns true if action succeeded, 'login' if user needs to login.
   */
  const toggle = useCallback(
    async (item: FeedItem): Promise<boolean | 'login'> => {
      if (!user || !supabase) return 'login';

      const isCurrentlyBookmarked = bookmarkIds.has(item.id);

      if (isCurrentlyBookmarked) {
        // Remove - optimistic update
        setBookmarkIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });

        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('feed_item_id', item.id);

        if (error) {
          // Revert on error
          setBookmarkIds((prev) => new Set(prev).add(item.id));
          return false;
        }
      } else {
        // Add - optimistic update
        setBookmarkIds((prev) => new Set(prev).add(item.id));

        const { error } = await supabase.from('bookmarks').insert({
          user_id: user.id,
          feed_item_id: item.id,
          title: item.title,
          url: item.url,
          source: item.source,
        });

        if (error) {
          // Revert on error
          setBookmarkIds((prev) => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
          });
          return false;
        }
      }

      return true;
    },
    [user, bookmarkIds]
  );

  const isBookmarked = useCallback(
    (id: string) => bookmarkIds.has(id),
    [bookmarkIds]
  );

  return {
    bookmarkIds,
    isBookmarked,
    toggle,
    loading: loadingBookmarks,
    isLoggedIn: !!user,
  };
}

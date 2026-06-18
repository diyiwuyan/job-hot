'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';

export interface SubscriptionConfig {
  id?: string;
  keywords: string[];
  categories: string[];
  companyTypes: string[];
  cities: string[];
  channels: string[];
  pushFrequency: 'daily' | 'weekly';
  isActive: boolean;
}

export interface SubscriptionMatch {
  id: string;
  feedItemId: string;
  title: string;
  url: string;
  source: string;
  companyName: string;
  location: string;
  deadline: string;
  channel: string;
  category: string;
  score: number;
  matchedKeywords: string[];
  isRead: boolean;
  matchedAt: string;
}

const DEFAULT_CONFIG: SubscriptionConfig = {
  keywords: [],
  categories: [],
  companyTypes: [],
  cities: [],
  channels: [],
  pushFrequency: 'daily',
  isActive: true,
};

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [config, setConfig] = useState<SubscriptionConfig>(DEFAULT_CONFIG);
  const [matches, setMatches] = useState<SubscriptionMatch[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch subscription config
  useEffect(() => {
    if (authLoading) return;
    if (!user || !supabase) {
      setConfig(DEFAULT_CONFIG);
      setMatches([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    async function fetchData() {
      // Fetch config
      const { data: subData } = await supabase!
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (subData) {
        setConfig({
          id: subData.id,
          keywords: subData.keywords || [],
          categories: subData.categories || [],
          companyTypes: subData.company_types || [],
          cities: subData.cities || [],
          channels: subData.channels || [],
          pushFrequency: subData.push_frequency || 'daily',
          isActive: subData.is_active ?? true,
        });
      }

      // Fetch recent matches (latest 50)
      const { data: matchData } = await supabase!
        .from('subscription_matches')
        .select('*')
        .eq('user_id', user!.id)
        .order('matched_at', { ascending: false })
        .limit(50);

      if (matchData) {
        const mapped = matchData.map((m: any) => ({
          id: m.id,
          feedItemId: m.feed_item_id,
          title: m.title,
          url: m.url,
          source: m.source || '',
          companyName: m.company_name || '',
          location: m.location || '',
          deadline: m.deadline || '',
          channel: m.channel || '',
          category: m.category || '',
          score: m.score || 0,
          matchedKeywords: m.matched_keywords || [],
          isRead: m.is_read,
          matchedAt: m.matched_at,
        }));
        setMatches(mapped);
        setUnreadCount(mapped.filter((m: SubscriptionMatch) => !m.isRead).length);
      }

      setLoading(false);
    }

    fetchData();
  }, [user, authLoading]);

  // Save subscription config
  const saveConfig = useCallback(
    async (newConfig: Partial<SubscriptionConfig>): Promise<boolean> => {
      if (!user || !supabase) return false;
      setSaving(true);

      const merged = { ...config, ...newConfig };

      const payload = {
        user_id: user.id,
        keywords: merged.keywords,
        categories: merged.categories,
        company_types: merged.companyTypes,
        cities: merged.cities,
        channels: merged.channels,
        push_frequency: merged.pushFrequency,
        is_active: merged.isActive,
      };

      const { error } = await supabase.from('subscriptions').upsert(
        { ...payload, id: config.id || undefined },
        { onConflict: 'user_id' }
      );

      if (!error) {
        setConfig(merged);
      }

      setSaving(false);
      return !error;
    },
    [user, config]
  );

  // Mark match as read
  const markRead = useCallback(
    async (matchId: string) => {
      if (!supabase) return;
      await supabase
        .from('subscription_matches')
        .update({ is_read: true })
        .eq('id', matchId);

      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, isRead: true } : m))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    []
  );

  // Mark all as read
  const markAllRead = useCallback(async () => {
    if (!user || !supabase) return;
    await supabase
      .from('subscription_matches')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setMatches((prev) => prev.map((m) => ({ ...m, isRead: true })));
    setUnreadCount(0);
  }, [user]);

  return {
    config,
    matches,
    unreadCount,
    loading,
    saving,
    saveConfig,
    markRead,
    markAllRead,
    isLoggedIn: !!user,
  };
}

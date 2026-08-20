'use client';

import { supabase } from './supabase';

// ── Session ID (persisted per browser tab lifecycle) ────────
let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;

  // Try to reuse from sessionStorage (same tab)
  try {
    const stored = sessionStorage.getItem('jh_sid');
    if (stored) {
      sessionId = stored;
      return stored;
    }
  } catch {}

  // Generate new session ID
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  sessionId = id;
  try {
    sessionStorage.setItem('jh_sid', id);
  } catch {}
  return id;
}

// ── Page View Tracking ─────────────────────────────────────
let currentPageViewId: number | null = null;
let pageEnterTime: number = 0;

export async function trackPageView(path: string): Promise<void> {
  if (!supabase) return;

  // Update duration for previous page view
  await updateDuration();

  pageEnterTime = Date.now();

  const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

  try {
    const { data } = await supabase
      .from('page_views')
      .insert({
        session_id: getSessionId(),
        user_id: userId,
        path,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 256) : null,
        screen_width: typeof window !== 'undefined' ? window.innerWidth : null,
        duration_seconds: 0,
      })
      .select('id')
      .single();

    currentPageViewId = data?.id ?? null;
  } catch {
    // Silently fail — analytics should never break the app
  }
}

export async function updateDuration(): Promise<void> {
  if (!supabase || !currentPageViewId || !pageEnterTime) return;

  const duration = Math.round((Date.now() - pageEnterTime) / 1000);
  if (duration < 1) return;

  try {
    await supabase
      .from('page_views')
      .update({ duration_seconds: Math.min(duration, 7200) }) // Cap at 2h
      .eq('id', currentPageViewId);
  } catch {}

  currentPageViewId = null;
  pageEnterTime = 0;
}

// ── Event Tracking ─────────────────────────────────────────
export async function trackEvent(
  eventType: string,
  eventTarget: string,
  eventData: Record<string, unknown> = {},
): Promise<void> {
  if (!supabase) return;

  const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

  try {
    await supabase.from('analytics_events').insert({
      session_id: getSessionId(),
      user_id: userId,
      event_type: eventType,
      event_target: eventTarget,
      event_data: eventData,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
    });
  } catch {}
}

// ── Module Click Helper ────────────────────────────────────
// Maps pathname prefix → module name for sidebar clicks
const MODULE_MAP: Record<string, string> = {
  '/': '首页',
  '/all': '求职信息',
  '/tools/assessment': '职业测评',
  '/tools/mbti': 'MBTI 测试',
  '/tools/values': '职业价值观测评',
  '/tools/coaching': '求职辅导',
  '/tools/prep': '求职准备中心',
  '/tools/exam': '笔试题库',
  '/tools/interview': '面试与群面题库',
  '/tools': '职业服务',
  '/tools/career-camp': '求职训练营',
  '/services/soe-delivery': '投递导航',
  '/services/soe-job-nav': '求职导航',
  '/nav': '常用网址',
  '/shame': '校招避雷',
  '/bookmarks': '我的收藏',
  '/workspace': '我的求职工作台',
  '/subscription': '订阅推送',
  '/about': '关于',
  '/login': '登录',
  '/donate': '捐赠',
  '/feedback': '反馈',
};

export function getModuleName(path: string): string {
  // Try exact match first, then prefix
  if (MODULE_MAP[path]) return MODULE_MAP[path];
  const match = Object.entries(MODULE_MAP)
    .filter(([prefix]) => prefix !== '/' && path.startsWith(prefix))
    .sort((a, b) => b[0].length - a[0].length)[0];
  return match ? match[1] : path;
}

export async function trackModuleClick(path: string): Promise<void> {
  await trackEvent('module_click', getModuleName(path));
}

// ── Lifecycle: flush duration on unload ────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (!supabase || !currentPageViewId || !pageEnterTime) return;
    const duration = Math.round((Date.now() - pageEnterTime) / 1000);
    if (duration < 1) return;
    // Use sendBeacon for reliability on unload
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/page_views?id=eq.${currentPageViewId}`;
    const body = JSON.stringify({ duration_seconds: Math.min(duration, 7200) });
    try {
      navigator.sendBeacon(
        url,
        new Blob([body], { type: 'application/json' })
      );
    } catch {}
  });
}

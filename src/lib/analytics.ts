"use client";

import { supabase } from "./supabase";

// ── Session ID (persisted per browser tab lifecycle) ────────
let sessionId: string | null = null;
type ApproximateLocation = {
  city: string | null;
  region: string | null;
  countryCode: string | null;
};
let locationPromise: Promise<ApproximateLocation> | null = null;

function cleanLocation(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized ? normalized.slice(0, maxLength) : null;
}

/**
 * Returns only coarse city-level location. The raw IP is never read or stored
 * by JOBHOT; the lookup is best-effort and analytics still work when it fails.
 */
async function getApproximateLocation(): Promise<ApproximateLocation> {
  if (locationPromise) return locationPromise;

  locationPromise = (async () => {
    if (typeof window === "undefined")
      return { city: null, region: null, countryCode: null };
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 1800);
    try {
      const response = await fetch("https://ipwho.is/", {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) return { city: null, region: null, countryCode: null };
      const data = (await response.json()) as {
        success?: boolean;
        city?: unknown;
        region?: unknown;
        country_code?: unknown;
      };
      if (data.success === false)
        return { city: null, region: null, countryCode: null };
      return {
        city: cleanLocation(data.city, 80),
        region: cleanLocation(data.region, 80),
        countryCode: cleanLocation(data.country_code, 8)?.toUpperCase() ?? null,
      };
    } catch {
      return { city: null, region: null, countryCode: null };
    } finally {
      window.clearTimeout(timer);
    }
  })();

  return locationPromise;
}

function getSessionId(): string {
  if (sessionId) return sessionId;

  // Try to reuse from sessionStorage (same tab)
  try {
    const stored = sessionStorage.getItem("jh_sid");
    if (stored) {
      sessionId = stored;
      return stored;
    }
  } catch {}

  // Generate new session ID
  const id = crypto.randomUUID();
  sessionId = id;
  try {
    sessionStorage.setItem("jh_sid", id);
  } catch {}
  return id;
}

// ── Page View Tracking ─────────────────────────────────────
let currentPageViewId: number | null = null;
let pageEnterTime: number = 0;

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function trackPageView(path: string): Promise<void> {
  if (!supabase) return;

  // Update duration for previous page view
  await updateDuration();

  pageEnterTime = Date.now();

  const [userId, location] = await Promise.all([
    currentUserId(),
    getApproximateLocation(),
  ]);

  try {
    const payload = {
      session_id: getSessionId(), user_id: userId, path,
      referrer: typeof document !== "undefined" ? document.referrer : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 256) : null,
      screen_width: typeof window !== "undefined" ? window.innerWidth : null,
      duration_seconds: 0,
    };
    // The RPC returns an ID without granting visitors SELECT on the table.
    const recorded = await supabase.rpc("record_page_view", {
      page_session: payload.session_id,
      page_user: payload.user_id,
      page_path: payload.path,
      page_referrer: payload.referrer,
      page_agent: payload.user_agent,
      page_screen_width: payload.screen_width,
      page_city: location.city,
      page_region: location.region,
      page_country_code: location.countryCode,
    });
    if (!recorded.error) {
      currentPageViewId = Number(recorded.data);
      return;
    }
    // Support the existing database until the migration is applied.
    const { error } = await supabase.from("page_views").insert({
      ...payload, city: location.city, region: location.region,
      country_code: location.countryCode,
    });
    if (error?.code === "PGRST204" || error?.code === "42703") {
      // Older databases may not have the optional location columns yet.
      const fallback = await supabase.from("page_views").insert(payload);
      if (fallback.error) console.warn("Page view tracking failed:", fallback.error.message);
    } else if (error) {
      console.warn("Page view tracking failed:", error.message);
    }
  } catch (error) {
    console.warn("Page view tracking failed:", error);
  }
}

export async function updateDuration(): Promise<void> {
  if (!supabase || !currentPageViewId || !pageEnterTime) return;

  const pageId = currentPageViewId;
  const duration = Math.round((Date.now() - pageEnterTime) / 1000);
  if (duration < 1) return;
  currentPageViewId = null;
  pageEnterTime = 0;

  try {
    const { error } = await supabase.rpc("record_page_duration", {
      page_id: pageId,
      page_session: getSessionId(),
      seconds_spent: Math.min(duration, 7200),
    });
    if (error) console.warn("Page duration tracking failed:", error.message);
  } catch {}
}

// ── Event Tracking ─────────────────────────────────────────
export async function trackEvent(
  eventType: string,
  eventTarget: string,
  eventData: Record<string, unknown> = {},
): Promise<void> {
  if (!supabase) return;

  const userId = await currentUserId();

  try {
    const { error } = await supabase.from("analytics_events").insert({
      session_id: getSessionId(),
      user_id: userId,
      event_type: eventType,
      event_target: eventTarget,
      event_data: eventData,
      path: typeof window !== "undefined" ? window.location.pathname : "",
    });
    if (error) console.warn("Analytics event tracking failed:", error.message);
  } catch (error) {
    console.warn("Analytics event tracking failed:", error);
  }
}

// ── Module Click Helper ────────────────────────────────────
// Maps pathname prefix → module name for sidebar clicks
const MODULE_MAP: Record<string, string> = {
  "/": "招聘信息",
  "/all": "招聘信息",
  "/tools/assessment": "职业测评",
  "/tools/mbti": "MBTI 测试",
  "/tools/values": "职业价值观测评",
  "/tools/coaching": "求职辅导",
  "/tools/prep": "资料中心",
  "/tools/company-prep": "企业备战库",
  "/tools/exam": "笔试题库",
  "/tools/interview": "面试与群面题库",
  "/tools": "职业服务",
  "/tools/career-camp": "求职训练营",
  "/services/soe-delivery": "投递导航",
  "/services/soe-job-nav": "求职导航",
  "/nav": "常用网址",
  "/shame": "校招避雷",
  "/bookmarks": "我的收藏",
  "/workspace": "求职工作台",
  "/subscription": "每日岗位推荐",
  "/about": "关于",
  "/login": "登录",
  "/donate": "捐赠",
  "/feedback": "反馈",
};

export function getModuleName(path: string): string {
  // Try exact match first, then prefix
  if (MODULE_MAP[path]) return MODULE_MAP[path];
  const match = Object.entries(MODULE_MAP)
    .filter(([prefix]) => prefix !== "/" && path.startsWith(prefix))
    .sort((a, b) => b[0].length - a[0].length)[0];
  return match ? match[1] : path;
}

export async function trackModuleClick(path: string): Promise<void> {
  await trackEvent("module_click", getModuleName(path));
}

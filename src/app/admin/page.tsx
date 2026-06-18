'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// ── Types ───────────────────────────────────────────────────
interface DailyStat {
  day: string;
  unique_visitors: number;
  page_views: number;
  avg_duration_seconds: number;
}

interface HourlyStat {
  day: string;
  hour: number;
  unique_visitors: number;
  page_views: number;
}

interface ModuleClick {
  day: string;
  module: string;
  clicks: number;
}

interface UserStat {
  total_users: number;
  active_users_today: number;
  active_users_7d: number;
  total_subscriptions: number;
  active_subscriptions: number;
  total_matches: number;
  pushed_matches: number;
}

// ── Color palette for chart lines ───────────────────────────
const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6',
];

// ── Helper: format date ─────────────────────────────────────
function fmtDate(d: string): string {
  return d.slice(5); // "2026-06-18" → "06-18"
}

function fmtDuration(s: number): string {
  if (s < 60) return `${s}秒`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec > 0 ? `${m}分${sec}秒` : `${m}分`;
}

// ── Pure CSS Bar Chart Component ────────────────────────────
function BarChart({
  data,
  labelKey,
  valueKey,
  color = '#6366f1',
  height = 200,
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  color?: string;
  height?: number;
}) {
  if (data.length === 0) return <div className="admin-empty">暂无数据</div>;

  const values = data.map(d => Number(d[valueKey]) || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="admin-bar-chart" style={{ height }}>
      <div className="admin-bar-chart-bars">
        {data.map((d, i) => {
          const val = values[i];
          const pct = (val / max) * 100;
          return (
            <div key={i} className="admin-bar-col" title={`${d[labelKey]}: ${val}`}>
              <div className="admin-bar-value">{val}</div>
              <div
                className="admin-bar"
                style={{
                  height: `${pct}%`,
                  background: color,
                }}
              />
              <div className="admin-bar-label">{String(d[labelKey])}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Multi-line Hourly Chart (SVG) ───────────────────────────
function HourlyChart({
  datasets,
  height = 240,
}: {
  datasets: { label: string; data: number[]; color: string }[];
  height?: number;
}) {
  if (datasets.length === 0) return <div className="admin-empty">暂无数据</div>;

  const allValues = datasets.flatMap(ds => ds.data);
  const max = Math.max(...allValues, 1);
  const w = 720;
  const h = height - 40;
  const padLeft = 30;
  const padRight = 10;
  const chartW = w - padLeft - padRight;

  function x(hour: number): number {
    return padLeft + (hour / 23) * chartW;
  }
  function y(val: number): number {
    return h - (val / max) * (h - 20);
  }

  return (
    <div className="admin-hourly-chart">
      <svg viewBox={`0 0 ${w} ${height}`} className="admin-svg-chart">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const yy = h - pct * (h - 20);
          return (
            <g key={pct}>
              <line x1={padLeft} y1={yy} x2={w - padRight} y2={yy} stroke="var(--border)" strokeWidth="0.5" />
              <text x={padLeft - 4} y={yy + 3} fontSize="10" fill="var(--text-muted)" textAnchor="end">
                {Math.round(max * pct)}
              </text>
            </g>
          );
        })}

        {/* Hour labels */}
        {[0, 3, 6, 9, 12, 15, 18, 21].map(hour => (
          <text key={hour} x={x(hour)} y={height - 4} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
            {hour}时
          </text>
        ))}

        {/* Data lines */}
        {datasets.map((ds, di) => {
          const points = ds.data
            .map((val, hour) => `${x(hour)},${y(val)}`)
            .join(' ');
          return (
            <g key={di}>
              <polyline
                points={points}
                fill="none"
                stroke={ds.color}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {ds.data.map((val, hour) => (
                <circle
                  key={hour}
                  cx={x(hour)}
                  cy={y(val)}
                  r="2.5"
                  fill={ds.color}
                  opacity={val > 0 ? 1 : 0.3}
                >
                  <title>{ds.label} {hour}时: {val}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="admin-chart-legend">
        {datasets.map((ds, i) => (
          <span key={i} className="admin-legend-item">
            <span className="admin-legend-dot" style={{ background: ds.color }} />
            {ds.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Admin Page ─────────────────────────────────────────
export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, role, loading: adminLoading } = useAdmin();

  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [hourlyStats, setHourlyStats] = useState<HourlyStat[]>([]);
  const [moduleClicks, setModuleClicks] = useState<ModuleClick[]>([]);
  const [userStats, setUserStats] = useState<UserStat | null>(null);
  const [compareDays, setCompareDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hourly' | 'modules' | 'users'>('overview');

  // ── Fetch data ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    setLoading(true);

    try {
      // Daily stats (last 30 days)
      const { data: daily } = await supabase
        .from('daily_stats')
        .select('*')
        .order('day', { ascending: false })
        .limit(30);

      if (daily) {
        setDailyStats(daily as DailyStat[]);
        // Default compare: today vs same day last week
        if (daily.length > 0 && compareDays.length === 0) {
          if (daily.length > 7) {
            setCompareDays([(daily[0] as DailyStat).day, (daily[7] as DailyStat).day]);
          } else if (daily.length > 1) {
            setCompareDays([(daily[0] as DailyStat).day, (daily[1] as DailyStat).day]);
          } else {
            setCompareDays([(daily[0] as DailyStat).day]);
          }
        }
      }

      // Hourly stats (last 14 days)
      const { data: hourly } = await supabase
        .from('hourly_stats')
        .select('*')
        .order('day', { ascending: false })
        .limit(336);

      if (hourly) setHourlyStats(hourly as HourlyStat[]);

      // Module clicks (last 7 days)
      const { data: modules } = await supabase
        .from('module_click_stats')
        .select('*')
        .order('day', { ascending: false })
        .limit(200);

      if (modules) setModuleClicks(modules as ModuleClick[]);

      // User stats (distinct user_id counts)
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgoStr = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);

      const [
        allUsersRes,
        todayUsersRes,
        weekUsersRes,
        { count: totalSubs },
        { count: activeSubs },
        { count: totalMatches },
        { count: pushedMatches },
      ] = await Promise.all([
        supabase.from('page_views').select('user_id').not('user_id', 'is', null),
        supabase.from('page_views').select('user_id').not('user_id', 'is', null).gte('created_at', todayStr),
        supabase.from('page_views').select('user_id').not('user_id', 'is', null).gte('created_at', weekAgoStr),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('subscription_matches').select('*', { count: 'exact', head: true }),
        supabase.from('subscription_matches').select('*', { count: 'exact', head: true }).eq('is_pushed', true),
      ]);

      // Deduplicate user_ids in frontend
      const distinctCount = (res: { data: { user_id: string }[] | null }) =>
        new Set(res.data?.map(r => r.user_id) ?? []).size;

      setUserStats({
        total_users: distinctCount(allUsersRes as { data: { user_id: string }[] | null }),
        active_users_today: distinctCount(todayUsersRes as { data: { user_id: string }[] | null }),
        active_users_7d: distinctCount(weekUsersRes as { data: { user_id: string }[] | null }),
        total_subscriptions: totalSubs ?? 0,
        active_subscriptions: activeSubs ?? 0,
        total_matches: totalMatches ?? 0,
        pushed_matches: pushedMatches ?? 0,
      });
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    }

    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (!adminLoading && isAdmin) fetchData();
  }, [adminLoading, isAdmin, fetchData]);

  // ── Auth guards ───────────────────────────────────────────
  if (authLoading || adminLoading) {
    return (
      <div className="page admin-page">
        <div className="admin-loading">验证权限中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page admin-page">
        <div className="admin-auth-guard">
          <h2>需要登录</h2>
          <p>请先登录管理员账号后再访问此页面。</p>
          <Link href="/login" className="btn">去登录</Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page admin-page">
        <div className="admin-auth-guard">
          <h2>权限不足</h2>
          <p>当前账号没有管理员权限，无法访问此页面。</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            当前账号：{user.email}
          </p>
          <Link href="/" className="btn" style={{ marginTop: '1rem' }}>返回首页</Link>
        </div>
      </div>
    );
  }

  // ── Prepare hourly comparison data ────────────────────────
  const availableDays = Array.from(new Set(hourlyStats.map(h => h.day))).sort().reverse();

  function getHourlyDataForDay(day: string): number[] {
    const arr = new Array(24).fill(0);
    hourlyStats
      .filter(h => h.day === day)
      .forEach(h => { arr[h.hour] = h.page_views; });
    return arr;
  }

  const hourlyDatasets = compareDays.map((day, i) => ({
    label: fmtDate(day),
    data: getHourlyDataForDay(day),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // ── Module clicks ─────────────────────────────────────────
  const todayModuleStr = new Date().toISOString().slice(0, 10);
  const todayModuleClicks = moduleClicks
    .filter(m => m.day === todayModuleStr)
    .sort((a, b) => b.clicks - a.clicks);

  const moduleAgg = new Map<string, number>();
  moduleClicks.forEach(m => {
    moduleAgg.set(m.module, (moduleAgg.get(m.module) || 0) + m.clicks);
  });
  const moduleAggSorted = Array.from(moduleAgg.entries())
    .map(([module, clicks]) => ({ module, clicks }))
    .sort((a, b) => b.clicks - a.clicks);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div>
          <h1>数据统计</h1>
          <p>{role === 'super_admin' ? '超级管理员' : '管理员'} · {user.email}</p>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="btn btn-secondary" onClick={fetchData} disabled={loading}>
            {loading ? '加载中...' : '刷新数据'}
          </button>
          {role === 'super_admin' && (
            <Link href="/admin/accounts" className="btn">账号管理</Link>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="admin-tabs">
        {(['overview', 'hourly', 'modules', 'users'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            className={`admin-tab ${activeTab === tab ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {{ overview: '访问概览', hourly: '小时分布', modules: '模块点击', users: '用户统计' }[tab]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">加载数据中...</div>
      ) : (
        <>
          {/* ── Overview Tab ──────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="admin-section">
              {dailyStats.length > 0 && (
                <div className="admin-stat-grid">
                  <div className="admin-stat-card">
                    <div className="admin-stat-value">{dailyStats[0]?.unique_visitors ?? 0}</div>
                    <div className="admin-stat-label">今日访客</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-value">{dailyStats[0]?.page_views ?? 0}</div>
                    <div className="admin-stat-label">今日访问次数</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-value">
                      {fmtDuration(dailyStats[0]?.avg_duration_seconds ?? 0)}
                    </div>
                    <div className="admin-stat-label">平均在线时长</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-value">
                      {dailyStats.length > 1 && dailyStats[1].unique_visitors > 0
                        ? `${((dailyStats[0].unique_visitors / dailyStats[1].unique_visitors - 1) * 100).toFixed(1)}%`
                        : '—'}
                    </div>
                    <div className="admin-stat-label">访客环比</div>
                  </div>
                </div>
              )}

              <h3 className="admin-section-title">每日趋势（近30天）</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>独立访客</th>
                      <th>访问次数</th>
                      <th>平均时长</th>
                      <th>环比变化</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyStats.map((stat, i) => {
                      const prev = dailyStats[i + 1];
                      const change = prev && prev.unique_visitors > 0
                        ? ((stat.unique_visitors / prev.unique_visitors - 1) * 100).toFixed(1)
                        : null;
                      return (
                        <tr key={stat.day}>
                          <td>{stat.day}</td>
                          <td>{stat.unique_visitors}</td>
                          <td>{stat.page_views}</td>
                          <td>{fmtDuration(stat.avg_duration_seconds)}</td>
                          <td>
                            {change !== null ? (
                              <span className={Number(change) >= 0 ? 'admin-change-up' : 'admin-change-down'}>
                                {Number(change) >= 0 ? '↑' : '↓'} {Math.abs(Number(change))}%
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <h3 className="admin-section-title">每日访客趋势</h3>
              <BarChart
                data={[...dailyStats].reverse().slice(-14).map(d => ({
                  label: fmtDate(d.day),
                  value: d.unique_visitors,
                }))}
                labelKey="label"
                valueKey="value"
                color="#6366f1"
                height={220}
              />
            </div>
          )}

          {/* ── Hourly Tab ────────────────────────────────── */}
          {activeTab === 'hourly' && (
            <div className="admin-section">
              <h3 className="admin-section-title">每小时在线分布</h3>
              <p className="admin-section-desc">选择日期进行对比（默认：今天 vs 上周同日）</p>

              <div className="admin-day-picker">
                {availableDays.slice(0, 14).map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    className={`tag ${compareDays.includes(day) ? 'tag-active' : ''}`}
                    onClick={() => {
                      setCompareDays(prev => {
                        if (prev.includes(day)) return prev.filter(d => d !== day);
                        if (prev.length >= 4) return [...prev.slice(1), day];
                        return [...prev, day];
                      });
                    }}
                    style={compareDays.includes(day) ? {
                      borderColor: CHART_COLORS[compareDays.indexOf(day) % CHART_COLORS.length],
                      color: CHART_COLORS[compareDays.indexOf(day) % CHART_COLORS.length],
                    } : undefined}
                  >
                    {fmtDate(day)}{i === 0 ? ' 今天' : ''}
                  </button>
                ))}
              </div>

              <HourlyChart datasets={hourlyDatasets} height={280} />
            </div>
          )}

          {/* ── Modules Tab ───────────────────────────────── */}
          {activeTab === 'modules' && (
            <div className="admin-section">
              <h3 className="admin-section-title">今日模块点击</h3>
              {todayModuleClicks.length === 0 ? (
                <div className="admin-empty">今日暂无点击数据</div>
              ) : (
                <BarChart
                  data={todayModuleClicks.map(m => ({ label: m.module, value: m.clicks }))}
                  labelKey="label"
                  valueKey="value"
                  color="#10b981"
                  height={220}
                />
              )}

              <h3 className="admin-section-title" style={{ marginTop: '2rem' }}>累计模块点击排行</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>排名</th>
                      <th>模块</th>
                      <th>累计点击</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moduleAggSorted.map((m, i) => (
                      <tr key={m.module}>
                        <td>{i + 1}</td>
                        <td>{m.module}</td>
                        <td>{m.clicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Users Tab ─────────────────────────────────── */}
          {activeTab === 'users' && userStats && (
            <div className="admin-section">
              <h3 className="admin-section-title">注册与订阅统计</h3>
              <div className="admin-stat-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-value">{userStats.total_users}</div>
                  <div className="admin-stat-label">累计注册用户（有访问）</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value">{userStats.active_users_today}</div>
                  <div className="admin-stat-label">今日活跃用户</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value">{userStats.active_users_7d}</div>
                  <div className="admin-stat-label">近7日活跃用户</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value">{userStats.total_subscriptions}</div>
                  <div className="admin-stat-label">订阅总数</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value">{userStats.active_subscriptions}</div>
                  <div className="admin-stat-label">活跃订阅</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value">{userStats.total_matches}</div>
                  <div className="admin-stat-label">匹配推送总数</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value">{userStats.pushed_matches}</div>
                  <div className="admin-stat-label">已推送</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

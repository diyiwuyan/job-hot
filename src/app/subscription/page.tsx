'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useSubscription, SubscriptionMatch } from '@/hooks/useSubscription';

// ─── 选项常量 ────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { value: 'internet', label: '互联网/AI' },
  { value: 'foreign', label: '外企' },
  { value: 'game', label: '游戏' },
  { value: 'auto_ic', label: '车企/IC' },
  { value: 'finance', label: '金融' },
  { value: 'security', label: '安全/云服务' },
  { value: 'other', label: '其他' },
];

const COMPANY_TYPE_OPTIONS = [
  { value: 'foreign', label: '外企' },
  { value: 'state', label: '央国企' },
  { value: 'private', label: '民企' },
  { value: 'bank', label: '银行' },
  { value: 'institution', label: '事业单位' },
];

const CHANNEL_OPTIONS = [
  { value: 'campus', label: '校招' },
  { value: 'intern', label: '实习' },
];

const POPULAR_CITIES = ['北京', '上海', '深圳', '广州', '杭州', '成都', '南京', '武汉', '西安', '苏州'];

// ─── 主页面 ──────────────────────────────────────────────────
export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    config,
    matches,
    unreadCount,
    loading,
    saving,
    saveConfig,
    markRead,
    markAllRead,
  } = useSubscription();

  const [tab, setTab] = useState<'settings' | 'inbox'>('inbox');
  const [keywordInput, setKeywordInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [localConfig, setLocalConfig] = useState(config);
  const [saveMsg, setSaveMsg] = useState('');

  // Sync local config when remote config loads
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // ─── 未登录 ─────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="timeline-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem' }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>订阅推送</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            设置关键词和筛选条件，JOBHOT 会自动帮你监控最新职位信息，通过邮件推送到你的邮箱。登录后即可使用。
          </p>
          <Link href="/login" className="btn" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            去登录
          </Link>
        </div>
      </div>
    );
  }

  // ─── 加载中 ─────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>加载中...</p>
      </div>
    );
  }

  // ─── 添加关键词 ─────────────────────────────────────────
  function addKeyword() {
    const kw = keywordInput.trim();
    if (!kw || localConfig.keywords.includes(kw)) return;
    setLocalConfig((prev) => ({ ...prev, keywords: [...prev.keywords, kw] }));
    setKeywordInput('');
  }

  function removeKeyword(kw: string) {
    setLocalConfig((prev) => ({ ...prev, keywords: prev.keywords.filter((k) => k !== kw) }));
  }

  // ─── 城市操作 ───────────────────────────────────────────
  function addCity(city: string) {
    if (localConfig.cities.includes(city)) return;
    setLocalConfig((prev) => ({ ...prev, cities: [...prev.cities, city] }));
    setCityInput('');
  }

  function removeCity(city: string) {
    setLocalConfig((prev) => ({ ...prev, cities: prev.cities.filter((c) => c !== city) }));
  }

  // ─── 多选切换 ───────────────────────────────────────────
  function toggleOption(field: 'categories' | 'companyTypes' | 'channels', value: string) {
    setLocalConfig((prev) => {
      const arr = prev[field];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [field]: next };
    });
  }

  // ─── 保存 ──────────────────────────────────────────────
  async function handleSave() {
    const ok = await saveConfig(localConfig);
    setSaveMsg(ok ? '保存成功' : '保存失败，请重试');
    setTimeout(() => setSaveMsg(''), 2000);
  }

  // ─── 渲染 ──────────────────────────────────────────────
  return (
    <div className="page">
      {/* 头部 */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>订阅推送</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          设置关键词和条件，新职位自动推送到你的注册邮箱
        </p>
      </div>

      {/* Tab 切换 */}
      <div className="segmented" style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`seg-item${tab === 'inbox' ? ' seg-item-active' : ''}`}
          onClick={() => setTab('inbox')}
        >
          推送收件箱{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </button>
        <button
          type="button"
          className={`seg-item${tab === 'settings' ? ' seg-item-active' : ''}`}
          onClick={() => setTab('settings')}
        >
          订阅设置
        </button>
      </div>

      {/* ── 收件箱 Tab ────────────────────────────────── */}
      {tab === 'inbox' && (
        <div>
          {matches.length === 0 ? (
            <div className="timeline-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.75rem' }}>
                <path d="M22 12h-6l-2 3H10L8 12H2" />
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
              <p style={{ fontSize: '0.9375rem', fontWeight: 500, marginBottom: '0.25rem' }}>收件箱为空</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {config.keywords.length === 0
                  ? '请先在「订阅设置」中添加关键词，新匹配的职位会出现在这里。'
                  : '暂无新的匹配结果。系统每天会自动扫描最新数据并推送。'}
              </p>
            </div>
          ) : (
            <>
              {unreadCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }} onClick={markAllRead}>
                    全部已读
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {matches.map((m) => (
                  <MatchCard key={m.id} match={m} onRead={() => markRead(m.id)} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 设置 Tab ──────────────────────────────────── */}
      {tab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 启用/停用 */}
          <div className="timeline-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>启用推送</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                开启后系统会自动监控并推送匹配的新职位
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLocalConfig((p) => ({ ...p, isActive: !p.isActive }))}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative',
                background: localConfig.isActive ? 'var(--accent)' : 'var(--border)',
                transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s',
                left: localConfig.isActive ? '22px' : '2px',
              }} />
            </button>
          </div>

          {/* 关键词 */}
          <div className="timeline-card" style={{ padding: '1rem 1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              关键词
              <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>公司名、岗位名、技术栈等</span>
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                className="field"
                placeholder="输入关键词，按回车添加"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn" onClick={addKeyword} style={{ whiteSpace: 'nowrap' }}>添加</button>
            </div>
            {localConfig.keywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {localConfig.keywords.map((kw) => (
                  <span key={kw} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onClick={() => removeKeyword(kw)}>
                    {kw}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 行业 */}
          <div className="timeline-card" style={{ padding: '1rem 1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>行业偏好</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="tag"
                  onClick={() => toggleOption('categories', opt.value)}
                  style={{
                    cursor: 'pointer',
                    background: localConfig.categories.includes(opt.value) ? 'var(--accent)' : undefined,
                    color: localConfig.categories.includes(opt.value) ? '#fff' : undefined,
                    borderColor: localConfig.categories.includes(opt.value) ? 'var(--accent)' : undefined,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>不选则不限行业</p>
          </div>

          {/* 企业类型 */}
          <div className="timeline-card" style={{ padding: '1rem 1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>企业类型</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {COMPANY_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="tag"
                  onClick={() => toggleOption('companyTypes', opt.value)}
                  style={{
                    cursor: 'pointer',
                    background: localConfig.companyTypes.includes(opt.value) ? 'var(--accent)' : undefined,
                    color: localConfig.companyTypes.includes(opt.value) ? '#fff' : undefined,
                    borderColor: localConfig.companyTypes.includes(opt.value) ? 'var(--accent)' : undefined,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>不选则不限类型</p>
          </div>

          {/* 频道 */}
          <div className="timeline-card" style={{ padding: '1rem 1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>求职类型</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {CHANNEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="tag"
                  onClick={() => toggleOption('channels', opt.value)}
                  style={{
                    cursor: 'pointer',
                    background: localConfig.channels.includes(opt.value) ? 'var(--accent)' : undefined,
                    color: localConfig.channels.includes(opt.value) ? '#fff' : undefined,
                    borderColor: localConfig.channels.includes(opt.value) ? 'var(--accent)' : undefined,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>不选则校招、实习都推</p>
          </div>

          {/* 城市 */}
          <div className="timeline-card" style={{ padding: '1rem 1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>目标城市</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  className="tag"
                  onClick={() => localConfig.cities.includes(city) ? removeCity(city) : addCity(city)}
                  style={{
                    cursor: 'pointer',
                    background: localConfig.cities.includes(city) ? 'var(--accent)' : undefined,
                    color: localConfig.cities.includes(city) ? '#fff' : undefined,
                    borderColor: localConfig.cities.includes(city) ? 'var(--accent)' : undefined,
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="field"
                placeholder="其他城市"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const c = cityInput.trim();
                    if (c) addCity(c);
                  }
                }}
                style={{ flex: 1 }}
              />
            </div>
            {localConfig.cities.filter((c) => !POPULAR_CITIES.includes(c)).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.375rem' }}>
                {localConfig.cities.filter((c) => !POPULAR_CITIES.includes(c)).map((city) => (
                  <span key={city} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }} onClick={() => removeCity(city)}>
                    {city}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </span>
                ))}
              </div>
            )}
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>不选则不限城市</p>
          </div>

          {/* 推送频率 */}
          <div className="timeline-card" style={{ padding: '1rem 1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>推送频率</h3>
            <div className="segmented" style={{ maxWidth: '280px' }}>
              <button
                type="button"
                className={`seg-item${localConfig.pushFrequency === 'daily' ? ' seg-item-active' : ''}`}
                onClick={() => setLocalConfig((p) => ({ ...p, pushFrequency: 'daily' }))}
              >
                每日推送
              </button>
              <button
                type="button"
                className={`seg-item${localConfig.pushFrequency === 'weekly' ? ' seg-item-active' : ''}`}
                onClick={() => setLocalConfig((p) => ({ ...p, pushFrequency: 'weekly' }))}
              >
                每周推送
              </button>
            </div>
          </div>

          {/* 保存按钮 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button type="button" className="btn" onClick={handleSave} disabled={saving} style={{ minWidth: '100px', justifyContent: 'center' }}>
              {saving ? '保存中...' : '保存设置'}
            </button>
            {saveMsg && (
              <span style={{ fontSize: '0.8125rem', color: saveMsg === '保存成功' ? '#22c55e' : '#ef4444' }}>
                {saveMsg}
              </span>
            )}
          </div>

          {/* 说明 */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.8, padding: '0.75rem 0' }}>
            <p>
              订阅推送会根据你设置的关键词和筛选条件，在每天的新数据中自动匹配，将符合条件的职位信息汇总后发送到你的注册邮箱（{user?.email}）。
              匹配到的结果也会出现在上方的「推送收件箱」中。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 匹配卡片组件 ─────────────────────────────────────────
function MatchCard({ match, onRead }: { match: SubscriptionMatch; onRead: () => void }) {
  return (
    <div
      className="timeline-card"
      style={{
        padding: '0.875rem 1rem',
        opacity: match.isRead ? 0.7 : 1,
        borderLeft: match.isRead ? undefined : '3px solid var(--accent)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <a
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            className="item-title"
            style={{ fontSize: '0.9375rem', fontWeight: 500 }}
            onClick={onRead}
          >
            {match.title}
          </a>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {match.source && <span>{match.source}</span>}
            {match.location && <span>{match.location}</span>}
            {match.deadline && <span>截止 {match.deadline}</span>}
            <span>{new Date(match.matchedAt).toLocaleDateString('zh-CN')}</span>
          </div>
          {match.matchedKeywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.375rem' }}>
              {match.matchedKeywords.map((kw) => (
                <span key={kw} className="tag" style={{ fontSize: '0.6875rem', padding: '0.125rem 0.375rem' }}>{kw}</span>
              ))}
            </div>
          )}
        </div>
        {!match.isRead && (
          <button
            type="button"
            title="标为已读"
            onClick={onRead}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--text-muted)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

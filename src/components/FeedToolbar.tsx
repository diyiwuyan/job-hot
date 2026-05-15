'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Channel, Category, CompanyType } from '@/lib/types';

interface FeedToolbarProps {
  currentChannel: Channel;
  currentCategory: Category;
  currentQuery: string;
  currentCities?: string[];
  currentCompanyType?: CompanyType;
  basePath: string;
  viewMode?: 'detail' | 'compact';
  onViewModeChange?: (mode: 'detail' | 'compact') => void;
  onExportCSV?: () => void;
}

const channels: { value: Channel; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'campus', label: '校招' },
  { value: 'intern', label: '实习' },
  { value: 'talk', label: '宣讲会' },
];

const categories: { value: Category; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'internet', label: '互联网/AI' },
  { value: 'foreign', label: '外企' },
  { value: 'game', label: '游戏' },
  { value: 'auto_ic', label: '车企/IC' },
  { value: 'finance', label: '金融/国企' },
  { value: 'security', label: '安全/云服务' },
  { value: 'other', label: '其他' },
];

const companyTypes: { value: CompanyType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'foreign', label: '外企' },
  { value: 'state', label: '央国企' },
  { value: 'private', label: '民企' },
  { value: 'bank', label: '银行' },
  { value: 'institution', label: '事业单位' },
];

function buildFilterUrl(
  basePath: string,
  channel: Channel,
  category: Category,
  cities?: string[],
  companyType?: CompanyType,
): string {
  const params = new URLSearchParams();
  params.set('page', '1');
  if (channel !== 'all') params.set('channel', channel);
  if (category !== 'all') params.set('category', category);
  if (cities && cities.length > 0) params.set('cities', cities.join(','));
  if (companyType && companyType !== 'all') params.set('companyType', companyType);
  return `${basePath}/?${params.toString()}`;
}

/* ── Multi-select city dropdown ─────────────────────────────────── */
function CityDropdown({
  cities,
  selected,
  onToggle,
  onClear,
}: {
  cities: string[];
  selected: string[];
  onToggle: (city: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const label = selected.length === 0 ? '不限' : selected.length <= 2 ? selected.join('、') : `${selected.length}个城市`;

  return (
    <div className="filter-dropdown" ref={ref}>
      <button
        type="button"
        className={`filter-dropdown-btn${selected.length > 0 ? ' filter-dropdown-btn-active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span className="filter-dropdown-label">城市</span>
        <span className="filter-dropdown-value">{label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="filter-dropdown-panel city-panel">
          {selected.length > 0 && (
            <button
              type="button"
              className="filter-dropdown-clear"
              onClick={onClear}
            >
              清除选择
            </button>
          )}
          <div className="city-grid">
            {cities.map(city => (
              <label key={city} className={`city-chip${selected.includes(city) ? ' city-chip-active' : ''}`}>
                <input
                  type="checkbox"
                  checked={selected.includes(city)}
                  onChange={() => onToggle(city)}
                  className="sr-only"
                />
                {city}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const basePath_api = process.env.NEXT_PUBLIC_BASE_PATH || '/job-hot';

export function FeedToolbar({
  currentChannel,
  currentCategory,
  currentQuery,
  currentCities = [],
  currentCompanyType = 'all',
  basePath,
  viewMode = 'detail',
  onViewModeChange,
  onExportCSV,
}: FeedToolbarProps) {
  const router = useRouter();
  const [cityList, setCityList] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>(currentCities);

  // Load city list once
  useEffect(() => {
    fetch(`${basePath_api}/api/feed/cities.json`)
      .then(r => r.ok ? r.json() : [])
      .then(setCityList)
      .catch(() => {});
  }, []);

  // Sync from URL params
  useEffect(() => {
    setSelectedCities(currentCities);
  }, [currentCities]);

  function navigateWithCities(next: string[]) {
    const params = new URLSearchParams();
    params.set('page', '1');
    if (currentChannel !== 'all') params.set('channel', currentChannel);
    if (currentCategory !== 'all') params.set('category', currentCategory);
    if (currentCompanyType !== 'all') params.set('companyType', currentCompanyType);
    if (currentQuery) params.set('q', currentQuery);
    if (next.length > 0) params.set('cities', next.join(','));
    router.push(`${basePath}/?${params.toString()}`);
  }

  function toggleCity(city: string) {
    setSelectedCities(prev => {
      const next = prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city];
      navigateWithCities(next);
      return next;
    });
  }

  function clearCities() {
    setSelectedCities([]);
    navigateWithCities([]);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    params.set('page', '1');
    const q = (formData.get('q') as string || '').trim();
    if (q) params.set('q', q);
    if (currentChannel !== 'all') params.set('channel', currentChannel);
    if (currentCategory !== 'all') params.set('category', currentCategory);
    if (currentCompanyType !== 'all') params.set('companyType', currentCompanyType);
    if (selectedCities.length > 0) params.set('cities', selectedCities.join(','));
    router.push(`${basePath}/?${params.toString()}`);
  }

  // Check if any filter is active
  const hasActiveFilters = currentChannel !== 'all' || currentCategory !== 'all' || currentCompanyType !== 'all' || selectedCities.length > 0 || currentQuery;

  function resetFilters() {
    setSelectedCities([]);
    router.push(`${basePath}/`);
  }

  return (
    <div className="page-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1>全部求职动态</h1>
          <p>大学生求职相关资讯全量信息流</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
          {/* View mode toggle */}
          {onViewModeChange && (
            <div className="view-toggle">
              <button
                type="button"
                className={`view-toggle-btn${viewMode === 'detail' ? ' view-toggle-btn-active' : ''}`}
                onClick={() => onViewModeChange('detail')}
                title="详细视图"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                type="button"
                className={`view-toggle-btn${viewMode === 'compact' ? ' view-toggle-btn-active' : ''}`}
                onClick={() => onViewModeChange('compact')}
                title="紧凑视图"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          )}
          {/* Export CSV */}
          {onExportCSV && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onExportCSV} title="导出 CSV">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              导出
            </button>
          )}
        </div>
      </div>

      <div className="divider" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Row 1: 招聘类型 */}
        <div className="filter-labeled-row">
          <span className="filter-label">招聘类型</span>
          <div className="segmented" aria-label="招聘类型">
            {channels.map((ch) => (
              <Link
                key={ch.value}
                href={buildFilterUrl(basePath, ch.value, currentCategory, selectedCities, currentCompanyType)}
                className={`seg-item${currentChannel === ch.value ? ' seg-item-active' : ''}`}
                aria-current={currentChannel === ch.value ? 'page' : undefined}
              >
                {ch.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Row 2: 行业 */}
        <div className="filter-labeled-row">
          <span className="filter-label">行业</span>
          <div className="segmented segmented-wrap" aria-label="行业筛选">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                href={buildFilterUrl(basePath, currentChannel, cat.value, selectedCities, currentCompanyType)}
                className={`seg-item${currentCategory === cat.value ? ' seg-item-active' : ''}`}
                aria-current={currentCategory === cat.value ? 'page' : undefined}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Row 3: 公司性质 */}
        <div className="filter-labeled-row">
          <span className="filter-label">公司性质</span>
          <div className="segmented" aria-label="公司性质">
            {companyTypes.map((ct) => (
              <Link
                key={ct.value}
                href={buildFilterUrl(basePath, currentChannel, currentCategory, selectedCities, ct.value)}
                className={`seg-item${currentCompanyType === ct.value ? ' seg-item-active' : ''}`}
                aria-current={currentCompanyType === ct.value ? 'page' : undefined}
              >
                {ct.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Row 4: 城市 */}
        {cityList.length > 0 && (
          <div className="filter-labeled-row">
            <span className="filter-label">城市</span>
            <CityDropdown
              cities={cityList}
              selected={selectedCities}
              onToggle={toggleCity}
              onClear={clearCities}
            />
          </div>
        )}

        {/* Row 5: 搜索 + 重置 */}
        <form className="filter-form" onSubmit={handleSearch}>
          <input
            type="text"
            name="q"
            placeholder="搜索公司/职位/关键词…"
            className="field"
            defaultValue={currentQuery}
          />
          <button type="submit" className="btn">搜索</button>
          {hasActiveFilters && (
            <button type="button" className="btn btn-secondary" onClick={resetFilters}>
              重置筛选
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

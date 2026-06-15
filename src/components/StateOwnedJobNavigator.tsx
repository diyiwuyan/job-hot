'use client';

import { useMemo, useState } from 'react';
import {
  SOE_COMPANIES,
  SOE_INDUSTRIES,
  SOE_INTERVIEW_DATA,
  SOE_MAJOR_MAP,
  SOE_MAJOR_NAMES,
  type CompanyTier,
  type CompanyType,
  type InterviewInfo,
  type MajorInfo,
  type StateOwnedCompany,
} from '@/lib/state-owned/data';

const QUICK_MAJORS = [
  '计算机科学与技术',
  '金融学',
  '电气工程及其自动化',
  '会计学',
  '法学',
  '机械工程',
  '土木工程',
  '汉语言文学',
  '通信工程',
  '材料科学与工程',
];

const TYPE_LABELS: Record<CompanyType, string> = {
  central: '央企',
  provincial: '省属国企',
  subsidiary: '央企子公司',
};

const TIER_LABELS: Record<CompanyTier, string> = {
  1: 'T1 头部首选',
  2: 'T2 稳妥可争',
  3: 'T3 保底兜底',
};

const INTERVIEW_ALIASES: Record<string, string> = {
  华能集团: '华能',
  大唐集团: '大唐',
  华电集团: '华电',
  三峡集团: '三峡',
  国家能源集团: '国家能源',
  中铁建: '中国铁建',
  中国电建: '电建',
};

function resolveMajor(input: string): string | null {
  const keyword = input.trim();
  if (!keyword) return null;
  if (SOE_MAJOR_MAP[keyword]) return keyword;
  return SOE_MAJOR_NAMES.find((name) => name.includes(keyword) || keyword.includes(name)) ?? null;
}

function compactMajorKeyword(major: string): string {
  return major.replace(/[及其自动化与科学工程管理技术法文学]/g, '');
}

function compactPositionKeyword(position: string): string {
  return position.replace(/[工程师管理师岗开发设计运维建设]/g, '');
}

function hasPositionMatch(company: StateOwnedCompany, major: string, majorInfo: MajorInfo): boolean {
  const majorKeyword = compactMajorKeyword(major);

  return company.positions.some((position) => {
    if (majorInfo.positions.some((target) => position.includes(target) || target.includes(position))) {
      return true;
    }

    const positionKeyword = compactPositionKeyword(position);
    return Boolean(
      majorKeyword &&
        positionKeyword &&
        (position.includes(majorKeyword) || majorKeyword.includes(positionKeyword))
    );
  });
}

function matchesMajor(company: StateOwnedCompany, major: string, majorInfo: MajorInfo): boolean {
  if (majorInfo.industries.includes('所有行业')) return true;

  const industryMatch = majorInfo.industries.some((industry) => {
    const keywords = SOE_INDUSTRIES[industry] ?? [];
    return (
      company.industry === industry ||
      keywords.some((keyword) => company.short.includes(keyword) || company.name.includes(keyword))
    );
  });

  return industryMatch || hasPositionMatch(company, major, majorInfo);
}

function getRelevantPositions(company: StateOwnedCompany, major: string, majorInfo: MajorInfo): string[] {
  const majorKeyword = compactMajorKeyword(major);
  const matched = company.positions.filter((position) => {
    const positionKeyword = compactPositionKeyword(position);
    return (
      majorInfo.positions.some((target) => position.includes(target) || target.includes(position)) ||
      Boolean(majorKeyword && positionKeyword && (position.includes(majorKeyword) || majorKeyword.includes(positionKeyword)))
    );
  });

  return (matched.length > 0 ? matched : company.positions).slice(0, 4);
}

function getInterview(company: StateOwnedCompany): InterviewInfo | undefined {
  return (
    SOE_INTERVIEW_DATA[company.short] ??
    SOE_INTERVIEW_DATA[INTERVIEW_ALIASES[company.short]] ??
    SOE_INTERVIEW_DATA[company.short.replace('集团', '')]
  );
}

function difficultyClass(difficulty?: string): string {
  if (!difficulty) return 'soe-difficulty-muted';
  if (difficulty.includes('高')) return 'soe-difficulty-high';
  if (difficulty.includes('中')) return 'soe-difficulty-medium';
  return 'soe-difficulty-low';
}

function formatTotal(total: number): string {
  return total.toLocaleString('zh-CN');
}

const provinceOptions = Array.from(new Set(SOE_COMPANIES.flatMap((company) => company.province.split(/[\/、,，]/))))
  .map((province) => province.trim().replace(/（.*?）/g, ''))
  .filter(Boolean)
  .filter((province, index, all) => all.indexOf(province) === index)
  .sort((a, b) => a.localeCompare(b, 'zh-CN'));

export function StateOwnedJobNavigator() {
  const [query, setQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | CompanyTier>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | CompanyType>('all');
  const [eduFilter, setEduFilter] = useState<'all' | 'master' | 'bachelor'>('all');
  const [provinceFilter, setProvinceFilter] = useState('all');

  const selectedMajor = useMemo(() => resolveMajor(query), [query]);
  const majorInfo = selectedMajor ? SOE_MAJOR_MAP[selectedMajor] : null;

  const filteredCompanies = useMemo(() => {
    if (!selectedMajor || !majorInfo) return [];

    return SOE_COMPANIES.filter((company) => matchesMajor(company, selectedMajor, majorInfo))
      .filter((company) => tierFilter === 'all' || company.tier === tierFilter)
      .filter((company) => typeFilter === 'all' || company.type === typeFilter)
      .filter((company) => {
        if (eduFilter === 'master') return company.eduReq.includes('硕士') || company.eduReq.includes('博士');
        if (eduFilter === 'bachelor') return company.eduReq.includes('本科');
        return true;
      })
      .filter((company) => provinceFilter === 'all' || company.province.includes(provinceFilter))
      .sort((a, b) => a.tier - b.tier || a.industry.localeCompare(b.industry, 'zh-CN'));
  }, [eduFilter, majorInfo, provinceFilter, selectedMajor, tierFilter, typeFilter]);

  const stats = useMemo(() => {
    const tierCounts = { 1: 0, 2: 0, 3: 0 } as Record<CompanyTier, number>;
    const industries = new Set<string>();
    filteredCompanies.forEach((company) => {
      tierCounts[company.tier] += 1;
      industries.add(company.industry);
    });

    return {
      total: filteredCompanies.length,
      tierCounts,
      industries: industries.size,
      interviews: filteredCompanies.filter((company) => getInterview(company)).length,
    };
  }, [filteredCompanies]);

  const groupedCompanies = useMemo(() => {
    return ([1, 2, 3] as CompanyTier[]).map((tier) => ({
      tier,
      companies: filteredCompanies.filter((company) => company.tier === tier),
    }));
  }, [filteredCompanies]);

  function pickMajor(major: string) {
    setQuery(major);
  }

  return (
    <div className="soe-page">
      <div className="page-header soe-hero">
        <div>
          <p className="soe-eyebrow">央国企服务</p>
          <h1>央国企求职导航</h1>
          <p>
            输入专业，匹配可投递企业、岗位方向、学历门槛、招聘节奏与面试准备要点。数据截至 2026 年 6 月，招聘人数和批次以企业官网最新公告为准。
          </p>
        </div>
        <div className="soe-hero-meta">
          <strong>{formatTotal(SOE_COMPANIES.length)}</strong>
          <span>家企业样本</span>
        </div>
      </div>

      <section className="soe-panel soe-search-panel" aria-label="专业搜索与筛选">
        <form className="soe-search-row" onSubmit={(event) => event.preventDefault()}>
          <div className="soe-search-field">
            <label htmlFor="soe-major-input">专业名称</label>
            <input
              id="soe-major-input"
              className="field"
              list="soe-major-list"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入专业，如 计算机科学与技术、金融学、电气工程"
            />
            <datalist id="soe-major-list">
              {SOE_MAJOR_NAMES.map((major) => (
                <option key={major} value={major} />
              ))}
            </datalist>
          </div>

          <button type="button" className="btn" onClick={() => selectedMajor && pickMajor(selectedMajor)}>
            匹配企业
          </button>
        </form>

        <div className="soe-filter-row">
          <select className="field" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'all' | CompanyType)}>
            <option value="all">全部类型</option>
            <option value="central">央企</option>
            <option value="subsidiary">央企子公司</option>
            <option value="provincial">省属国企</option>
          </select>

          <select className="field" value={eduFilter} onChange={(event) => setEduFilter(event.target.value as 'all' | 'master' | 'bachelor')}>
            <option value="all">全部学历</option>
            <option value="bachelor">本科可投</option>
            <option value="master">硕士优先/起步</option>
          </select>

          <select className="field" value={provinceFilter} onChange={(event) => setProvinceFilter(event.target.value)}>
            <option value="all">全部地区</option>
            {provinceOptions.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        <div className="soe-tier-tabs" aria-label="档次筛选">
          <button className={tierFilter === 'all' ? 'tag tag-active' : 'tag'} type="button" onClick={() => setTierFilter('all')}>
            全部
          </button>
          {([1, 2, 3] as CompanyTier[]).map((tier) => (
            <button
              key={tier}
              className={tierFilter === tier ? 'tag tag-active' : 'tag'}
              type="button"
              onClick={() => setTierFilter(tier)}
            >
              {TIER_LABELS[tier]}
            </button>
          ))}
        </div>

        <div className="soe-quick-tags" aria-label="常用专业">
          {QUICK_MAJORS.map((major) => (
            <button key={major} className="tag" type="button" onClick={() => pickMajor(major)}>
              {major}
            </button>
          ))}
        </div>
      </section>

      {!query.trim() ? (
        <section className="soe-empty">
          <h2>先输入一个专业</h2>
          <p>系统会从专业类别、可投递方向和企业行业标签中做匹配，适合作为咨询前的机会池初筛。</p>
        </section>
      ) : !selectedMajor || !majorInfo ? (
        <section className="soe-empty">
          <h2>暂未收录这个专业</h2>
          <p>可以换一个更常见的专业名称，或从上方快捷专业开始查看匹配效果。</p>
        </section>
      ) : (
        <>
          <section className="soe-summary-grid" aria-label="匹配概览">
            <div className="soe-stat-card">
              <span>匹配企业</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="soe-stat-card">
              <span>覆盖行业</span>
              <strong>{stats.industries}</strong>
            </div>
            <div className="soe-stat-card">
              <span>面经样本</span>
              <strong>{stats.interviews}</strong>
            </div>
            <div className="soe-stat-card">
              <span>专业类别</span>
              <strong className="soe-stat-text">{majorInfo.category}</strong>
            </div>
          </section>

          <section className="soe-panel soe-major-brief">
            <div>
              <span>可投递方向</span>
              <div className="soe-chip-list">
                {majorInfo.positions.map((position) => (
                  <span key={position} className="tag">
                    {position}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span>重点行业</span>
              <div className="soe-chip-list">
                {majorInfo.industries.map((industry) => (
                  <span key={industry} className="tag">
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {stats.total === 0 ? (
            <section className="soe-empty">
              <h2>当前筛选下没有匹配企业</h2>
              <p>可以放宽地区、学历或档次筛选，再重新查看机会池。</p>
            </section>
          ) : (
            <div className="soe-results">
              {groupedCompanies.map(({ tier, companies }) =>
                companies.length > 0 ? (
                  <section key={tier} className="soe-tier-section">
                    <div className="soe-tier-heading">
                      <h2>{TIER_LABELS[tier]}</h2>
                      <span>{companies.length} 家</span>
                    </div>
                    <div className="soe-company-grid">
                      {companies.map((company) => (
                        <CompanyCard key={`${company.short}-${company.province}-${company.tier}`} company={company} major={selectedMajor} majorInfo={majorInfo} />
                      ))}
                    </div>
                  </section>
                ) : null
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CompanyCard({
  company,
  major,
  majorInfo,
}: {
  company: StateOwnedCompany;
  major: string;
  majorInfo: MajorInfo;
}) {
  const interview = getInterview(company);
  const positions = getRelevantPositions(company, major, majorInfo);

  return (
    <article className="soe-company-card">
      <div className="soe-card-head">
        <div>
          <h3>{company.name}</h3>
          <p>{company.industry} · {company.province} · {company.eduReq}</p>
        </div>
        <div className="soe-badge-stack">
          <span className={`soe-tier-badge soe-tier-${company.tier}`}>{TIER_LABELS[company.tier]}</span>
          <span className="soe-type-badge">{TYPE_LABELS[company.type]}</span>
        </div>
      </div>

      <div className="soe-chip-list">
        {positions.map((position) => (
          <span key={position} className="tag">
            {position}
          </span>
        ))}
      </div>

      <p className="soe-advice">{company.advice}</p>

      <div className="soe-recruit-meta">
        <span>招聘量：<strong>{company.recruitInfo.total}</strong></span>
        <span>周期：{company.recruitInfo.period}</span>
        <span>阶段：{company.recruitInfo.phase}</span>
      </div>

      {company.recruitInfo.note ? <p className="soe-note">{company.recruitInfo.note}</p> : null}

      <details className="soe-detail">
        <summary>人才画像与岗位要求</summary>
        <ul>
          {company.talentProfile.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>方向：{company.recruitInfo.direction}</p>
      </details>

      <details className="soe-detail">
        <summary>面试与笔试准备</summary>
        {interview ? (
          <div className="soe-interview">
            <p><strong>流程：</strong>{interview.interviewProcess}</p>
            <p><strong>笔试：</strong>{interview.writtenTest}</p>
            <p><strong>形式：</strong>{interview.interviewForm}</p>
            <div className="soe-interview-meta">
              <span className={difficultyClass(interview.difficulty)}>{interview.difficulty}</span>
              <span>{interview.competitionRatio}</span>
            </div>
            <ul>
              {interview.commonQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
            <p className="soe-prep">{interview.preparationTips}</p>
          </div>
        ) : (
          <p className="soe-muted">暂无面经样本，可先按企业官网公告和岗位 JD 准备。</p>
        )}
      </details>
    </article>
  );
}

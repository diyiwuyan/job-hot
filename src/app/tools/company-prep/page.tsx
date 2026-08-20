'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { COMPANY_EXAM_SETS } from '@/lib/company-exam-data';
import { COMPANY_INTERVIEW_QUESTION_COUNT, COMPANY_PREP_PROFILES } from '@/lib/company-prep-data';
import styles from './CompanyPrep.module.css';

type SectorFilter = '全部' | '快消' | '专业服务';

const writtenQuestionCount = COMPANY_EXAM_SETS.reduce((total, set) => total + set.questions.length, 0);

export default function CompanyPrepPage() {
  const [selectedId, setSelectedId] = useState('pg');
  const [sector, setSector] = useState<SectorFilter>('全部');
  const [search, setSearch] = useState('');

  const filteredCompanies = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return COMPANY_PREP_PROFILES.filter((company) => {
      if (sector !== '全部' && company.sector !== sector) return false;
      if (!keyword) return true;
      const text = [company.name, ...company.roles, ...company.writtenFocus, ...company.interviewFocus].join(' ').toLowerCase();
      return text.includes(keyword);
    });
  }, [search, sector]);

  const selected = filteredCompanies.find((company) => company.id === selectedId)
    ?? filteredCompanies[0]
    ?? COMPANY_PREP_PROFILES[0];

  function selectCompany(id: string) {
    setSelectedId(id);
    window.setTimeout(() => document.getElementById('company-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  return <div className={`page ${styles.page}`}>
    <section className={styles.hero}>
      <div><p>JOBHOT COMPANY PREP</p><h1>按企业准备，不再到处翻零散面经</h1><span>先了解流程和考察结构，再练笔试、行为面试与商业案例。企业招聘会随岗位和批次变化，以下内容用于形成准备框架，不冒充内部真题。</span><div><Link href="/tools/exam" className="btn">去企业笔试题库</Link><Link href="/tools/interview" className="btn btn-secondary">去通用面试题库</Link></div></div>
      <aside><div><strong>{COMPANY_EXAM_SETS.length}</strong><span>企业笔试方向</span></div><div><strong>{writtenQuestionCount}</strong><span>企业模拟笔试题</span></div><div><strong>{COMPANY_INTERVIEW_QUESTION_COUNT}</strong><span>企业面试练习</span></div><div><strong>{COMPANY_PREP_PROFILES.length}</strong><span>完整企业档案</span></div></aside>
    </section>

    <section className={styles.filters}>
      <label><span>搜索企业、岗位或能力</span><input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="宝洁、市场、审计、供应链…" /></label>
      <div>{(['全部', '快消', '专业服务'] as SectorFilter[]).map((item) => <button type="button" key={item} data-active={sector === item} onClick={() => setSector(item)}>{item}</button>)}</div>
    </section>

    <div className={styles.workspace}>
      <nav className={styles.companyList} aria-label="企业列表">
        {filteredCompanies.map((company, index) => <button type="button" key={company.id} data-active={company.id === selected.id} onClick={() => selectCompany(company.id)} style={{ '--company-accent': company.accent } as React.CSSProperties}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{company.shortName}</strong><small>{company.sector} · {company.roles.slice(0, 2).join(' / ')}</small></div><i>→</i></button>)}
        {!filteredCompanies.length && <p>没有找到符合条件的企业。</p>}
      </nav>

      {!filteredCompanies.length && <section className={styles.noResult}><strong>暂时没有符合条件的企业档案</strong><p>可以减少搜索词，或者切换到“全部”企业。</p></section>}
      <main id="company-detail" className={styles.detail} hidden={!filteredCompanies.length} style={{ '--company-accent': selected.accent } as React.CSSProperties}>
        <header className={styles.companyHeader}><div><p>{selected.sector.toUpperCase()} COMPANY</p><h2>{selected.name}</h2><div>{selected.roles.map((role) => <span key={role}>{role}</span>)}</div></div><aside><a href={selected.officialUrl} target="_blank" rel="noopener noreferrer">企业招聘官网 ↗</a><a href={selected.experienceUrl} target="_blank" rel="noopener noreferrer">公开面经样本 ↗</a></aside></header>

        <section className={styles.processSection}><div className={styles.sectionHeading}><span>01</span><div><h3>常见招聘流程</h3><p>只用于安排准备顺序，请以个人收到的通知为准。</p></div></div><ol>{selected.process.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol></section>

        <div className={styles.focusGrid}>
          <section><div className={styles.sectionHeading}><span>02</span><div><h3>笔试重点</h3><p>先练能力结构，不背来源不明的题。</p></div></div><div>{selected.writtenFocus.map((focus) => <span key={focus}>{focus}</span>)}</div><Link href="/tools/exam">进入企业方向笔试 →</Link></section>
          <section><div className={styles.sectionHeading}><span>03</span><div><h3>面试重点</h3><p>把每个维度准备成可追问的真实证据。</p></div></div><div>{selected.interviewFocus.map((focus) => <span key={focus}>{focus}</span>)}</div><Link href="/tools/interview">练通用单面方法 →</Link></section>
        </div>

        <section className={styles.questions}><div className={styles.sectionHeading}><span>04</span><div><h3>{selected.shortName}面试练习</h3><p>{selected.questions.length}道原创问题，每题都包含回答结构和继续追问。</p></div></div><div>{selected.questions.map((question, index) => <details key={question.id}><summary><span>{String(index + 1).padStart(2, '0')}</span><div><small>{question.dimension}</small><h4>{question.prompt}</h4></div><i>展开练习</i></summary><div className={styles.questionBody}><section><h5>建议回答结构</h5><ol>{question.framework.map((step) => <li key={step}>{step}</li>)}</ol></section><section><h5>面试官可能继续追问</h5><ul>{question.followups.map((followup) => <li key={followup}>{followup}</li>)}</ul></section><p><strong>练习要求：</strong>准备60秒，回答2—3分钟；只使用真实经历，不要为了套框架编造数据。</p></div></details>)}</div></section>

        <section className={styles.caseSection}><div className={styles.sectionHeading}><span>05</span><div><h3>企业案例练习</h3><p>{selected.casePractice.timebox}</p></div></div><article><span>CASE PRACTICE</span><h4>{selected.casePractice.title}</h4><p>{selected.casePractice.prompt}</p><div><strong>最终交付</strong><p>{selected.casePractice.deliverable}</p></div></article></section>

        <footer className={styles.boundary}><strong>来源与内容边界</strong><p>{selected.sourceNote}</p><p>公开面经只用于归纳可能出现的能力主题和流程形式，不能代表所有候选人，也不能替代当次官方通知。</p></footer>
      </main>
    </div>
  </div>;
}

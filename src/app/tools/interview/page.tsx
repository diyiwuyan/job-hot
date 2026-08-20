'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { GROUP_CASES, INTERVIEW_QUESTIONS, INTERVIEW_SOURCES, type InterviewCategory } from '@/lib/interview-data';
import styles from './Interview.module.css';

type Tab = 'questions' | 'group' | 'method';

const categories: Array<{ value: 'all' | InterviewCategory; label: string }> = [
  { value: 'all', label: '全部题型' },
  { value: 'behavioral', label: '经历深挖' },
  { value: 'product', label: '产品运营' },
  { value: 'technical', label: '技术研发' },
  { value: 'data', label: '数据算法' },
  { value: 'hr', label: '动机与HR' },
];

export default function InterviewPage() {
  const [tab, setTab] = useState<Tab>('questions');
  const [category, setCategory] = useState<'all' | InterviewCategory>('all');
  const [role, setRole] = useState('全部岗位');
  const [company, setCompany] = useState('全部企业');
  const [search, setSearch] = useState('');
  const [randomId, setRandomId] = useState('');

  const roles = useMemo(() => ['全部岗位', ...Array.from(new Set(INTERVIEW_QUESTIONS.flatMap((item) => item.roles))).sort()], []);
  const companies = useMemo(() => ['全部企业', ...Array.from(new Set(INTERVIEW_QUESTIONS.flatMap((item) => item.companies))).sort()], []);
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const list = INTERVIEW_QUESTIONS.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (role !== '全部岗位' && !item.roles.includes(role) && !item.roles.includes('通用')) return false;
      if (company !== '全部企业' && !item.companies.includes(company) && !item.companies.includes('通用')) return false;
      if (keyword && !`${item.question} ${item.intent} ${item.roles.join(' ')} ${item.companies.join(' ')}`.toLowerCase().includes(keyword)) return false;
      return true;
    });
    if (!randomId) return list;
    return [...list].sort((a, b) => (a.id === randomId ? -1 : b.id === randomId ? 1 : 0));
  }, [category, company, randomId, role, search]);

  function pickRandom() {
    const pool = filtered.length ? filtered : INTERVIEW_QUESTIONS;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    if (!selected) return;
    setRandomId(selected.id);
    window.setTimeout(() => {
      const card = document.getElementById(`question-${selected.id}`) as HTMLDetailsElement | null;
      if (!card) return;
      card.open = true;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  return (
    <div className={`page ${styles.page}`}>
      <section className={styles.hero}>
        <div>
          <p>JOBHOT INTERVIEW LAB</p>
          <h1>面试题库与无领导小组</h1>
          <span>不是背“标准答案”，而是练习听懂考察意图、组织真实证据，并在追问中保持一致。</span>
          <div className={styles.heroActions}><button type="button" className="btn" onClick={() => { setTab('questions'); window.setTimeout(pickRandom, 0); }}>随机抽一道题</button><Link href="/tools/company-prep" className="btn btn-secondary">按企业准备</Link><Link href="/tools/exam" className="btn btn-secondary">去笔试题库</Link></div>
        </div>
        <div className={styles.heroStats}><div><strong>{INTERVIEW_QUESTIONS.length}</strong><span>原创单面题</span></div><div><strong>{GROUP_CASES.length}</strong><span>群面案例</span></div><div><strong>5</strong><span>岗位题型</span></div></div>
      </section>

      <nav className={styles.tabs} aria-label="面试题库分区">
        <button type="button" data-active={tab === 'questions'} onClick={() => setTab('questions')}>单面题库</button>
        <button type="button" data-active={tab === 'group'} onClick={() => setTab('group')}>无领导小组</button>
        <button type="button" data-active={tab === 'method'} onClick={() => setTab('method')}>作答方法</button>
      </nav>

      {tab === 'questions' && <>
        <section className={styles.filters}>
          <div className={styles.categoryPills}>{categories.map((item) => <button type="button" key={item.value} data-active={category === item.value} onClick={() => { setCategory(item.value); setRandomId(''); }}>{item.label}<span>{item.value === 'all' ? INTERVIEW_QUESTIONS.length : INTERVIEW_QUESTIONS.filter((question) => question.category === item.value).length}</span></button>)}</div>
          <div className={styles.filterRow}>
            <label><span>岗位方向</span><select className="field" value={role} onChange={(event) => setRole(event.target.value)}>{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>企业方向</span><select className="field" value={company} onChange={(event) => setCompany(event.target.value)}>{companies.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className={styles.search}><span>搜索题目</span><input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="项目、留存、Redis、职业规划…" /></label>
            <button type="button" className="btn btn-secondary" onClick={pickRandom}>随机抽题</button>
          </div>
          <p>找到 {filtered.length} 道题。企业筛选表示公开面经中常见的考察方向，不代表该企业固定题目。</p>
        </section>

        <section className={styles.questionList}>
          {filtered.map((item, index) => <details id={`question-${item.id}`} key={item.id} className={styles.questionCard}>
            <summary>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><div><em>{item.categoryLabel}</em><b data-level={item.difficulty}>{item.difficulty}</b></div><h2>{item.question}</h2><small>{item.roles.join(' · ')}　|　{item.companies.join(' · ')}</small></div>
              <i>展开练习</i>
            </summary>
            <div className={styles.questionBody}>
              <section><h3>面试官在听什么</h3><p>{item.intent}</p></section>
              <section><h3>建议组织框架</h3><ol>{item.framework.map((step) => <li key={step}>{step}</li>)}</ol></section>
              <section><h3>继续追问</h3><div className={styles.followups}>{item.followups.map((followup) => <span key={followup}>{followup}</span>)}</div></section>
              <div className={styles.practicePrompt}><strong>练习要求</strong><span>准备60秒，回答2分钟；回答后检查是否有“我的行动、事实证据、结果和复盘”。</span></div>
            </div>
          </details>)}
          {!filtered.length && <div className={styles.empty}>没有符合当前筛选的题目，请减少筛选条件。</div>}
        </section>
      </>}

      {tab === 'group' && <>
        <section className={styles.groupIntro}><div><p>LEADERLESS GROUP DISCUSSION</p><h2>群面不是“抢Leader”比赛</h2><span>面试官观察的是你如何帮助团队理解问题、处理分歧并按时交付共同结果。教育部公开指导显示，常见形式为6–8人限时讨论，由小组代表汇报一致结论。</span></div><div>{['主动贡献', '逻辑分析', '沟通倾听', '团队协作', '结果推进'].map((item) => <span key={item}>{item}</span>)}</div></section>
        <section className={styles.caseGrid}>{GROUP_CASES.map((item, index) => <details key={item.id} className={styles.caseCard}>
          <summary><div><span>CASE {String(index + 1).padStart(2, '0')} · {item.type}</span><h2>{item.title}</h2><p>{item.duration} · {item.groupSize} · {item.roles.join(' / ')}</p></div><i>开始案例 →</i></summary>
          <div className={styles.caseBody}><section><h3>案例材料</h3><p>{item.prompt}</p></section><section><h3>最终交付</h3><p>{item.deliverable}</p></section><section><h3>建议时间线</h3><ol>{item.process.map((step) => <li key={step}>{step}</li>)}</ol></section><section><h3>观察维度</h3><div className={styles.caseTags}>{item.dimensions.map((dimension) => <span key={dimension}>{dimension}</span>)}</div></section><section><h3>复盘提示</h3><ul>{item.observerNotes.map((note) => <li key={note}>{note}</li>)}</ul></section></div>
        </details>)}</section>
      </>}

      {tab === 'method' && <section className={styles.methodPage}>
        <article><span>01 · 单面</span><h2>先理解问题，再选择证据</h2><ol><li><strong>确认意图</strong><p>这是在问动机、能力、事实，还是价值判断？</p></li><li><strong>先给结论</strong><p>用一句话回答，不要让面试官等三分钟才知道重点。</p></li><li><strong>提供证据</strong><p>优先讲自己的任务、判断、行动和结果，而不是团队流水账。</p></li><li><strong>主动复盘</strong><p>说明局限、取舍和下一次会改变什么。</p></li></ol></article>
        <article><span>02 · 群面</span><h2>让自己的贡献可被观察</h2><ol><li><strong>建立标准</strong><p>先定义目标、约束和评价标准，再争论具体选项。</p></li><li><strong>基于他人推进</strong><p>先准确复述对方观点，再补充、合并或提出证据。</p></li><li><strong>管理过程</strong><p>关注时间、分歧和最终交付，但不要为了角色压制团队。</p></li><li><strong>帮助形成结果</strong><p>总结共识、未决点与行动，让团队按时完成任务。</p></li></ol></article>
        <article className={styles.badAnswers}><span>03 · 避免</span><h2>四类常见失分表现</h2><div><p><b>空泛：</b>“我沟通能力很好”，却没有具体行为。</p><p><b>越权：</b>把团队结果全部说成自己的贡献。</p><p><b>编造：</b>为了好看临时创造指标，追问后无法自洽。</p><p><b>抢戏：</b>群面发言最多，却没有帮助团队产出结果。</p></div></article>
      </section>}

      <section className={styles.sources}>
        <div><h2>题库依据与内容边界</h2><p>本站根据公开招聘流程、职业指导资料和求职者公开面经归纳考察主题，并重新编写练习题、案例与解析。不会声称掌握企业内部题库，也不替代当次官方通知。</p></div>
        <div>{INTERVIEW_SOURCES.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span>↗</span></a>)}</div>
      </section>
    </div>
  );
}

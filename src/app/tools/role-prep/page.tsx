import Link from 'next/link';
import { PREP_EVIDENCE, ROLE_PREP_PROFILES, sourceKindLabel } from '@/lib/role-prep-data';
import styles from './RolePrep.module.css';

export default function RolePrepPage() {
  const officialCount = PREP_EVIDENCE.filter(item => item.kind.startsWith('official')).length;
  const experienceCount = PREP_EVIDENCE.length - officialCount;

  return (
    <div className={`page ${styles.page}`}>
      <section className={styles.hero}>
        <div>
          <p>ROLE-SPECIFIC PREP</p>
          <h1>先按岗位准备，再叠加企业差异</h1>
          <span>同一家企业的数据分析、后端和产品岗考察完全不同。这里用官方 JD 确定岗位需要什么，用公开面经核对历年实际出现过哪些方向；不把本站原创练习包装成企业真题。</span>
        </div>
        <aside>
          <div><strong>{ROLE_PREP_PROFILES.length}</strong><span>校招岗位方向</span></div>
          <div><strong>{PREP_EVIDENCE.length}</strong><span>可点击来源记录</span></div>
          <div><strong>{officialCount}</strong><span>官方 JD / 流程</span></div>
          <div><strong>{experienceCount}</strong><span>求职者公开记录</span></div>
        </aside>
      </section>

      <section className={styles.sourceRule} aria-label="来源规则">
        <div><strong>A · 官方岗位与流程</strong><span>用于判断当前招聘方向、JD 能力要求和官方明确的测评边界。</span></div>
        <div><strong>B · 公开面经</strong><span>用于观察某一批次、部门和岗位实际出现过的考察主题，不推断为固定题库。</span></div>
        <div><strong>C · 本站练习</strong><span>只用于训练通用或岗位能力，必须标注“原创练习”，不进入历年真题统计。</span></div>
      </section>

      <div className={styles.layout}>
        <nav className={styles.nav} aria-label="岗位方向导航">
          {ROLE_PREP_PROFILES.map(profile => <a href={`#${profile.id}`} key={profile.id}>{profile.shortName}<span>{profile.evidenceIds.length} 条来源</span></a>)}
        </nav>

        <main className={styles.content}>
          {ROLE_PREP_PROFILES.map((profile, index) => {
            const evidence = profile.evidenceIds.map(id => PREP_EVIDENCE.find(item => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
            return (
              <article className={styles.role} id={profile.id} key={profile.id}>
                <header className={styles.roleHead}>
                  <div><p>PATH {String(index + 1).padStart(2, '0')}</p><h2>{profile.name}</h2><span>{profile.description}</span></div>
                  <Link href="/tools/exam" className="btn btn-secondary">去做基础练习</Link>
                </header>

                <div className={styles.focus}>
                  <section><h3>JD 常见要求</h3><ul>{profile.jdSignals.map(item => <li key={item}>{item}</li>)}</ul></section>
                  <section><h3>笔试准备</h3><ul>{profile.writtenFocus.map(item => <li key={item}>{item}</li>)}</ul></section>
                  <section><h3>面试准备</h3><ul>{profile.interviewFocus.map(item => <li key={item}>{item}</li>)}</ul></section>
                </div>

                <div className={styles.evidenceTitle}><h3>已核验的招聘与笔面经依据</h3><span>点击可回到原始页面</span></div>
                <div className={styles.evidenceList}>
                  {evidence.map(item => <article className={styles.evidence} key={item.id}>
                    <div><em>{sourceKindLabel(item.kind)}</em><b>{item.company}</b><b>{item.period}</b></div>
                    <h4>{item.title}</h4><p>{item.summary}</p>
                    <div className={styles.topics}>{item.topics.map(topic => <span key={topic}>{topic}</span>)}</div>
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">查看{item.sourceName}原文 ↗</a>
                  </article>)}
                </div>
              </article>
            );
          })}
          <div className={styles.footerNote}>重要说明：公开面经是个人在特定时间、部门和岗位下的经历，只能证明“曾有求职者报告过”，不能证明下一批次必考。题目版权归原发布者或平台；JOBHOT 仅提供主题级摘要和原文链接，不整篇搬运。</div>
        </main>
      </div>
    </div>
  );
}

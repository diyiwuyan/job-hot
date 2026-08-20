import Link from 'next/link';
import type { FeedItem } from '@/lib/types';
import { evidenceForRole, matchCompanyName, matchRoleProfiles, sourceKindLabel } from '@/lib/role-prep-data';
import styles from './JobPrepPanel.module.css';

export function JobPrepPanel({ item }: { item: FeedItem }) {
  const searchableText = [item.title, item.summary, item.source, ...item.tags].join(' ');
  const roles = matchRoleProfiles(searchableText);
  const company = matchCompanyName(searchableText);
  const evidence = roles.flatMap(role => evidenceForRole(role, company)).filter((record, index, list) => list.findIndex(item => item.id === record.id) === index).slice(0, 3);

  return (
    <section className={styles.panel} aria-label="岗位备战资料">
      <header className={styles.head}>
        <div><p>JOB → PREP</p><h2>这条岗位怎么准备</h2><span>{company ? `已识别企业：${company}。` : ''}根据岗位名称、摘要和标签匹配准备方向，再用公开来源核对企业差异。</span></div>
        <Link href="/tools/role-prep" className="btn btn-secondary">查看全部岗位方向</Link>
      </header>

      {roles.length ? (
        <div className={styles.roles}>{roles.map(role => <a key={role.id} href={`/tools/role-prep#${role.id}`}>{role.name}</a>)}</div>
      ) : (
        <div className={styles.empty}>这条招聘信息没有足够清晰的岗位关键词，暂不自动推断专业题型。建议先打开原岗位 JD，再从岗位专项备战页手动选择方向。</div>
      )}

      {evidence.length > 0 && <div className={styles.sources}>
        {evidence.map(record => <article className={styles.source} key={record.id}>
          <div><em>{sourceKindLabel(record.kind)}</em><b>{record.company}</b><b>{record.period}</b></div>
          <h3>{record.title}</h3><p>{record.summary}</p>
          <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer">查看原始来源 ↗</a>
        </article>)}
      </div>}

      <div className={styles.actions}>
        <Link href="/tools/exam" className="btn btn-secondary">通用笔试练习</Link>
        <Link href="/tools/interview" className="btn btn-secondary">岗位面试练习</Link>
        {company && <Link href="/tools/company-prep" className="btn btn-secondary">企业流程与案例</Link>}
      </div>
      <p className={styles.note}>来源边界：官方页面用于确认 JD 与招聘流程；公开面经只代表特定候选人在特定批次的个人记录，不保证本批次复现。</p>
    </section>
  );
}

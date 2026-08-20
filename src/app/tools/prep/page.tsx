import type { Metadata } from 'next';
import Link from 'next/link';
import { EXAM_SETS } from '@/lib/exam-data';
import { COMPANY_EXAM_SETS } from '@/lib/company-exam-data';
import { GROUP_CASES, INTERVIEW_QUESTIONS } from '@/lib/interview-data';
import { COMPANY_INTERVIEW_QUESTION_COUNT, COMPANY_PREP_PROFILES } from '@/lib/company-prep-data';
import { PREP_EVIDENCE, ROLE_PREP_PROFILES } from '@/lib/role-prep-data';
import styles from './Prep.module.css';

export const metadata: Metadata = {
  title: '求职准备中心 - JOBHOT',
  description: '从简历、笔试到单面和无领导小组，按真实招聘流程完成大学生求职准备。',
};

const writtenCount = [...EXAM_SETS, ...COMPANY_EXAM_SETS].reduce((total, item) => total + item.questions.length, 0);

export default function PrepPage() {
  return <div className={`page ${styles.page}`}>
    <section className={styles.hero}><div><span>JOB SEARCH PREPARATION</span><h1>求职准备中心</h1><p>不要泛泛地“准备面试”。先按岗位建立能力底盘，再根据目标企业和当前招聘环节叠加准备。</p></div><div className={styles.path}><span>岗位</span><i>→</i><span>企业</span><i>→</i><span>笔试</span><i>→</i><span>面试</span></div></section>
    <section className={styles.grid}>
      <Link href="/tools/role-prep" className={styles.card}><span className={styles.number}>01</span><div><small>ROLE PREP</small><h2>岗位专项备战</h2><p>按数据分析、产品、后端、AI Agent 等岗位查看 JD 要求、笔试重点和历年公开面经。</p><strong>选择岗位方向 →</strong></div><ul><li>{ROLE_PREP_PROFILES.length}个岗位方向</li><li>{PREP_EVIDENCE.length}条可追溯来源</li><li>官方 JD + 公开面经</li></ul></Link>
      <Link href="/tools/company-prep" className={styles.card}><span className={styles.number}>02</span><div><small>COMPANY PREP</small><h2>企业备战库</h2><p>按企业查看官方招聘流程、考察重点、原创行为练习和商业案例。</p><strong>选择目标企业 →</strong></div><ul><li>{COMPANY_PREP_PROFILES.length}份完整档案</li><li>{COMPANY_INTERVIEW_QUESTION_COUNT}道原创练习</li><li>官网与面经依据</li></ul></Link>
      <Link href="/workspace" className={styles.card}><span className={styles.number}>03</span><div><small>RESUME</small><h2>简历诊断与岗位版本</h2><p>选择简历和目标岗位，诊断证据缺口，补充真实信息后生成岗位定向内容。</p><strong>进入我的工作台 →</strong></div><ul><li>五维诊断</li><li>证据补充</li><li>版本管理</li></ul></Link>
      <Link href="/tools/exam" className={styles.card}><span className={styles.number}>04</span><div><small>WRITTEN TEST</small><h2>笔试题库</h2><p>通用能力和按企业公开测评框架改写的能力练习，支持答题、解析、计时和成绩保存。</p><strong>开始笔试训练 →</strong></div><ul><li>{EXAM_SETS.length + COMPANY_EXAM_SETS.length}套练习</li><li>{writtenCount}道原创训练题</li><li>不冒充企业原题</li></ul></Link>
      <Link href="/tools/interview" className={styles.card}><span className={styles.number}>05</span><div><small>INTERVIEW</small><h2>单面题库</h2><p>按岗位能力筛选原创练习，理解考察意图、回答框架和可能的继续追问。</p><strong>抽一道面试题 →</strong></div><ul><li>{INTERVIEW_QUESTIONS.length}道原创练习</li><li>5类题型</li><li>岗位筛选</li></ul></Link>
      <Link href="/tools/interview" className={styles.card}><span className={styles.number}>06</span><div><small>GROUP INTERVIEW</small><h2>无领导小组案例</h2><p>覆盖资源排序、危机处理、商业策划、优先级决策和公共服务等原创情境。</p><strong>选择群面案例 →</strong></div><ul><li>{GROUP_CASES.length}个原创案例</li><li>时间线</li><li>观察维度</li></ul></Link>
    </section>
    <section className={styles.guide}><div><span>怎么使用</span><h2>每次只练一个可改进点</h2></div><ol><li><strong>选环节</strong><p>以最近一次真实招聘安排为准。</p></li><li><strong>限时作答</strong><p>模拟真实压力，不边搜边答。</p></li><li><strong>对照框架</strong><p>检查证据、逻辑、取舍和结果。</p></li><li><strong>记录下一步</strong><p>回到工作台保存练习复盘。</p></li></ol></section>
    <p className={styles.note}>官方 JD 与招聘流程、求职者公开面经、本站原创练习分层展示。公开面经不等于固定题库，原创练习不标为企业真题，最终以当次官方通知为准。</p>
  </div>;
}

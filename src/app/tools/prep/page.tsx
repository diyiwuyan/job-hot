import type { Metadata } from 'next';
import Link from 'next/link';
import { EXAM_SETS } from '@/lib/exam-data';
import { COMPANY_EXAM_SETS } from '@/lib/company-exam-data';
import { GROUP_CASES, INTERVIEW_QUESTIONS } from '@/lib/interview-data';
import styles from './Prep.module.css';

export const metadata: Metadata = {
  title: '求职准备中心 - JOBHOT',
  description: '从简历、笔试到单面和无领导小组，按真实招聘流程完成大学生求职准备。',
};

const writtenCount = [...EXAM_SETS, ...COMPANY_EXAM_SETS].reduce((total, item) => total + item.questions.length, 0);

export default function PrepPage() {
  return <div className={`page ${styles.page}`}>
    <section className={styles.hero}><div><span>JOB SEARCH PREPARATION</span><h1>求职准备中心</h1><p>不要泛泛地“准备面试”。先确定当前招聘环节，再完成一次有结果、有复盘的训练。</p></div><div className={styles.path}><span>简历</span><i>→</i><span>笔试</span><i>→</i><span>单面</span><i>→</i><span>群面</span></div></section>
    <section className={styles.grid}>
      <Link href="/workspace" className={styles.card}><span className={styles.number}>01</span><div><small>RESUME</small><h2>简历诊断与岗位版本</h2><p>选择简历和目标岗位，诊断证据缺口，补充真实信息后生成岗位定向内容。</p><strong>进入我的工作台 →</strong></div><ul><li>五维诊断</li><li>证据补充</li><li>版本管理</li></ul></Link>
      <Link href="/tools/exam" className={styles.card}><span className={styles.number}>02</span><div><small>WRITTEN TEST</small><h2>笔试题库</h2><p>通用能力题和企业方向原创模拟，支持做题、背题、解析、计时与成绩保存。</p><strong>开始笔试训练 →</strong></div><ul><li>{EXAM_SETS.length + COMPANY_EXAM_SETS.length}套题库</li><li>{writtenCount}道题</li><li>{COMPANY_EXAM_SETS.length}个企业方向</li></ul></Link>
      <Link href="/tools/interview" className={styles.card}><span className={styles.number}>03</span><div><small>INTERVIEW</small><h2>单面题库</h2><p>按岗位和企业方向筛选，理解考察意图、回答框架和可能的继续追问。</p><strong>抽一道面试题 →</strong></div><ul><li>{INTERVIEW_QUESTIONS.length}道原创题</li><li>5类题型</li><li>岗位筛选</li></ul></Link>
      <Link href="/tools/interview" className={styles.card}><span className={styles.number}>04</span><div><small>GROUP INTERVIEW</small><h2>无领导小组案例</h2><p>覆盖资源排序、危机处理、商业策划、优先级决策和公共服务等情境。</p><strong>选择群面案例 →</strong></div><ul><li>{GROUP_CASES.length}个完整案例</li><li>时间线</li><li>观察维度</li></ul></Link>
    </section>
    <section className={styles.guide}><div><span>怎么使用</span><h2>每次只练一个可改进点</h2></div><ol><li><strong>选环节</strong><p>以最近一次真实招聘安排为准。</p></li><li><strong>限时作答</strong><p>模拟真实压力，不边搜边答。</p></li><li><strong>对照框架</strong><p>检查证据、逻辑、取舍和结果。</p></li><li><strong>记录下一步</strong><p>回到工作台保存练习复盘。</p></li></ol></section>
    <p className={styles.note}>企业方向题库根据官网公开流程和公开求职经验归纳并原创编写，不是企业内部题库。岗位和题型会随招聘批次变化，请以当次官方通知为准。</p>
  </div>;
}

'use client';

import { Children, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/lib/supabase';
import styles from './UserInsights.module.css';

interface AccountUser {
  user_id: string;
  email: string;
  nickname?: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  page_view_count: number;
  last_active_at: string | null;
}

interface AssessmentRow { user_id: string; assessment_id: string; result_name: string; updated_at: string }
interface ExamRow { user_id: string; exam_id: string; score: number; total: number; created_at: string }
interface ApplicationRow { user_id: string; company: string; job_title: string; status: string; updated_at: string }
interface DocumentRow { user_id: string; kind: string; name: string; size_bytes: number; updated_at: string }
interface PracticeRow { user_id: string; kind: string; title: string; score: number | null; max_score: number | null; practiced_at: string; updated_at: string }
interface ActivityRow { user_id: string; event_type: string; event_target: string | null; path: string; created_at: string }

interface UserDetail {
  assessments: AssessmentRow[];
  exams: ExamRow[];
  applications: ApplicationRow[];
  documents: DocumentRow[];
  practices: PracticeRow[];
  activities: ActivityRow[];
}

type ActivityFilter = 'all' | 'active' | 'profile' | 'workspace';

const emptyDetail = (): UserDetail => ({
  assessments: [],
  exams: [],
  applications: [],
  documents: [],
  practices: [],
  activities: [],
});

const assessmentNames: Record<string, string> = {
  holland: '霍兰德职业兴趣',
  values: '职业价值观',
  'work-style': '职业工作风格',
  'skills-map': '通用技能画像',
  employability: '就业胜任力',
  'job-readiness': '求职行动准备度',
  'caas-sf': '职业适应力',
  cddq: '职业决策障碍',
};

const applicationStatus: Record<string, string> = {
  saved: '已收藏', preparing: '准备中', applied: '已投递', assessment: '笔试中',
  interview: '面试中', offer: '已获 Offer', closed: '已结束',
};

function displayName(user: AccountUser) {
  return user.nickname?.trim() || user.email.split('@')[0] || '未命名用户';
}

function fmtDate(value: string | null) {
  if (!value) return '暂无';
  return new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function percent(numerator: number, denominator: number) {
  return denominator ? Math.round((numerator / denominator) * 100) : 0;
}

export default function UserInsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [details, setDetails] = useState<Record<string, UserDetail>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partialAccess, setPartialAccess] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [sevenDaysAgo] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000);

  const fetchData = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    setLoading(true);
    setError('');
    setPartialAccess(false);

    const { data: accountData, error: accountError } = await supabase.rpc('admin_list_users_safe');
    if (accountError) {
      setError(`用户档案加载失败：${accountError.message}`);
      setLoading(false);
      return;
    }

    const accountRows = (accountData ?? []) as AccountUser[];
    const nextDetails = Object.fromEntries(accountRows.map(item => [item.user_id, emptyDetail()]));

    const [assessmentRes, examRes, applicationRes, documentRes, practiceRes, activityRes] = await Promise.all([
      supabase.from('assessment_results').select('user_id,assessment_id,result_name,updated_at').order('updated_at', { ascending: false }).limit(5000),
      supabase.from('exam_results').select('user_id,exam_id,score,total,created_at').order('created_at', { ascending: false }).limit(5000),
      supabase.from('job_applications').select('user_id,company,job_title,status,updated_at').order('updated_at', { ascending: false }).limit(5000),
      supabase.from('career_documents').select('user_id,kind,name,size_bytes,updated_at').order('updated_at', { ascending: false }).limit(5000),
      supabase.from('practice_records').select('user_id,kind,title,score,max_score,practiced_at,updated_at').order('updated_at', { ascending: false }).limit(5000),
      supabase.from('analytics_events').select('user_id,event_type,event_target,path,created_at').not('user_id', 'is', null).order('created_at', { ascending: false }).limit(3000),
    ]);

    const results = [assessmentRes, examRes, applicationRes, documentRes, practiceRes, activityRes];
    setPartialAccess(results.some(result => Boolean(result.error)));

    ((assessmentRes.data ?? []) as AssessmentRow[]).forEach(row => nextDetails[row.user_id]?.assessments.push(row));
    ((examRes.data ?? []) as ExamRow[]).forEach(row => nextDetails[row.user_id]?.exams.push(row));
    ((applicationRes.data ?? []) as ApplicationRow[]).forEach(row => nextDetails[row.user_id]?.applications.push(row));
    ((documentRes.data ?? []) as DocumentRow[]).forEach(row => nextDetails[row.user_id]?.documents.push(row));
    ((practiceRes.data ?? []) as PracticeRow[]).forEach(row => nextDetails[row.user_id]?.practices.push(row));
    ((activityRes.data ?? []) as ActivityRow[]).forEach(row => nextDetails[row.user_id]?.activities.push(row));

    setUsers(accountRows);
    setDetails(nextDetails);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (adminLoading || !isAdmin) return;
    const timer = window.setTimeout(() => void fetchData(), 0);
    return () => window.clearTimeout(timer);
  }, [adminLoading, fetchData, isAdmin]);

  const activeUsers = users.filter(item => item.last_active_at && new Date(item.last_active_at).getTime() >= sevenDaysAgo).length;
  const profiledUsers = users.filter(item => (details[item.user_id]?.assessments.length ?? 0) > 0).length;
  const workspaceUsers = users.filter(item => {
    const detail = details[item.user_id];
    return detail && detail.applications.length + detail.documents.length + detail.practices.length > 0;
  }).length;

  const filteredUsers = useMemo(() => users.filter(item => {
    const detail = details[item.user_id] ?? emptyDetail();
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || item.email.toLowerCase().includes(keyword) || displayName(item).toLowerCase().includes(keyword);
    if (!matchesSearch) return false;
    if (filter === 'active') return Boolean(item.last_active_at && new Date(item.last_active_at).getTime() >= sevenDaysAgo);
    if (filter === 'profile') return detail.assessments.length > 0;
    if (filter === 'workspace') return detail.applications.length + detail.documents.length + detail.practices.length > 0;
    return true;
  }), [details, filter, search, sevenDaysAgo, users]);

  if (authLoading || adminLoading) return <div className="page admin-page"><div className="admin-loading">验证权限中...</div></div>;
  if (!user || !isAdmin) {
    return <div className="page admin-page"><div className="admin-auth-guard"><h2>权限不足</h2><p>需要管理员权限才能访问用户档案。</p><Link href="/login" className="btn">去登录</Link></div></div>;
  }

  return (
    <div className={`page admin-page ${styles.page}`}>
      <header className={styles.intro}>
        <div>
          <h1>用户档案与使用情况</h1>
          <p>以账号为主线查看职业测评、材料准备、投递与练习进度。这里只展示运营和辅导所需的记录摘要，不直接开放用户的私有简历原文件。</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={fetchData} disabled={loading}>{loading ? '加载中...' : '刷新数据'}</button>
      </header>

      {error && <div className="admin-msg admin-msg-error">{error}</div>}
      {partialAccess && <div className={styles.notice}>部分求职档案数据尚未向管理员开放，当前仍可查看账号和基础使用情况。应用配套的管理员只读权限后，这里会自动补齐测评、投递、材料与练习记录。</div>}

      <section className={styles.stats} aria-label="用户使用概览">
        <div className={styles.stat}><span>注册用户</span><strong>{users.length}</strong></div>
        <div className={styles.stat}><span>近 7 日活跃</span><strong>{activeUsers}</strong></div>
        <div className={styles.stat}><span>完成过测评</span><strong>{percent(profiledUsers, users.length)}%</strong></div>
        <div className={styles.stat}><span>使用过工作台</span><strong>{percent(workspaceUsers, users.length)}%</strong></div>
      </section>

      <section className={styles.toolbar}>
        <input className="field" type="search" placeholder="搜索昵称或邮箱" value={search} onChange={event => setSearch(event.target.value)} />
        <select className="field" value={filter} onChange={event => setFilter(event.target.value as ActivityFilter)} aria-label="筛选用户">
          <option value="all">全部用户</option>
          <option value="active">近 7 日活跃</option>
          <option value="profile">完成过测评</option>
          <option value="workspace">使用过工作台</option>
        </select>
      </section>

      <section className={styles.list} aria-label="用户档案列表">
        {loading ? <div className={styles.empty}>正在整理用户档案...</div> : filteredUsers.length === 0 ? <div className={styles.empty}>没有符合条件的用户</div> : filteredUsers.map(item => {
          const detail = details[item.user_id] ?? emptyDetail();
          const expanded = expandedUserId === item.user_id;
          return (
            <article className={styles.userCard} key={item.user_id}>
              <div className={styles.userSummary}>
                <div className={styles.identity}><strong>{displayName(item)}</strong><span title={item.email}>{item.email} · 最近活跃 {fmtDate(item.last_active_at)}</span></div>
                <div className={styles.metric}><strong>{detail.assessments.length}</strong><span>测评</span></div>
                <div className={styles.metric}><strong>{detail.applications.length}</strong><span>投递</span></div>
                <div className={`${styles.metric} ${styles.mobileHidden}`}><strong>{detail.documents.length}</strong><span>材料</span></div>
                <div className={`${styles.metric} ${styles.optionalMetric}`}><strong>{detail.exams.length}</strong><span>笔试</span></div>
                <div className={`${styles.metric} ${styles.optionalMetric}`}><strong>{detail.practices.length}</strong><span>练习</span></div>
                <button type="button" className="btn btn-secondary" onClick={() => setExpandedUserId(expanded ? null : item.user_id)} aria-expanded={expanded}>{expanded ? '收起' : '查看档案'}</button>
              </div>

              {expanded && (
                <div className={styles.detail}>
                  <div className={styles.journey} aria-label="求职闭环进度">
                    <div className={`${styles.journeyStep} ${styles.journeyDone}`}>1. 已注册</div>
                    <div className={`${styles.journeyStep} ${detail.assessments.length ? styles.journeyDone : ''}`}>2. 职业测评</div>
                    <div className={`${styles.journeyStep} ${detail.documents.length ? styles.journeyDone : ''}`}>3. 材料准备</div>
                    <div className={`${styles.journeyStep} ${detail.applications.length ? styles.journeyDone : ''}`}>4. 岗位投递</div>
                    <div className={`${styles.journeyStep} ${detail.exams.length + detail.practices.length ? styles.journeyDone : ''}`}>5. 笔面练习</div>
                  </div>

                  <DetailSection title="职业测评与综合画像" empty="还没有完成测评">
                    {detail.assessments.slice(0, 8).map(row => <li key={`${row.assessment_id}-${row.updated_at}`}><span>{assessmentNames[row.assessment_id] ?? row.assessment_id} · {row.result_name}</span><time>{fmtDate(row.updated_at)}</time></li>)}
                  </DetailSection>
                  <DetailSection title="投递进展" empty="还没有记录投递">
                    {detail.applications.slice(0, 8).map(row => <li key={`${row.company}-${row.job_title}-${row.updated_at}`}><span>{row.company} · {row.job_title}</span><span>{applicationStatus[row.status] ?? row.status}</span></li>)}
                  </DetailSection>
                  <DetailSection title="求职材料" empty="还没有上传材料">
                    {detail.documents.slice(0, 8).map(row => <li key={`${row.name}-${row.updated_at}`}><span>{row.name}</span><span>{row.kind} · {Math.max(1, Math.round(row.size_bytes / 1024))} KB</span></li>)}
                  </DetailSection>
                  <DetailSection title="笔试与面试练习" empty="还没有练习记录">
                    {detail.exams.slice(0, 4).map(row => <li key={`${row.exam_id}-${row.created_at}`}><span>笔试：{row.exam_id}</span><span>{row.score}/{row.total}</span></li>)}
                    {detail.practices.slice(0, 4).map(row => <li key={`${row.title}-${row.updated_at}`}><span>{row.title}</span><span>{row.score == null ? row.kind : `${row.score}/${row.max_score ?? '-'}`}</span></li>)}
                  </DetailSection>
                  <DetailSection title="最近使用动作" empty="暂无可识别的使用动作">
                    {detail.activities.slice(0, 8).map(row => <li key={`${row.created_at}-${row.event_type}-${row.path}`}><span>{row.event_target || row.event_type} · {row.path}</span><time>{fmtDate(row.created_at)}</time></li>)}
                  </DetailSection>
                  <DetailSection title="账号信息" empty="">
                    <li><span>注册时间</span><time>{fmtDate(item.created_at)}</time></li>
                    <li><span>最后登录</span><time>{fmtDate(item.last_sign_in_at)}</time></li>
                    <li><span>累计页面访问</span><span>{item.page_view_count} 次</span></li>
                  </DetailSection>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}

function DetailSection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const childCount = Children.count(children);
  return (
    <section className={styles.detailSection}>
      <h3>{title}</h3>
      {childCount ? <ul className={styles.detailList}>{children}</ul> : <div className={styles.empty}>{empty}</div>}
    </section>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { ResumeOptimizer } from '@/components/ResumeOptimizer';
import { supabase } from '@/lib/supabase';
import { EXAM_SETS } from '@/lib/exam-data';
import { COMPANY_EXAM_SETS } from '@/lib/company-exam-data';
import styles from './Workspace.module.css';

type WorkspaceTab = 'overview' | 'applications' | 'documents' | 'resume' | 'practice';
type ApplicationStatus = 'saved' | 'preparing' | 'applied' | 'assessment' | 'interview' | 'offer' | 'closed';
type DocumentKind = 'resume' | 'portfolio' | 'certificate' | 'other';
type PracticeKind = 'written' | 'interview' | 'group' | 'case' | 'technical' | 'other';

type JobApplication = {
  id: string;
  company: string;
  job_title: string;
  source_url: string | null;
  status: ApplicationStatus;
  deadline: string | null;
  next_action: string | null;
  next_action_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CareerDocument = {
  id: string;
  kind: DocumentKind;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number;
  created_at: string;
  updated_at: string;
};

type PracticeRecord = {
  id: string;
  kind: PracticeKind;
  title: string;
  score: number | null;
  max_score: number | null;
  duration_minutes: number | null;
  practiced_at: string;
  notes: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
};

type ExamResult = {
  id: string;
  exam_id: string;
  score: number;
  total: number;
  duration_seconds: number | null;
  created_at: string;
};

type Notice = { tone: 'success' | 'error'; text: string } | null;

const APPLICATION_STATUSES: Array<{ value: ApplicationStatus; label: string; short: string }> = [
  { value: 'saved', label: '感兴趣', short: '收藏' },
  { value: 'preparing', label: '准备投递', short: '准备' },
  { value: 'applied', label: '已投递', short: '投递' },
  { value: 'assessment', label: '笔试测评', short: '笔试' },
  { value: 'interview', label: '面试中', short: '面试' },
  { value: 'offer', label: '已获 Offer', short: 'Offer' },
  { value: 'closed', label: '已结束', short: '结束' },
];

const DOCUMENT_KINDS: Array<{ value: DocumentKind; label: string }> = [
  { value: 'resume', label: '简历' },
  { value: 'portfolio', label: '作品集' },
  { value: 'certificate', label: '证书/成绩单' },
  { value: 'other', label: '其他材料' },
];

const PRACTICE_KINDS: Array<{ value: PracticeKind; label: string }> = [
  { value: 'written', label: '笔试训练' },
  { value: 'interview', label: '单面练习' },
  { value: 'group', label: '群面练习' },
  { value: 'case', label: '案例分析' },
  { value: 'technical', label: '专业技能' },
  { value: 'other', label: '其他练习' },
];

const emptyApplication = {
  company: '',
  job_title: '',
  source_url: '',
  status: 'saved' as ApplicationStatus,
  deadline: '',
  next_action: '',
  next_action_at: '',
  notes: '',
};

const emptyPractice = {
  kind: 'interview' as PracticeKind,
  title: '',
  score: '',
  max_score: '',
  duration_minutes: '',
  practiced_at: new Date().toISOString().slice(0, 10),
  notes: '',
  next_action: '',
};

const RECENT_PRACTICE_START = (() => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.getTime();
})();

const examNames = Object.fromEntries(
  [...EXAM_SETS, ...COMPANY_EXAM_SETS].map((item) => [item.id, item.title]),
) as Record<string, string>;

function formatDate(value: string | null, includeYear = false) {
  if (!value) return '未设置';
  return new Intl.DateTimeFormat('zh-CN', includeYear
    ? { year: 'numeric', month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric' }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function practiceLabel(value: PracticeKind) {
  return PRACTICE_KINDS.find((item) => item.value === value)?.label ?? value;
}

function documentLabel(value: DocumentKind) {
  return DOCUMENT_KINDS.find((item) => item.value === value)?.label ?? value;
}

function isDueSoon(value: string | null) {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${value.slice(0, 10)}T00:00:00`);
  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  return diff >= 0 && diff <= 7;
}

export default function WorkspacePage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<WorkspaceTab>('overview');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [documents, setDocuments] = useState<CareerDocument[]>([]);
  const [practices, setPractices] = useState<PracticeRecord[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [schemaReady, setSchemaReady] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [applicationForm, setApplicationForm] = useState(emptyApplication);
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null);
  const [practiceForm, setPracticeForm] = useState(emptyPractice);
  const [editingPracticeId, setEditingPracticeId] = useState<string | null>(null);
  const [documentKind, setDocumentKind] = useState<DocumentKind>('resume');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const applicationFormRef = useRef<HTMLDivElement>(null);
  const practiceFormRef = useRef<HTMLDivElement>(null);
  const importedOpportunityRef = useRef(false);

  useEffect(() => {
    if (!user || importedOpportunityRef.current) return;
    importedOpportunityRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const company = params.get('company')?.slice(0, 120) ?? '';
    const jobTitle = params.get('job_title')?.slice(0, 160) ?? '';
    if (!company && !jobTitle) return;
    const deadline = params.get('deadline') ?? '';
    const timer = window.setTimeout(() => {
      setTab('applications');
      setApplicationForm({
        ...emptyApplication,
        company,
        job_title: jobTitle,
        source_url: params.get('source_url')?.slice(0, 1000) ?? '',
        deadline: /^\d{4}-\d{2}-\d{2}/.test(deadline) ? deadline.slice(0, 10) : '',
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !supabase) {
      const timer = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      const [applicationQuery, documentQuery, practiceQuery, examQuery, assessmentQuery, bookmarkQuery] = await Promise.all([
        supabase.from('job_applications').select('id,company,job_title,source_url,status,deadline,next_action,next_action_at,notes,created_at,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }),
        supabase.from('career_documents').select('id,kind,name,storage_path,mime_type,size_bytes,created_at,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }),
        supabase.from('practice_records').select('id,kind,title,score,max_score,duration_minutes,practiced_at,notes,next_action,created_at,updated_at').eq('user_id', user.id).order('practiced_at', { ascending: false }).limit(100),
        supabase.from('exam_results').select('id,exam_id,score,total,duration_seconds,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('assessment_results').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      if (cancelled) return;
      const workspaceErrors = [applicationQuery.error, documentQuery.error, practiceQuery.error].filter(Boolean);
      setSchemaReady(workspaceErrors.length === 0);
      setApplications((applicationQuery.data ?? []) as JobApplication[]);
      setDocuments((documentQuery.data ?? []) as CareerDocument[]);
      setPractices((practiceQuery.data ?? []) as PracticeRecord[]);
      setExamResults((examQuery.data ?? []) as ExamResult[]);
      setAssessmentCount(assessmentQuery.count ?? 0);
      setBookmarkCount(bookmarkQuery.count ?? 0);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [authLoading, user]);

  const activeApplications = useMemo(
    () => applications.filter((item) => item.status !== 'closed'),
    [applications]
  );
  const dueSoon = useMemo(
    () => activeApplications.filter((item) => isDueSoon(item.deadline) || isDueSoon(item.next_action_at)),
    [activeApplications]
  );
  const recentPracticeCount = useMemo(() => {
    const manual = practices.filter((item) => new Date(`${item.practiced_at}T12:00:00`).getTime() >= RECENT_PRACTICE_START).length;
    const exams = examResults.filter((item) => new Date(item.created_at).getTime() >= RECENT_PRACTICE_START).length;
    return manual + exams;
  }, [examResults, practices]);

  const nextStep = useMemo(() => {
    if (!documents.some((item) => item.kind === 'resume')) {
      return { eyebrow: '先补齐基础材料', title: '上传一份当前使用的简历', desc: '先建立材料基线，后续每次投递和面试复盘才有统一参照。', tab: 'documents' as WorkspaceTab, action: '上传简历' };
    }
    const datedAction = [...activeApplications]
      .filter((item) => item.next_action_at)
      .sort((a, b) => (a.next_action_at ?? '').localeCompare(b.next_action_at ?? ''))[0];
    if (datedAction && isDueSoon(datedAction.next_action_at)) {
      return { eyebrow: '近期优先事项', title: datedAction.next_action || `跟进 ${datedAction.company} 的申请`, desc: `${datedAction.company} · ${datedAction.job_title}，计划日期 ${formatDate(datedAction.next_action_at, true)}。`, tab: 'applications' as WorkspaceTab, action: '查看投递' };
    }
    if (activeApplications.length === 0) {
      return { eyebrow: '让方向进入真实验证', title: '加入第一个目标岗位', desc: `你已收藏 ${bookmarkCount} 条信息。把真正准备申请的机会加入投递看板。`, tab: 'applications' as WorkspaceTab, action: '新建投递' };
    }
    if (recentPracticeCount === 0) {
      return { eyebrow: '本周尚未形成练习记录', title: '安排一次针对性练习', desc: '根据当前最接近的招聘环节，选择笔试、单面或群面，并记录结论。', tab: 'practice' as WorkspaceTab, action: '记录练习' };
    }
    return { eyebrow: '本周节奏正常', title: '复盘一次投递漏斗', desc: '检查停留过久的岗位，把下一步动作和日期写清楚。', tab: 'applications' as WorkspaceTab, action: '开始复盘' };
  }, [activeApplications, bookmarkCount, documents, recentPracticeCount]);

  function showNotice(tone: 'success' | 'error', text: string) {
    setNotice({ tone, text });
    window.setTimeout(() => setNotice(null), 4500);
  }

  function openTab(nextTab: WorkspaceTab) {
    setTab(nextTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveApplication(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !user || !schemaReady) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      company: applicationForm.company.trim(),
      job_title: applicationForm.job_title.trim(),
      source_url: applicationForm.source_url.trim() || null,
      status: applicationForm.status,
      deadline: applicationForm.deadline || null,
      next_action: applicationForm.next_action.trim() || null,
      next_action_at: applicationForm.next_action_at || null,
      notes: applicationForm.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const query = editingApplicationId
      ? supabase.from('job_applications').update(payload).eq('id', editingApplicationId).eq('user_id', user.id).select().single()
      : supabase.from('job_applications').insert(payload).select().single();
    const { data, error } = await query;
    setSaving(false);
    if (error || !data) {
      showNotice('error', '保存失败，请稍后再试。');
      return;
    }
    const saved = data as JobApplication;
    setApplications((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    setApplicationForm(emptyApplication);
    setEditingApplicationId(null);
    showNotice('success', editingApplicationId ? '投递信息已更新。' : '已加入投递看板。');
  }

  function editApplication(item: JobApplication) {
    setEditingApplicationId(item.id);
    setApplicationForm({
      company: item.company,
      job_title: item.job_title,
      source_url: item.source_url ?? '',
      status: item.status,
      deadline: item.deadline ?? '',
      next_action: item.next_action ?? '',
      next_action_at: item.next_action_at ?? '',
      notes: item.notes ?? '',
    });
    window.setTimeout(() => applicationFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  async function updateApplicationStatus(id: string, status: ApplicationStatus) {
    if (!supabase || !user) return;
    const previous = applications;
    setApplications((current) => current.map((item) => item.id === id ? { ...item, status, updated_at: new Date().toISOString() } : item));
    const { error } = await supabase.from('job_applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id);
    if (error) {
      setApplications(previous);
      showNotice('error', '状态更新失败，请重试。');
    }
  }

  async function deleteApplication(item: JobApplication) {
    if (!supabase || !user || !window.confirm(`确定删除“${item.company} · ${item.job_title}”吗？`)) return;
    const { error } = await supabase.from('job_applications').delete().eq('id', item.id).eq('user_id', user.id);
    if (error) showNotice('error', '删除失败，请稍后再试。');
    else {
      setApplications((current) => current.filter((entry) => entry.id !== item.id));
      showNotice('success', '投递记录已删除。');
    }
  }

  async function uploadDocument(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !user || !documentFile || !schemaReady) return;
    const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    const extension = documentFile.name.split('.').pop()?.toLowerCase() ?? '';
    if (!allowedExtensions.includes(extension)) {
      showNotice('error', '支持 PDF、Word、JPG 和 PNG 文件。');
      return;
    }
    if (documentFile.size > 10 * 1024 * 1024) {
      showNotice('error', '单个文件不能超过 10MB。');
      return;
    }

    setSaving(true);
    const safeName = documentFile.name.replace(/[^a-zA-Z0-9._-]+/g, '-');
    const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from('career-documents').upload(storagePath, documentFile, { upsert: false });
    if (uploadError) {
      setSaving(false);
      showNotice('error', '上传失败，请稍后再试。');
      return;
    }

    const { data, error } = await supabase.from('career_documents').insert({
      user_id: user.id,
      kind: documentKind,
      name: documentFile.name,
      storage_path: storagePath,
      mime_type: documentFile.type || null,
      size_bytes: documentFile.size,
    }).select().single();
    if (error || !data) {
      await supabase.storage.from('career-documents').remove([storagePath]);
      setSaving(false);
      showNotice('error', '文件信息保存失败，请重试。');
      return;
    }
    setDocuments((current) => [data as CareerDocument, ...current]);
    setDocumentFile(null);
    const input = document.getElementById('career-document-file') as HTMLInputElement | null;
    if (input) input.value = '';
    setSaving(false);
    showNotice('success', '材料已加密保存到你的账号。');
  }

  async function openDocument(item: CareerDocument) {
    if (!supabase) return;
    const { data, error } = await supabase.storage.from('career-documents').createSignedUrl(item.storage_path, 90);
    if (error || !data?.signedUrl) showNotice('error', '文件暂时无法打开，请重试。');
    else window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  async function deleteDocument(item: CareerDocument) {
    if (!supabase || !user || !window.confirm(`确定删除“${item.name}”吗？删除后无法恢复。`)) return;
    const { error: storageError } = await supabase.storage.from('career-documents').remove([item.storage_path]);
    if (storageError) {
      showNotice('error', '文件删除失败，请稍后再试。');
      return;
    }
    const { error } = await supabase.from('career_documents').delete().eq('id', item.id).eq('user_id', user.id);
    if (error) showNotice('error', '文件记录删除失败，请联系管理员。');
    else {
      setDocuments((current) => current.filter((entry) => entry.id !== item.id));
      showNotice('success', '材料已删除。');
    }
  }

  async function savePractice(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !user || !schemaReady) return;
    const score = practiceForm.score ? Number(practiceForm.score) : null;
    const maxScore = practiceForm.max_score ? Number(practiceForm.max_score) : null;
    if (score !== null && maxScore !== null && score > maxScore) {
      showNotice('error', '得分不能高于满分。');
      return;
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      kind: practiceForm.kind,
      title: practiceForm.title.trim(),
      score,
      max_score: maxScore,
      duration_minutes: practiceForm.duration_minutes ? Number(practiceForm.duration_minutes) : null,
      practiced_at: practiceForm.practiced_at,
      notes: practiceForm.notes.trim() || null,
      next_action: practiceForm.next_action.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const query = editingPracticeId
      ? supabase.from('practice_records').update(payload).eq('id', editingPracticeId).eq('user_id', user.id).select().single()
      : supabase.from('practice_records').insert(payload).select().single();
    const { data, error } = await query;
    setSaving(false);
    if (error || !data) {
      showNotice('error', '练习记录保存失败，请稍后再试。');
      return;
    }
    const saved = data as PracticeRecord;
    setPractices((current) => [saved, ...current.filter((item) => item.id !== saved.id)]
      .sort((a, b) => b.practiced_at.localeCompare(a.practiced_at)));
    setPracticeForm({ ...emptyPractice, practiced_at: new Date().toISOString().slice(0, 10) });
    setEditingPracticeId(null);
    showNotice('success', editingPracticeId ? '练习记录已更新。' : '练习记录已保存。');
  }

  function editPractice(item: PracticeRecord) {
    setEditingPracticeId(item.id);
    setPracticeForm({
      kind: item.kind,
      title: item.title,
      score: item.score === null ? '' : String(item.score),
      max_score: item.max_score === null ? '' : String(item.max_score),
      duration_minutes: item.duration_minutes === null ? '' : String(item.duration_minutes),
      practiced_at: item.practiced_at,
      notes: item.notes ?? '',
      next_action: item.next_action ?? '',
    });
    window.setTimeout(() => practiceFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  async function deletePractice(item: PracticeRecord) {
    if (!supabase || !user || !window.confirm(`确定删除“${item.title}”这条练习记录吗？`)) return;
    const { error } = await supabase.from('practice_records').delete().eq('id', item.id).eq('user_id', user.id);
    if (error) showNotice('error', '删除失败，请稍后再试。');
    else {
      setPractices((current) => current.filter((entry) => entry.id !== item.id));
      showNotice('success', '练习记录已删除。');
    }
  }

  if (authLoading || loading) {
    return <div className={`page ${styles.page}`}><div className={styles.loading}>正在整理你的求职进展…</div></div>;
  }

  if (!user) {
    return (
      <div className={`page ${styles.page}`}>
        <section className={styles.loginGate}>
          <span className={styles.lockIcon}>⌁</span>
          <p className={styles.eyebrow}>个人求职空间</p>
          <h1>登录后建立你的求职工作台</h1>
          <p>简历材料、投递进度、练习记录和测评结果只保存在你的账号中，并可跨设备同步。</p>
          <div className={styles.loginActions}>
            <Link href="/login?redirect=/workspace" className="btn">登录 / 注册</Link>
            <Link href="/tools/assessment" className="btn btn-secondary">先看看职业测评</Link>
          </div>
        </section>
      </div>
    );
  }

  const overviewStats = [
    { value: activeApplications.length, label: '进行中投递', note: applications.length ? `全部 ${applications.length} 个` : '等待加入目标' },
    { value: dueSoon.length, label: '7天内待办', note: dueSoon.length ? '优先处理' : '暂无临期事项' },
    { value: documents.length, label: '求职材料', note: documents.some((item) => item.kind === 'resume') ? '已有简历' : '尚未上传简历' },
    { value: recentPracticeCount, label: '近7天练习', note: `累计 ${practices.length + examResults.length} 次` },
  ];

  return (
    <div className={`page ${styles.page}`}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>MY JOB SEARCH</p>
          <h1>我的求职工作台</h1>
          <p>把方向、材料、机会和练习放在同一条行动链里。这里记录事实、提醒下一步，不替你制造焦虑。</p>
        </div>
        <div className={styles.heroMeta}>
          <span>账号数据 · 云端同步</span>
          <strong>{user.user_metadata?.nickname || user.email?.split('@')[0] || '我的工作台'}</strong>
        </div>
      </section>

      {!schemaReady && (
        <div className={styles.setupNotice} role="status">
          <strong>工作台数据功能正在初始化</strong>
          <span>测评和笔试记录仍可查看；材料、投递与手动练习暂时只读，请管理员完成数据库初始化。</span>
        </div>
      )}

      {notice && <div className={`${styles.toast} ${notice.tone === 'error' ? styles.toastError : ''}`} role="status">{notice.text}</div>}

      <nav className={styles.tabs} aria-label="求职工作台分区">
        {([
          ['overview', '总览'],
          ['applications', '投递管理'],
          ['documents', '求职材料'],
          ['resume', '简历诊断'],
          ['practice', '练习记录'],
        ] as Array<[WorkspaceTab, string]>).map(([value, label]) => (
          <button key={value} type="button" data-active={tab === value} onClick={() => openTab(value)}>{label}</button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className={styles.overview}>
          <section className={styles.statGrid}>
            {overviewStats.map((item) => <button type="button" key={item.label} className={styles.statCard} onClick={() => openTab(item.label.includes('投递') || item.label.includes('待办') ? 'applications' : item.label.includes('材料') ? 'documents' : 'practice')}>
              <strong>{item.value}</strong><span>{item.label}</span><small>{item.note}</small>
            </button>)}
          </section>

          <section className={styles.nextStep}>
            <div><p>{nextStep.eyebrow}</p><h2>{nextStep.title}</h2><span>{nextStep.desc}</span></div>
            <button type="button" className="btn" onClick={() => openTab(nextStep.tab)}>{nextStep.action} →</button>
          </section>

          <div className={styles.overviewGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeading}><div><p className={styles.eyebrow}>PIPELINE</p><h2>投递漏斗</h2></div><button type="button" onClick={() => openTab('applications')}>管理全部 →</button></div>
              <div className={styles.pipeline}>
                {APPLICATION_STATUSES.slice(0, 6).map((status) => {
                  const count = applications.filter((item) => item.status === status.value).length;
                  return <div key={status.value}><span>{status.short}</span><strong>{count}</strong><i style={{ height: `${Math.max(4, count ? Math.min(100, count * 22) : 4)}%` }} /></div>;
                })}
              </div>
              {dueSoon.length > 0 ? <div className={styles.compactList}>{dueSoon.slice(0, 3).map((item) => <button type="button" key={item.id} onClick={() => openTab('applications')}><span>{formatDate(item.next_action_at || item.deadline)}</span><div><strong>{item.next_action || `${item.company} 截止`}</strong><small>{item.company} · {item.job_title}</small></div></button>)}</div> : <div className={styles.emptyCompact}>当前没有 7 天内到期的投递事项。</div>}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeading}><div><p className={styles.eyebrow}>PROFILE & PRACTICE</p><h2>能力准备</h2></div><Link href="/tools/assessment/profile">职业画像 →</Link></div>
              <div className={styles.readinessGrid}>
                <Link href="/tools/assessment/profile"><strong>{assessmentCount}</strong><span>份测评结果</span><small>{assessmentCount ? '查看组合洞察' : '从一项测评开始'}</small></Link>
                <button type="button" onClick={() => openTab('practice')}><strong>{practices.length + examResults.length}</strong><span>次练习记录</span><small>{recentPracticeCount ? `近7天 ${recentPracticeCount} 次` : '本周还没有练习'}</small></button>
              </div>
              <div className={styles.quickActions}>
                <button type="button" onClick={() => openTab('resume')}>诊断并生成岗位定向简历</button>
                <Link href="/tools/exam">开始一次笔试训练</Link>
                <Link href="/tools/interview">抽一道面试题或群面案例</Link>
                <button type="button" onClick={() => openTab('practice')}>记录一次面试练习</button>
                <Link href="/tools/assessment">选择职业测评</Link>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'applications' && (
        <div className={styles.sectionLayout}>
          <section className={styles.panel} ref={applicationFormRef}>
            <div className={styles.panelHeading}><div><p className={styles.eyebrow}>APPLICATION</p><h2>{editingApplicationId ? '编辑投递' : '加入一个目标岗位'}</h2><span>先记录事实，再明确唯一的下一步。</span></div></div>
            <form className={styles.form} onSubmit={saveApplication}>
              <div className={styles.twoColumns}>
                <label><span>公司 *</span><input className="field" required maxLength={120} value={applicationForm.company} onChange={(event) => setApplicationForm({ ...applicationForm, company: event.target.value })} placeholder="例如：某科技公司" /></label>
                <label><span>岗位 *</span><input className="field" required maxLength={160} value={applicationForm.job_title} onChange={(event) => setApplicationForm({ ...applicationForm, job_title: event.target.value })} placeholder="例如：产品经理校招" /></label>
              </div>
              <div className={styles.twoColumns}>
                <label><span>当前阶段</span><select className="field" value={applicationForm.status} onChange={(event) => setApplicationForm({ ...applicationForm, status: event.target.value as ApplicationStatus })}>{APPLICATION_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                <label><span>投递截止日</span><input className="field" type="date" value={applicationForm.deadline} onChange={(event) => setApplicationForm({ ...applicationForm, deadline: event.target.value })} /></label>
              </div>
              <label><span>职位链接</span><input className="field" type="url" value={applicationForm.source_url} onChange={(event) => setApplicationForm({ ...applicationForm, source_url: event.target.value })} placeholder="https://…" /></label>
              <div className={styles.twoColumns}>
                <label><span>下一步动作</span><input className="field" maxLength={240} value={applicationForm.next_action} onChange={(event) => setApplicationForm({ ...applicationForm, next_action: event.target.value })} placeholder="例如：针对JD补充项目成果" /></label>
                <label><span>计划完成日</span><input className="field" type="date" value={applicationForm.next_action_at} onChange={(event) => setApplicationForm({ ...applicationForm, next_action_at: event.target.value })} /></label>
              </div>
              <label><span>备注</span><textarea className="field" rows={3} maxLength={3000} value={applicationForm.notes} onChange={(event) => setApplicationForm({ ...applicationForm, notes: event.target.value })} placeholder="内推人、网申账号、岗位要求或复盘要点…" /></label>
              <div className={styles.formActions}><button className="btn" disabled={saving || !schemaReady}>{saving ? '保存中…' : editingApplicationId ? '保存修改' : '加入投递看板'}</button>{editingApplicationId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingApplicationId(null); setApplicationForm(emptyApplication); }}>取消编辑</button>}</div>
            </form>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><p className={styles.eyebrow}>YOUR PIPELINE</p><h2>全部投递</h2><span>{applications.length} 个岗位 · 可直接切换招聘阶段</span></div></div>
            <div className={styles.statusSummary}>{APPLICATION_STATUSES.map((status) => <span key={status.value}>{status.short}<strong>{applications.filter((item) => item.status === status.value).length}</strong></span>)}</div>
            {applications.length ? <div className={styles.applicationList}>{applications.map((item) => <article key={item.id} className={styles.applicationCard} data-status={item.status}>
              <div className={styles.applicationTop}><div><span>{item.company}</span><h3>{item.job_title}</h3></div><select aria-label={`更新 ${item.company} ${item.job_title} 的阶段`} value={item.status} onChange={(event) => updateApplicationStatus(item.id, event.target.value as ApplicationStatus)}>{APPLICATION_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div>
              <div className={styles.applicationMeta}>{item.deadline && <span data-alert={isDueSoon(item.deadline)}>截止 {formatDate(item.deadline)}</span>}{item.next_action_at && <span data-alert={isDueSoon(item.next_action_at)}>计划 {formatDate(item.next_action_at)}</span>}<span>更新于 {formatDate(item.updated_at, true)}</span></div>
              {item.next_action && <div className={styles.actionLine}><small>下一步</small><strong>{item.next_action}</strong></div>}
              {item.notes && <p className={styles.notes}>{item.notes}</p>}
              <div className={styles.rowActions}>{item.source_url && <a href={item.source_url} target="_blank" rel="noopener noreferrer">打开职位 ↗</a>}<button type="button" onClick={() => editApplication(item)}>编辑</button><button type="button" className={styles.dangerAction} onClick={() => deleteApplication(item)}>删除</button></div>
            </article>)}</div> : <div className={styles.emptyState}><strong>还没有投递记录</strong><p>从一个真正想申请的岗位开始，不必一次录入所有收藏。</p><Link href="/all">浏览招聘机会 →</Link></div>}
          </section>
        </div>
      )}

      {tab === 'documents' && (
        <div className={styles.sectionLayout}>
          <section className={styles.aiResumePanel}>
            <div className={styles.aiResumeIntro}>
              <div className={styles.aiResumeMark}>AI</div>
              <div>
                <p className={styles.eyebrow}>RESUME OPTIMIZER</p>
                <h2>把经历改写成岗位更愿意读的简历</h2>
                <p>适合已经有基础经历、需要按目标岗位重组重点的人。先在工具中建立经历信息库，再选择方向或粘贴 JD，让 AI 生成定向版本。</p>
              </div>
            </div>
            <ol className={styles.aiResumeSteps}>
              <li><span>01</span><div><strong>录入真实经历</strong><small>教育、实习、项目与技能</small></div></li>
              <li><span>02</span><div><strong>指定岗位方向</strong><small>专业版支持 JD 精准匹配</small></div></li>
              <li><span>03</span><div><strong>导出并回存</strong><small>把生成版本上传回材料库</small></div></li>
            </ol>
            <div className={styles.aiResumeActions}>
              <button type="button" className="btn" onClick={() => openTab('resume')}>开始站内诊断 →</button>
              <a className="btn btn-secondary" href="https://ai-resume-9wy.pages.dev/" target="_blank" rel="noopener noreferrer">使用外部简历工具 ↗</a>
              <span>先诊断和补证据，再生成岗位版本</span>
            </div>
            <p className={styles.externalNote}>站内诊断会使用你主动选择的简历、目标岗位和补充证据；外部工具在新页面打开，使用独立账号且不能自动读取 JOBHOT 材料库。</p>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><p className={styles.eyebrow}>PRIVATE FILES</p><h2>上传求职材料</h2><span>用于沉淀版本，不会生成永久公开链接。</span></div></div>
            <form className={styles.uploadForm} onSubmit={uploadDocument}>
              <label><span>材料类型</span><select className="field" value={documentKind} onChange={(event) => setDocumentKind(event.target.value as DocumentKind)}>{DOCUMENT_KINDS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label className={styles.fileDrop} htmlFor="career-document-file"><strong>{documentFile ? documentFile.name : '选择文件上传'}</strong><span>{documentFile ? formatBytes(documentFile.size) : 'PDF / Word / JPG / PNG，单个不超过 10MB'}</span><input id="career-document-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} /></label>
              <button className="btn" disabled={saving || !documentFile || !schemaReady}>{saving ? '上传中…' : '安全保存到账号'}</button>
            </form>
            <div className={styles.privacyNote}><strong>隐私说明</strong><span>文件存放在私有空间，只有当前登录账号可生成 90 秒有效的临时查看链接。删除后不可恢复，请自行保留原件。</span></div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><p className={styles.eyebrow}>VERSION LIBRARY</p><h2>我的材料库</h2><span>建议用文件名标明方向和日期，例如“产品经理_2026秋招_v2.pdf”。</span></div></div>
            {documents.length ? <div className={styles.documentList}>{documents.map((item) => <article key={item.id} className={styles.documentCard}><div className={styles.fileIcon}>{item.name.split('.').pop()?.slice(0, 4).toUpperCase() || 'FILE'}</div><div><span>{documentLabel(item.kind)}</span><strong>{item.name}</strong><small>{formatBytes(item.size_bytes)} · {formatDate(item.updated_at, true)}</small></div><div className={styles.rowActions}><button type="button" onClick={() => openDocument(item)}>查看</button><button type="button" className={styles.dangerAction} onClick={() => deleteDocument(item)}>删除</button></div></article>)}</div> : <div className={styles.emptyState}><strong>材料库还是空的</strong><p>建议先上传一份当前简历，之后再按目标岗位保留不同版本。</p></div>}
          </section>
        </div>
      )}

      {tab === 'resume' && (
        <ResumeOptimizer
          documents={documents.filter((item) => item.kind === 'resume')}
          applications={applications}
          assessmentCount={assessmentCount}
          onOpenDocuments={() => openTab('documents')}
          onOpenApplications={() => openTab('applications')}
        />
      )}

      {tab === 'practice' && (
        <div className={styles.sectionLayout}>
          <section className={styles.panel} ref={practiceFormRef}>
            <div className={styles.panelHeading}><div><p className={styles.eyebrow}>DELIBERATE PRACTICE</p><h2>{editingPracticeId ? '编辑练习记录' : '记录一次练习'}</h2><span>重点记录暴露的问题和下一次要改变的行为。</span></div></div>
            <form className={styles.form} onSubmit={savePractice}>
              <div className={styles.twoColumns}>
                <label><span>练习类型</span><select className="field" value={practiceForm.kind} onChange={(event) => setPracticeForm({ ...practiceForm, kind: event.target.value as PracticeKind })}>{PRACTICE_KINDS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                <label><span>练习日期</span><input className="field" type="date" required value={practiceForm.practiced_at} onChange={(event) => setPracticeForm({ ...practiceForm, practiced_at: event.target.value })} /></label>
              </div>
              <label><span>练习主题 *</span><input className="field" required maxLength={160} value={practiceForm.title} onChange={(event) => setPracticeForm({ ...practiceForm, title: event.target.value })} placeholder="例如：宝洁八大问模拟面试" /></label>
              <div className={styles.threeColumns}>
                <label><span>得分（可选）</span><input className="field" type="number" min="0" step="0.01" value={practiceForm.score} onChange={(event) => setPracticeForm({ ...practiceForm, score: event.target.value })} /></label>
                <label><span>满分（可选）</span><input className="field" type="number" min="0.01" step="0.01" value={practiceForm.max_score} onChange={(event) => setPracticeForm({ ...practiceForm, max_score: event.target.value })} /></label>
                <label><span>用时（分钟）</span><input className="field" type="number" min="1" max="1440" value={practiceForm.duration_minutes} onChange={(event) => setPracticeForm({ ...practiceForm, duration_minutes: event.target.value })} /></label>
              </div>
              <label><span>复盘记录</span><textarea className="field" rows={3} maxLength={3000} value={practiceForm.notes} onChange={(event) => setPracticeForm({ ...practiceForm, notes: event.target.value })} placeholder="哪些地方做得好？哪里卡住？证据是什么？" /></label>
              <label><span>下一次只改一件事</span><input className="field" maxLength={240} value={practiceForm.next_action} onChange={(event) => setPracticeForm({ ...practiceForm, next_action: event.target.value })} placeholder="例如：每个项目回答补一个量化结果" /></label>
              <div className={styles.formActions}><button className="btn" disabled={saving || !schemaReady}>{saving ? '保存中…' : editingPracticeId ? '保存修改' : '保存练习记录'}</button>{editingPracticeId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingPracticeId(null); setPracticeForm({ ...emptyPractice, practiced_at: new Date().toISOString().slice(0, 10) }); }}>取消编辑</button>}</div>
            </form>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><p className={styles.eyebrow}>PRACTICE LOG</p><h2>练习时间线</h2><span>站内笔试成绩会自动进入这里。</span></div><Link href="/tools/prep">打开训练题库 →</Link></div>
            {(practices.length || examResults.length) ? <div className={styles.practiceList}>
              {examResults.slice(0, 5).map((item) => <article key={`exam-${item.id}`} className={styles.practiceCard}><div className={styles.practiceDate}>{formatDate(item.created_at)}</div><div><span>站内笔试 · 自动记录</span><strong>{examNames[item.exam_id] || item.exam_id}</strong><small>{item.score}/{item.total} 分{item.duration_seconds ? ` · ${Math.max(1, Math.round(item.duration_seconds / 60))} 分钟` : ''}</small></div><b>{Math.round(item.score / item.total * 100)}%</b></article>)}
              {practices.map((item) => <article key={item.id} className={styles.practiceCard}><div className={styles.practiceDate}>{formatDate(item.practiced_at)}</div><div><span>{practiceLabel(item.kind)}</span><strong>{item.title}</strong><small>{item.duration_minutes ? `${item.duration_minutes} 分钟` : '未记录时长'}{item.score !== null ? ` · ${item.score}${item.max_score !== null ? `/${item.max_score}` : ' 分'}` : ''}</small>{item.notes && <p>{item.notes}</p>}{item.next_action && <em>下次改进：{item.next_action}</em>}</div><div className={styles.rowActions}><button type="button" onClick={() => editPractice(item)}>编辑</button><button type="button" className={styles.dangerAction} onClick={() => deletePractice(item)}>删除</button></div></article>)}
            </div> : <div className={styles.emptyState}><strong>还没有练习记录</strong><p>练习的价值不在“做过”，而在看见问题、形成下一次动作。</p><Link href="/tools/prep">选择一次笔面试训练 →</Link></div>}
          </section>
        </div>
      )}
    </div>
  );
}

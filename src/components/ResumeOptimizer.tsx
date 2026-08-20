'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './ResumeOptimizer.module.css';

type ResumeDocument = {
  id: string;
  name: string;
  mime_type: string | null;
  updated_at: string;
};

type TargetApplication = {
  id: string;
  company: string;
  job_title: string;
  source_url: string | null;
};

type Dimension = {
  key: string;
  name: string;
  score: number;
  assessment: string;
  evidence: string;
};

type Issue = {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  evidence: string;
  impact: string;
  recommendation: string;
};

type MissingQuestion = {
  id: string;
  question: string;
  why: string;
  placeholder: string;
  required: boolean;
};

type ResumeDiagnostic = {
  id: string;
  document_id: string;
  application_id: string | null;
  target_company: string | null;
  target_job_title: string;
  overall_score: number;
  summary: string;
  dimensions: Dimension[];
  strengths: string[];
  issues: Issue[];
  missing_questions: MissingQuestion[];
  created_at: string;
};

type ResumeBullet = {
  text: string;
  source: string;
  confidence: 'confirmed' | 'needs_review';
};

type ResumeSection = {
  name: string;
  items: Array<{
    heading: string;
    subheading: string;
    bullets: ResumeBullet[];
  }>;
};

type ResumeChange = {
  location: string;
  before: string;
  after: string;
  reason: string;
};

type ResumeVersion = {
  id: string;
  diagnostic_id: string;
  title: string;
  optimized_content: { positioning?: string; sections?: ResumeSection[] };
  change_log: ResumeChange[];
  unresolved_items: string[];
  created_at: string;
};

type Props = {
  documents: ResumeDocument[];
  applications: TargetApplication[];
  assessmentCount: number;
  onOpenDocuments: () => void;
  onOpenApplications: () => void;
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function scoreTone(score: number) {
  if (score >= 80) return 'good';
  if (score >= 60) return 'medium';
  return 'risk';
}

function errorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') return fallback;
  const context = 'context' in error && error.context && typeof error.context === 'object' ? error.context : null;
  const body = context && 'body' in context ? context.body : null;
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      if (typeof parsed.error === 'string') return parsed.error;
    } catch {}
  }
  if ('message' in error && typeof error.message === 'string') return error.message;
  return fallback;
}

export function ResumeOptimizer({ documents, applications, assessmentCount, onOpenDocuments, onOpenApplications }: Props) {
  const pdfDocuments = useMemo(
    () => documents.filter((item) => item.mime_type === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf')),
    [documents]
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState(pdfDocuments[0]?.id ?? '');
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [diagnostic, setDiagnostic] = useState<ResumeDiagnostic | null>(null);
  const [version, setVersion] = useState<ResumeVersion | null>(null);
  const [diagnosticHistory, setDiagnosticHistory] = useState<ResumeDiagnostic[]>([]);
  const [versionHistory, setVersionHistory] = useState<ResumeVersion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [schemaReady, setSchemaReady] = useState(true);
  const [busy, setBusy] = useState<'diagnose' | 'optimize' | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase) {
      const timer = window.setTimeout(() => setLoadingHistory(false), 0);
      return () => window.clearTimeout(timer);
    }
    let cancelled = false;
    void (async () => {
      const [diagnosticsQuery, versionsQuery] = await Promise.all([
        supabase.from('resume_diagnostics')
          .select('id,document_id,application_id,target_company,target_job_title,overall_score,summary,dimensions,strengths,issues,missing_questions,created_at')
          .order('created_at', { ascending: false }).limit(20),
        supabase.from('resume_versions')
          .select('id,diagnostic_id,title,optimized_content,change_log,unresolved_items,created_at')
          .order('created_at', { ascending: false }).limit(20),
      ]);
      if (cancelled) return;
      setSchemaReady(!diagnosticsQuery.error && !versionsQuery.error);
      setDiagnosticHistory((diagnosticsQuery.data ?? []) as ResumeDiagnostic[]);
      setVersionHistory((versionsQuery.data ?? []) as ResumeVersion[]);
      setLoadingHistory(false);
    })();
    return () => { cancelled = true; };
  }, []);

  function chooseApplication(id: string) {
    setSelectedApplicationId(id);
    const item = applications.find((application) => application.id === id);
    if (item) {
      setTargetCompany(item.company);
      setTargetJobTitle(item.job_title);
    }
  }

  async function diagnose() {
    if (!supabase || !selectedDocumentId || !targetJobTitle.trim()) return;
    setBusy('diagnose');
    setError('');
    setMessage('');
    setVersion(null);
    const { data, error: invokeError } = await supabase.functions.invoke('resume-coach', {
      body: {
        action: 'diagnose',
        documentId: selectedDocumentId,
        applicationId: selectedApplicationId || null,
        targetCompany: targetCompany.trim(),
        targetJobTitle: targetJobTitle.trim(),
        jobDescription: jobDescription.trim(),
      },
    });
    setBusy(null);
    if (invokeError || !data?.diagnostic) {
      setError(errorMessage(invokeError, data?.error || '诊断没有完成，请稍后再试。'));
      return;
    }
    const next = data.diagnostic as ResumeDiagnostic;
    setDiagnostic(next);
    setAnswers({});
    setDiagnosticHistory((current) => [next, ...current.filter((item) => item.id !== next.id)]);
    setMessage('诊断完成。补充关键证据后，生成结果会更可靠。');
  }

  async function optimize() {
    if (!supabase || !diagnostic) return;
    setBusy('optimize');
    setError('');
    setMessage('');
    const evidenceAnswers = diagnostic.missing_questions.map((question) => ({
      id: question.id,
      question: question.question,
      answer: answers[question.id]?.trim() || '',
    })).filter((item) => item.answer);
    const { data, error: invokeError } = await supabase.functions.invoke('resume-coach', {
      body: {
        action: 'optimize',
        documentId: diagnostic.document_id,
        applicationId: diagnostic.application_id,
        diagnosticId: diagnostic.id,
        targetCompany: diagnostic.target_company,
        targetJobTitle: diagnostic.target_job_title,
        evidenceAnswers,
      },
    });
    setBusy(null);
    if (invokeError || !data?.version) {
      setError(errorMessage(invokeError, data?.error || '优化版本没有生成，请稍后再试。'));
      return;
    }
    const next = data.version as ResumeVersion;
    setVersion(next);
    setVersionHistory((current) => [next, ...current.filter((item) => item.id !== next.id)]);
    setMessage('岗位定向版本已经保存到你的账号。请逐条核对后再用于投递。');
  }

  function loadDiagnostic(item: ResumeDiagnostic) {
    setDiagnostic(item);
    setVersion(versionHistory.find((entry) => entry.diagnostic_id === item.id) ?? null);
    setSelectedDocumentId(item.document_id);
    setSelectedApplicationId(item.application_id ?? '');
    setTargetCompany(item.target_company ?? '');
    setTargetJobTitle(item.target_job_title);
    setAnswers({});
    setError('');
    setMessage('');
  }

  async function copyVersion() {
    if (!version) return;
    const sections = version.optimized_content.sections ?? [];
    const text = [
      version.title,
      version.optimized_content.positioning ?? '',
      ...sections.flatMap((section) => [
        `\n${section.name}`,
        ...section.items.flatMap((item) => [item.heading, item.subheading, ...item.bullets.map((bullet) => `• ${bullet.text}`)]),
      ]),
    ].filter(Boolean).join('\n');
    await navigator.clipboard.writeText(text);
    setMessage('优化版内容已复制。');
  }

  if (loadingHistory) return <div className={styles.loading}>正在读取简历诊断记录…</div>;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p>JOBHOT RESUME COACH</p>
          <h2>先诊断，再补证据，最后生成岗位版本</h2>
          <span>AI只使用你的简历、目标岗位和主动补充的信息。没有证据的内容不会被包装成事实。</span>
        </div>
        <div className={styles.heroRule}><strong>不编造</strong><small>所有改写都标记信息来源</small></div>
      </section>

      {!schemaReady && <div className={styles.serviceNotice}><strong>诊断记录功能等待后台初始化</strong><span>页面流程已经就绪，管理员完成数据表和AI服务配置后即可使用。</span></div>}
      {error && <div className={styles.error} role="alert">{error}</div>}
      {message && <div className={styles.success} role="status">{message}</div>}

      <section className={styles.stepCard}>
        <div className={styles.stepHeading}><span>01</span><div><h3>确定本次诊断对象</h3><p>选择一份PDF简历和一个目标岗位；有JD时判断会更准确。</p></div></div>
        {!pdfDocuments.length ? (
          <div className={styles.empty}>
            <strong>材料库里还没有PDF简历</strong>
            <p>第一版AI诊断支持PDF。上传后再回到这里开始。</p>
            <button type="button" className="btn" onClick={onOpenDocuments}>去上传简历</button>
          </div>
        ) : (
          <div className={styles.form}>
            <label><span>选择简历 *</span><select className="field" value={selectedDocumentId} onChange={(event) => setSelectedDocumentId(event.target.value)}>{pdfDocuments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label><span>关联投递（可选）</span><select className="field" value={selectedApplicationId} onChange={(event) => chooseApplication(event.target.value)}><option value="">不关联，手动填写目标</option>{applications.map((item) => <option key={item.id} value={item.id}>{item.company} · {item.job_title}</option>)}</select></label>
            <div className={styles.twoColumns}>
              <label><span>目标公司</span><input className="field" maxLength={200} value={targetCompany} onChange={(event) => setTargetCompany(event.target.value)} placeholder="例如：某科技公司" /></label>
              <label><span>目标岗位 *</span><input className="field" required maxLength={200} value={targetJobTitle} onChange={(event) => setTargetJobTitle(event.target.value)} placeholder="例如：产品经理校招" /></label>
            </div>
            <label><span>岗位JD</span><textarea className="field" rows={7} maxLength={12000} value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="粘贴岗位职责和任职要求。没有JD也能诊断，但岗位匹配结论会更保守。" /></label>
            <div className={styles.contextBar}><span>将自动参考</span><strong>{assessmentCount} 份测评结果</strong><strong>{applications.length} 个投递岗位</strong><small>测评只影响提问和排序，不会被当作履历事实。</small></div>
            <div className={styles.actions}><button type="button" className="btn" disabled={!schemaReady || busy !== null || !selectedDocumentId || !targetJobTitle.trim()} onClick={diagnose}>{busy === 'diagnose' ? 'AI正在阅读和诊断…' : '开始AI诊断'}</button>{!applications.length && <button type="button" className="btn btn-secondary" onClick={onOpenApplications}>先加入目标岗位</button>}</div>
          </div>
        )}
      </section>

      {diagnostic && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}><span>02</span><div><h3>查看诊断与证据缺口</h3><p>{diagnostic.target_company ? `${diagnostic.target_company} · ` : ''}{diagnostic.target_job_title}</p></div><div className={styles.overall} data-tone={scoreTone(diagnostic.overall_score)}><strong>{diagnostic.overall_score}</strong><small>综合诊断</small></div></div>
          <p className={styles.summary}>{diagnostic.summary}</p>
          <div className={styles.dimensionGrid}>{diagnostic.dimensions.map((item) => <article key={item.key} data-tone={scoreTone(item.score)}><div><span>{item.name}</span><strong>{item.score}</strong></div><i><b style={{ width: `${item.score}%` }} /></i><p>{item.assessment}</p><small>{item.evidence}</small></article>)}</div>
          {!!diagnostic.strengths.length && <div className={styles.strengths}><h4>建议保留的有效信息</h4><div>{diagnostic.strengths.map((item) => <span key={item}>{item}</span>)}</div></div>}
          <div className={styles.issueList}><h4>优先修改的问题</h4>{diagnostic.issues.map((item, index) => <article key={item.id} data-priority={item.priority}><span>{String(index + 1).padStart(2, '0')}</span><div><h5>{item.title}</h5><p><b>原文证据：</b>{item.evidence}</p><p><b>影响：</b>{item.impact}</p><strong>{item.recommendation}</strong></div></article>)}</div>
        </section>
      )}

      {diagnostic && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}><span>03</span><div><h3>补充会改变结果的信息</h3><p>不知道或没有数据可以留空，系统会把它列为待核实，而不是替你编造。</p></div></div>
          {diagnostic.missing_questions.length ? <div className={styles.questionList}>{diagnostic.missing_questions.map((question, index) => <label key={question.id}><div><span>{index + 1}</span><strong>{question.question}</strong>{question.required && <em>关键</em>}</div><p>{question.why}</p><textarea className="field" rows={3} maxLength={3000} value={answers[question.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder={question.placeholder} /></label>)}</div> : <div className={styles.readyMessage}>当前信息足够生成第一版；系统仍会标记需要你人工核对的表达。</div>}
          <div className={styles.actions}><button type="button" className="btn" disabled={busy !== null} onClick={optimize}>{busy === 'optimize' ? '正在生成岗位版本…' : '生成优化版内容'}</button><small>生成后自动保存，投递前仍需由你确认事实。</small></div>
        </section>
      )}

      {version && (
        <section className={styles.stepCard}>
          <div className={styles.stepHeading}><span>04</span><div><h3>岗位定向优化版</h3><p>{version.title} · 已保存于 {dateLabel(version.created_at)}</p></div><button type="button" className="btn btn-secondary" onClick={copyVersion}>复制全部内容</button></div>
          {version.optimized_content.positioning && <div className={styles.positioning}><span>内容定位</span><strong>{version.optimized_content.positioning}</strong></div>}
          <div className={styles.resumePaper}>{(version.optimized_content.sections ?? []).map((section) => <section key={section.name}><h4>{section.name}</h4>{section.items.map((item, index) => <article key={`${section.name}-${index}`}><div><strong>{item.heading}</strong><span>{item.subheading}</span></div><ul>{item.bullets.map((bullet, bulletIndex) => <li key={bulletIndex} data-review={bullet.confidence === 'needs_review'}><p>{bullet.text}</p><small>{bullet.confidence === 'needs_review' ? '需要核实' : '信息已确认'} · 来源：{bullet.source}</small></li>)}</ul></article>)}</section>)}</div>
          {!!version.unresolved_items.length && <div className={styles.unresolved}><h4>投递前仍需核实</h4>{version.unresolved_items.map((item) => <span key={item}>{item}</span>)}</div>}
          {!!version.change_log.length && <details className={styles.changeLog}><summary>查看重要修改对照（{version.change_log.length}）</summary><div>{version.change_log.map((item, index) => <article key={index}><strong>{item.location}</strong><p><del>{item.before}</del></p><p>{item.after}</p><small>{item.reason}</small></article>)}</div></details>}
        </section>
      )}

      {!!diagnosticHistory.length && (
        <section className={styles.history}>
          <div><h3>历史诊断与版本</h3><p>同一份基础简历可以针对不同岗位生成不同版本。</p></div>
          <div>{diagnosticHistory.map((item) => <button type="button" key={item.id} data-active={diagnostic?.id === item.id} onClick={() => loadDiagnostic(item)}><span>{dateLabel(item.created_at)}</span><strong>{item.target_company ? `${item.target_company} · ` : ''}{item.target_job_title}</strong><b>{item.overall_score}</b><small>{versionHistory.some((entry) => entry.diagnostic_id === item.id) ? '已有优化版' : '仅诊断'}</small></button>)}</div>
        </section>
      )}

      <footer className={styles.disclaimer}>AI诊断用于求职准备，不代表企业筛选结论。请删除简历中非必要的身份证号、家庭住址等敏感信息；系统不会要求AI补造经历或成果。</footer>
    </div>
  );
}

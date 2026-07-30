'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';

type CampSettings = {
  intro_title: string;
  intro_body: string;
  intro_image_url: string | null;
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
};

type Task = {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  due_at: string | null;
  sort_order: number;
};

type Submission = {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  file_url: string | null;
  status: string;
  teacher_note: string;
  updated_at: string;
};

type Draft = {
  content: string;
  file: File | null;
  fileUrl: string;
  loading: boolean;
};

const defaultSettings: CampSettings = {
  intro_title: 'JOBHOT 求职训练营',
  intro_body: '系统化完成简历、投递、笔试、面试和 offer 选择训练。登录后可以查看每节课作业，并完成打卡提交。',
  intro_image_url: null,
};

const createDraft = (): Draft => ({
  content: '',
  file: null,
  fileUrl: '',
  loading: false,
});

function fmtDateTime(iso: string | null) {
  if (!iso) return '不限时';
  const date = new Date(iso);
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export default function CareerCampPage() {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<CampSettings>(defaultSettings);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const [{ data: settingData }, { data: lessonData }, { data: taskData }] = await Promise.all([
      supabase.from('career_camp_settings').select('intro_title,intro_body,intro_image_url').eq('key', 'main').maybeSingle(),
      supabase.from('career_camp_lessons').select('id,title,description,sort_order').eq('is_published', true).order('sort_order'),
      supabase.from('career_camp_tasks').select('id,lesson_id,title,description,due_at,sort_order').eq('is_published', true).order('sort_order'),
    ]);

    setSettings((settingData as CampSettings | null) ?? defaultSettings);
    setLessons((lessonData ?? []) as Lesson[]);
    setTasks((taskData ?? []) as Task[]);

    if (user) {
      const { data: submissionData } = await supabase
        .from('career_camp_submissions')
        .select('id,task_id,user_id,content,file_url,status,teacher_note,updated_at')
        .eq('user_id', user.id);
      setSubmissions((submissionData ?? []) as Submission[]);
    } else {
      setSubmissions([]);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    const timer = window.setTimeout(() => {
      fetchData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, fetchData]);

  const tasksByLesson = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const list = map.get(task.lesson_id) ?? [];
      list.push(task);
      map.set(task.lesson_id, list);
    }
    return map;
  }, [tasks]);

  const submissionsByTask = useMemo(() => {
    const map = new Map<string, Submission>();
    for (const submission of submissions) map.set(submission.task_id, submission);
    return map;
  }, [submissions]);

  const completion = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(task => submissionsByTask.has(task.id)).length;
    return {
      total,
      done,
      rate: total ? Math.round((done / total) * 100) : 0,
    };
  }, [submissionsByTask, tasks]);

  function updateDraft(taskId: string, patch: Partial<Draft>) {
    setDrafts(prev => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] ?? createDraft()),
        ...patch,
      },
    }));
  }

  async function uploadHomeworkFile(taskId: string, file: File) {
    if (!supabase || !user) return '';
    const safeName = file.name.replace(/[^\w.\-]+/g, '-');
    const path = `${user.id}/${taskId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('career-camp-homework')
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('career-camp-homework').getPublicUrl(path);
    return data.publicUrl;
  }

  async function submitTask(task: Task) {
    if (!supabase || !user) return;
    const draft = drafts[task.id] ?? { content: '', file: null, fileUrl: '', loading: false };
    const existing = submissionsByTask.get(task.id);

    if (!draft.content.trim() && !draft.file && !draft.fileUrl.trim() && !existing?.file_url) {
      setError('请填写作业说明，或上传一个文件。');
      return;
    }

    setError('');
    setMessage('');
    updateDraft(task.id, { loading: true });

    try {
      let fileUrl = draft.fileUrl.trim() || existing?.file_url || '';
      if (draft.file) fileUrl = await uploadHomeworkFile(task.id, draft.file);

      const payload = {
        task_id: task.id,
        user_id: user.id,
        content: draft.content.trim() || existing?.content || '',
        file_url: fileUrl || null,
        status: 'submitted',
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('career_camp_submissions')
        .upsert(payload, { onConflict: 'task_id,user_id' });

      if (upsertError) throw upsertError;
      setMessage('打卡已提交。');
      updateDraft(task.id, { content: '', file: null, fileUrl: '', loading: false });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请稍后再试。');
      updateDraft(task.id, { loading: false });
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>求职训练营</h1>
        <p>跟着课程节奏完成作业打卡，把求职动作真正推进下去</p>
      </div>

      {message && <div className="admin-msg admin-msg-success">{message}</div>}
      {error && <div className="admin-msg admin-msg-error">{error}</div>}

      <section className="timeline-card" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '1.25rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem' }}>{settings.intro_title}</h2>
          <div style={{ color: 'var(--text-muted)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{settings.intro_body}</div>
        </div>
        {settings.intro_image_url && (
          <img src={settings.intro_image_url} alt="训练营介绍图" style={{ width: 180, maxWidth: '100%', borderRadius: 12, border: '1px solid var(--border)' }} />
        )}
      </section>

      <section className="timeline-card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>学员登录</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {user ? `已登录：${user.email}` : '登录后可提交作业、查看自己的累计完成情况。'}
            </p>
          </div>
          {user ? (
            <div className="timeline-tags">
              <span className="tag">已完成 {completion.done}/{completion.total}</span>
              <span className="tag">完成率 {completion.rate}%</span>
            </div>
          ) : (
            <Link href="/login?redirect=/tools/career-camp" className="btn">学员登录</Link>
          )}
        </div>
      </section>

      {loading ? (
        <div className="empty-state"><div className="empty-state-title">加载中...</div></div>
      ) : lessons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">训练营课程准备中</div>
          <div className="empty-state-desc">管理员发布课程后，会在这里展示。</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {lessons.map((lesson, index) => {
            const lessonTasks = tasksByLesson.get(lesson.id) ?? [];
            return (
              <section key={lesson.id} className="timeline-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--accent-muted)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>{lesson.title}</h2>
                    {lesson.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>{lesson.description}</p>}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
                  {lessonTasks.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>本节课暂无课后作业。</div>
                  ) : lessonTasks.map(task => {
                    const submission = submissionsByTask.get(task.id);
                    const draft = drafts[task.id] ?? { content: '', file: null, fileUrl: '', loading: false };
                    return (
                      <div key={task.id} className="card" style={{ background: 'var(--bg-elevated)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                          <div>
                            <h3 style={{ fontWeight: 700 }}>{task.title}</h3>
                            {task.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, marginTop: '0.25rem' }}>{task.description}</p>}
                          </div>
                          <span className="tag">截止 {fmtDateTime(task.due_at)}</span>
                        </div>

                        {submission && (
                          <div style={{ marginTop: '0.75rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 10 }}>
                            <strong style={{ color: 'var(--success)' }}>已打卡</strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>更新时间：{fmtDateTime(submission.updated_at)}</div>
                            {submission.teacher_note && <div style={{ marginTop: '0.5rem' }}>老师反馈：{submission.teacher_note}</div>}
                            {submission.file_url && <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem' }}>查看已上传文件</a>}
                          </div>
                        )}

                        {user ? (
                          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.9rem' }}>
                            <textarea
                              className="field"
                              rows={3}
                              placeholder="写下作业说明、复盘或提交备注..."
                              value={draft.content}
                              onChange={e => updateDraft(task.id, { content: e.target.value })}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                              <input className="field" type="file" onChange={e => updateDraft(task.id, { file: e.target.files?.[0] ?? null })} />
                              <input className="field" placeholder="或粘贴文件/作品链接" value={draft.fileUrl} onChange={e => updateDraft(task.id, { fileUrl: e.target.value })} />
                            </div>
                            <button type="button" className="btn" disabled={draft.loading} onClick={() => submitTask(task)}>
                              {draft.loading ? '提交中...' : submission ? '更新打卡' : '提交打卡'}
                            </button>
                          </div>
                        ) : (
                          <Link href="/login?redirect=/tools/career-camp" className="btn" style={{ marginTop: '0.9rem' }}>登录后提交作业</Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

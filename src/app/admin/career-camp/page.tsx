'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/lib/supabase';

type Settings = {
  intro_title: string;
  intro_body: string;
  intro_image_url: string | null;
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  is_published: boolean;
};

type Task = {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  due_at: string | null;
  sort_order: number;
  is_published: boolean;
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

type AccountUser = {
  user_id: string;
  email: string;
};

const emptySettings: Settings = {
  intro_title: 'JOBHOT 求职训练营',
  intro_body: '',
  intro_image_url: '',
};

function fmtDateTime(iso: string | null) {
  if (!iso) return '不限时';
  const date = new Date(iso);
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminCareerCampPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', sort_order: 10 });
  const [taskForm, setTaskForm] = useState({ lesson_id: '', title: '', description: '', due_at: '', sort_order: 10 });
  const [activeTab, setActiveTab] = useState<'content' | 'outline' | 'stats'>('content');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    setLoading(true);
    setError('');

    const [settingsRes, lessonsRes, tasksRes, submissionsRes, usersRes] = await Promise.all([
      supabase.from('career_camp_settings').select('intro_title,intro_body,intro_image_url').eq('key', 'main').maybeSingle(),
      supabase.from('career_camp_lessons').select('*').order('sort_order'),
      supabase.from('career_camp_tasks').select('*').order('sort_order'),
      supabase.from('career_camp_submissions').select('*').order('updated_at', { ascending: false }),
      supabase.rpc('admin_list_users_safe'),
    ]);

    if (settingsRes.data) setSettings(settingsRes.data as Settings);
    setLessons((lessonsRes.data ?? []) as Lesson[]);
    setTasks((tasksRes.data ?? []) as Task[]);
    setSubmissions((submissionsRes.data ?? []) as Submission[]);
    setUsers(((usersRes.data ?? []) as { user_id: string; email: string }[]).map(item => ({ user_id: item.user_id, email: item.email })));
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (authLoading || adminLoading || !isAdmin) return;
    const timer = window.setTimeout(() => {
      fetchData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [adminLoading, authLoading, fetchData, isAdmin]);

  const userEmail = useMemo(() => {
    const map = new Map<string, string>();
    for (const account of users) map.set(account.user_id, account.email);
    return map;
  }, [users]);

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
    const map = new Map<string, Submission[]>();
    for (const submission of submissions) {
      const list = map.get(submission.task_id) ?? [];
      list.push(submission);
      map.set(submission.task_id, list);
    }
    return map;
  }, [submissions]);

  const studentStats = useMemo(() => {
    const totalTasks = tasks.filter(task => task.is_published).length;
    const map = new Map<string, { user_id: string; email: string; done: number; rate: number; submissions: Submission[] }>();
    for (const submission of submissions) {
      const item = map.get(submission.user_id) ?? {
        user_id: submission.user_id,
        email: userEmail.get(submission.user_id) ?? submission.user_id,
        done: 0,
        rate: 0,
        submissions: [],
      };
      item.done += 1;
      item.submissions.push(submission);
      item.rate = totalTasks ? Math.round((item.done / totalTasks) * 100) : 0;
      map.set(submission.user_id, item);
    }
    return [...map.values()].sort((a, b) => b.done - a.done);
  }, [submissions, tasks, userEmail]);

  async function saveSettings() {
    if (!supabase) return;
    setError('');
    const { error: saveError } = await supabase
      .from('career_camp_settings')
      .upsert({ key: 'main', ...settings, updated_at: new Date().toISOString() });
    if (saveError) {
      setError(saveError.message);
    } else {
      setMessage('训练营介绍已保存。');
      fetchData();
    }
  }

  async function createLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !lessonForm.title.trim()) return;
    const { error: createError } = await supabase.from('career_camp_lessons').insert({
      title: lessonForm.title.trim(),
      description: lessonForm.description.trim(),
      sort_order: lessonForm.sort_order,
      is_published: true,
    });
    if (createError) setError(createError.message);
    else {
      setMessage('课程已创建。');
      setLessonForm({ title: '', description: '', sort_order: lessonForm.sort_order + 10 });
      fetchData();
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !taskForm.lesson_id || !taskForm.title.trim()) return;
    const { error: createError } = await supabase.from('career_camp_tasks').insert({
      lesson_id: taskForm.lesson_id,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      due_at: taskForm.due_at ? new Date(taskForm.due_at).toISOString() : null,
      sort_order: taskForm.sort_order,
      is_published: true,
    });
    if (createError) setError(createError.message);
    else {
      setMessage('作业任务已创建。');
      setTaskForm({ lesson_id: taskForm.lesson_id, title: '', description: '', due_at: '', sort_order: taskForm.sort_order + 10 });
      fetchData();
    }
  }

  async function toggleLesson(lesson: Lesson) {
    if (!supabase) return;
    await supabase.from('career_camp_lessons').update({ is_published: !lesson.is_published }).eq('id', lesson.id);
    fetchData();
  }

  async function toggleTask(task: Task) {
    if (!supabase) return;
    await supabase.from('career_camp_tasks').update({ is_published: !task.is_published }).eq('id', task.id);
    fetchData();
  }

  async function saveTeacherNote(submission: Submission, note: string) {
    if (!supabase) return;
    const { error: updateError } = await supabase
      .from('career_camp_submissions')
      .update({ teacher_note: note, status: 'reviewed', updated_at: new Date().toISOString() })
      .eq('id', submission.id);
    if (updateError) setError(updateError.message);
    else {
      setMessage('老师反馈已保存。');
      fetchData();
    }
  }

  if (authLoading || adminLoading) {
    return <div className="page admin-page"><div className="admin-loading">验证权限中...</div></div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="page admin-page">
        <div className="admin-auth-guard">
          <h2>权限不足</h2>
          <p>需要管理员权限才能访问训练营管理。</p>
          <Link href="/login" className="btn">去登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div>
          <h1>求职训练营管理</h1>
          <p>维护介绍、课程大纲、课后作业和学员打卡统计</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>{loading ? '加载中...' : '刷新'}</button>
      </div>

      {message && <div className="admin-msg admin-msg-success">{message}</div>}
      {error && <div className="admin-msg admin-msg-error">{error}</div>}

      <div className="segmented" style={{ marginBottom: '1rem' }}>
        {[
          ['content', '训练营介绍'],
          ['outline', '课程与作业'],
          ['stats', '打卡统计'],
        ].map(([key, label]) => (
          <button key={key} className={`seg-item${activeTab === key ? ' seg-item-active' : ''}`} onClick={() => setActiveTab(key as typeof activeTab)}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <section className="admin-section">
          <h2 className="admin-section-title">训练营介绍图文</h2>
          <div style={{ display: 'grid', gap: '0.9rem' }}>
            <input className="field" value={settings.intro_title} onChange={e => setSettings({ ...settings, intro_title: e.target.value })} placeholder="训练营标题" />
            <input className="field" value={settings.intro_image_url ?? ''} onChange={e => setSettings({ ...settings, intro_image_url: e.target.value })} placeholder="介绍图片 URL（可选）" />
            <textarea className="field" rows={8} value={settings.intro_body} onChange={e => setSettings({ ...settings, intro_body: e.target.value })} placeholder="训练营介绍正文，支持换行" />
            <button className="btn" onClick={saveSettings}>保存介绍</button>
          </div>
        </section>
      )}

      {activeTab === 'outline' && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <section className="admin-section">
            <h2 className="admin-section-title">创建课程</h2>
            <form onSubmit={createLesson} className="camp-admin-form">
              <label className="camp-field camp-field-title">
                <span>每节课主题</span>
                <input className="field" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="例如：简历诊断与岗位定位" required />
              </label>
              <label className="camp-field camp-field-order">
                <span>课程顺序</span>
                <input className="field" type="number" min={1} value={lessonForm.sort_order} onChange={e => setLessonForm({ ...lessonForm, sort_order: Number(e.target.value) })} placeholder="如 1" />
                <small>数字越小越靠前</small>
              </label>
              <label className="camp-field camp-field-desc">
                <span>课程说明</span>
                <textarea className="field" rows={3} value={lessonForm.description} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="这节课讲什么、适合谁、完成后有什么产出" />
              </label>
              <button className="btn" type="submit">新增课程</button>
            </form>
          </section>

          <section className="admin-section">
            <h2 className="admin-section-title">创建课后作业</h2>
            <form onSubmit={createTask} className="camp-admin-form camp-task-form">
              <label className="camp-field">
                <span>所属课程</span>
                <select className="field" value={taskForm.lesson_id} onChange={e => setTaskForm({ ...taskForm, lesson_id: e.target.value })} required>
                  <option value="">选择课程</option>
                  {lessons.map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
                </select>
              </label>
              <label className="camp-field">
                <span>作业标题</span>
                <input className="field" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="例如：上传一版简历初稿" required />
              </label>
              <label className="camp-field">
                <span>截止时间</span>
                <input className="field" type="datetime-local" value={taskForm.due_at} onChange={e => setTaskForm({ ...taskForm, due_at: e.target.value })} />
              </label>
              <label className="camp-field camp-field-order">
                <span>作业顺序</span>
                <input className="field" type="number" min={1} value={taskForm.sort_order} onChange={e => setTaskForm({ ...taskForm, sort_order: Number(e.target.value) })} placeholder="如 10" />
                <small>同一节课内排序</small>
              </label>
              <label className="camp-field camp-field-desc">
                <span>作业要求</span>
                <textarea className="field" rows={3} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="说明提交内容、格式、附件要求等" />
              </label>
              <button className="btn" type="submit">新增作业</button>
            </form>
          </section>

          <section className="admin-section">
            <h2 className="admin-section-title">课程大纲</h2>
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="timeline-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <strong>{index + 1}. {lesson.title}</strong>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{lesson.description || '暂无说明'}</p>
                    </div>
                    <button className="btn-sm btn-secondary" onClick={() => toggleLesson(lesson)}>{lesson.is_published ? '隐藏' : '发布'}</button>
                  </div>
                  <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {(tasksByLesson.get(lesson.id) ?? []).map(task => (
                      <div key={task.id} className="card" style={{ padding: '0.8rem', background: 'var(--bg-elevated)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                          <span>{task.title}</span>
                          <button className="btn-sm btn-secondary" onClick={() => toggleTask(task)}>{task.is_published ? '隐藏' : '发布'}</button>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>截止：{fmtDateTime(task.due_at)} · 已完成：{submissionsByTask.get(task.id)?.length ?? 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <section className="admin-section">
            <h2 className="admin-section-title">学员累计统计</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>学员账号</th>
                    <th>累计完成</th>
                    <th>完成率</th>
                    <th>最近提交</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>暂无打卡记录</td></tr>
                  ) : studentStats.map(stat => (
                    <tr key={stat.user_id}>
                      <td>{stat.email}</td>
                      <td>{stat.done}</td>
                      <td>{stat.rate}%</td>
                      <td>{fmtDateTime(stat.submissions[0]?.updated_at ?? null)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section">
            <h2 className="admin-section-title">每节课完成情况与作业详情</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {tasks.map(task => (
                <div key={task.id} className="timeline-card">
                  <h3 style={{ fontWeight: 700 }}>{task.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>完成 {submissionsByTask.get(task.id)?.length ?? 0} 人 · 截止 {fmtDateTime(task.due_at)}</p>
                  <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                    {(submissionsByTask.get(task.id) ?? []).map(submission => (
                      <div key={submission.id} className="card" style={{ background: 'var(--bg-elevated)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                          <strong>{userEmail.get(submission.user_id) ?? submission.user_id}</strong>
                          <span className="tag">{fmtDateTime(submission.updated_at)}</span>
                        </div>
                        {submission.content && <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{submission.content}</p>}
                        {submission.file_url && <a href={submission.file_url} target="_blank" rel="noopener noreferrer">查看上传文件</a>}
                        <textarea
                          className="field"
                          rows={2}
                          defaultValue={submission.teacher_note}
                          placeholder="老师反馈"
                          style={{ marginTop: '0.75rem' }}
                          onBlur={e => {
                            if (e.target.value !== submission.teacher_note) saveTeacherNote(submission, e.target.value);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

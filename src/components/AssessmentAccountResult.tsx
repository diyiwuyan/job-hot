'use client';

import Link from 'next/link';
import type { StoredAssessmentResult } from '@/hooks/useAssessmentResult';

type SavedResultCardProps = {
  email?: string | null;
  loading: boolean;
  error: string;
  savedResult: StoredAssessmentResult | null;
  onView: () => void;
};

export function SavedAssessmentResultCard({ email, loading, error, savedResult, onView }: SavedResultCardProps) {
  if (!email) {
    return (
      <section className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--border-light)' }}>
        <strong style={{ fontSize: '.86rem' }}>登录后可把结果绑定到账号</strong>
        <p style={{ color: 'var(--text-muted)', fontSize: '.76rem', lineHeight: 1.7, margin: '.35rem 0 .7rem' }}>未登录也可以完成测评，但结果不会跨设备同步。</p>
        <Link href="/login" className="btn btn-secondary btn-sm">登录账号</Link>
      </section>
    );
  }

  if (loading) {
    return <section className="card" style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '.8rem' }}>正在读取 {email} 的历史测评结果…</section>;
  }

  if (savedResult) {
    const savedAt = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(savedResult.updated_at));
    return (
      <section className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--success)' }}>
        <div style={{ color: 'var(--success)', fontSize: '.72rem', fontWeight: 800, marginBottom: '.25rem' }}>✓ 账号内已有测评结果</div>
        <strong style={{ display: 'block', fontSize: '.95rem' }}>{savedResult.result_name}</strong>
        <p style={{ color: 'var(--text-muted)', fontSize: '.74rem', lineHeight: 1.7, margin: '.3rem 0 .75rem' }}>保存于 {savedAt} · 账号 {email}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onView}>查看上次结果</button>
      </section>
    );
  }

  return (
    <section className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--accent)' }}>
      <strong style={{ fontSize: '.86rem' }}>本次结果会自动保存</strong>
      <p style={{ color: 'var(--text-muted)', fontSize: '.76rem', lineHeight: 1.7, margin: '.35rem 0 0' }}>完成后将绑定到账号 {email}，刷新或换设备登录后仍可再次查看。{error ? ` ${error}` : ''}</p>
    </section>
  );
}

type CloudStatusProps = {
  email?: string | null;
  saving: boolean;
  error: string;
  savedResult: StoredAssessmentResult | null;
};

export function AssessmentCloudStatus({ email, saving, error, savedResult }: CloudStatusProps) {
  if (!email) {
    return <section className="card" style={{ margin: '1rem 0', fontSize: '.8rem' }}>当前未登录。<Link href="/login">登录账号</Link>后重新完成测评，即可把结果同步到账号。</section>;
  }

  const text = saving
    ? `正在保存到账号 ${email}…`
    : error
      ? error
      : savedResult
        ? `已自动保存到账号 ${email}，刷新页面后可从测评首页再次查看。`
        : `准备保存到账号 ${email}。`;

  return (
    <section
      className="card"
      style={{
        margin: '1rem 0',
        borderLeft: `4px solid ${error ? 'var(--danger)' : saving ? 'var(--warning)' : 'var(--success)'}`,
      }}
      role="status"
    >
      <strong>{saving ? '云端保存中' : error ? '云端保存失败' : '✓ 已绑定账号'}</strong>
      <span style={{ display: 'block', marginTop: '.25rem', fontSize: '.76rem' }}>{text}</span>
    </section>
  );
}

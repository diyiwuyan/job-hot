'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';

function getInitialRedirectPath() {
  if (typeof window === 'undefined') return '/';
  const value = new URLSearchParams(window.location.search).get('redirect') || '/';
  return value.startsWith('/') ? value : '/';
}

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [redirectPath] = useState(getInitialRedirectPath);

  // If already logged in, show account info
  if (user) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="timeline-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '1.25rem', color: 'white', fontWeight: 700 }}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>已登录</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{user.email}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <a href={redirectPath === '/' ? '/bookmarks' : redirectPath} className="btn" style={{ flex: 1, justifyContent: 'center' }}>
              {redirectPath === '/' ? '我的收藏' : '返回上一页'}
            </a>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={async () => {
                await supabase?.auth.signOut();
                router.push('/');
              }}
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError('登录服务暂时不可用，请稍后再试。');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'register') {
      if (!nickname.trim()) {
        setError('请输入昵称');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname: nickname.trim() },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('注册成功！请查收验证邮件，点击链接后即可登录。');
        setNickname('');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('邮箱尚未验证，请先查收验证邮件并点击链接。');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('邮箱或密码错误');
        } else {
          setError(error.message);
        }
      } else {
        router.push(redirectPath);
      }
    }

    setLoading(false);
  }

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="timeline-card" style={{ maxWidth: '420px', width: '100%', padding: '2rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            <span>JOB</span>
            <span style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HOT</span>
          </span>
        </div>

        {/* Tabs */}
        <div className="segmented" style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={`seg-item${mode === 'login' ? ' seg-item-active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setMessage(''); }}
          >
            登录
          </button>
          <button
            type="button"
            className={`seg-item${mode === 'register' ? ' seg-item-active' : ''}`}
            onClick={() => { setMode('register'); setError(''); setMessage(''); }}
          >
            注册
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>昵称</label>
              <input
                type="text"
                className="field"
                placeholder="请输入昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>邮箱</label>
            <input
              type="email"
              className="field"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>密码</label>
            <input
              type="password"
              className="field"
              placeholder={mode === 'register' ? '至少 6 位密码' : '请输入密码'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div style={{ fontSize: '0.8125rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ fontSize: '0.8125rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
              {message}
            </div>
          )}

          <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem', textAlign: 'center', lineHeight: 1.6 }}>
          {mode === 'register'
            ? '注册后需要验证邮箱才能登录。登录后可以使用收藏功能，跨设备同步。'
            : '登录后可以收藏职位信息，数据云端同步，多设备通用。'
          }
        </p>
      </div>
    </div>
  );
}

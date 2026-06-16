'use client';

import { useState } from 'react';
import Link from 'next/link';

type FormData = {
  wechat: string;
  phone: string;
};

export default function AssessmentPage() {
  const [form, setForm] = useState<FormData>({ wechat: '', phone: '' });
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!form.wechat.trim() || !form.phone.trim()) {
      setError('请填写完整信息后开始测评');
      return;
    }
    if (!/^1\d{10}$/.test(form.phone.trim())) {
      setError('请输入正确的11位手机号');
      return;
    }
    setError('');
    setUnlocked(true);
    // 存储到 localStorage 以便后续测评页面读取
    localStorage.setItem('jobhot_user_info', JSON.stringify(form));
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>职业测评</h1>
        <p>科学测评工具，帮你找到适合的方向</p>
      </div>

      {/* 信息采集门槛 */}
      {!unlocked && (
        <section className="card" style={{ maxWidth: 480, margin: '0 auto 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '2.5rem' }}>🔓</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem' }}>
              全部测评 <span style={{ color: 'var(--accent)' }}>免费</span> 使用
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.6 }}>
              填写联系方式即可解锁所有测评工具，我们会在测评完成后将详细报告发送给你
            </p>
          </div>

          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
                微信号 *
              </label>
              <input
                type="text"
                placeholder="用于发送测评报告"
                value={form.wechat}
                onChange={(e) => setForm({ ...form, wechat: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
                手机号 *
              </label>
              <input
                type="tel"
                placeholder="用于接收开营通知"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '0.8rem', color: '#f87171', margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              style={{
                marginTop: '0.5rem',
                padding: '0.7rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
            >
              解锁全部测评（免费）
            </button>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
              信息仅用于发送报告，不会外泄
            </p>
          </form>
        </section>
      )}

      {/* 测评列表 */}
      <section style={{ opacity: unlocked ? 1 : 0.5, pointerEvents: unlocked ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.05rem',
            fontWeight: 700,
            paddingBottom: '0.6rem',
            marginBottom: '1rem',
            borderBottom: '2px solid var(--border)',
          }}
        >
          <span>📋</span> 选择测评
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 霍兰德 */}
          <Link
            href="/tools/holland"
            className="timeline-card timeline-card-featured"
            style={{ display: 'block', textDecoration: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.5" />
                </svg>
              </span>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                  霍兰德职业兴趣测试
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Holland RIASEC · 48 题 · 约 5 分钟
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              通过六大职业兴趣维度（现实/研究/艺术/社会/企业/常规），测出你的霍兰德代码，得到适合的职业方向与专业参考。
            </p>
            <div className="timeline-tags" style={{ marginTop: '0.5rem' }}>
              <span className="tag">职业兴趣</span>
              <span className="tag">方向探索</span>
              <span className="tag">免费</span>
            </div>
          </Link>

          {/* MBTI */}
          <div
            className="timeline-card timeline-card-featured"
            style={{ display: 'block', position: 'relative' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                  <path d="M12 12l7-7" />
                </svg>
              </span>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                  MBTI 性格类型测试
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  16型人格 · 70 题 · 约 10 分钟
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              识别你的认知功能偏好（外向/内向、感觉/直觉、思维/情感、判断/知觉），找到与性格匹配的工作环境和团队角色。
            </p>
            <div className="timeline-tags" style={{ marginTop: '0.5rem' }}>
              <span className="tag">性格分析</span>
              <span className="tag">团队适配</span>
              <span className="tag">免费</span>
              <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>即将上线</span>
            </div>
          </div>

          {/* 求职底牌自测 */}
          <Link
            href="/tools/dipai"
            className="timeline-card timeline-card-featured"
            style={{ display: 'block', textDecoration: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M7 8h.01" />
                  <path d="M12 8h.01" />
                  <path d="M17 8h.01" />
                  <path d="M7 12h.01" />
                  <path d="M12 12h.01" />
                  <path d="M17 12h.01" />
                  <path d="M7 16h.01" />
                  <path d="M12 16h.01" />
                  <path d="M17 16h.01" />
                </svg>
              </span>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                  求职底牌自测表
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  12 题 · 约 5 分钟 · 测出你最缺哪张底牌
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              从「缓冲地带」「信息密度」「试错能力」「家庭期待管理」四个维度，诊断你在求职路上的最大短板，给出针对性改善建议。
            </p>
            <div className="timeline-tags" style={{ marginTop: '0.5rem' }}>
              <span className="tag">求职诊断</span>
              <span className="tag">短板识别</span>
              <span className="tag">免费</span>
            </div>
          </Link>
        </div>
      </section>

      {!unlocked && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.5rem' }}>
          ↑ 填写信息后即可解锁上方全部测评
        </p>
      )}
    </div>
  );
}

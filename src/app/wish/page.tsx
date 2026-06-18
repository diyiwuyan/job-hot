'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */

interface Wish {
  id: string;
  content: string;
  company_type: string;
  emoji: string;
  created_at: string;
}

/* ──────────────────────────────────────────
   Constants
   ────────────────────────────────────────── */

const COMPANY_TYPES = ['互联网', '外企', '国企', '金融', '游戏', '其他'] as const;

const MOOD_EMOJIS = ['🌟', '⭐', '💫', '🔥', '🎯', '🍀', '🎉', '✨'] as const;

const ENCOURAGEMENTS = [
  '愿望已送达宇宙，好运正在路上 ✨',
  '种下一颗种子，静待花开 🌱',
  '你的努力，终将被看见 💪',
  '好的 offer 正在赶来的路上 🚀',
  '相信自己，你值得最好的 🌟',
  '每一份投递都是一次靠近 🎯',
] as const;

const LOCAL_STORAGE_KEY = 'jobhot-wishes';

/* ──────────────────────────────────────────
   Helper: generate a simple id
   ────────────────────────────────────────── */

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ──────────────────────────────────────────
   Helper: localStorage CRUD
   ────────────────────────────────────────── */

function loadLocalWishes(): Wish[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Wish[]) : [];
  } catch {
    return [];
  }
}

function saveLocalWish(wish: Wish): void {
  const list = loadLocalWishes();
  list.unshift(wish);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
}

/* ──────────────────────────────────────────
   Helper: relative time
   ────────────────────────────────────────── */

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} 小时前`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(iso).toLocaleDateString('zh-CN');
}

/* ──────────────────────────────────────────
   Stars data (generated once, stable across re-renders)
   ────────────────────────────────────────── */

const STARS = Array.from({ length: 30 }, (_, i) => ({
  key: i,
  size: 1.5 + ((i * 7 + 3) % 10) * 0.25,
  top: ((i * 31 + 17) % 100),
  left: ((i * 53 + 7) % 100),
  duration: 2 + ((i * 11 + 5) % 10) * 0.4,
  delay: ((i * 13 + 2) % 10) * 0.3,
}));

/* ──────────────────────────────────────────
   Component
   ────────────────────────────────────────── */

export default function WishPage() {
  /* ── form state ── */
  const [content, setContent] = useState('');
  const [companyType, setCompanyType] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('🌟');

  /* ── UI state ── */
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [flyAway, setFlyAway] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [isLocal, setIsLocal] = useState(false);

  /* ── load wishes ── */
  const fetchWishes = useCallback(async () => {
    if (supabase) {
      const { data } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(60);
      if (data) setWishes(data as Wish[]);
    } else {
      setIsLocal(true);
      setWishes(loadLocalWishes());
    }
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  /* ── submit ── */
  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || !companyType) return;

    setSubmitting(true);

    const newWish: Wish = {
      id: uid(),
      content: trimmed,
      company_type: companyType,
      emoji,
      created_at: new Date().toISOString(),
    };

    /* trigger fly-away animation */
    setFlyAway(true);

    if (supabase) {
      await supabase.from('wishes').insert({
        content: newWish.content,
        company_type: newWish.company_type,
        emoji: newWish.emoji,
      });
    } else {
      saveLocalWish(newWish);
    }

    /* pick a random encouragement */
    setEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);

    /* wait for animation, then reset */
    setTimeout(() => {
      setFlyAway(false);
      setContent('');
      setCompanyType('');
      setEmoji('🌟');
      setSubmitting(false);
      fetchWishes();
    }, 1200);
  };

  /* ────────────────────────────────────────
     Render
     ──────────────────────────────────────── */

  return (
    <>
      <style jsx>{`
        /* ── Starry sky ── */
        .wish-sky {
          position: relative;
          overflow: hidden;
          border-radius: 0.75rem;
          padding: 3rem 1.5rem 2.5rem;
          text-align: center;
          background: linear-gradient(135deg, #0b0e2d 0%, #141852 40%, #1a1054 70%, #0d0f30 100%);
          border: 1px solid rgba(88, 166, 255, 0.15);
          margin-bottom: 1rem;
        }

        .wish-sky-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #e6edf3;
          margin-bottom: 0.35rem;
          position: relative;
          z-index: 2;
        }

        .wish-sky-sub {
          font-size: 0.85rem;
          color: #8b949e;
          position: relative;
          z-index: 2;
        }

        /* stars */
        .star {
          position: absolute;
          border-radius: 50%;
          background: #fff;
          animation: twinkle var(--d, 3s) ease-in-out infinite alternate;
          opacity: 0;
          z-index: 1;
        }

        @keyframes twinkle {
          0%   { opacity: 0.15; transform: scale(0.8); }
          50%  { opacity: 1;    transform: scale(1.2); }
          100% { opacity: 0.2;  transform: scale(0.9); }
        }

        /* shooting star */
        .shooting-star {
          position: absolute;
          width: 80px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.8), transparent);
          top: 18%;
          left: -80px;
          animation: shoot 4.5s ease-in-out infinite;
          animation-delay: 2s;
          z-index: 1;
        }

        @keyframes shoot {
          0%   { left: -80px; top: 18%; opacity: 0; }
          5%   { opacity: 1; }
          30%  { left: 110%; top: 55%; opacity: 0; }
          100% { left: 110%; top: 55%; opacity: 0; }
        }

        /* bottle silhouette */
        .wish-bottle {
          display: inline-block;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 2;
          animation: bottle-float 4s ease-in-out infinite;
        }

        @keyframes bottle-float {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50%      { transform: translateY(-8px) rotate(3deg); }
        }

        /* ── Form area ── */
        .wish-form-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.25rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .wish-form-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 0.5rem;
        }

        .wish-textarea {
          width: 100%;
          min-height: 80px;
          resize: vertical;
          padding: 0.625rem 1rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          color: var(--text);
          font-size: 0.875rem;
          font-family: inherit;
          line-height: 1.6;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .wish-textarea:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-muted);
        }

        .wish-textarea::placeholder {
          color: var(--text-muted);
        }

        /* company type tags */
        .wish-tag-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .wish-tag {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.625rem;
          font-size: 0.75rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .wish-tag:hover {
          background: var(--accent-muted);
          color: var(--accent);
          border-color: var(--accent);
        }

        .wish-tag-active {
          background: var(--accent-muted);
          color: var(--accent);
          border-color: var(--accent);
        }

        /* emoji picker */
        .wish-emoji-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .wish-emoji-btn {
          width: 2.25rem;
          height: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wish-emoji-btn:hover {
          border-color: var(--accent);
          transform: scale(1.15);
        }

        .wish-emoji-active {
          border-color: var(--accent);
          background: var(--accent-muted);
          transform: scale(1.15);
          box-shadow: 0 0 0 2px var(--accent-muted);
        }

        /* submit button */
        .wish-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1.5rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, var(--accent), #a371f7);
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
        }

        .wish-submit:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .wish-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Fly-away card animation ── */
        .wish-fly-wrapper {
          position: relative;
          overflow: hidden;
        }

        .wish-fly-card {
          transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .wish-fly-card-go {
          opacity: 0;
          transform: translateY(-120px) scale(0.6);
          filter: blur(4px);
        }

        /* encouragement text */
        .wish-encourage {
          text-align: center;
          padding: 1.5rem 1rem;
          font-size: 1rem;
          color: var(--accent);
          font-weight: 600;
          animation: encourage-in 0.6s ease-out 0.4s both;
        }

        @keyframes encourage-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Wish wall ── */
        .wish-wall-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.75rem;
        }

        .wish-wall-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 0.75rem;
        }

        .wish-wall-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
        }

        .wish-wall-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(88, 166, 255, 0.03) 0%,
            transparent 60%
          );
          pointer-events: none;
        }

        .wish-wall-card:hover {
          border-color: var(--border-light);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .wish-wall-emoji {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .wish-wall-content {
          font-size: 0.875rem;
          color: var(--text);
          line-height: 1.6;
          margin-bottom: 0.5rem;
          word-break: break-word;
        }

        .wish-wall-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .wish-wall-type {
          display: inline-flex;
          align-items: center;
          padding: 0.125rem 0.5rem;
          font-size: 0.6875rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-muted);
        }

        /* ── Empty state ── */
        .wish-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .wish-empty-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }

        /* ── Local mode hint ── */
        .wish-local-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        /* ── Section spacing ── */
        .wish-section {
          margin-top: 1.25rem;
        }

        .wish-form-section {
          margin-bottom: 1rem;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .wish-sky {
            padding: 2rem 1rem 1.75rem;
          }

          .wish-sky-title {
            font-size: 1.25rem;
          }

          .wish-wall-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .wish-wall-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page">
        {/* ── Starry sky hero ── */}
        <div className="wish-sky">
          {/* stars — 30 deterministic dots */}
          {STARS.map((s) => (
            <span
              key={s.key}
              className="star"
              style={{
                width: s.size,
                height: s.size,
                top: `${s.top}%`,
                left: `${s.left}%`,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
          <div className="shooting-star" />

          <div className="wish-bottle">🏺</div>
          <div className="wish-sky-title">许愿池</div>
          <div className="wish-sky-sub">写下你的求职愿望，让好运看见你</div>
        </div>

        {/* ── Local-mode hint ── */}
        {isLocal && (
          <div className="wish-local-hint">
            <span>📦</span>
            <span>当前为本地模式，愿望保存在浏览器中，仅自己可见</span>
          </div>
        )}

        {/* ── Form card ── */}
        <div className="wish-fly-wrapper">
          {flyAway && encouragement && (
            <div className="wish-encourage">{encouragement}</div>
          )}

          <div className={`wish-form-card wish-fly-card ${flyAway ? 'wish-fly-card-go' : ''}`}>
            {/* Content */}
            <div className="wish-form-section">
              <label className="wish-form-label">✏️ 你的求职愿望</label>
              <textarea
                className="wish-textarea"
                placeholder="例如：希望拿到字节跳动的 offer…"
                maxLength={200}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div
                style={{
                  textAlign: 'right',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                }}
              >
                {content.length}/200
              </div>
            </div>

            {/* Company type */}
            <div className="wish-form-section">
              <label className="wish-form-label">🏢 目标公司类型</label>
              <div className="wish-tag-group">
                {COMPANY_TYPES.map((t) => (
                  <span
                    key={t}
                    className={`wish-tag ${companyType === t ? 'wish-tag-active' : ''}`}
                    onClick={() => setCompanyType(t)}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Emoji */}
            <div className="wish-form-section">
              <label className="wish-form-label">😊 选个心情</label>
              <div className="wish-emoji-group">
                {MOOD_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={`wish-emoji-btn ${emoji === e ? 'wish-emoji-active' : ''}`}
                    onClick={() => setEmoji(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              className="wish-submit"
              disabled={!content.trim() || !companyType || submitting}
              onClick={handleSubmit}
            >
              放飞愿望 🕊️
            </button>
          </div>
        </div>

        {/* ── Wish wall ── */}
        <div className="wish-section">
          <div className="wish-wall-title">
            🌌 许愿墙{isLocal ? '（我的愿望）' : ''}
          </div>

          {wishes.length === 0 ? (
            <div className="wish-empty">
              <div className="wish-empty-icon">🌠</div>
              <div>还没有人许愿，成为第一个吧</div>
            </div>
          ) : (
            <div className="wish-wall-grid">
              {wishes.map((w) => (
                <div key={w.id} className="wish-wall-card">
                  <div className="wish-wall-emoji">{w.emoji}</div>
                  <div className="wish-wall-content">{w.content}</div>
                  <div className="wish-wall-meta">
                    <span className="wish-wall-type">{w.company_type}</span>
                    <span>{relativeTime(w.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

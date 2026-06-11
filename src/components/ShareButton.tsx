'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FeedItem } from '@/lib/types';
import { generateQR, qrToDataURL } from '@/lib/qrcode';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/job-hot';

/** 构造某条岗位的站内分享详情页绝对链接 */
export function buildShareUrl(item: FeedItem): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${basePath}/item?id=${encodeURIComponent(item.id)}`;
}

/** 构造分享文案（带关键信息） */
export function buildShareText(item: FeedItem): string {
  const lines: string[] = [];
  lines.push(`【JOBHOT 招聘】${item.title}`);
  const metas: string[] = [];
  if (item.location) metas.push(`城市：${item.location}`);
  if (item.deadline) metas.push(`截止：${item.deadline}`);
  if (item.source) metas.push(`来源：${item.source}`);
  if (metas.length) lines.push(metas.join(' · '));
  if (item.summary) lines.push(item.summary.slice(0, 80));
  return lines.join('\n');
}

interface ShareButtonProps {
  item: FeedItem;
  /** 'icon' 用于卡片角标，'full' 用于详情页大按钮 */
  variant?: 'icon' | 'full';
}

export function ShareButton({ item, variant = 'icon' }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== 'undefined' ? buildShareUrl(item) : '';
  const shareText = buildShareText(item);
  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2000);
  }, []);

  // 打开面板时生成二维码（懒生成）
  useEffect(() => {
    if (open && !qrUrl && shareUrl) {
      try {
        setQrUrl(qrToDataURL(generateQR(shareUrl)));
      } catch {
        setQrUrl('');
      }
    }
  }, [open, qrUrl, shareUrl]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  async function handleCopy() {
    const text = `${shareText}\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('已复制分享文案和链接');
    } catch {
      // 降级
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('已复制分享文案和链接'); }
      catch { showToast('复制失败，请手动复制'); }
      document.body.removeChild(ta);
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title: item.title, text: shareText, url: shareUrl });
    } catch {
      /* 用户取消，忽略 */
    }
  }

  return (
    <div className="share-wrap" ref={panelRef}>
      {variant === 'icon' ? (
        <button
          type="button"
          className="share-btn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v); }}
          title="分享这条岗位"
          aria-label="分享"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          className="share-btn-full"
          onClick={(e) => { e.preventDefault(); setOpen(v => !v); }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          分享这条岗位
        </button>
      )}

      {open && (
        <div className="share-panel" onClick={(e) => e.stopPropagation()}>
          <div className="share-panel-title">分享岗位</div>

          <button type="button" className="share-action" onClick={handleCopy}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            复制文案和链接
          </button>

          {hasNativeShare && (
            <button type="button" className="share-action" onClick={handleNativeShare}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              系统分享…
            </button>
          )}

          <div className="share-qr">
            <div className="share-qr-label">扫码打开</div>
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="二维码" width={132} height={132} />
            ) : (
              <div className="share-qr-placeholder">生成中…</div>
            )}
          </div>
        </div>
      )}

      {toast && <div className="share-toast">{toast}</div>}
    </div>
  );
}

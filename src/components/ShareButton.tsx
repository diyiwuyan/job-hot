'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FeedItem } from '@/lib/types';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

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

const ShareGlyph = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export function ShareButton({ item, variant = 'icon' }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  // 是否移动端：支持原生分享视为移动端，弹精简面板；否则桌面端直接复制
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const shareText = buildShareText(item);

  useEffect(() => {
    // 仅在“真正的移动端”才弹面板：窄屏 + 主指针为粗(触屏) + 不存在精细指针 + 支持原生分享。
    // 触屏 Windows 笔记本等桌面设备一律走一键复制，绝不弹面板。
    const mm = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia.bind(window) : null;
    const coarse = mm ? mm('(pointer: coarse)').matches : false;
    const noFine = mm ? mm('(any-pointer: fine)').matches === false : false;
    const narrow = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
    const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    setIsMobile(narrow && coarse && noFine && canShare);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2000);
  }, []);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const doCopy = useCallback(async () => {
    const url = buildShareUrl(item);
    const text = `${shareText}\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('已复制，去粘贴吧');
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      document.body.removeChild(ta);
      showToast(ok ? '已复制，去粘贴吧' : '复制失败，请手动复制');
      return ok;
    }
  }, [item, shareText, showToast]);

  const doNativeShare = useCallback(async () => {
    try {
      await navigator.share({ title: item.title, text: shareText, url: buildShareUrl(item) });
    } catch {
      /* 用户取消，忽略 */
    }
  }, [item, shareText]);

  // 点击主按钮：桌面端直接复制；移动端打开精简面板
  const handleMainClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMobile) {
      setOpen(v => !v);
    } else {
      void doCopy();
    }
  }, [isMobile, doCopy]);

  return (
    <div className="share-wrap" ref={panelRef}>
      {variant === 'icon' ? (
        <button
          type="button"
          className="share-btn"
          onClick={handleMainClick}
          title={isMobile ? '分享这条岗位' : '复制分享文案和链接'}
          aria-label="分享"
        >
          <ShareGlyph size={14} />
        </button>
      ) : (
        <button type="button" className="share-btn-full" onClick={handleMainClick}>
          <ShareGlyph size={16} />
          {isMobile ? '分享这条岗位' : '复制分享文案和链接'}
        </button>
      )}

      {/* 仅移动端弹面板：复制 + 系统分享 */}
      {open && isMobile && (
        <div className="share-panel" onClick={(e) => e.stopPropagation()}>
          <div className="share-panel-title">分享岗位</div>

          <button type="button" className="share-action" onClick={() => { void doCopy(); setOpen(false); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            复制文案和链接
          </button>

          <button type="button" className="share-action" onClick={() => { void doNativeShare(); setOpen(false); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            系统分享…
          </button>
        </div>
      )}

      {toast && <div className="share-toast">{toast}</div>}
    </div>
  );
}

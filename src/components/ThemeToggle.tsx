'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

type ThemeMode = 'dark' | 'light' | 'auto' | 'ocean' | 'mint' | 'warm';

const themeOptions: { value: ThemeMode; label: string; swatch: string }[] = [
  { value: 'dark', label: '深色', swatch: 'linear-gradient(135deg, #111827, #2563eb)' },
  { value: 'light', label: '浅色', swatch: 'linear-gradient(135deg, #ffffff, #dbeafe)' },
  { value: 'ocean', label: '海盐', swatch: 'linear-gradient(135deg, #eff6ff, #a7f3d0)' },
  { value: 'mint', label: '薄荷', swatch: 'linear-gradient(135deg, #f0fdf4, #99f6e4)' },
  { value: 'warm', label: '暖阳', swatch: 'linear-gradient(135deg, #fff7ed, #fde68a)' },
  { value: 'auto', label: '自动', swatch: 'linear-gradient(135deg, #111827 0 50%, #ffffff 50% 100%)' },
];

function isThemeMode(value: string | null): value is ThemeMode {
  return themeOptions.some(option => option.value === value);
}

function getThemeSnapshot(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('jobhot-theme');
  return isThemeMode(saved) ? saved : 'dark';
}

function subscribeTheme(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener('jobhot-theme-change', onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener('jobhot-theme-change', onStoreChange);
  };
}

export function ThemeToggle() {
  const mode = useSyncExternalStore<ThemeMode>(subscribeTheme, getThemeSnapshot, () => 'dark');
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const activeOption = themeOptions.find(option => option.value === mode) ?? themeOptions[0];

  const applyTheme = (newMode: ThemeMode, persist = true) => {
    const root = document.documentElement;
    let actual: ThemeMode;

    if (newMode === 'auto') {
      actual = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } else {
      actual = newMode;
    }

    root.setAttribute('data-theme', actual);
    root.setAttribute('data-theme-mode', newMode);
    document.body.setAttribute('arco-theme', actual === 'dark' ? 'dark' : 'light');
    if (persist) localStorage.setItem('jobhot-theme', newMode);
    window.dispatchEvent(new Event('jobhot-theme-change'));
  };

  useEffect(() => {
    applyTheme(mode, false);
  }, [mode]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleChange = (newMode: ThemeMode) => {
    applyTheme(newMode);
    setOpen(false);
  };

  return (
    <div className="theme-picker" ref={pickerRef}>
      <button
        type="button"
        className="theme-picker-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="jobhot-theme-menu"
        title={`页面主题：${activeOption.label}`}
        onClick={() => setOpen(value => !value)}
      >
        <span className="theme-swatch" style={{ background: activeOption.swatch }} aria-hidden="true" />
        <span>主题</span>
        <span className={`theme-picker-chevron ${open ? 'theme-picker-chevron-open' : ''}`} aria-hidden="true">⌃</span>
      </button>

      {open && (
        <div id="jobhot-theme-menu" className="theme-picker-popover" role="menu" aria-label="选择页面主题">
          <div className="theme-picker-title">
            <span>页面主题</span>
            <span>{activeOption.label}</span>
          </div>
          <div className="theme-toggle">
            {themeOptions.map(option => (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={mode === option.value}
                className={`theme-toggle-opt ${mode === option.value ? 'theme-toggle-opt-active' : ''}`}
                title={`切换到${option.label}主题`}
                onClick={() => handleChange(option.value)}
              >
                <span className="theme-swatch" style={{ background: option.swatch }} aria-hidden="true" />
                <span className="theme-toggle-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

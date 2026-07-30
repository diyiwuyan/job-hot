'use client';

import { useSyncExternalStore } from 'react';

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
  const mode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark');

  const applyTheme = (newMode: ThemeMode) => {
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
    localStorage.setItem('jobhot-theme', newMode);
    window.dispatchEvent(new Event('jobhot-theme-change'));
  };

  const handleChange = (newMode: ThemeMode) => {
    applyTheme(newMode);
  };

  return (
    <div className="theme-toggle">
      {themeOptions.map(option => (
        <button
          key={option.value}
          type="button"
          className={`theme-toggle-opt ${mode === option.value ? 'theme-toggle-opt-active' : ''}`}
          title={`切换到${option.label}主题`}
          onClick={() => handleChange(option.value)}
        >
          <span className="theme-swatch" style={{ background: option.swatch }} />
          <span className="theme-toggle-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

type ThemeMode = 'dark' | 'auto' | 'light';

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('jobhot-theme') as ThemeMode | null;
    if (saved && (saved === 'dark' || saved === 'light' || saved === 'auto')) {
      setMode(saved);
    }
  }, []);

  const applyTheme = (newMode: ThemeMode) => {
    const root = document.documentElement;
    let actual: 'dark' | 'light';

    if (newMode === 'auto') {
      actual = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } else {
      actual = newMode;
    }

    root.setAttribute('data-theme', actual);
    root.setAttribute('data-theme-mode', newMode);
    document.body.setAttribute('arco-theme', actual);
    localStorage.setItem('jobhot-theme', newMode);
    setMode(newMode);
  };

  const handleChange = (newMode: ThemeMode) => {
    applyTheme(newMode);
  };

  if (!mounted) {
    return (
      <div className="theme-toggle">
        <div className="theme-toggle-thumb"></div>
        <label className="theme-toggle-opt">
          <input type="radio" name="theme" value="dark" defaultChecked />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </label>
        <label className="theme-toggle-opt">
          <input type="radio" name="theme" value="auto" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="3" rx="2" />
            <line x1="8" x2="16" y1="21" y2="21" />
            <line x1="12" x2="12" y1="17" y2="21" />
          </svg>
        </label>
        <label className="theme-toggle-opt">
          <input type="radio" name="theme" value="light" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </label>
      </div>
    );
  }

  return (
    <div className="theme-toggle">
      <div className="theme-toggle-thumb" data-position={mode === 'dark' ? 'left' : mode === 'auto' ? 'center' : 'right'}></div>
      <label className={`theme-toggle-opt ${mode === 'dark' ? 'theme-toggle-opt-active' : ''}`}>
        <input
          type="radio"
          name="theme"
          value="dark"
          checked={mode === 'dark'}
          onChange={() => handleChange('dark')}
        />
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </label>
      <label className={`theme-toggle-opt ${mode === 'auto' ? 'theme-toggle-opt-active' : ''}`}>
        <input
          type="radio"
          name="theme"
          value="auto"
          checked={mode === 'auto'}
          onChange={() => handleChange('auto')}
        />
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      </label>
      <label className={`theme-toggle-opt ${mode === 'light' ? 'theme-toggle-opt-active' : ''}`}>
        <input
          type="radio"
          name="theme"
          value="light"
          checked={mode === 'light'}
          onChange={() => handleChange('light')}
        />
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </label>
    </div>
  );
}

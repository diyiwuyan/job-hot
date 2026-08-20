'use client';

import { useSidebar } from './SidebarContext';

export function MobileBar() {
  const { isOpen, toggle } = useSidebar();

  return (
    <header className="app-mobile-bar">
      <button
        className="hamburger"
        onClick={toggle}
        aria-label={isOpen ? '关闭菜单' : '打开菜单'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>
      <div className="mobile-brand">
        <span className="brand-logo-text">JOB</span>
        <span className="brand-logo-hot">HOT</span>
      </div>
      {/* Spacer to balance the layout */}
      <div style={{ width: 38 }} />
    </header>
  );
}

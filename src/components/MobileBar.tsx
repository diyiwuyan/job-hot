'use client';

import { useState } from 'react';

export function MobileBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    const appShell = document.querySelector('.app-shell');
    if (appShell) {
      const newState = !isOpen;
      setIsOpen(newState);
      if (newState) {
        appShell.setAttribute('data-sidebar-open', 'true');
      } else {
        appShell.removeAttribute('data-sidebar-open');
      }
    }
  };

  return (
    <header className="app-mobile-bar">
      <button
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        aria-label={isOpen ? '关闭菜单' : '打开菜单'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>
      <div className="mobile-brand">
        <span className="brand-logo">JOB</span>
        <span className="brand-logo-hot">HOT</span>
      </div>
    </header>
  );
}

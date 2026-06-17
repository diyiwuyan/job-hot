'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { useSidebar } from './SidebarContext';

type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  external?: boolean;
  children?: { href: string; label: string; external?: boolean }[];
};

const navItems: NavItem[] = [
  {
    href: '/',
    label: '首页',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    href: '/all',
    label: '求职信息',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    href: '/tools',
    label: '职业服务',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    children: [
      {
        href: '/tools/assessment',
        label: '职业测评',
      },
      {
        href: '/tools/coaching',
        label: '求职辅导',
      },
      {
        href: 'https://ai-resume-9wy.pages.dev/',
        label: 'AI简历',
        external: true,
      },
    ],
  },
  {
    href: '/services/soe-delivery',
    label: '央国企服务',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 7h1" />
        <path d="M14 7h1" />
        <path d="M9 11h1" />
        <path d="M14 11h1" />
        <path d="M9 15h1" />
        <path d="M14 15h1" />
      </svg>
    ),
    children: [
      {
        href: '/services/soe-delivery',
        label: '投递导航',
      },
      {
        href: '/services/soe-job-nav',
        label: '求职导航',
      },
    ],
  },
  {
    href: '/nav',
    label: '常用网址',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    href: '/shame',
    label: '校招避雷',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: '/about',
    label: '关于',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    href: '/changelog',
    label: '更新日志',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    href: '/feedback',
    label: '反馈',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
];

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function Sidebar() {
  const pathname = usePathname();
  const { close } = useSidebar();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Normalize pathname: remove basePath prefix if present（basePath 为空时无操作）
  const normalizedPath = (basePath ? pathname.replace(new RegExp(`^${basePath}`), '') : pathname) || '/';

  function isActive(href: string): boolean {
    if (href === '/') return normalizedPath === '/';
    return normalizedPath.startsWith(href);
  }

  function isGroupActive(item: NavItem): boolean {
    return isActive(item.href) || Boolean(item.children?.some((child) => isActive(child.href)));
  }

  function toggleGroup(label: string) {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function renderNavItem(item: NavItem) {
    if (item.children?.length) {
      const groupActive = isGroupActive(item);
      const isOpen = expanded[item.label] ?? groupActive;
      return (
        <div key={item.label} className={`side-group ${groupActive ? 'side-group-active' : ''}`}>
          <button
            type="button"
            className={`side-link ${groupActive ? 'side-link-active' : ''}`}
            onClick={() => toggleGroup(item.label)}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
          >
            {item.icon}
            <span>{item.label}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginLeft: 'auto', opacity: 0.4, transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          {isOpen && (
            <div className="side-subnav">
              {item.children.map((child) =>
                child.external ? (
                  <a
                    key={child.href}
                    href={child.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="side-sublink"
                    onClick={close}
                  >
                    {child.label}
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.25rem', opacity: 0.5 }}>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                ) : (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`side-sublink ${isActive(child.href) ? 'side-sublink-active' : ''}`}
                    onClick={close}
                  >
                    {child.label}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      );
    }

    if (item.external) {
      return (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="side-link"
          onClick={close}
        >
          {item.icon}
          <span>{item.label}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', opacity: 0.4 }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`side-link ${isActive(item.href) ? 'side-link-active' : ''}`}
        onClick={close}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <aside id="app-sidebar" className="sidebar" aria-label="主导航">
      {/* Brand Logo */}
      <Link href="/" className="brand-logo" aria-label="JOBHOT 首页" onClick={close}>
        <span className="brand-job">JOB</span>
        <span className="orbit-dot" aria-hidden="true"></span>
        <span className="brand-hot">HOT</span>
      </Link>
      <span className="brand-slogan">更好用的大学生求职站</span>

      <div className="divider" />

      {/* Navigation */}
      <nav className="side-nav">
        {navItems.map(renderNavItem)}
      </nav>

      {/* Footer with Theme Toggle and Login */}
      <div className="sidebar-footer">
        <ThemeToggle />
        <Link
          href="/login"
          className={`side-link ${isActive('/login') ? 'side-link-active' : ''}`}
          onClick={close}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          <span>登录</span>
        </Link>
      </div>
    </aside>
  );
}

'use client';

import { useSidebar } from './SidebarContext';

export function SidebarOverlay() {
  const { isOpen, close } = useSidebar();

  return (
    <div
      className={`sidebar-overlay${isOpen ? ' active' : ''}`}
      onClick={close}
      aria-hidden="true"
    />
  );
}

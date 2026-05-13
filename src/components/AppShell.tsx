'use client';

import { useSidebar } from './SidebarContext';
import { SidebarOverlay } from './SidebarOverlay';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="app-shell" data-sidebar-open={isOpen ? 'true' : undefined}>
      <SidebarOverlay />
      {children}
    </div>
  );
}

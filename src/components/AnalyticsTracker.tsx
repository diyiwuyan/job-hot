'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, trackModuleClick, updateDuration } from '@/lib/analytics';

/**
 * Drop this component inside the root layout to auto-track page views.
 * It fires on every route change and records duration on unmount / route change.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    // Don't double-track the same path
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    // Track page view and module click
    trackPageView(pathname);
    trackModuleClick(pathname);

    // On cleanup (route change or unmount), update duration
    return () => {
      updateDuration();
    };
  }, [pathname]);

  return null; // Invisible component
}

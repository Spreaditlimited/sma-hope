'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CONSENT_CHANGED_EVENT } from '@/lib/cookie-consent';
import { syncGoogleAnalytics } from '@/lib/google-analytics';
export function GoogleAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    const sync = () => syncGoogleAnalytics(pathname);
    sync();
    window.addEventListener(CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
  }, [pathname]);
  return null;
}

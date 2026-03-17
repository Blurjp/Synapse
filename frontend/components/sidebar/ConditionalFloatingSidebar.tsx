'use client';

import { usePathname } from 'next/navigation';
import { FloatingSidebar } from './FloatingSidebar';

export function ConditionalFloatingSidebar() {
  const pathname = usePathname();

  // Don't show floating sidebar on dashboard page (it has its own sidebar)
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return <FloatingSidebar />;
}

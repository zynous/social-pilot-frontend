'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

const PUBLIC_PATHS = ['/sign-in'];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, loading, checked } = useAuth();
  const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (!checked || loading) return;
    if (isPublic) {
      if (token && user?.brandId) {
        router.replace('/setup');
      }
      return;
    }
    if (!token || !user?.brandId) {
      router.replace('/sign-in');
    }
  }, [checked, loading, token, user?.brandId, isPublic, pathname, router]);

  if (!checked || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (isPublic) {
    return <>{children}</>;
  }

  if (!token || !user?.brandId) {
    return null;
  }

  return <>{children}</>;
}

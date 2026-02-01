'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, user, loading, checked } = useAuth();

  useEffect(() => {
    if (!checked || loading) return;
    if (token && user?.brandId) {
      router.replace('/setup');
    }
  }, [checked, loading, token, user?.brandId, router]);

  return <>{children}</>;
}

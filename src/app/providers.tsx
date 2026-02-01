'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { BrandProvider } from '@/contexts/brand-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BrandProvider>{children}</BrandProvider>
    </AuthProvider>
  );
}

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useBrand } from '@/contexts/brand-context';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { brand } = useBrand();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header
        className="header-zynous"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--white-smoke)',
          boxShadow: 'var(--shadow-sm)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Link href="/setup" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--oxford-blue)' }}>
          <img src="/images/logos/logo.png" alt="Zynous" style={{ height: 32, width: 'auto', display: 'block' }} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 0, lineHeight: 1.2 }}>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.02em' }}>Social Pilot</span>
            <span style={{ fontSize: 11, opacity: 0.85 }}>from Zynous</span>
          </span>
        </Link>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--oxford-blue)', textAlign: 'center' }}>
            {brand?.name || '—'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/settings" className="btn btn-ghost header-link" style={{ fontSize: 13, color: 'var(--oxford-blue)' }}>
            Settings
          </Link>
          <span style={{ fontSize: 13, color: 'var(--oxford-blue)', opacity: 0.9 }}>
            {user?.email}
          </span>
          <button type="button" className="btn btn-ghost header-link" onClick={signOut} style={{ fontSize: 13, color: 'var(--oxford-blue)' }}>
            Sign out
          </button>
        </div>
      </header>
      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  );
}

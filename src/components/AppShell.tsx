'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useBrand } from '@/contexts/brand-context';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { brand } = useBrand();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuOpen, closeMenu]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header
        className="header-zynous"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--white-smoke)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/setup"
          style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--oxford-blue)', minHeight: 44 }}
          aria-label="Social Pilot home"
        >
          <img src="/images/logos/logo.png" alt="" style={{ height: 32, width: 'auto', display: 'block' }} />
          <span style={{ flexDirection: 'column', gap: 0, lineHeight: 1.2 }} className="header-brand-text">
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.02em' }}>Social Pilot</span>
            <span style={{ fontSize: 11, opacity: 0.85 }}>from Zynous</span>
          </span>
        </Link>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: 'var(--oxford-blue)',
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {brand?.name || '—'}
          </span>
        </div>

        <div className="header-desktop-nav">
          <Link href="/settings" className="btn btn-ghost header-link" style={{ fontSize: 13, color: 'var(--oxford-blue)', minHeight: 44 }}>
            Settings
          </Link>
          <span
            className="header-email"
            style={{ fontSize: 13, color: 'var(--oxford-blue)', opacity: 0.9 }}
            title={user?.email ?? ''}
          >
            {user?.email}
          </span>
          <button
            type="button"
            className="btn btn-ghost header-link"
            onClick={signOut}
            style={{ fontSize: 13, color: 'var(--oxford-blue)', minHeight: 44 }}
          >
            Sign out
          </button>
        </div>

        <button
          type="button"
          className="header-mobile-menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </header>

      <div
        className={`header-drawer ${menuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onClick={(e) => e.target === e.currentTarget && closeMenu()}
      >
        <div className="header-drawer-panel" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="header-drawer-close" onClick={closeMenu} aria-label="Close menu">
            ×
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--oxford-blue)', marginBottom: 4 }}>{brand?.name || '—'}</div>
            <div className="header-drawer-email">{user?.email}</div>
          </div>
          <Link href="/settings" className="header-drawer-link" onClick={closeMenu}>
            Settings
          </Link>
          <button
            type="button"
            className="header-drawer-link"
            style={{ border: 'none', cursor: 'pointer' }}
            onClick={() => {
              closeMenu();
              signOut();
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <main className="app-main">{children}</main>
    </div>
  );
}

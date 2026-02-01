'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      router.replace('/setup');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--white-smoke)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="card-elevated" style={{ padding: 32 }}>
          <div style={{ marginBottom: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/images/logos/logo.png" alt="Zynous" style={{ height: 36, width: 'auto', display: 'block' }} />
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, lineHeight: 1.2 }}>
                <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--oxford-blue)', letterSpacing: '-0.02em' }}>Social Pilot</span>
                <span className="text-muted" style={{ fontSize: 12 }}>from Zynous</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: 16 }}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbrand.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="alert-error" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy || !email.trim() || !password}
              style={{ width: '100%', padding: 12 }}
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

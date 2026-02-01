'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { setStoredApiBaseUrl } from '@/lib/storage';
import { getApiBaseUrl } from '@/lib/client';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithToken } = useAuth();
  const [mode, setMode] = useState<'email' | 'token'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [token, setToken] = useState('');
  const [brandId, setBrandId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const base = apiBaseUrl.trim() || undefined;
      if (base) setStoredApiBaseUrl(base);
      await signIn(email.trim(), password, base);
      router.replace('/setup');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const base = apiBaseUrl.trim() || (typeof window !== 'undefined' ? window.location.origin : '');
      if (base) setStoredApiBaseUrl(base);
      await signInWithToken(base || undefined, token.trim(), brandId.trim());
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

          {mode === 'email' ? (
            <form onSubmit={handleEmailSubmit}>
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
              {showAdvanced && (
                <div className="field" style={{ marginBottom: 20 }}>
                  <label htmlFor="apiBaseUrlEmail">API base URL</label>
                  <input
                    id="apiBaseUrlEmail"
                    type="url"
                    className="input"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    placeholder={getApiBaseUrl() || 'https://api.example.com'}
                  />
                </div>
              )}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: 13, color: 'var(--text-muted)' }}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide' : 'Show'} advanced
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: 13, color: 'var(--text-muted)' }}
                  onClick={() => { setMode('token'); setError(null); }}
                >
                  Use token instead
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleTokenSubmit}>
              <div className="field" style={{ marginBottom: 16 }}>
                <label htmlFor="brandId">Brand ID</label>
                <input
                  id="brandId"
                  type="text"
                  className="input"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  placeholder="Your brand UUID (from admin or support)"
                  required
                />
              </div>
              <div className="field" style={{ marginBottom: 20 }}>
                <label htmlFor="token">Access token</label>
                <textarea
                  id="token"
                  className="textarea"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your access token"
                  rows={3}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}
                  required
                />
                <span className="text-muted" style={{ marginTop: 6, display: 'block', fontSize: 12 }}>
                  Get this from your admin or support.
                </span>
              </div>
              {showAdvanced && (
                <div className="field" style={{ marginBottom: 20 }}>
                  <label htmlFor="apiBaseUrlToken">API base URL</label>
                  <input
                    id="apiBaseUrlToken"
                    type="url"
                    className="input"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    placeholder={getApiBaseUrl() || 'http://localhost:3000'}
                  />
                </div>
              )}
              {error && (
                <div className="alert-error" style={{ marginBottom: 16 }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={busy || !token.trim() || !brandId.trim()}
                style={{ width: '100%', padding: 12 }}
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: 13, color: 'var(--text-muted)' }}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide' : 'Show'} advanced
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: 13, color: 'var(--text-muted)' }}
                  onClick={() => { setMode('email'); setError(null); }}
                >
                  Use email instead
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

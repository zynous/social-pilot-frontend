'use client';

import { useState } from 'react';
import { getApiClient } from '@/lib/client';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }
    setBusy(true);
    try {
      const client = getApiClient();
      await client.put('/api/v1/auth/password', {
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.includes('401') || msg.includes('Current') ? 'Current password is incorrect' : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-wide">
      <div style={{ maxWidth: 420 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>Settings</h1>
        <p className="page-subtitle" style={{ marginBottom: 24 }}>Account and security</p>

        <div className="card-elevated" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Change password</h2>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
            Enter your current password and choose a new one (at least 8 characters).
          </p>
          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: 16 }}>
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                type="password"
                className="input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="field" style={{ marginBottom: 16 }}>
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            {error && (
              <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>
            )}
            {success && (
              <div className="alert-success" style={{ marginBottom: 16 }}>
                Password updated. You can sign in with your new password next time.
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy || !currentPassword || !newPassword || !confirmPassword}
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

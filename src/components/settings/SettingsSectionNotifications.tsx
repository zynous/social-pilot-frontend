'use client';

import { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/brand-context';

type SettingsSectionNotificationsProps = {
  onSaved?: () => void;
};

export function SettingsSectionNotifications({ onSaved }: SettingsSectionNotificationsProps) {
  const { brand, updateConfig } = useBrand();
  const config = (brand?.config || {}) as Record<string, unknown>;
  const [approvalEmail, setApprovalEmail] = useState('');
  const [publishEmails, setPublishEmails] = useState('');
  const [publishHour, setPublishHour] = useState(9);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setApprovalEmail(String(config.approvalEmail ?? ''));
    const emails = config.publishNotificationEmails;
    setPublishEmails(Array.isArray(emails) ? (emails as string[]).join(', ') : '');
    const h = config.publishHour;
    setPublishHour(typeof h === 'number' ? h : parseInt(String(h), 10) || 9);
  }, [brand?.brandId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const emails = publishEmails.split(',').map((s) => s.trim()).filter(Boolean);
      const next = { ...config, approvalEmail: approvalEmail.trim(), publishNotificationEmails: emails, publishHour };
      await updateConfig(next);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="field">
            <label htmlFor="approvalEmail">Approval email</label>
            <input
              id="approvalEmail"
              type="email"
              className="input"
              value={approvalEmail}
              onChange={(e) => setApprovalEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="publishEmails">Publish notification emails (comma separated)</label>
            <input
              id="publishEmails"
              className="input"
              value={publishEmails}
              onChange={(e) => setPublishEmails(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="publishHour">Default publish hour (0–23)</label>
            <input
              id="publishHour"
              type="number"
              min={0}
              max={23}
              className="input"
              value={publishHour}
              onChange={(e) => setPublishHour(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>
        {error && <div className="alert-error" style={{ marginTop: 16 }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ marginTop: 24 }}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </form>
    </>
  );
}

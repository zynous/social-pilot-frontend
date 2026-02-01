'use client';

import { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/brand-context';

function getConfigValue(config: Record<string, unknown> | undefined, path: string): string | number {
  const keys = path.split('.');
  let cur: unknown = config;
  for (const k of keys) {
    cur = cur && typeof cur === 'object' && k in cur ? (cur as Record<string, unknown>)[k] : undefined;
  }
  if (typeof cur === 'number') return cur;
  return typeof cur === 'string' ? cur : '';
}

type StepNotificationsProps = {
  onNext: () => void;
  onBack?: () => void;
  saveBusy: boolean;
  setSaveBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
};

export function StepNotifications({ onNext, onBack, saveBusy, setSaveBusy, setError }: StepNotificationsProps) {
  const { brand, updateConfig } = useBrand();
  const config = (brand?.config || {}) as Record<string, unknown>;
  const [approvalEmail, setApprovalEmail] = useState('');
  const [publishEmails, setPublishEmails] = useState('');
  const [publishHour, setPublishHour] = useState(9);

  useEffect(() => {
    setApprovalEmail(String(getConfigValue(config, 'approvalEmail')));
    const emails = config.publishNotificationEmails;
    setPublishEmails(Array.isArray(emails) ? (emails as string[]).join(', ') : '');
    const h = getConfigValue(config, 'publishHour');
    setPublishHour(typeof h === 'number' ? h : parseInt(String(h), 10) || 9);
  }, [brand?.brandId]);

  const handleSave = async () => {
    setSaveBusy(true);
    setError(null);
    try {
      const emails = publishEmails
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const next = {
        ...config,
        approvalEmail: approvalEmail.trim(),
        publishNotificationEmails: emails,
        publishHour,
      };
      await updateConfig(next);
      onNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaveBusy(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title" style={{ marginBottom: 16 }}>
        Notifications
      </h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        Where to send approval and publish notifications.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label htmlFor="approvalEmail">Approval email</label>
          <input
            id="approvalEmail"
            type="email"
            className="input"
            value={approvalEmail}
            onChange={(e) => setApprovalEmail(e.target.value)}
            placeholder="approvals@company.com"
          />
        </div>
        <div className="field">
          <label htmlFor="publishEmails">Publish notification emails (comma separated)</label>
          <input
            id="publishEmails"
            className="input"
            value={publishEmails}
            onChange={(e) => setPublishEmails(e.target.value)}
            placeholder="team@company.com, alerts@company.com"
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
      <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: onBack ? 'space-between' : 'flex-end' }}>
        {onBack && (
          <button type="button" className="btn" onClick={onBack} disabled={saveBusy}>
            Back
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saveBusy}>
          {saveBusy ? 'Saving…' : 'Finish setup'}
        </button>
      </div>
    </div>
  );
}

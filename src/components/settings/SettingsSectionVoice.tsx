'use client';

import { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/brand-context';

function getConfigValue(config: Record<string, unknown> | undefined, path: string): string {
  const keys = path.split('.');
  let cur: unknown = config;
  for (const k of keys) {
    cur = cur && typeof cur === 'object' && k in cur ? (cur as Record<string, unknown>)[k] : undefined;
  }
  return typeof cur === 'string' ? cur : '';
}

type SettingsSectionVoiceProps = {
  onSaved?: () => void;
};

export function SettingsSectionVoice({ onSaved }: SettingsSectionVoiceProps) {
  const { brand, updateConfig } = useBrand();
  const config = (brand?.config || {}) as Record<string, unknown>;
  const [brandOverview, setBrandOverview] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [tone, setTone] = useState('');
  const [callToActionText, setCallToActionText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBrandOverview(getConfigValue(config, 'brandOverview'));
    setBrandVoice(getConfigValue(config, 'brandVoice'));
    setTone(getConfigValue(config, 'tone'));
    setCallToActionText(getConfigValue(config, 'callToActionText'));
  }, [brand?.brandId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const next = { ...config, brandOverview, brandVoice, tone, callToActionText };
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
            <label htmlFor="overview">Brand overview</label>
            <textarea id="overview" className="textarea" value={brandOverview} onChange={(e) => setBrandOverview(e.target.value)} rows={4} placeholder="A short description of your brand..." />
          </div>
          <div className="field">
            <label htmlFor="voice">Brand voice</label>
            <textarea id="voice" className="textarea" value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} rows={3} placeholder="How your brand sounds: professional, friendly, confident..." />
          </div>
          <div className="field">
            <label htmlFor="tone">Tone (short)</label>
            <input id="tone" className="input" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g. Friendly, persuasive" />
          </div>
          <div className="field">
            <label htmlFor="cta">Call to action text</label>
            <textarea id="cta" className="textarea" value={callToActionText} onChange={(e) => setCallToActionText(e.target.value)} rows={2} placeholder="Website, phone, email, or address to include in content" />
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

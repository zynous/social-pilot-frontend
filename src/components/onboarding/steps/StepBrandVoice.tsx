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

type StepBrandVoiceProps = {
  onNext: () => void;
  onBack?: () => void;
  saveBusy: boolean;
  setSaveBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
};

export function StepBrandVoice({ onNext, onBack, saveBusy, setSaveBusy, setError }: StepBrandVoiceProps) {
  const { brand, updateConfig } = useBrand();
  const config = brand?.config || {};
  const [brandOverview, setBrandOverview] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [tone, setTone] = useState('');

  useEffect(() => {
    setBrandOverview(getConfigValue(config as Record<string, unknown>, 'brandOverview'));
    setBrandVoice(getConfigValue(config as Record<string, unknown>, 'brandVoice'));
    setTone(getConfigValue(config as Record<string, unknown>, 'tone'));
  }, [brand?.brandId]);

  const handleSave = async () => {
    setSaveBusy(true);
    setError(null);
    try {
      const next = { ...(config as Record<string, unknown>), brandOverview, brandVoice, tone };
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
        Brand voice
      </h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        How should we describe your brand and write content?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label htmlFor="overview">Brand overview</label>
          <textarea
            id="overview"
            className="textarea"
            value={brandOverview}
            onChange={(e) => setBrandOverview(e.target.value)}
            placeholder="A short description of your brand..."
            rows={4}
          />
        </div>
        <div className="field">
          <label htmlFor="voice">Brand voice</label>
          <textarea
            id="voice"
            className="textarea"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Professional, friendly, confident..."
            rows={3}
          />
        </div>
        <div className="field">
          <label htmlFor="tone">Tone (short)</label>
          <input
            id="tone"
            className="input"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="Friendly, persuasive"
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
          {saveBusy ? 'Saving…' : 'Save and continue'}
        </button>
      </div>
    </div>
  );
}

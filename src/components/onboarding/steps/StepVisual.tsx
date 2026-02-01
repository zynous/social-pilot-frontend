'use client';

import { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/brand-context';

function getNested(config: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let cur: unknown = config;
  for (const k of keys) {
    cur = cur && typeof cur === 'object' && k in cur ? (cur as Record<string, unknown>)[k] : undefined;
  }
  return typeof cur === 'string' ? cur : '';
}

type StepVisualProps = {
  onNext: () => void;
  onBack?: () => void;
  saveBusy: boolean;
  setSaveBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
};

export function StepVisual({ onNext, onBack, saveBusy, setSaveBusy, setError }: StepVisualProps) {
  const { brand, updateConfig } = useBrand();
  const config = (brand?.config || {}) as Record<string, unknown>;
  const [primary, setPrimary] = useState('#001f3f');
  const [secondary, setSecondary] = useState('#000000');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const colors = config.brandColors as Record<string, string> | undefined;
    setPrimary(colors?.primary || '#001f3f');
    setSecondary(colors?.secondary || '#000000');
    const logo = config.logo as Record<string, unknown> | undefined;
    const urls = logo?.variantUrls as Record<string, string> | undefined;
    setLogoUrl(urls?.default || '');
  }, [brand?.brandId]);

  const handleSave = async () => {
    setSaveBusy(true);
    setError(null);
    try {
      const next = {
        ...config,
        brandColors: { ...(config.brandColors as Record<string, string>), primary, secondary },
        logo: {
          ...(config.logo as Record<string, unknown>),
          variantUrls: { ...((config.logo as Record<string, unknown>)?.variantUrls as Record<string, string>), default: logoUrl },
        },
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
        Visual identity
      </h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        Colors and logo used in your content.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="grid-cols-2" style={{ display: 'grid', gap: 16 }}>
          <div className="field">
            <label>Primary color</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  backgroundColor: primary,
                  flexShrink: 0,
                }}
              />
              <input
                className="input"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                placeholder="#001f3f"
              />
            </div>
          </div>
          <div className="field">
            <label>Secondary color</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  backgroundColor: secondary,
                  flexShrink: 0,
                }}
              />
              <input
                className="input"
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
        <div className="field">
          <label htmlFor="logoUrl">Logo URL</label>
          <input
            id="logoUrl"
            className="input"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
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

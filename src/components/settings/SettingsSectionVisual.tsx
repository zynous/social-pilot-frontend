'use client';

import { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/brand-context';

type SettingsSectionVisualProps = {
  onSaved?: () => void;
};

export function SettingsSectionVisual({ onSaved }: SettingsSectionVisualProps) {
  const { brand, updateConfig } = useBrand();
  const config = (brand?.config || {}) as Record<string, unknown>;
  const [primary, setPrimary] = useState('#001f3f');
  const [secondary, setSecondary] = useState('#000000');
  const [other, setOther] = useState('#d4af37');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const colors = config.brandColors as Record<string, string> | undefined;
    setPrimary(colors?.primary || '#001f3f');
    setSecondary(colors?.secondary || '#000000');
    setOther(colors?.other || '#d4af37');
  }, [brand?.brandId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const next = {
        ...config,
        brandColors: { ...(config.brandColors as Record<string, string>), primary, secondary, other },
      };
      await updateConfig(next);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const colorField = (label: string, value: string, setValue: (v: string) => void) => (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--border)', backgroundColor: value, flexShrink: 0 }} />
        <input className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="#000000" />
      </div>
    </div>
  );

  return (
    <>
      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid-cols-2" style={{ display: 'grid', gap: 16 }}>
            {colorField('Primary color', primary, setPrimary)}
            {colorField('Secondary color', secondary, setSecondary)}
            {colorField('Accent color', other, setOther)}
          </div>
        </div>
        {error && <div className="alert-error" style={{ marginTop: 16 }}>{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </>
  );
}

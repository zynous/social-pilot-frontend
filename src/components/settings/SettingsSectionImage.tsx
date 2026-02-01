'use client';

import { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/brand-context';

function getConfigValue(config: Record<string, unknown> | undefined, path: string): string | undefined {
  const keys = path.split('.');
  let cur: unknown = config;
  for (const k of keys) {
    cur = cur && typeof cur === 'object' && k in cur ? (cur as Record<string, unknown>)[k] : undefined;
  }
  if (cur === undefined || cur === null) return undefined;
  return String(cur);
}

type SettingsSectionImageProps = {
  onSaved?: () => void;
};

export function SettingsSectionImage({ onSaved }: SettingsSectionImageProps) {
  const { brand, updateConfig } = useBrand();
  const config = (brand?.config || {}) as Record<string, unknown>;
  const [imageAspectRatio, setImageAspectRatio] = useState('4:5');
  const [imageAvoidList, setImageAvoidList] = useState('');
  const [imageCreationGuidelines, setImageCreationGuidelines] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImageAspectRatio(String(getConfigValue(config, 'imageConfigs.imageAspectRatio') ?? '4:5'));
    const imageAvoid = config.imageConfigs as Record<string, unknown> | undefined;
    const avoidArr = imageAvoid?.imageAvoidList as string[] | undefined;
    setImageAvoidList(Array.isArray(avoidArr) ? avoidArr.join('\n') : '');
    setImageCreationGuidelines(String(getConfigValue(config, 'imageConfigs.imageCreationGuidelines') ?? ''));
  }, [brand?.brandId, brand?.config]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const avoidLines = imageAvoidList.split('\n').map((s) => s.trim()).filter(Boolean);
      const next = {
        ...config,
        imageConfigs: {
          ...(config.imageConfigs as Record<string, unknown>),
          imageAspectRatio: imageAspectRatio || undefined,
          imageAvoidList: avoidLines.length ? avoidLines : undefined,
          imageCreationGuidelines: imageCreationGuidelines || undefined,
        },
      };
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
            <label htmlFor="imageAspect">Image aspect ratio</label>
            <input id="imageAspect" className="input" value={imageAspectRatio} onChange={(e) => setImageAspectRatio(e.target.value)} placeholder="4:5" />
          </div>
          <div className="field">
            <label htmlFor="imageAvoid">Image avoid list (one item per line)</label>
            <textarea id="imageAvoid" className="textarea" value={imageAvoidList} onChange={(e) => setImageAvoidList(e.target.value)} rows={3} placeholder="Things to avoid in images..." />
          </div>
          <div className="field">
            <label htmlFor="imageGuidelines">Image creation guidelines</label>
            <textarea id="imageGuidelines" className="textarea" value={imageCreationGuidelines} onChange={(e) => setImageCreationGuidelines(e.target.value)} rows={3} placeholder="Visual guidelines for images..." />
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

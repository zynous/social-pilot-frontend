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

type SettingsSectionContentGuidelinesProps = {
  onSaved?: () => void;
};

export function SettingsSectionContentGuidelines({ onSaved }: SettingsSectionContentGuidelinesProps) {
  const { brand, updateConfig } = useBrand();
  const config = (brand?.config || {}) as Record<string, unknown>;
  const [topicGuidelines, setTopicGuidelines] = useState('');
  const [captionGuidelines, setCaptionGuidelines] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTopicGuidelines(getConfigValue(config, 'topicCreationGuidelines'));
    setCaptionGuidelines(getConfigValue(config, 'captionCreationGuidelines'));
    setTargetAudience(getConfigValue(config, 'videoConfigs.targetAudience'));
  }, [brand?.brandId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const next = {
        ...config,
        topicCreationGuidelines: topicGuidelines,
        captionCreationGuidelines: captionGuidelines,
        videoConfigs: { ...(config.videoConfigs as Record<string, unknown>), targetAudience: targetAudience },
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
            <label htmlFor="topic">Topic creation guidelines</label>
            <textarea id="topic" className="textarea" value={topicGuidelines} onChange={(e) => setTopicGuidelines(e.target.value)} rows={3} placeholder="How we should choose and create topics..." />
          </div>
          <div className="field">
            <label htmlFor="caption">Caption creation guidelines</label>
            <textarea id="caption" className="textarea" value={captionGuidelines} onChange={(e) => setCaptionGuidelines(e.target.value)} rows={3} placeholder="How we should write captions..." />
          </div>
          <div className="field">
            <label htmlFor="audience">Target audience (comma separated)</label>
            <textarea id="audience" className="textarea" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} rows={2} placeholder="Who you're targeting: demographics, interests..." />
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

'use client';

import { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/brand-context';

function getConfigValue(config: Record<string, unknown> | undefined, path: string): string | number | undefined {
  const keys = path.split('.');
  let cur: unknown = config;
  for (const k of keys) {
    cur = cur && typeof cur === 'object' && k in cur ? (cur as Record<string, unknown>)[k] : undefined;
  }
  if (cur === undefined || cur === null) return undefined;
  return typeof cur === 'number' ? cur : String(cur);
}

type SettingsSectionImageVideoProps = {
  onSaved?: () => void;
};

export function SettingsSectionImageVideo({ onSaved }: SettingsSectionImageVideoProps) {
  const { brand, updateConfig } = useBrand();
  const config = (brand?.config || {}) as Record<string, unknown>;
  const [imageAspectRatio, setImageAspectRatio] = useState('4:5');
  const [imageAvoidList, setImageAvoidList] = useState('');
  const [imageCreationGuidelines, setImageCreationGuidelines] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState('9:16');
  const [totalVideoLength, setTotalVideoLength] = useState('');
  const [introDuration, setIntroDuration] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImageAspectRatio(String(getConfigValue(config, 'imageConfigs.imageAspectRatio') ?? '4:5'));
    const imageAvoid = config.imageConfigs as Record<string, unknown> | undefined;
    const avoidArr = imageAvoid?.imageAvoidList as string[] | undefined;
    setImageAvoidList(Array.isArray(avoidArr) ? avoidArr.join('\n') : '');
    setImageCreationGuidelines(String(getConfigValue(config, 'imageConfigs.imageCreationGuidelines') ?? ''));
    setVideoAspectRatio(String(getConfigValue(config, 'videoConfigs.videoAspectRatio') ?? '9:16'));
    setTotalVideoLength(String(getConfigValue(config, 'videoConfigs.totalVideoLength') ?? ''));
    setIntroDuration(String(getConfigValue(config, 'videoConfigs.introDuration') ?? ''));
  }, [brand?.brandId]);

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
        videoConfigs: {
          ...(config.videoConfigs as Record<string, unknown>),
          videoAspectRatio: videoAspectRatio || undefined,
          totalVideoLength: totalVideoLength ? Number(totalVideoLength) : undefined,
          introDuration: introDuration ? Number(introDuration) : undefined,
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
          <div className="field">
            <label htmlFor="videoAspect">Video aspect ratio</label>
            <input id="videoAspect" className="input" value={videoAspectRatio} onChange={(e) => setVideoAspectRatio(e.target.value)} placeholder="9:16" />
          </div>
          <div className="grid-cols-2" style={{ display: 'grid', gap: 16 }}>
            <div className="field">
              <label htmlFor="videoLength">Total video length (seconds)</label>
              <input id="videoLength" className="input" type="number" min={1} value={totalVideoLength} onChange={(e) => setTotalVideoLength(e.target.value)} placeholder="60" />
            </div>
            <div className="field">
              <label htmlFor="introDuration">Intro duration (seconds)</label>
              <input id="introDuration" className="input" type="number" min={0} value={introDuration} onChange={(e) => setIntroDuration(e.target.value)} placeholder="5" />
            </div>
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

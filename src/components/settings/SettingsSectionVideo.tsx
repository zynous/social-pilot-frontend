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

type SettingsSectionVideoProps = {
  onSaved?: () => void;
};

export function SettingsSectionVideo({ onSaved }: SettingsSectionVideoProps) {
  const { brand, updateConfig } = useBrand();
  const config = (brand?.config || {}) as Record<string, unknown>;
  const [videoAspectRatio, setVideoAspectRatio] = useState('9:16');
  const [totalVideoLength, setTotalVideoLength] = useState('');
  const [introDuration, setIntroDuration] = useState('');
  const [splitDuration, setSplitDuration] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [videoCreationGuidelines, setVideoCreationGuidelines] = useState('');
  const [videoGoal, setVideoGoal] = useState('');
  const [videoAvoidScriptAndImage, setVideoAvoidScriptAndImage] = useState('');
  const [videoAvoidVideoGen, setVideoAvoidVideoGen] = useState('');
  const [videoCaptioningTemplate, setVideoCaptioningTemplate] = useState('');
  const [ccCaptionStyle, setCcCaptionStyle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVideoAspectRatio(String(getConfigValue(config, 'videoConfigs.videoAspectRatio') ?? '9:16'));
    setTotalVideoLength(String(getConfigValue(config, 'videoConfigs.totalVideoLength') ?? ''));
    setIntroDuration(String(getConfigValue(config, 'videoConfigs.introDuration') ?? ''));
    setSplitDuration(String(getConfigValue(config, 'videoConfigs.splitDuration') ?? ''));
    setTargetAudience(String(getConfigValue(config, 'videoConfigs.targetAudience') ?? ''));
    setVideoCreationGuidelines(String(getConfigValue(config, 'videoConfigs.videoCreationGuidelines') ?? ''));
    setVideoGoal(String(config.videoGoal ?? ''));
    const videoAvoid = config.videoConfigs as Record<string, unknown> | undefined;
    const avoidList = videoAvoid?.videoAvoidList as Record<string, string[]> | undefined;
    setVideoAvoidScriptAndImage(Array.isArray(avoidList?.applyToScriptAndImageGen) ? avoidList.applyToScriptAndImageGen.join('\n') : '');
    setVideoAvoidVideoGen(Array.isArray(avoidList?.applyToVideoGen) ? avoidList.applyToVideoGen.join('\n') : '');
    setVideoCaptioningTemplate(String(getConfigValue(config, 'videoConfigs.videoCaptioningTemplate') ?? ''));
    setCcCaptionStyle(String(getConfigValue(config, 'videoConfigs.ccCaptionTemplateStyle') ?? ''));
  }, [brand?.brandId, brand?.config]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const scriptAvoid = videoAvoidScriptAndImage.split('\n').map((s) => s.trim()).filter(Boolean);
      const videoGenAvoid = videoAvoidVideoGen.split('\n').map((s) => s.trim()).filter(Boolean);
      const videoAvoidList: Record<string, string[]> | undefined =
        scriptAvoid.length || videoGenAvoid.length
          ? { ...(scriptAvoid.length ? { applyToScriptAndImageGen: scriptAvoid } : {}), ...(videoGenAvoid.length ? { applyToVideoGen: videoGenAvoid } : {}) }
          : undefined;
      const next = {
        ...config,
        videoGoal: videoGoal.trim() || undefined,
        videoConfigs: {
          ...(config.videoConfigs as Record<string, unknown>),
          videoAspectRatio: videoAspectRatio || undefined,
          totalVideoLength: totalVideoLength ? Number(totalVideoLength) : undefined,
          introDuration: introDuration ? Number(introDuration) : undefined,
          splitDuration: splitDuration ? Number(splitDuration) : undefined,
          targetAudience: targetAudience.trim() || undefined,
          videoCreationGuidelines: videoCreationGuidelines.trim() || undefined,
          videoAvoidList,
          videoCaptioningTemplate: videoCaptioningTemplate.trim() || undefined,
          ccCaptionTemplateStyle: ccCaptionStyle.trim() || undefined,
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
          <div className="grid-cols-2" style={{ display: 'grid', gap: 16 }}>
            <div className="field">
              <label htmlFor="videoAspect">Video aspect ratio</label>
              <input id="videoAspect" className="input" value={videoAspectRatio} onChange={(e) => setVideoAspectRatio(e.target.value)} placeholder="9:16" />
            </div>
            <div className="field">
              <label htmlFor="videoLength">Total video length (seconds)</label>
              <input id="videoLength" className="input" type="number" min={1} value={totalVideoLength} onChange={(e) => setTotalVideoLength(e.target.value)} placeholder="60" />
            </div>
            <div className="field">
              <label htmlFor="introDuration">Intro duration (seconds)</label>
              <input id="introDuration" className="input" type="number" min={0} value={introDuration} onChange={(e) => setIntroDuration(e.target.value)} placeholder="5" />
            </div>
            <div className="field">
              <label htmlFor="splitDuration">Segment length (seconds)</label>
              <input id="splitDuration" className="input" type="number" min={0} value={splitDuration} onChange={(e) => setSplitDuration(e.target.value)} placeholder="10" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="targetAudience">Video target audience</label>
            <textarea id="targetAudience" className="textarea" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} rows={2} placeholder="Who this video is for..." />
          </div>
          <div className="field">
            <label htmlFor="videoCreationGuidelines">Video creation guidelines</label>
            <textarea id="videoCreationGuidelines" className="textarea" value={videoCreationGuidelines} onChange={(e) => setVideoCreationGuidelines(e.target.value)} rows={3} placeholder="Visual and style guidelines for videos..." />
          </div>
          <div className="field">
            <label htmlFor="videoGoal">Video goal</label>
            <textarea id="videoGoal" className="textarea" value={videoGoal} onChange={(e) => setVideoGoal(e.target.value)} rows={2} placeholder="e.g. Educate and engage audience" />
          </div>
          <div className="field">
            <label htmlFor="videoAvoidScript">Video avoid list – script & images (one per line)</label>
            <textarea id="videoAvoidScript" className="textarea" value={videoAvoidScriptAndImage} onChange={(e) => setVideoAvoidScriptAndImage(e.target.value)} rows={3} placeholder="Topics or elements to avoid in script and images..." />
          </div>
          <div className="field">
            <label htmlFor="videoAvoidVideo">Video avoid list – video generation (one per line)</label>
            <textarea id="videoAvoidVideo" className="textarea" value={videoAvoidVideoGen} onChange={(e) => setVideoAvoidVideoGen(e.target.value)} rows={3} placeholder="Elements to avoid in generated video..." />
          </div>
          <div className="field">
            <label htmlFor="videoCaptionTemplate">Caption template</label>
            <input id="videoCaptionTemplate" className="input" value={videoCaptioningTemplate} onChange={(e) => setVideoCaptioningTemplate(e.target.value)} placeholder="Optional caption template" />
          </div>
          <div className="field">
            <label htmlFor="ccCaptionStyle">Caption style</label>
            <input id="ccCaptionStyle" className="input" value={ccCaptionStyle} onChange={(e) => setCcCaptionStyle(e.target.value)} placeholder="e.g. business" />
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

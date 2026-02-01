'use client';

import { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/brand-context';

type StepBasicInfoProps = {
  onNext: () => void;
  onBack?: () => void;
  saveBusy: boolean;
  setSaveBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
};

export function StepBasicInfo({ onNext, onBack, saveBusy, setSaveBusy, setError }: StepBasicInfoProps) {
  const { brand, updateBrand } = useBrand();
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [phoneNumbers, setPhoneNumbers] = useState('');

  useEffect(() => {
    if (brand) {
      setName(brand.name || '');
      setTimezone(brand.timezone || 'UTC');
      setPhoneNumbers((brand.phoneNumbers || []).join(', '));
    }
  }, [brand]);

  const handleSave = async () => {
    setSaveBusy(true);
    setError(null);
    try {
      await updateBrand({
        name: name.trim(),
        timezone: timezone.trim() || 'UTC',
        phoneNumbers: phoneNumbers
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
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
        Basic info
      </h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        Tell us your brand name and how we can reach you.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label htmlFor="name">Brand name</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Inc."
          />
        </div>
        <div className="field">
          <label htmlFor="timezone">Timezone</label>
          <input
            id="timezone"
            className="input"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="UTC"
          />
        </div>
        <div className="field">
          <label htmlFor="phones">Phone numbers (comma separated)</label>
          <input
            id="phones"
            className="input"
            value={phoneNumbers}
            onChange={(e) => setPhoneNumbers(e.target.value)}
            placeholder="+1234567890, +0987654321"
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

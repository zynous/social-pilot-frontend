'use client';

import { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/brand-context';

type SettingsSectionDetailsProps = {
  onSaved?: () => void;
};

export function SettingsSectionDetails({ onSaved }: SettingsSectionDetailsProps) {
  const { brand, updateBrand } = useBrand();
  const [timezone, setTimezone] = useState('UTC');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (brand) {
      setTimezone(brand.timezone || 'UTC');
      setPhoneNumbers((brand.phoneNumbers || []).join(', '));
    }
  }, [brand]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateBrand({
        timezone: timezone.trim() || 'UTC',
        phoneNumbers: phoneNumbers.split(',').map((s) => s.trim()).filter(Boolean),
      });
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
            <label htmlFor="timezone">Timezone</label>
            <input id="timezone" className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="e.g. America/New_York" />
          </div>
          <div className="field">
            <label htmlFor="phones">Phone numbers (comma separated)</label>
            <input id="phones" className="input" value={phoneNumbers} onChange={(e) => setPhoneNumbers(e.target.value)} placeholder="+1234567890, +0987654321" />
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

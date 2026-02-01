'use client';

import { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/brand-context';

type ServiceItem = { type: string; description: string };

type SettingsSectionServicesProps = {
  onSaved?: () => void;
};

export function SettingsSectionServices({ onSaved }: SettingsSectionServicesProps) {
  const { brand, updateConfig } = useBrand();
  const config = (brand?.config || {}) as Record<string, unknown>;
  const [serviceThatIsBeingPromoted, setServiceThatIsBeingPromoted] = useState('');
  const [focusCalibration, setFocusCalibration] = useState<string>('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setServiceThatIsBeingPromoted(String(config.serviceThatIsBeingPromoted ?? ''));
    const fc = config.focusCalibration;
    setFocusCalibration(fc !== undefined && fc !== null && fc !== '' ? String(fc) : '');
    const svc = config.services;
    setServices(Array.isArray(svc) ? svc.map((s: unknown) => ({
      type: typeof (s as ServiceItem)?.type === 'string' ? (s as ServiceItem).type : '',
      description: typeof (s as ServiceItem)?.description === 'string' ? (s as ServiceItem).description : '',
    })) : []);
  }, [brand?.brandId, brand?.config]);

  const addService = () => {
    setServices((prev) => [...prev, { type: '', description: '' }]);
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceItem, value: string) => {
    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const next = {
        ...config,
        serviceThatIsBeingPromoted: serviceThatIsBeingPromoted.trim() || undefined,
        focusCalibration: (() => { const n = Number(focusCalibration); return focusCalibration.trim() && Number.isFinite(n) ? n : undefined; })(),
        services: services.filter((s) => s.type.trim() || s.description.trim()).length > 0
          ? services.filter((s) => s.type.trim() || s.description.trim())
          : undefined,
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
            <label htmlFor="serviceThatIsBeingPromoted">Currently promoted service</label>
            <input
              id="serviceThatIsBeingPromoted"
              type="text"
              className="input"
              value={serviceThatIsBeingPromoted}
              onChange={(e) => setServiceThatIsBeingPromoted(e.target.value)}
              placeholder="e.g. Happy Hours"
            />
          </div>
          <div className="field">
            <label htmlFor="focusCalibration">Focus calibration</label>
            <input
              id="focusCalibration"
              type="number"
              className="input"
              value={focusCalibration}
              onChange={(e) => setFocusCalibration(e.target.value)}
              placeholder="Optional number"
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label>Services</label>
              <button type="button" className="btn btn-ghost" onClick={addService} style={{ fontSize: 13 }}>
                + Add service
              </button>
            </div>
            {services.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 13 }}>No services yet. Add one to describe what your brand offers.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="card-elevated"
                    style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 8 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>Service {index + 1}</span>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => removeService(index)}
                        style={{ fontSize: 12, padding: '4px 8px' }}
                        aria-label="Remove service"
                      >
                        Remove
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className="field">
                        <label style={{ fontSize: 12 }}>Service type</label>
                        <input
                          className="input"
                          value={service.type}
                          onChange={(e) => updateService(index, 'type', e.target.value)}
                          placeholder="e.g. Happy Hours"
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: 12 }}>Description</label>
                        <textarea
                          className="input"
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          placeholder="Short description of this service..."
                          rows={3}
                          style={{ resize: 'vertical', minHeight: 60 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

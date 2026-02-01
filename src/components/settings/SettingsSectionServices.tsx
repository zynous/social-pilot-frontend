'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [scrollToIndex, setScrollToIndex] = useState<number | null>(null);
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  useEffect(() => {
    if (scrollToIndex === null) return;
    const el = serviceRefs.current[scrollToIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    setScrollToIndex(null);
  }, [scrollToIndex, services.length]);

  const addService = useCallback(() => {
    setServices((prev) => [...prev, { type: '', description: '' }]);
    setScrollToIndex(services.length);
  }, [services.length]);

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
    setExpandedIndex((prev) => (prev === index ? null : prev != null && prev > index ? prev - 1 : prev));
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
          <div className="field-group">
            <div className="field">
              <label htmlFor="serviceThatIsBeingPromoted">Currently promoted service</label>
              <select
                id="serviceThatIsBeingPromoted"
                className="input select"
                value={serviceThatIsBeingPromoted}
                onChange={(e) => setServiceThatIsBeingPromoted(e.target.value)}
                aria-label="Currently promoted service"
              >
                <option value="">None</option>
                {services
                  .map((s) => s.type.trim())
                  .filter(Boolean)
                  .filter((type, i, arr) => arr.indexOf(type) === i)
                  .map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                {serviceThatIsBeingPromoted.trim() &&
                  !services.some((s) => s.type.trim() === serviceThatIsBeingPromoted.trim()) && (
                  <option value={serviceThatIsBeingPromoted}>{serviceThatIsBeingPromoted}</option>
                )}
              </select>
            </div>
            <div className="field">
              <label htmlFor="focusCalibration">Focus calibration</label>
              <input
                id="focusCalibration"
                type="number"
                className="input input-narrow"
                value={focusCalibration}
                onChange={(e) => setFocusCalibration(e.target.value)}
                placeholder="Optional number"
              />
            </div>
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
                {services.map((service, index) => {
                  const isExpanded = expandedIndex === index;
                  const displayName = service.type.trim() || `Service ${index + 1}`;
                  return (
                    <div
                      key={index}
                      ref={(el) => { serviceRefs.current[index] = el; }}
                      className="card-elevated service-card"
                      style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}
                    >
                      <button
                        type="button"
                        className="service-card-header"
                        onClick={() => setExpandedIndex((prev) => (prev === index ? null : index))}
                        aria-expanded={isExpanded}
                      >
                        <span className="service-card-title">{displayName}</span>
                        <span className="service-card-chevron" aria-hidden>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </button>
                      {isExpanded && (
                        <div style={{ padding: 16, paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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

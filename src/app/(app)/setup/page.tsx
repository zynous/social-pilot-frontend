'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBrand } from '@/contexts/brand-context';
import { SettingsSectionDetails } from '@/components/settings/SettingsSectionDetails';
import { SettingsSectionVoice } from '@/components/settings/SettingsSectionVoice';
import { SettingsSectionVisual } from '@/components/settings/SettingsSectionVisual';
import { SettingsSectionNotifications } from '@/components/settings/SettingsSectionNotifications';
import { SettingsSectionContentGuidelines } from '@/components/settings/SettingsSectionContentGuidelines';
import { SettingsSectionImage } from '@/components/settings/SettingsSectionImage';
import { SettingsSectionVideo } from '@/components/settings/SettingsSectionVideo';
import { SettingsSectionServices } from '@/components/settings/SettingsSectionServices';

const SECTIONS = [
  { id: 'details', label: 'Your details', description: 'Account and contact', href: '?section=details' },
  { id: 'voice', label: 'About your brand', description: 'Voice and messaging', href: '?section=voice' },
  { id: 'visual', label: 'Colors & logo', description: 'Visual identity', href: '?section=visual' },
  { id: 'notifications', label: 'Notifications', description: 'Notification preferences', href: '?section=notifications' },
  { id: 'content-guidelines', label: 'Content guidelines', description: 'Content and audience', href: '?section=content-guidelines' },
  { id: 'services', label: 'Services', description: 'Services you offer and promotion focus', href: '?section=services' },
  { id: 'image', label: 'Image', description: 'Image formats and guidelines', href: '?section=image' },
  { id: 'video', label: 'Video', description: 'Video format and captions', href: '?section=video' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const SECTION_COMPONENTS: Record<SectionId, React.ComponentType<{ onSaved?: () => void }>> = {
  details: SettingsSectionDetails,
  voice: SettingsSectionVoice,
  visual: SettingsSectionVisual,
  notifications: SettingsSectionNotifications,
  'content-guidelines': SettingsSectionContentGuidelines,
  services: SettingsSectionServices,
  image: SettingsSectionImage,
  video: SettingsSectionVideo,
};

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const sectionId: SectionId = SECTIONS.some((s) => s.id === sectionParam) ? (sectionParam as SectionId) : 'details';
  const { brand, reload } = useBrand();
  const currentSection = SECTIONS.find((s) => s.id === sectionId);
  const SectionComponent = SECTION_COMPONENTS[sectionId];

  useEffect(() => {
    reload();
  }, [reload]);

  const onSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SectionId;
    router.push(`?section=${value}`);
  };

  if (!brand) {
    return (
      <div className="container-wide" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container-wide">
      <div className="setup-layout">
        <aside className="setup-aside">
          <nav className="setup-nav-vertical" style={{ display: 'flex', flexDirection: 'column', gap: 2 }} aria-label="Setup sections">
            {SECTIONS.map((s) => {
              const isActive = sectionId === s.id;
              return (
                <Link
                  key={s.id}
                  href={s.href}
                  className={`setup-nav-link ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}
                >
                  <span style={{ fontWeight: isActive ? 600 : 500 }}>{s.label}</span>
                  <span className="text-muted setup-nav-desc" style={{ fontSize: 12 }}>{s.description}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="setup-section-picker-wrap">
          <select
            id="setup-section-picker"
            className="setup-section-picker select"
            value={sectionId}
            onChange={onSectionChange}
            aria-label="Configuration section"
          >
            {SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="setup-content">
          {currentSection && (
            <div style={{ marginBottom: 24 }}>
              <h1 className="page-title">{currentSection.label}</h1>
              <p className="page-subtitle" style={{ marginBottom: 0 }}>{currentSection.description}</p>
            </div>
          )}
          {SectionComponent && (
            <div className="card-elevated setup-card" style={{ padding: 28 }}>
              <SectionComponent onSaved={() => reload()} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <div className="spinner" />
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  );
}

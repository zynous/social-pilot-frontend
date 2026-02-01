'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBrand } from '@/contexts/brand-context';
import { SettingsSectionDetails } from '@/components/settings/SettingsSectionDetails';
import { SettingsSectionVoice } from '@/components/settings/SettingsSectionVoice';
import { SettingsSectionVisual } from '@/components/settings/SettingsSectionVisual';
import { SettingsSectionNotifications } from '@/components/settings/SettingsSectionNotifications';
import { SettingsSectionContentGuidelines } from '@/components/settings/SettingsSectionContentGuidelines';
import { SettingsSectionImageVideo } from '@/components/settings/SettingsSectionImageVideo';
import { SettingsSectionServices } from '@/components/settings/SettingsSectionServices';

const SECTIONS = [
  { id: 'details', label: 'Your details', description: 'Account and contact', href: '?section=details' },
  { id: 'voice', label: 'About your brand', description: 'Voice and messaging', href: '?section=voice' },
  { id: 'visual', label: 'Colors & logo', description: 'Visual identity', href: '?section=visual' },
  { id: 'notifications', label: 'Notifications', description: 'Notification preferences', href: '?section=notifications' },
  { id: 'content-guidelines', label: 'Content guidelines', description: 'Content and audience', href: '?section=content-guidelines' },
  { id: 'services', label: 'Services', description: 'Promoted service and service list', href: '?section=services' },
  { id: 'image-video', label: 'Image & video', description: 'Media and formats', href: '?section=image-video' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const SECTION_COMPONENTS: Record<SectionId, React.ComponentType<{ onSaved?: () => void }>> = {
  details: SettingsSectionDetails,
  voice: SettingsSectionVoice,
  visual: SettingsSectionVisual,
  notifications: SettingsSectionNotifications,
  'content-guidelines': SettingsSectionContentGuidelines,
  services: SettingsSectionServices,
  'image-video': SettingsSectionImageVideo,
};

function SetupContent() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const sectionId: SectionId = SECTIONS.some((s) => s.id === sectionParam) ? (sectionParam as SectionId) : 'details';
  const { brand, reload } = useBrand();
  const currentSection = SECTIONS.find((s) => s.id === sectionId);
  const SectionComponent = SECTION_COMPONENTS[sectionId];

  useEffect(() => {
    reload();
  }, [reload]);

  if (!brand) {
    return (
      <div className="container-wide" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container-wide">
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <aside style={{ flex: '0 0 220px', position: 'sticky', top: 24 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  <span className="text-muted" style={{ fontSize: 12 }}>{s.description}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <div style={{ flex: 1, minWidth: 0, maxWidth: 560 }}>
          {currentSection && (
            <div style={{ marginBottom: 24 }}>
              <h1 className="page-title">{currentSection.label}</h1>
              <p className="page-subtitle" style={{ marginBottom: 0 }}>{currentSection.description}</p>
            </div>
          )}
          {SectionComponent && (
            <div className="card-elevated" style={{ padding: 28 }}>
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

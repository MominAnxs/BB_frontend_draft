'use client';

import { useRouter, useParams, notFound } from 'next/navigation';
import { ProfileSettings, type SettingsSection } from '../../../../components/ProfileSettings';
import { useAppState } from '../../../providers';

// Mirrors the SettingsSection union in ProfileSettings. Used to 404 on
// malformed section slugs and to narrow the URL param down to the typed
// SettingsSection value before handing it to the component.
const VALID_SECTIONS: readonly SettingsSection[] = [
  'personal',
  'business',
  'password',
  'users',
  'notifications',
  'billing',
];

export default function SettingsSectionPage() {
  const router = useRouter();
  const params = useParams<{ section?: string }>();
  const { userInfo } = useAppState();

  const rawSection = params?.section ?? '';
  if (!VALID_SECTIONS.includes(rawSection as SettingsSection)) {
    notFound();
  }
  const activeSection = rawSection as SettingsSection;

  return (
    <ProfileSettings
      userInfo={userInfo}
      activeSection={activeSection}
      buildSectionHref={(section) => `/dashboard/settings/${section}`}
      onClose={() => router.push('/dashboard/chat')}
      onNavigate={(screen) => router.push(`/dashboard/${screen}`)}
    />
  );
}

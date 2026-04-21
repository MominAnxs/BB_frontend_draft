'use client';

import { useRouter, useParams, notFound } from 'next/navigation';
import { ProfileSettings, type SettingsSection } from '../../../../../../components/ProfileSettings';
import { useAppState, useRouteContext } from '../../../../../providers';

// Authoritative list of valid sections — mirrors the SettingsSection union in
// ProfileSettings. Kept here so the page can both 404 on bogus slugs and
// narrow the URL param into a well-typed value before passing it down.
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
  const { buildPath } = useRouteContext();

  const rawSection = params?.section ?? '';
  if (!VALID_SECTIONS.includes(rawSection as SettingsSection)) {
    notFound();
  }
  const activeSection = rawSection as SettingsSection;

  return (
    <ProfileSettings
      userInfo={userInfo}
      activeSection={activeSection}
      // Each tab renders as a <Link> pointing here. buildPath() anchors the
      // URL to the current (service, model) so marketing and accounts
      // users stay in their own route trees without us having to
      // reconstruct slugs by hand.
      buildSectionHref={(section) => buildPath(`settings/${section}`)}
      onClose={() => router.push(buildPath('chat'))}
      onNavigate={(screen) => {
        const sectionMap: Record<string, string> = {
          chat: 'chat',
          reports: 'overview',
          workspace: 'workspace',
          dataroom: 'dataroom',
        };
        router.push(buildPath(sectionMap[screen] || screen));
      }}
    />
  );
}

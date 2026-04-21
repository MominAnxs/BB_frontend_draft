'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Bare /dashboard/settings has no UI of its own — always land the user
// on a concrete section (default: Personal Info) so the URL and the nav
// stay in sync. replace() instead of push() keeps the back-button history
// clean.
export default function SettingsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/settings/personal');
  }, [router]);

  return null;
}

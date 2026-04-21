import { redirect } from 'next/navigation';

/**
 * Bare `/settings` has no meaningful UI of its own — the left nav always
 * has a section selected. Bounce visitors to the "Personal Info" tab so
 * there's a concrete URL for every render, which keeps the back button
 * and tab-restore behavior predictable.
 *
 * This is a **server component** that issues the redirect during SSR, so
 * the browser never sees a blank client shell hydrating and firing a
 * useEffect to call router.replace(). That removes one round-trip and
 * the flash of nothing between the profile-dropdown click and the
 * Personal Info screen.
 *
 * Using `redirect()` (which throws internally) also means the page never
 * enters the React tree — so direct hits to `/settings` hand control to
 * `/settings/personal` before any Suspense boundary has to resolve.
 */
export default async function SettingsIndexPage({
  params,
}: {
  params: Promise<{ service: string; model: string }>;
}) {
  const { service, model } = await params;
  redirect(`/${service}/${model}/dashboard/settings/personal`);
}

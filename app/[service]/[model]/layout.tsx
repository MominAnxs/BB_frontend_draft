import { notFound } from 'next/navigation';

/**
 * Canonical (service, model) URL combinations.
 *
 *   Marketing   → /performance-marketing/{e-commerce | lead-generation}/...
 *   Accounts    → /accounts-taxation/{ecommerce-restaurants | trading-manufacturing}/...
 *
 * Anything outside this set is considered malformed — we return 404 at the
 * server layer so Vercel never ships a broken dashboard render to the client.
 * Keep this list in sync with `SERVICE_SLUG` + `MODEL_SLUG` in `app/providers.tsx`.
 */
const VALID_ROUTES: ReadonlyArray<{ service: string; model: string }> = [
  { service: 'performance-marketing', model: 'e-commerce' },
  { service: 'performance-marketing', model: 'lead-generation' },
  { service: 'accounts-taxation', model: 'ecommerce-restaurants' },
  { service: 'accounts-taxation', model: 'trading-manufacturing' },
];

const VALID_ROUTE_SET = new Set(VALID_ROUTES.map((r) => `${r.service}/${r.model}`));

/**
 * Tell Next.js which (service, model) permutations to prerender. Vercel will
 * statically generate these at build time so cold requests never hit dynamic
 * rendering for a valid dashboard URL.
 */
export function generateStaticParams() {
  return VALID_ROUTES.map((r) => ({ service: r.service, model: r.model }));
}

export const dynamicParams = true; // allow dynamic (but invalid combos will 404 below)

export default async function ServiceModelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ service: string; model: string }>;
}) {
  const { service, model } = await params;

  if (!VALID_ROUTE_SET.has(`${service}/${model}`)) {
    notFound();
  }

  return <>{children}</>;
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * Route-shape middleware for the dashboard URL space.
 *
 * The app exposes four canonical combinations:
 *   /performance-marketing/{e-commerce | lead-generation}/dashboard/...
 *   /accounts-taxation/{ecommerce-restaurants | trading-manufacturing}/dashboard/...
 *
 * This middleware does two resilience tasks BEFORE the request touches a page:
 *
 *   1. Auto-correct common slug mismatches (e.g. someone pasting
 *      /accounts-taxation/e-commerce/dashboard/overview from the marketing
 *      flow) to the nearest valid finance variant, instead of 404'ing.
 *
 *   2. Quarantine finance users from marketing-only sections and marketing
 *      users from finance-only sections by redirecting to the correct
 *      overview. This stops `.../accounts-taxation/ecommerce-restaurants/dashboard/google-ads`
 *      from ever rendering a broken PerformanceReports for a finance user.
 *
 * The logic runs as a 308 (permanent) for genuine canonicalisation and 307
 * (temporary) for contextual redirects so crawlers never cache a temporary
 * quarantine as a canonical URL.
 */

const SERVICES = {
  marketing: 'performance-marketing',
  finance: 'accounts-taxation',
} as const;

const MARKETING_MODELS = new Set(['e-commerce', 'lead-generation']);
const FINANCE_MODELS = new Set(['ecommerce-restaurants', 'trading-manufacturing']);

// Sections that only make sense for the marketing service
const MARKETING_ONLY_SECTIONS = new Set(['google-ads', 'meta-ads', 'shopify', 'website']);

// Sections that only make sense for the finance service. These live under
// AccountsReports and don't have a marketing analogue — if a marketing user
// lands here (copy-pasted URL, bookmark after a service switch), they get
// redirected back to their own overview instead of a broken render.
const FINANCE_ONLY_SECTIONS = new Set([
  'sales',
  'receivables',
  'expenses',
  'payables',
  'profit-loss',
  'balance-sheet',
  'cashflow',
  'ratios',
]);

// Sections that exist for both services today. Everything under `dashboard/`
// that isn't in one of the `*_ONLY_SECTIONS` sets is allowed for either
// service. (overview, chat, dataroom, settings, workspace, pricing, upgrade)

function isValidCombination(service: string, model: string): boolean {
  if (service === SERVICES.marketing) return MARKETING_MODELS.has(model);
  if (service === SERVICES.finance) return FINANCE_MODELS.has(model);
  return false;
}

function nearestFinanceModel(model: string): 'ecommerce-restaurants' | 'trading-manufacturing' {
  const m = model.toLowerCase();
  if (m.includes('trading') || m.includes('manufact') || m.includes('service')) {
    return 'trading-manufacturing';
  }
  return 'ecommerce-restaurants';
}

function nearestMarketingModel(model: string): 'e-commerce' | 'lead-generation' {
  const m = model.toLowerCase();
  if (m.includes('lead') || m.includes('generation') || m.includes('leadgen')) {
    return 'lead-generation';
  }
  return 'e-commerce';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Match /{service}/{model}/dashboard/{...rest}
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 3 || segments[2] !== 'dashboard') {
    return NextResponse.next();
  }

  const [service, model, , ...rest] = segments;
  const section = rest[0] ?? 'overview';

  // 1. Unknown service → let not-found.tsx handle it.
  const isKnownService = service === SERVICES.marketing || service === SERVICES.finance;
  if (!isKnownService) return NextResponse.next();

  // 2. Mismatched service + model → redirect to the closest valid combination.
  if (!isValidCombination(service, model)) {
    const nextModel =
      service === SERVICES.finance ? nearestFinanceModel(model) : nearestMarketingModel(model);
    const url = req.nextUrl.clone();
    url.pathname = `/${service}/${nextModel}/dashboard/${rest.join('/') || 'overview'}`;
    return NextResponse.redirect(url, 308);
  }

  // 3. Finance service requesting a marketing-only section → redirect to overview.
  if (service === SERVICES.finance && MARKETING_ONLY_SECTIONS.has(section)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${service}/${model}/dashboard/overview`;
    return NextResponse.redirect(url, 307);
  }

  // 4. Marketing service requesting a finance-only section → redirect to overview.
  if (service === SERVICES.marketing && FINANCE_ONLY_SECTIONS.has(section)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${service}/${model}/dashboard/overview`;
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Only run on dashboard URLs. Everything else (static assets, /api, /onboarding)
   * skips the middleware entirely — zero overhead on non-dashboard routes.
   */
  matcher: [
    '/performance-marketing/:path*',
    '/accounts-taxation/:path*',
  ],
};

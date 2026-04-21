import Link from 'next/link';

/**
 * Scoped 404 for invalid (service, model) dashboard URLs.
 *
 * Triggered by `notFound()` in `app/[service]/[model]/layout.tsx` when the
 * user hits an unsupported slug combination like:
 *   - /performance-marketing/trading-manufacturing/...
 *   - /accounts-taxation/e-commerce/...
 *   - /foo/bar/...
 *
 * Offers quick recovery links to each of the 4 canonical dashboards.
 */
export default function ServiceModelNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 px-6">
      <div className="max-w-lg w-full text-center">
        <p className="text-sm font-semibold text-brand mb-2">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">That dashboard URL doesn&rsquo;t exist</h1>
        <p className="text-gray-600 mb-8">
          The service and business-type combination in the URL isn&rsquo;t one we ship.
          Pick a valid workspace below, or start from onboarding.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
          <Link
            href="/accounts-taxation/ecommerce-restaurants/dashboard/overview"
            className="rounded-xl border border-gray-200 bg-white p-4 hover:border-brand hover:shadow-[0_4px_16px_rgba(32,76,199,0.08)] transition-all"
          >
            <p className="text-xs font-semibold text-brand uppercase tracking-wide">Accounts &amp; Taxation</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">E-Commerce or Restaurants</p>
          </Link>
          <Link
            href="/accounts-taxation/trading-manufacturing/dashboard/overview"
            className="rounded-xl border border-gray-200 bg-white p-4 hover:border-brand hover:shadow-[0_4px_16px_rgba(32,76,199,0.08)] transition-all"
          >
            <p className="text-xs font-semibold text-brand uppercase tracking-wide">Accounts &amp; Taxation</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">Trading, Manufacturing or Services</p>
          </Link>
          <Link
            href="/performance-marketing/e-commerce/dashboard/overview"
            className="rounded-xl border border-gray-200 bg-white p-4 hover:border-brand hover:shadow-[0_4px_16px_rgba(32,76,199,0.08)] transition-all"
          >
            <p className="text-xs font-semibold text-brand uppercase tracking-wide">Performance Marketing</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">E-Commerce</p>
          </Link>
          <Link
            href="/performance-marketing/lead-generation/dashboard/overview"
            className="rounded-xl border border-gray-200 bg-white p-4 hover:border-brand hover:shadow-[0_4px_16px_rgba(32,76,199,0.08)] transition-all"
          >
            <p className="text-xs font-semibold text-brand uppercase tracking-wide">Performance Marketing</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">Lead Generation</p>
          </Link>
        </div>

        <Link
          href="/onboarding"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors"
        >
          Start from onboarding
        </Link>
      </div>
    </main>
  );
}

'use client';

/**
 * Shared page shell for every Accounts & Taxation module route
 * (Sales, Expenses, Receivables, Payables, Profit & Loss, Balance Sheet,
 * Cashflow, Ratios). Each per-module page is a one-liner that imports this
 * component and passes its `module` prop — the actual routing, service
 * branch, businessType derivation, and cross-sell wiring lives here so we
 * have a single spot to touch when the contract evolves.
 *
 * Why a shared component instead of copy-pasting eight near-identical pages:
 * the only per-route variation is a single string. Duplicating that across
 * 8 files would mean 8 places to keep in sync when e.g. the cross-sell
 * flow signature changes — a small accident surface that's trivial to
 * avoid. Each page.tsx still exists so Next.js's file-based routing and
 * generateStaticParams continue to work exactly as before.
 */

import { useRouter } from 'next/navigation';
import { AccountsReports, type AccountsModuleSlug } from '../../../../../components/reports/AccountsReports';
import { useAppState, useRouteContext } from '../../../../providers';
import { useCrossSellFlow } from '../../../../../components/business/CrossSellFlowProvider';

// URL slug → AccountsReports internal module id.
// Keep this table in one place so kebab-case URL segments (`profit-loss`)
// map cleanly to the module ids used by the component (`profitloss`).
const SLUG_TO_INITIAL_MODULE = {
  sales: 'sales',
  expenses: 'expenses',
  receivables: 'receivables',
  payables: 'payables',
  'profit-loss': 'profitloss',
  'balance-sheet': 'balancesheet',
  cashflow: 'cashflow',
  ratios: 'ratios',
} as const;

type InternalModule = (typeof SLUG_TO_INITIAL_MODULE)[keyof typeof SLUG_TO_INITIAL_MODULE];

export interface AccountsModulePageProps {
  /** URL slug for this route (e.g. "sales", "profit-loss"). */
  module: keyof typeof SLUG_TO_INITIAL_MODULE;
}

export function AccountsModulePage({ module }: AccountsModulePageProps) {
  const router = useRouter();
  const { model, buildPath } = useRouteContext();
  const { userInfo, setSelectedService } = useAppState();
  const { openCrossSell } = useCrossSellFlow();

  // Derive the canonical businessType label from the URL-resolved model so
  // the Accounts modules render the right variant (Trading/Manufacturing vs
  // E-Commerce/Restaurants). Matches the string each module checks against
  // verbatim — see providers.resolveFinanceVariant and TraditionalOnboarding.
  const financeBusinessType =
    model === 'trading-manufacturing'
      ? 'Trading, Manufacturing or Services'
      : 'E-Commerce or Restaurants';

  const initialModule = SLUG_TO_INITIAL_MODULE[module] as InternalModule;

  return (
    <AccountsReports
      onClose={() => router.push(buildPath('chat'))}
      diagnosticData={{ businessType: financeBusinessType }}
      userInfo={userInfo}
      currentService="finance"
      initialModule={initialModule}
      onModuleChange={(slug: AccountsModuleSlug) => router.push(buildPath(slug))}
      onServiceSwitch={(svc) => {
        setSelectedService(svc);
        if (svc === 'marketing') {
          router.push(buildPath('overview', { service: 'marketing', model: 'ecommerce' }));
        }
      }}
      onActivateCrossSell={openCrossSell}
      // Jump straight to the default tab instead of `/settings` — the index
      // route is a server-side redirect to this path, so skipping it here
      // saves one navigation hop and the flash of a blank shell.
      onProfileSettings={() => router.push(buildPath('settings/personal'))}
    />
  );
}

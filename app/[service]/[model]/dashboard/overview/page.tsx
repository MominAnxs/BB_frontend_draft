'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { PerformanceReports } from '../../../../../components/reports/PerformanceReports';
import { useAppState, useRouteContext, type BusinessModel } from '../../../../providers';
import { useCrossSellFlow } from '../../../../../components/business/CrossSellFlowProvider';

// Accounts dashboard is loaded lazily to keep the marketing bundle lean.
// `ssr: false` is safe: overview is gated by client-side interaction anyway,
// and avoids hydration mismatch on finance pages where the context may not
// yet reflect the URL on first paint.
const AccountsReports = dynamic(
  () => import('../../../../../components/reports/AccountsReports').then(m => ({ default: m.AccountsReports })),
  { ssr: false },
);

// Marketing allows only `ecommerce` | `leadgen`. The server layout already
// rejects finance-only models on marketing URLs, but keep the narrow for TS.
function isMarketingModel(m: BusinessModel): m is 'ecommerce' | 'leadgen' {
  return m === 'ecommerce' || m === 'leadgen';
}

export default function OverviewPage() {
  const router = useRouter();
  const { service, model, buildPath } = useRouteContext();
  const { userInfo, setSelectedService } = useAppState();
  const { openCrossSell } = useCrossSellFlow();

  if (service === 'finance') {
    // Every Accounts module branches on `diagnosticData.businessType ===
    // 'Trading, Manufacturing or Services'` to switch between the
    // ecommerce-restaurants and trading-manufacturing variants (different
    // copy, data shapes, balance-sheet/P&L structures, insights). When no
    // diagnosticData is passed, that check silently fails and every user
    // falls through to the ecommerce variant — which was the bug visible
    // at /accounts-taxation/trading-manufacturing/dashboard/overview.
    //
    // The URL is the source of truth for the business model, so derive the
    // canonical businessType label from the resolved `model` param and
    // hand it down. The labels here must match the strings the modules
    // check against verbatim (see providers.resolveFinanceVariant + the
    // TraditionalOnboarding option values).
    const financeBusinessType =
      model === 'trading-manufacturing'
        ? 'Trading, Manufacturing or Services'
        : 'E-Commerce or Restaurants';

    return (
      <AccountsReports
        onClose={() => router.push(buildPath('chat'))}
        diagnosticData={{ businessType: financeBusinessType }}
        userInfo={userInfo}
        currentService="finance"
        initialModule="overview"
        onModuleChange={(slug) => router.push(buildPath(slug))}
        onServiceSwitch={(svc) => {
          setSelectedService(svc);
          if (svc === 'marketing') {
            router.push(buildPath('overview', { service: 'marketing', model: 'ecommerce' }));
          }
        }}
        onActivateCrossSell={openCrossSell}
        onProfileSettings={() => router.push(buildPath('settings/personal'))}
      />
    );
  }

  const marketingModel = isMarketingModel(model) ? model : 'ecommerce';

  return (
    <PerformanceReports
      userInfo={userInfo}
      businessModel={marketingModel}
      onBack={() => router.push(buildPath('chat'))}
      onModuleChange={(module) => router.push(buildPath(module))}
      onServiceSwitch={(svc) => {
        setSelectedService(svc);
        if (svc === 'finance') {
          router.push(buildPath('overview', { service: 'finance', model: 'ecommerce-restaurants' }));
        }
      }}
      onActivateCrossSell={openCrossSell}
      onProfileSettings={() => router.push(buildPath('settings/personal'))}
    />
  );
}

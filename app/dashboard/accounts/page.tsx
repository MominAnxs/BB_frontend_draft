'use client';

import { useRouter } from 'next/navigation';
import { AccountsReports } from '../../../components/reports/AccountsReports';
import { useAppState } from '../../providers';

export default function AccountsPage() {
  const router = useRouter();
  const { userInfo, selectedService, setSelectedService, businessModel } = useAppState();

  // Derive the canonical businessType label from the in-context business
  // model so the Accounts modules pick up the right variant (Trading /
  // Manufacturing / Services vs E-Commerce / Restaurants). Without this,
  // every Accounts module silently falls back to the ecommerce variant.
  const financeBusinessType =
    businessModel === 'trading-manufacturing'
      ? 'Trading, Manufacturing or Services'
      : 'E-Commerce or Restaurants';

  return (
    <AccountsReports
      onClose={() => router.push('/dashboard/reports')}
      diagnosticData={{ businessType: financeBusinessType }}
      userInfo={userInfo}
      currentService={selectedService}
      onServiceSwitch={(svc) => {
        setSelectedService(svc);
        if (svc === 'marketing') router.push('/dashboard/reports');
      }}
      onProfileSettings={() => router.push('/dashboard/settings')}
    />
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { TraditionalOnboarding } from '../../components/onboarding/TraditionalOnboarding';
import { useAppState, resolveFinanceVariant, type BusinessModel } from '../providers';

/** Recognise any label/shape the onboarding step emits for Accounts & Taxation. */
function isFinanceService(service?: string | null): boolean {
  if (!service) return false;
  const s = service.toLowerCase();
  return (
    s === 'finance' ||
    s === 'accounts & taxation' ||
    s === 'accounts and taxation' ||
    s.includes('accounts') ||
    s.includes('taxation')
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { userInfo, setUserInfo, setBusinessModel, setSelectedService, dashboardPath } = useAppState();

  const handleComplete = (
    goal?: string,
    bm?: 'ecommerce' | 'leadgen',
    financeData?: {
      businessType?: string;
      financeManagement?: string;
      revenueRange?: string;
      accountingSoftware?: string;
    },
    service?: string,
    adSpendRange?: string,
    industry?: string,
  ) => {
    const isFinance = isFinanceService(service);

    // Resolve final service + model for the URL and the app context
    const finalService: 'marketing' | 'finance' = isFinance ? 'finance' : 'marketing';
    const finalModel: BusinessModel = isFinance
      ? resolveFinanceVariant(financeData?.businessType)
      : (bm ?? 'ecommerce');

    // Keep global context aligned with the URL we're about to push
    setSelectedService(finalService);
    setBusinessModel(finalModel);

    setUserInfo((prev) => ({
      ...prev,
      goal: goal ?? prev.goal,
      // Persist marketing-only fields verbatim; ignore bm for finance so we
      // don't accidentally stamp 'ecommerce' on a finance user.
      businessModel: isFinance ? prev.businessModel : (bm ?? prev.businessModel),
      adSpendRange: adSpendRange ?? prev.adSpendRange,
      industry: industry ?? prev.industry,
      // Finance fields (only populate for finance flow)
      ...(isFinance && financeData
        ? {
            businessType: financeData.businessType ?? prev.businessType,
            financeManagement: financeData.financeManagement ?? prev.financeManagement,
            revenueRange: financeData.revenueRange ?? prev.revenueRange,
            accountingSoftware: financeData.accountingSoftware ?? prev.accountingSoftware,
          }
        : {}),
      selectedService: isFinance ? 'Accounts & Taxation' : (prev.selectedService || 'Performance Marketing'),
    }));

    router.push(dashboardPath('overview', { service: finalService, model: finalModel }));
  };

  return (
    <TraditionalOnboarding
      userInfo={userInfo}
      onComplete={handleComplete}
    />
  );
}

'use client';

/**
 * CrossSellFlowProvider
 * ─────────────────────
 * Owns the Plan + Business-Details modals that are fired from the sidebar
 * cross-sell CTA ("Explore Finance" / "Explore Marketing") on the dashboard
 * pages under `/[service]/[model]/dashboard/*`.
 *
 * Why this exists:
 *   The dashboard pages (overview/meta-ads/etc.) render PerformanceReports or
 *   AccountsReports directly — they don't own the Add-Business state the way
 *   ChatInterface does. Before this provider, clicking the cross-sell CTA on
 *   those pages did nothing because no `onAddBusiness` / `onActivateCrossSell`
 *   handler was wired up.
 *
 * Consumers call `openCrossSell('finance' | 'marketing')` (typically via the
 * `onActivateCrossSell` prop on the Reports components) and this provider
 * takes over from there: plan selection → payment → business details →
 * navigate to the newly-added service's dashboard.
 */

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AddBusinessPlanModal } from './AddBusinessPlanModal';
import { AddBusinessModal } from './AddBusinessModal';
import type { BusinessAccount } from './BusinessAccountCard';
import { useAppState, type AppService, type BusinessModel } from '../../app/providers';

type ServiceLabel = 'Performance Marketing' | 'Accounts & Taxation';

interface CrossSellFlowContextValue {
  /** Open the Plan modal for the given service, skipping the service picker. */
  openCrossSell: (service: 'marketing' | 'finance') => void;
}

const CrossSellFlowContext = createContext<CrossSellFlowContextValue | null>(null);

export function useCrossSellFlow(): CrossSellFlowContextValue {
  const ctx = useContext(CrossSellFlowContext);
  // Soft-fail: if a page is rendered outside the provider, return a no-op so
  // callers don't crash. They simply won't get a modal — the CTA is inert.
  return ctx ?? { openCrossSell: () => {} };
}

function serviceIdToLabel(id: 'marketing' | 'finance'): ServiceLabel {
  return id === 'finance' ? 'Accounts & Taxation' : 'Performance Marketing';
}

function labelToServiceId(label: ServiceLabel): AppService {
  return label === 'Accounts & Taxation' ? 'finance' : 'marketing';
}

export function CrossSellFlowProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { setSelectedService, setBusinessModel } = useAppState();

  const [showPlan, setShowPlan] = useState(false);
  const [showBiz, setShowBiz] = useState(false);
  const [preSelected, setPreSelected] = useState<ServiceLabel | undefined>(undefined);

  const openCrossSell = useCallback((service: 'marketing' | 'finance') => {
    setPreSelected(serviceIdToLabel(service));
    setShowPlan(true);
  }, []);

  const handlePlanClose = useCallback(() => {
    setShowPlan(false);
    // Only clear preselection if the business-details step isn't about to
    // open (handlePlanComplete leaves preselection in place for the next step).
    if (!showBiz) setPreSelected(undefined);
  }, [showBiz]);

  // After payment success → move to business details with same preselection.
  const handlePlanComplete = useCallback((service: ServiceLabel, _plan: string) => {
    setShowPlan(false);
    setPreSelected(service);
    setShowBiz(true);
  }, []);

  const handleBizClose = useCallback(() => {
    setShowBiz(false);
    setPreSelected(undefined);
  }, []);

  // After business details submitted → navigate into the new service's
  // dashboard. We don't persist accounts here (ChatInterface owns the full
  // multi-account state); the user enters the new service's overview with
  // the URL-level state correctly set.
  const handleBizComplete = useCallback(
    (acct: BusinessAccount) => {
      setShowBiz(false);
      setPreSelected(undefined);

      const svc: AppService = labelToServiceId(acct.service);
      let model: BusinessModel;
      if (svc === 'finance') {
        // Business type from AddBusinessModal is already a finance variant id.
        model = (acct.businessType === 'trading-manufacturing'
          ? 'trading-manufacturing'
          : 'ecommerce-restaurants') as BusinessModel;
      } else {
        model = (acct.businessType === 'leadgen' ? 'leadgen' : 'ecommerce') as BusinessModel;
      }

      // Sync context so other consumers that still read from it stay coherent.
      setSelectedService(svc);
      setBusinessModel(model);

      const serviceSlug = svc === 'finance' ? 'accounts-taxation' : 'performance-marketing';
      const modelSlug =
        model === 'ecommerce'
          ? 'e-commerce'
          : model === 'leadgen'
            ? 'lead-generation'
            : model; // finance variants already use their url slug

      toast.success(`${acct.name} created`, {
        description: `${acct.service} workspace is ready`,
        duration: 3000,
      });

      router.push(`/${serviceSlug}/${modelSlug}/dashboard/overview`);
    },
    [router, setSelectedService, setBusinessModel],
  );

  const value = useMemo<CrossSellFlowContextValue>(() => ({ openCrossSell }), [openCrossSell]);

  return (
    <CrossSellFlowContext.Provider value={value}>
      {children}
      <AddBusinessPlanModal
        isOpen={showPlan}
        onClose={handlePlanClose}
        preSelectedService={preSelected}
        onComplete={handlePlanComplete}
      />
      <AddBusinessModal
        isOpen={showBiz}
        onClose={handleBizClose}
        preSelectedService={preSelected}
        onComplete={handleBizComplete}
        existingAccounts={[]}
      />
    </CrossSellFlowContext.Provider>
  );
}

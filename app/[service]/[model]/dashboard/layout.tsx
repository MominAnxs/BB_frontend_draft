'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppState, SLUG_TO_SERVICE, SLUG_TO_MODEL } from '../../../providers';
import { CrossSellFlowProvider } from '../../../../components/business/CrossSellFlowProvider';

/**
 * Keeps the React context loosely in sync with whatever is in the URL so that
 * components which still read `selectedService` / `businessModel` from
 * `useAppState()` get a sensible value after a hard refresh on Vercel.
 *
 * The URL — not this context — is the source of truth. New page code should
 * prefer `useRouteContext()` which reads params directly (no flicker, no race).
 *
 * Also mounts the cross-sell flow provider so that every dashboard page can
 * trigger the "Explore Finance" / "Explore Marketing" activation flow from
 * the sidebar ServiceSwitcher widget without owning modal state themselves.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ service: string; model: string }>();
  const { selectedService, setSelectedService, businessModel, setBusinessModel } = useAppState();

  useEffect(() => {
    const urlService = SLUG_TO_SERVICE[params?.service ?? ''];
    if (urlService && urlService !== selectedService) {
      setSelectedService(urlService);
    }
    const urlModel = SLUG_TO_MODEL[params?.model ?? ''];
    if (urlModel && urlModel !== businessModel) {
      setBusinessModel(urlModel);
    }
    // We intentionally depend only on the URL — we don't want this effect to
    // re-run (and potentially thrash) whenever a component mutates context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.service, params?.model]);

  return <CrossSellFlowProvider>{children}</CrossSellFlowProvider>;
}

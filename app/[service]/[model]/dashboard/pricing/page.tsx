'use client';

import { useRouter } from 'next/navigation';
import { PricingPage } from '../../../../../components/upgrade/PricingPage';
import { useRouteContext } from '../../../../providers';

export default function PricingPageRoute() {
  const router = useRouter();
  const { service, buildPath } = useRouteContext();

  return (
    <PricingPage
      service={service}
      onSelectPlan={() => router.push(buildPath('upgrade'))}
    />
  );
}

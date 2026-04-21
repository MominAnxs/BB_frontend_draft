'use client';

import { useRouter } from 'next/navigation';
import { PricingPage } from '../../../components/upgrade/PricingPage';
import { useAppState } from '../../providers';

export default function PricingPageRoute() {
  const router = useRouter();
  const { selectedService } = useAppState();

  return (
    <PricingPage
      service={selectedService}
      onSelectPlan={() => router.push('/dashboard/upgrade')}
    />
  );
}

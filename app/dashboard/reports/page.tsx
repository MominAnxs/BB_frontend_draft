'use client';

import { useRouter } from 'next/navigation';
import { PerformanceReports } from '../../../components/reports/PerformanceReports';
import { useAppState } from '../../providers';

export default function ReportsPage() {
  const router = useRouter();
  const { userInfo, businessModel, setSelectedService } = useAppState();
  const marketingModel = businessModel === 'leadgen' ? 'leadgen' : 'ecommerce';

  return (
    <PerformanceReports
      userInfo={userInfo}
      businessModel={marketingModel}
      onBack={() => router.push('/dashboard/chat')}
      onServiceSwitch={(svc) => {
        setSelectedService(svc);
        if (svc === 'finance') router.push('/dashboard/accounts');
      }}
      onProfileSettings={() => router.push('/dashboard/settings')}
    />
  );
}

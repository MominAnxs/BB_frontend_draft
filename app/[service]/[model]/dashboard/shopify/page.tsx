'use client';

import { useRouter } from 'next/navigation';
import { PerformanceReports } from '../../../../../components/reports/PerformanceReports';
import { useAppState, useRouteContext } from '../../../../providers';
import { useCrossSellFlow } from '../../../../../components/business/CrossSellFlowProvider';

export default function ShopifyPage() {
  const router = useRouter();
  const { userInfo, setSelectedService } = useAppState();
  const { model, buildPath } = useRouteContext();
  const { openCrossSell } = useCrossSellFlow();
  const marketingModel = model === 'leadgen' ? 'leadgen' : 'ecommerce';

  return (
    <PerformanceReports
      userInfo={userInfo}
      businessModel={marketingModel}
      initialModule="sales"
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

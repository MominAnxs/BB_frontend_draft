'use client';

import { useRouter } from 'next/navigation';
import { UpgradeFlow } from '../../../../../components/upgrade/UpgradeFlow';
import { useAppState, useRouteContext } from '../../../../providers';

export default function UpgradePage() {
  const router = useRouter();
  const { userInfo } = useAppState();
  const { buildPath } = useRouteContext();

  return (
    <UpgradeFlow
      userInfo={userInfo}
      onClose={() => router.push(buildPath('chat'))}
      onComplete={() => router.push(buildPath('chat'))}
    />
  );
}

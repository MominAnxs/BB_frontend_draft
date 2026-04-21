'use client';

import { useRouter } from 'next/navigation';
import { UpgradeFlow } from '../../../components/upgrade/UpgradeFlow';
import { useAppState } from '../../providers';

export default function UpgradePage() {
  const router = useRouter();
  const { userInfo } = useAppState();

  return (
    <UpgradeFlow
      userInfo={userInfo}
      onClose={() => router.push('/dashboard/chat')}
      onComplete={() => router.push('/dashboard/chat')}
    />
  );
}

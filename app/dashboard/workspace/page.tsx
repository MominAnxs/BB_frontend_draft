'use client';

import { useRouter } from 'next/navigation';
import { Workspace } from '../../../components/workspace/Workspace';
import { useAppState } from '../../providers';

export default function WorkspacePage() {
  const router = useRouter();
  const { userInfo } = useAppState();

  return (
    <Workspace
      userInfo={userInfo}
      onNavigateToChat={() => router.push('/dashboard/chat')}
      onNavigateToReports={() => router.push('/dashboard/reports')}
      onNavigateToDataroom={() => router.push('/dashboard/dataroom')}
      onBack={() => router.push('/dashboard/chat')}
      onProfileSettings={() => router.push('/dashboard/settings')}
    />
  );
}

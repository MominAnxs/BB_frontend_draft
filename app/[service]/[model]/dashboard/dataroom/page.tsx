'use client';

import { useRouter } from 'next/navigation';
import { Dataroom } from '../../../../../components/dataroom/Dataroom';
import { useAppState, useRouteContext } from '../../../../providers';

export default function DataroomPage() {
  const router = useRouter();
  const { userInfo } = useAppState();
  const { buildPath } = useRouteContext();

  return (
    <Dataroom
      userInfo={userInfo}
      onBack={() => router.push(buildPath('chat'))}
      onNavigateToChat={() => router.push(buildPath('chat'))}
      onNavigateToWorkspace={() => router.push(buildPath('workspace'))}
      onProfileSettings={() => router.push(buildPath('settings/personal'))}
    />
  );
}

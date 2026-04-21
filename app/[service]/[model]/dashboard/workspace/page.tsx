'use client';

import { useRouter } from 'next/navigation';
import { Workspace } from '../../../../../components/workspace/Workspace';
import { useAppState, useRouteContext } from '../../../../providers';

export default function WorkspacePage() {
  const router = useRouter();
  const { userInfo } = useAppState();
  const { buildPath } = useRouteContext();

  return (
    <Workspace
      userInfo={userInfo}
      onNavigateToChat={() => router.push(buildPath('chat'))}
      onNavigateToReports={() => router.push(buildPath('overview'))}
      onNavigateToDataroom={() => router.push(buildPath('dataroom'))}
      onBack={() => router.push(buildPath('chat'))}
      onProfileSettings={() => router.push(buildPath('settings/personal'))}
    />
  );
}

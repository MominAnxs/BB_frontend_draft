'use client';

import { useRouter } from 'next/navigation';
import { Dataroom } from '../../../components/dataroom/Dataroom';
import { useAppState } from '../../providers';

export default function DataroomPage() {
  const router = useRouter();
  const { userInfo } = useAppState();

  return (
    <Dataroom
      userInfo={userInfo}
      onBack={() => router.push('/dashboard/chat')}
      onNavigateToChat={() => router.push('/dashboard/chat')}
      onNavigateToWorkspace={() => router.push('/dashboard/workspace')}
      onProfileSettings={() => router.push('/dashboard/settings')}
    />
  );
}

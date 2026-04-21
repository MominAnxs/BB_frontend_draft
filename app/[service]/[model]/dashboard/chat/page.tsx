'use client';

import { useRouter } from 'next/navigation';
import { ChatInterface } from '../../../../../components/chat/ChatInterface';
import { useAppState, useRouteContext } from '../../../../providers';

export default function ChatPage() {
  const router = useRouter();
  const { userInfo } = useAppState();
  const { buildPath } = useRouteContext();

  return (
    <ChatInterface
      userInfo={userInfo}
      onComplete={() => router.push(buildPath('overview'))}
    />
  );
}

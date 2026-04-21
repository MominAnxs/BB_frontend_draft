'use client';

import { useRouter } from 'next/navigation';
import { ChatInterface } from '../../../components/chat/ChatInterface';
import { useAppState } from '../../providers';

export default function ChatPage() {
  const router = useRouter();
  const { userInfo } = useAppState();

  return (
    <ChatInterface
      userInfo={userInfo}
      onComplete={() => router.push('/dashboard/reports')}
    />
  );
}

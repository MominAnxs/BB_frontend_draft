'use client';

import { useRouter } from 'next/navigation';
import { AuthPage } from '../components/auth/AuthPage';
import { useAppState } from './providers';
import type { AuthResult } from '../types';

export default function Home() {
  const router = useRouter();
  const { setAuthResult } = useAppState();

  const handleAuthSuccess = (result: AuthResult) => {
    setAuthResult(result);
    router.push('/onboarding');
  };

  return <AuthPage onAuthSuccess={handleAuthSuccess} />;
}

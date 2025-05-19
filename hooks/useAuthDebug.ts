'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export function useAuthDebug() {
  const { data: session, status } = useSession();
  
  useEffect(() => {
    console.log('Auth Status:', status);
    console.log('Session Data:', session);
  }, [session, status]);
  
  return { session, status };
}

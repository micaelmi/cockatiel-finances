'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { setTokenGetter } from '@/lib/api/client';

/**
 * Registers Clerk's getToken() with the API client so all requests
 * automatically include a valid JWT in the Authorization header.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  return <>{children}</>;
}

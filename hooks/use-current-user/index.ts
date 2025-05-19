'use client';

import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import { useSession } from 'next-auth/react';
import type { UserWithId } from '@/types';

interface UseCurrentUserResult {
  user: UserWithId | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: { name?: string; image?: string }) => Promise<UserWithId | null>;
}

export function useCurrentUser(): UseCurrentUserResult {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await userApi.getCurrentUser();

        if (error) {
          setError(error);
        } else if (data) {
          setUser(data);
        }
      } catch (err) {
        setError('사용자 정보를 불러오는 중 오류가 발생했습니다');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [status]);

  const updateProfile = async (data: { name?: string; image?: string }): Promise<UserWithId | null> => {
    try {
      const { data: updatedUser, error } = await userApi.updateProfile(data);

      if (error) {
        setError(error);
        return null;
      }

      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError('프로필을 업데이트하는 중 오류가 발생했습니다');
      console.error(err);
      return null;
    }
  };

  return {
    user: user || (session?.user as UserWithId),
    isLoading: status === 'loading' || isLoading,
    error,
    updateProfile,
  };
}

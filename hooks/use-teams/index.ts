'use client';

import { useState, useEffect, useCallback } from 'react';
import { teamApi } from '@/lib/api';

interface Team {
  id: string;
  name: string;
  description?: string;
  members?: Array<{
    id: string;
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
    };
    role: string;
  }>;
  _count?: {
    todos: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseTeamsResult {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTeam: (data: { name: string; description?: string }) => Promise<Team | null>;
  updateTeam: (teamId: string, data: { name?: string; description?: string }) => Promise<Team | null>;
  deleteTeam: (teamId: string) => Promise<boolean>;
  inviteUser: (teamId: string, email: string) => Promise<boolean>;
}

export function useTeams(): UseTeamsResult {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await teamApi.getTeams();

      if (error) {
        setError(error);
      } else {
        setTeams(data || []);
      }
    } catch (err) {
      setError('팀 목록을 불러오는 중 오류가 발생했습니다');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createTeam = async (data: { name: string; description?: string }): Promise<Team | null> => {
    try {
      const { data: createdTeam, error } = await teamApi.createTeam(data);

      if (error) {
        setError(error);
        return null;
      }

      // 팀 목록 업데이트
      setTeams((prev) => [createdTeam, ...prev]);
      return createdTeam;
    } catch (err) {
      setError('팀을 생성하는 중 오류가 발생했습니다');
      console.error(err);
      return null;
    }
  };

  const updateTeam = async (
    teamId: string,
    data: { name?: string; description?: string }
  ): Promise<Team | null> => {
    try {
      const { data: updatedTeam, error } = await teamApi.updateTeam(teamId, data);

      if (error) {
        setError(error);
        return null;
      }

      // 팀 목록 업데이트
      setTeams((prev) =>
        prev.map((team) => (team.id === teamId ? updatedTeam : team))
      );
      return updatedTeam;
    } catch (err) {
      setError('팀을 업데이트하는 중 오류가 발생했습니다');
      console.error(err);
      return null;
    }
  };

  const deleteTeam = async (teamId: string): Promise<boolean> => {
    try {
      const { error } = await teamApi.deleteTeam(teamId);

      if (error) {
        setError(error);
        return false;
      }

      // 팀 목록에서 제거
      setTeams((prev) => prev.filter((team) => team.id !== teamId));
      return true;
    } catch (err) {
      setError('팀을 삭제하는 중 오류가 발생했습니다');
      console.error(err);
      return false;
    }
  };

  const inviteUser = async (teamId: string, email: string): Promise<boolean> => {
    try {
      const { error } = await teamApi.inviteUser(teamId, email);

      if (error) {
        setError(error);
        return false;
      }

      // 팀 목록 새로고침
      await fetchTeams();
      return true;
    } catch (err) {
      setError('사용자를 초대하는 중 오류가 발생했습니다');
      console.error(err);
      return false;
    }
  };

  return {
    teams,
    isLoading,
    error,
    refetch: fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteUser,
  };
}

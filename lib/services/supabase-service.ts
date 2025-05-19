import { supabase } from '@/lib/supabase';
import type { Todo, UserWithId } from '@/types';

/**
 * 사용자 관련 Supabase 서비스
 */
export const userService = {
  /**
   * 사용자 프로필 가져오기
   */
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  },
  
  /**
   * 사용자 프로필 업데이트
   */
  async updateProfile(userId: string, updates: Partial<UserWithId>) {
    const { data, error } = await supabase
      .from('User')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return data;
  }
};

/**
 * 팀 관련 Supabase 서비스
 */
export const teamService = {
  /**
   * 사용자가 속한 팀 목록 가져오기
   */
  async getUserTeams(userId: string) {
    const { data, error } = await supabase
      .from('TeamMember')
      .select(`
        *,
        team: Team(*)
      `)
      .eq('userId', userId);
    
    if (error) {
      console.error('Error fetching user teams:', error);
      return [];
    }
    
    return data.map(item => item.team);
  },
  
  /**
   * 팀 상세 정보 가져오기
   */
  async getTeam(teamId: string) {
    const { data, error } = await supabase
      .from('Team')
      .select(`
        *,
        members: TeamMember(
          *,
          user: User(id, name, email, image)
        )
      `)
      .eq('id', teamId)
      .single();
    
    if (error) {
      console.error('Error fetching team:', error);
      return null;
    }
    
    return data;
  },
  
  /**
   * 새 팀 생성
   */
  async createTeam(name: string, description: string | null, ownerId: string) {
    // 트랜잭션 처리가 필요하지만 Supabase에서는 제한적입니다
    // 따라서 두 단계로 나누어 처리합니다
    
    // 1. 팀 생성
    const { data: team, error: teamError } = await supabase
      .from('Team')
      .insert([{ name, description }])
      .select()
      .single();
    
    if (teamError) {
      console.error('Error creating team:', teamError);
      return null;
    }
    
    // 2. 팀 멤버 추가 (소유자)
    const { error: memberError } = await supabase
      .from('TeamMember')
      .insert([{ teamId: team.id, userId: ownerId, role: 'owner' }]);
    
    if (memberError) {
      console.error('Error adding team owner:', memberError);
      // 이상적으로는 롤백이 필요하지만 단순화를 위해 생략합니다
      return null;
    }
    
    return team;
  }
};

/**
 * 할 일 관련 Supabase 서비스
 */
export const todoService = {
  /**
   * 할 일 목록 가져오기
   */
  async getTodos(userId: string, options: { teamId?: string, completed?: boolean } = {}) {
    let query = supabase
      .from('Todo')
      .select(`
        *,
        createdBy: User!createdById(id, name, image),
        assignedTo: TodoAssignment(
          *,
          user: User(id, name, image)
        ),
        team: Team(id, name)
      `);
    
    // 팀 ID 필터링
    if (options.teamId) {
      query = query.eq('teamId', options.teamId);
    } else {
      // 사용자의 할 일만 가져오기 (생성자이거나 할당된 경우)
      query = query.or(`createdById.eq.${userId},assignedTo.user.id.eq.${userId}`);
    }
    
    // 완료 상태 필터링
    if (options.completed !== undefined) {
      query = query.eq('completed', options.completed);
    }
    
    // 정렬 (완료되지 않은 항목 먼저, 그 다음 마감일순)
    query = query.order('completed').order('deadline');
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching todos:', error);
      return [];
    }
    
    return data;
  },
  
  /**
   * 할 일 생성
   */
  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('Todo')
      .insert([todo])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating todo:', error);
      return null;
    }
    
    return data;
  },
  
  /**
   * 할 일 업데이트
   */
  async updateTodo(todoId: string, updates: Partial<Todo>) {
    const { data, error } = await supabase
      .from('Todo')
      .update(updates)
      .eq('id', todoId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating todo:', error);
      return null;
    }
    
    return data;
  },
  
  /**
   * 할 일 삭제
   */
  async deleteTodo(todoId: string) {
    const { error } = await supabase
      .from('Todo')
      .delete()
      .eq('id', todoId);
    
    if (error) {
      console.error('Error deleting todo:', error);
      return false;
    }
    
    return true;
  }
};

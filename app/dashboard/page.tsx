'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UserButton } from '@/components/ui/user-button';
import { TeamSelector } from '@/components/ui/team-selector';
import { TodoFilters, type TodoFilters as TodoFiltersType } from '@/components/ui/todo-filters';
import { TodoForm } from '@/components/ui/todo-form';
import { TodoItem } from '@/components/ui/todo-item';
import { Loading, ErrorState, EmptyState } from '@/components/ui/loading';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useTodos } from '@/hooks/use-todos';
import { useTeams } from '@/hooks/use-teams';
import { format } from 'date-fns';
import { ListTodo, Users } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useCurrentUser();
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TodoFiltersType>({
    status: 'all',
    assignee: 'all',
    deadline: 'all',
    sortBy: 'deadline',
    sortOrder: 'asc'
  });
  
  const { 
    todos, 
    isLoading: isLoadingTodos, 
    error: todosError,
    refetch: refetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    assignTodo
  } = useTodos({
    teamId: currentTeamId || undefined,
    // 상태에 따른 필터
    completed: filters.status === 'completed' ? true : 
              filters.status === 'active' ? false : 
              undefined,
    // 마감일에 따른 필터
    deadline: filters.deadline !== 'all' ? filters.deadline : undefined
  });
  
  const {
    teams,
    isLoading: isLoadingTeams
  } = useTeams();
  
  // 사용자가 로그인하지 않았으면 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push('/auth/signin');
    }
  }, [isLoadingUser, user, router]);
  
  // 할 일 필터링 및 정렬
  const filteredAndSortedTodos = todos
    // 담당자 필터링
    .filter(todo => {
      if (filters.assignee === 'all') return true;
      if (filters.assignee === 'me' && todo.assignedTo?.includes(user?.id || '')) return true;
      if (filters.assignee === 'others' && todo.assignedTo?.some(id => id !== user?.id)) return true;
      return false;
    })
    // 정렬
    .sort((a, b) => {
      // 먼저 완료 상태로 정렬
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // 지정된 정렬 기준으로 정렬
      if (filters.sortBy === 'deadline') {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      
      if (filters.sortBy === 'created') {
        const orderMultiplier = filters.sortOrder === 'asc' ? 1 : -1;
        return orderMultiplier * ((new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()));
      }
      
      if (filters.sortBy === 'alphabetical') {
        return a.text.localeCompare(b.text);
      }
      
      return 0;
    });
  
  // 필터 계산을 위한 카운트
  const counts = {
    all: todos.length,
    active: todos.filter(todo => !todo.completed).length,
    completed: todos.filter(todo => todo.completed).length,
    today: todos.filter(todo => {
      if (!todo.deadline) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const deadline = new Date(todo.deadline);
      return deadline >= today && deadline < tomorrow;
    }).length,
    upcoming: todos.filter(todo => {
      if (!todo.deadline) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadline = new Date(todo.deadline);
      return deadline >= today;
    }).length,
    overdue: todos.filter(todo => {
      if (!todo.deadline) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadline = new Date(todo.deadline);
      return deadline < today && !todo.completed;
    }).length
  };
  
  // 팀 멤버 목록 생성
  const teamMembers = teams.length > 0 && currentTeamId
    ? teams
        .find(team => team.id === currentTeamId)
        ?.members
        ?.map(member => ({
          id: member.user.id,
          name: member.user.name || member.user.email?.split('@')[0] || 'User',
          avatar: member.user.image || '/placeholder.svg?height=32&width=32',
          online: true // 실제로는 온라인 상태를 가져와야 함
        })) || []
    : [user].filter(Boolean).map(u => ({
        id: u?.id || '',
        name: u?.name || 'You',
        avatar: u?.image || '/placeholder.svg?height=32&width=32',
        online: true
      }));
  
  // 할 일 추가 처리
  const handleAddTodo = async (data: { 
    text: string; 
    assignedTo?: string[]; 
    deadline?: string | null;
  }) => {
    if (!user) return false;
    
    const createdTodo = await createTodo({
      text: data.text,
      teamId: currentTeamId || undefined,
      assignedTo: data.assignedTo,
      deadline: data.deadline
    });
    
    return !!createdTodo;
  };
  
  // 할 일 토글 처리
  const handleToggleTodo = async (id: string | number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id.toString(), { completed: !todo.completed });
    }
  };
  
  // 할 일 삭제 처리
  const handleDeleteTodo = async (id: string | number) => {
    await deleteTodo(id.toString());
  };
  
  // 할 일 할당 처리
  const handleAssignTodo = async (id: string | number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    // 여기서는 간단하게 처리하지만, 실제로는 담당자 선택 UI를 표시해야 함
    // 현재는 기존 담당자에 현재 사용자만 토글
    const currentAssignees = todo.assignedTo || [];
    const newAssignees = currentAssignees.includes(user?.id || '')
      ? currentAssignees.filter(assigneeId => assigneeId !== user?.id)
      : [...currentAssignees, user?.id || ''];
    
    await assignTodo(id.toString(), newAssignees);
  };
  
  // 로딩 중이면 로딩 상태 표시
  if (isLoadingUser) {
    return <Loading fullScreen text="사용자 정보 로딩 중..." />;
  }
  
  // 사용자 정보가 없으면 로그인 페이지로 리디렉션 (이미 위에서 처리)
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto p-4">
        <header className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold">Dynamic Island Todo</h1>
          <UserButton user={user} />
        </header>
        
        <div className="mb-6 flex items-center justify-between">
          <TeamSelector
            currentTeamId={currentTeamId}
            onTeamChange={setCurrentTeamId}
          />
        </div>
        
        <div className="bg-black rounded-xl border border-gray-800 p-5 shadow-lg">
          <TodoFilters
            filters={filters}
            onFilterChange={setFilters}
            counts={counts}
          />
          
          <div className="mb-6">
            <TodoForm
              onAddTodo={handleAddTodo}
              teamMembers={teamMembers}
              currentUserId={user.id}
            />
          </div>
          
          {isLoadingTodos ? (
            <div className="py-8">
              <Loading text="할 일 목록 로딩 중..." />
            </div>
          ) : todosError ? (
            <ErrorState 
              message="할 일 목록을 불러오는 중 오류가 발생했습니다" 
              retry={refetchTodos} 
            />
          ) : filteredAndSortedTodos.length === 0 ? (
            <EmptyState
              message={
                currentTeamId
                  ? "이 팀에는 아직 할 일이 없습니다"
                  : "아직 할 일이 없습니다"
              }
              icon={currentTeamId ? Users : ListTodo}
              action={{
                label: "할 일 추가하기",
                onClick: () => {
                  // 입력 폼에 포커스
                  document.querySelector('input[type="text"]')?.focus();
                }
              }}
            />
          ) : (
            <motion.div
              layout
              className="space-y-3"
            >
              <AnimatePresence>
                {filteredAndSortedTodos.map(todo => (
                  <TodoItem
                    key={todo.id}
                    id={todo.id}
                    text={todo.text}
                    completed={todo.completed}
                    deadline={todo.deadline}
                    assignedTo={todo.assignedTo}
                    teamMembers={teamMembers}
                    onToggle={handleToggleTodo}
                    onDelete={handleDeleteTodo}
                    onAssign={handleAssignTodo}
                    currentUserId={user.id}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

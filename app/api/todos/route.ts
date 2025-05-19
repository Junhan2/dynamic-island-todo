import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { todoService } from '@/lib/services/supabase-service';
import { supabase } from '@/lib/supabase';

// 할 일 목록 조회
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  const completed = searchParams.has('completed') ? searchParams.get('completed') === 'true' : undefined;
  const deadlineParam = searchParams.get('deadline');
  
  const userId = session.user.id;
  
  try {
    // Supabase 서비스 사용
    const todos = await todoService.getTodos(userId, {
      teamId: teamId || undefined,
      completed
    });
    
    // 마감일 필터링
    let filteredTodos = todos;
    if (deadlineParam) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineParam === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        filteredTodos = todos.filter(todo => {
          if (!todo.deadline) return false;
          const deadline = new Date(todo.deadline);
          return deadline >= today && deadline < tomorrow;
        });
      } else if (deadlineParam === 'upcoming') {
        filteredTodos = todos.filter(todo => {
          if (!todo.deadline) return false;
          const deadline = new Date(todo.deadline);
          return deadline >= today;
        });
      } else if (deadlineParam === 'overdue') {
        filteredTodos = todos.filter(todo => {
          if (!todo.deadline) return false;
          const deadline = new Date(todo.deadline);
          return deadline < today && !todo.completed;
        });
      }
    }
    
    return NextResponse.json(filteredTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: '할 일 목록 조회 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// 새 할 일 생성
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { text, teamId, assignedTo, deadline } = body;
    
    if (!text || text.trim() === '') {
      return NextResponse.json({ error: '할 일 내용은 필수 항목입니다' }, { status: 400 });
    }
    
    // 팀 ID가 제공된 경우 사용자가 해당 팀의 멤버인지 확인
    if (teamId) {
      const { data: isMember } = await supabase
        .from('TeamMember')
        .select('id')
        .eq('userId', session.user.id)
        .eq('teamId', teamId)
        .maybeSingle();
      
      if (!isMember) {
        return NextResponse.json({ error: '이 팀에 할 일을 추가할 권한이 없습니다' }, { status: 403 });
      }
    }
    
    // Supabase를 통해 할 일 생성
    const newTodo = await todoService.createTodo({
      text,
      completed: false,
      createdBy: session.user.id,
      teamId: teamId || null,
      deadline: deadline ? new Date(deadline).toISOString() : null
    });
    
    if (!newTodo) {
      return NextResponse.json({ error: '할 일 생성에 실패했습니다' }, { status: 500 });
    }
    
    // 할당 처리
    if (assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0) {
      for (const userId of assignedTo) {
        await supabase
          .from('TodoAssignment')
          .insert({ todoId: newTodo.id, userId });
      }
    } else {
      // 할당된 사용자가 없는 경우 생성자에게 할당
      await supabase
        .from('TodoAssignment')
        .insert({ todoId: newTodo.id, userId: session.user.id });
    }
    
    // 생성된 할 일 정보와 할당 정보 조회
    const { data: todoWithAssignments } = await supabase
      .from('Todo')
      .select(`
        *,
        assignedTo: TodoAssignment(userId),
        createdBy: User!createdById(id, name, image)
      `)
      .eq('id', newTodo.id)
      .single();
    
    return NextResponse.json(todoWithAssignments);
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: '할 일 생성 중 오류가 발생했습니다' }, { status: 500 });
  }
}
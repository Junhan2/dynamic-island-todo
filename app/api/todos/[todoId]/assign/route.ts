import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { todoService } from '@/lib/services/supabase-service';

interface RouteSegment {
  params: {
    todoId: string;
  };
}

// 할 일에 사용자 할당
export async function POST(request: Request, { params }: RouteSegment) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  const { todoId } = params;
  
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
      include: {
        team: {
          include: {
            members: true,
          },
        },
      },
    });
    
    if (!todo) {
      return NextResponse.json({ error: '할 일을 찾을 수 없습니다' }, { status: 404 });
    }
    
    // 권한 확인 (생성자 또는 같은 팀의 멤버)
    const canAssign = todo.createdById === session.user.id || 
                     (todo.team && todo.team.members.some(member => member.userId === session.user.id));
    
    if (!canAssign) {
      return NextResponse.json({ error: '이 할 일에 사용자를 할당할 권한이 없습니다' }, { status: 403 });
    }
    
    const body = await request.json();
    const { userIds } = body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: '할당할 사용자 ID 목록이 필요합니다' }, { status: 400 });
    }
    
    // 팀 ID가 있는 경우 모든 사용자가 팀 멤버인지 확인
    if (todo.teamId && userIds.length > 0) {
      const teamMembers = todo.team!.members.map(member => member.userId);
      const nonTeamMembers = userIds.filter(userId => !teamMembers.includes(userId));
      
      if (nonTeamMembers.length > 0) {
        return NextResponse.json({ 
          error: '일부 사용자가 팀에 속하지 않습니다',
          nonTeamMembers,
        }, { status: 400 });
      }
    }
    
    // Supabase 서비스를 사용하여 할 일 할당 처리
    const updatedTodo = await todoService.assignTodo(todoId, userIds);
    
    if (!updatedTodo) {
      return NextResponse.json({ error: '할 일 할당 중 오류가 발생했습니다' }, { status: 500 });
    }
    
    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error assigning users to todo:', error);
    return NextResponse.json({ error: '할 일 할당 중 오류가 발생했습니다' }, { status: 500 });
  }
}
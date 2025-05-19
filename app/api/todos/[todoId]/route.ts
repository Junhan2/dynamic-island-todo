import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface RouteSegment {
  params: {
    todoId: string;
  };
}

// 해당 사용자가 할 일에 접근할 수 있는지 확인하는 함수
async function canAccessTodo(userId: string, todoId: string) {
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    include: {
      assignedTo: true,
      team: {
        include: {
          members: true,
        },
      },
    },
  });
  
  if (!todo) return false;
  
  // 본인이 만든 할 일인 경우
  if (todo.createdById === userId) return true;
  
  // 할당된 사용자인 경우
  if (todo.assignedTo.some(assignment => assignment.userId === userId)) return true;
  
  // 같은 팀의 멤버인 경우
  if (todo.team && todo.team.members.some(member => member.userId === userId)) return true;
  
  return false;
}

// 할 일 상세 정보 조회
export async function GET(request: Request, { params }: RouteSegment) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  const { todoId } = params;
  
  try {
    // 접근 권한 확인
    const hasAccess = await canAccessTodo(session.user.id, todoId);
    
    if (!hasAccess) {
      return NextResponse.json({ error: '이 할 일에 접근할 권한이 없습니다' }, { status: 403 });
    }
    
    // 할 일 상세 정보 조회
    const todo = await prisma.todo.findUnique({
      where: {
        id: todoId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!todo) {
      return NextResponse.json({ error: '할 일을 찾을 수 없습니다' }, { status: 404 });
    }
    
    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json({ error: '할 일 정보 조회 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// 할 일 업데이트
export async function PUT(request: Request, { params }: RouteSegment) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  const { todoId } = params;
  
  try {
    // 접근 권한 확인
    const hasAccess = await canAccessTodo(session.user.id, todoId);
    
    if (!hasAccess) {
      return NextResponse.json({ error: '이 할 일을 업데이트할 권한이 없습니다' }, { status: 403 });
    }
    
    const body = await request.json();
    const { text, completed, deadline } = body;
    
    if (text !== undefined && text.trim() === '') {
      return NextResponse.json({ error: '할 일 내용은 비워둘 수 없습니다' }, { status: 400 });
    }
    
    // 할 일 정보 업데이트
    const updatedTodo = await prisma.todo.update({
      where: {
        id: todoId,
      },
      data: {
        text: text ?? undefined,
        completed: completed !== undefined ? completed : undefined,
        deadline: deadline ? new Date(deadline) : deadline === null ? null : undefined,
      },
      include: {
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });
    
    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json({ error: '할 일 업데이트 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// 할 일 삭제
export async function DELETE(request: Request, { params }: RouteSegment) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  const { todoId } = params;
  
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
    });
    
    if (!todo) {
      return NextResponse.json({ error: '할 일을 찾을 수 없습니다' }, { status: 404 });
    }
    
    // 생성자만 삭제 가능
    if (todo.createdById !== session.user.id) {
      // 팀 소유자인 경우도 삭제 권한 부여
      if (todo.teamId) {
        const isTeamOwner = await prisma.teamMember.findFirst({
          where: {
            userId: session.user.id,
            teamId: todo.teamId,
            role: 'owner',
          },
        });
        
        if (!isTeamOwner) {
          return NextResponse.json({ error: '이 할 일을 삭제할 권한이 없습니다' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: '이 할 일을 삭제할 권한이 없습니다' }, { status: 403 });
      }
    }
    
    // 할 일 삭제 (관련된 할당 정보도 자동으로 삭제됨)
    await prisma.todo.delete({
      where: {
        id: todoId,
      },
    });
    
    return NextResponse.json({ message: '할 일이 성공적으로 삭제되었습니다' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json({ error: '할 일 삭제 중 오류가 발생했습니다' }, { status: 500 });
  }
}
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface RouteSegment {
  params: {
    teamId: string;
  };
}

// 해당 사용자가 팀에 속해 있는지 확인하는 함수
async function isTeamMember(userId: string, teamId: string) {
  const member = await prisma.teamMember.findFirst({
    where: {
      userId,
      teamId,
    },
  });
  
  return !!member;
}

// 팀 상세 정보 조회
export async function GET(request: Request, { params }: RouteSegment) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  const { teamId } = params;
  
  try {
    // 사용자가 팀의 멤버인지 확인
    const isMember = await isTeamMember(session.user.id, teamId);
    
    if (!isMember) {
      return NextResponse.json({ error: '이 팀에 접근할 권한이 없습니다' }, { status: 403 });
    }
    
    // 팀 상세 정보 조회
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        todos: {
          orderBy: {
            createdAt: 'desc',
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
          },
        },
      },
    });
    
    if (!team) {
      return NextResponse.json({ error: '팀을 찾을 수 없습니다' }, { status: 404 });
    }
    
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: '팀 정보 조회 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// 팀 정보 업데이트
export async function PUT(request: Request, { params }: RouteSegment) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  const { teamId } = params;
  
  try {
    // 사용자가 팀의 소유자인지 확인
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
        role: 'owner',
      },
    });
    
    if (!teamMember) {
      return NextResponse.json({ error: '이 팀을 업데이트할 권한이 없습니다' }, { status: 403 });
    }
    
    const body = await request.json();
    const { name, description } = body;
    
    if (name && name.trim() === '') {
      return NextResponse.json({ error: '팀 이름은 비워둘 수 없습니다' }, { status: 400 });
    }
    
    // 팀 정보 업데이트
    const updatedTeam = await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        name: name ?? undefined,
        description: description ?? undefined,
      },
    });
    
    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: '팀 정보 업데이트 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// 팀 삭제
export async function DELETE(request: Request, { params }: RouteSegment) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  const { teamId } = params;
  
  try {
    // 사용자가 팀의 소유자인지 확인
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
        role: 'owner',
      },
    });
    
    if (!teamMember) {
      return NextResponse.json({ error: '이 팀을 삭제할 권한이 없습니다' }, { status: 403 });
    }
    
    // 팀 삭제 (관련된 팀 멤버 및 할 일도 자동으로 삭제됨)
    await prisma.team.delete({
      where: {
        id: teamId,
      },
    });
    
    return NextResponse.json({ message: '팀이 성공적으로 삭제되었습니다' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: '팀 삭제 중 오류가 발생했습니다' }, { status: 500 });
  }
}
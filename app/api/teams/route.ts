import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// 팀 목록 조회 또는 팀 생성
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  try {
    // 사용자가 속한 팀 조회
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
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
        _count: {
          select: {
            todos: true,
          },
        },
      },
    });
    
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: '팀 목록 조회 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// 새 팀 생성
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { name, description } = body;
    
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: '팀 이름은 필수 항목입니다' }, { status: 400 });
    }
    
    // 트랜잭션을 사용하여 팀 및 팀 멤버 생성
    const result = await prisma.$transaction(async (tx) => {
      // 팀 생성
      const team = await tx.team.create({
        data: {
          name,
          description,
        },
      });
      
      // 현재 사용자를 팀 소유자로 추가
      await tx.teamMember.create({
        data: {
          role: 'owner',
          teamId: team.id,
          userId: session.user.id,
        },
      });
      
      return team;
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: '팀 생성 중 오류가 발생했습니다' }, { status: 500 });
  }
}
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface RouteSegment {
  params: {
    teamId: string;
  };
}

// 팀에 사용자 초대
export async function POST(request: Request, { params }: RouteSegment) {
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
      return NextResponse.json({ error: '이 팀에 사용자를 초대할 권한이 없습니다' }, { status: 403 });
    }
    
    const body = await request.json();
    const { email } = body;
    
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json({ error: '유효한 이메일 주소가 필요합니다' }, { status: 400 });
    }
    
    // 초대할 사용자 찾기
    const invitedUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    
    if (!invitedUser) {
      return NextResponse.json({ error: '해당 이메일을 가진 사용자를 찾을 수 없습니다' }, { status: 404 });
    }
    
    // 이미 팀에 소속되어 있는지 확인
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        userId: invitedUser.id,
        teamId,
      },
    });
    
    if (existingMember) {
      return NextResponse.json({ error: '이 사용자는 이미 팀에 소속되어 있습니다' }, { status: 400 });
    }
    
    // 팀 멤버로 추가
    const newMember = await prisma.teamMember.create({
      data: {
        role: 'member',
        teamId,
        userId: invitedUser.id,
      },
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
    });
    
    return NextResponse.json({
      message: '사용자가 성공적으로 팀에 초대되었습니다',
      member: newMember,
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    return NextResponse.json({ error: '사용자 초대 중 오류가 발생했습니다' }, { status: 500 });
  }
}
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      teams: {
        include: {
          team: true,
        },
      },
    },
  });
  
  if (!user) {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
  }
  
  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증되지 않은 요청' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { name, image } = body;
    
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name ?? undefined,
        image: image ?? undefined,
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: '사용자 업데이트 중 오류가 발생했습니다' }, { status: 500 });
  }
}
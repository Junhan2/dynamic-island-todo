import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // 공개 경로 정의
  const publicPaths = ['/auth/signin'];
  const isPublicPath = publicPaths.includes(path);
  
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // 인증되지 않았고 공개 경로가 아닌 경우
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
  
  // 인증되었고 로그인 페이지에 접근하는 경우
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

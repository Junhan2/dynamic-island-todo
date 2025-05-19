import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // 공개 경로 정의 - 모든 /auth/ 경로와 API 경로를 포함하도록 수정
  const publicPaths = ['/auth', '/auth/signin', '/api/auth'];
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // console.log(`Path: ${path}, Public: ${isPublicPath}, Token: ${!!token}`);
  
  // 인증되지 않았고 공개 경로가 아닌 경우
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
  
  // 인증되었고 로그인 페이지에 접근하는 경우
  if (token && path === '/auth/signin') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

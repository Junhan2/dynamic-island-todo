import { NextResponse } from 'next/server';

/**
 * 이 API 엔드포인트는 NextAuth가 Google에 등록하는 리다이렉션 URL을 확인하기 위한 것입니다.
 */
export async function GET(request: Request) {
  // 현재 환경 정보 가져오기
  const nextauthUrl = process.env.NEXTAUTH_URL;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const vercelUrl = process.env.VERCEL_URL;
  const trustHost = process.env.AUTH_TRUST_HOST;
  
  // 예상 리다이렉션 URL 구성
  const expectedCallbackUrl = `${nextauthUrl}/api/auth/callback/google`;
  
  // Next.js가 사용할 수 있는 다른 환경 변수들
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;
  const alternativeCallbackUrl = `${baseUrl}/api/auth/callback/google`;
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    auth_config: {
      nextauth_url: nextauthUrl,
      vercel_url: vercelUrl,
      trust_host: trustHost,
      google_client_id_configured: !!googleClientId
    },
    expected_callback_urls: {
      from_nextauth_url: expectedCallbackUrl,
      from_request_headers: alternativeCallbackUrl,
    },
    request_info: {
      host,
      protocol,
      full_url: request.url,
    }
  });
}

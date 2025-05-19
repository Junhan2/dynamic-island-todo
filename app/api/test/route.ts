import { NextResponse } from 'next/server';

export async function GET() {
  // 환경 변수 확인
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  
  // 인증 정보 마스킹 함수 (보안을 위해 일부만 표시)
  const maskSecret = (secret: string | undefined) => {
    if (!secret) return 'undefined';
    if (secret.length <= 8) return '********';
    return secret.substring(0, 4) + '...' + secret.substring(secret.length - 4);
  };
  
  return NextResponse.json({
    message: '환경 변수 테스트',
    googleAuthentication: {
      clientIdSet: !!googleClientId,
      clientId: maskSecret(googleClientId),
      clientSecretSet: !!googleClientSecret,
      clientSecret: maskSecret(googleClientSecret),
    },
    nextAuth: {
      urlSet: !!nextAuthUrl,
      url: nextAuthUrl,
      secretSet: !!nextAuthSecret,
      secret: maskSecret(nextAuthSecret),
    },
    requestInfo: {
      host: headers().get('host'),
      protocol: headers().get('x-forwarded-proto') || 'http',
    },
  });
}

// 헤더 함수
function headers() {
  const headers = new Headers();
  return headers;
}
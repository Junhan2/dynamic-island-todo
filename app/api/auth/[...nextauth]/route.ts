import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';

/**
 * NextAuth 구성 옵션
 * 가능한 단순하게 유지하여 문제 해결
 */
export const authOptions = {
  // 디버그 모드 활성화
  debug: true,
  
  // 어댑터 설정
  adapter: PrismaAdapter(prisma),
  
  // 제공자 설정 - Google만 사용
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  
  // 기본 페이지 설정
  pages: {
    signIn: '/auth/signin',
  },
};

export default NextAuth(authOptions);

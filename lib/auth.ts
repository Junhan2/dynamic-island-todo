import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';

/**
 * NextAuth 구성 옵션
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      // 명확한 리디렉션 URL 지정
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  debug: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('signIn callback', { user, account, profile });
      if (!user?.email) {
        console.error('User email is missing');
        return false;
      }
      console.log('Sign-in successful, returning true');
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback', { url, baseUrl });
      // 절대 URL인 경우 유효한 리디렉션인지 확인
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (url.startsWith(baseUrl)) {
        return url;
      }
      // 기본적으로 루트 페이지로 리디렉션
      return baseUrl;
    },
    async session({ session, user }) {
      console.log('Session callback', { session, user });
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback', { token, user, account });
      if (user) {
        token.uid = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    // 추가 페이지 설정
    error: '/auth/error', // 오류 페이지 추가
  },
  secret: process.env.NEXTAUTH_SECRET,
  // 세션 설정
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  
  // JWT 설정
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  // 쿠키 설정
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
  },
};

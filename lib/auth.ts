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
      // 명시적으로 authorization 파라미터 설정
      authorization: {
        params: {
          prompt: "select_account"
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
      // 명시적으로 baseUrl로 리디렉션
      return `${baseUrl}/dashboard`;
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
    strategy: "database",
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

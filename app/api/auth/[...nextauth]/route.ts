import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/**
 * 가장 기본적인 NextAuth 설정 - 복잡한 설정 없이 순수하게 Google 로그인만 구현
 */
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  debug: true,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});

export { handler as GET, handler as POST };

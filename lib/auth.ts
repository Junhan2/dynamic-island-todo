import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import { supabase } from './supabase';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      },
    }),
  ],
  debug: true, // 디버그 모드 활성화
  logger: {
    error: (code, metadata) => {
      console.error(`Auth error: ${code}`, metadata);
    },
    warn: (code) => {
      console.warn(`Auth warning: ${code}`);
    },
    debug: (code, metadata) => {
      console.log(`Auth debug: ${code}`, metadata);
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('signIn callback', { user, account, profile });
      if (!user.email) {
        console.error('User email is missing');
        return false;
      }
      
      // Supabase에도 사용자 정보 동기화
      if (account?.provider === 'google') {
        try {
          // Supabase 사용자 확인
          const { data: existingUser } = await supabase
            .from('User')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();
          
          if (!existingUser) {
            // 새 사용자 추가
            const { error } = await supabase
              .from('User')
              .insert([{
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                emailVerified: new Date().toISOString(),
              }]);
            
            if (error) {
              console.error('Error syncing user to Supabase:', error);
              // 사용자 로그인은 허용 (NextAuth에서는 동작하므로)
            }
          }
        } catch (error) {
          console.error('Error during Supabase sync:', error);
          // 오류가 있더라도 로그인 처리는 진행
        }
      }
      
      console.log('Sign-in successful, redirecting...');
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback', { url, baseUrl });
      // 기본 URL이 포함된 URL로만 리디렉션 허용
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // 다른 도메인으로의 리디렉션은 기본 URL로 변경
      return baseUrl;
    },
    session: async ({ session, user }) => {
      console.log('Session callback', { session, user });
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

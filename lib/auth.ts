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
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
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
      
      return true;
    },
    session: async ({ session, user }) => {
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

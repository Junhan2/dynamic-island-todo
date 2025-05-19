import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 공식 NextAuth.js v5 API Route
 * authOptions는 lib/auth.ts에서 가져옴
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignIn() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-black/80 backdrop-blur-sm p-6 shadow-xl border border-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Dynamic Island Todo</h1>
          <p className="mt-2 text-gray-400">로그인하여 할 일을 관리하세요</p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-md text-sm">
            오류가 발생했습니다: {error}
          </div>
        )}
        
        <button
          className="w-full flex items-center justify-center bg-white hover:bg-gray-200 text-black p-3 rounded-md"
          onClick={() => signIn('google')}
        >
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Google로 로그인
        </button>
      </div>
    </div>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-black/80 backdrop-blur-sm p-6 shadow-xl border border-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">인증 오류</h1>
          <p className="mt-2 text-gray-400">로그인 과정에서 오류가 발생했습니다</p>
        </div>
        
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">오류 정보</h2>
          <p>{error || '알 수 없는 오류가 발생했습니다'}</p>
          
          {error === 'OAuthSignin' && (
            <p className="mt-2">OAuth 로그인 과정을 시작하는 중 오류가 발생했습니다.</p>
          )}
          
          {error === 'OAuthCallback' && (
            <p className="mt-2">OAuth 콜백 처리 중 오류가 발생했습니다.</p>
          )}
          
          {error === 'OAuthCreateAccount' && (
            <p className="mt-2">OAuth 계정 생성 중 오류가 발생했습니다.</p>
          )}
          
          {error === 'EmailCreateAccount' && (
            <p className="mt-2">이메일 계정 생성 중 오류가 발생했습니다.</p>
          )}
          
          {error === 'Callback' && (
            <p className="mt-2">콜백 처리 중 오류가 발생했습니다.</p>
          )}
          
          {error === 'OAuthAccountNotLinked' && (
            <p className="mt-2">이메일이 다른 계정에 이미 연결되어 있습니다.</p>
          )}
          
          {error === 'EmailSignin' && (
            <p className="mt-2">이메일 로그인 중 오류가 발생했습니다.</p>
          )}
          
          {error === 'CredentialsSignin' && (
            <p className="mt-2">자격 증명이 유효하지 않습니다.</p>
          )}
          
          {error === 'SessionRequired' && (
            <p className="mt-2">이 페이지에 접근하려면 로그인이 필요합니다.</p>
          )}
          
          {error === 'Default' && (
            <p className="mt-2">알 수 없는 오류가 발생했습니다.</p>
          )}
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/auth/signin"
            className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

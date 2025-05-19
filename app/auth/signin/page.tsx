'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // URL에서 에러 파라미터 가져오기
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/'; 
  
  // URL 에러 파라미터 처리
  useEffect(() => {
    if (errorType) {
      switch (errorType) {
        case 'OAuthSignin':
          setError('OAuth 로그인 과정을 시작하는 중 오류가 발생했습니다.');
          break;
        case 'OAuthCallback':
          setError('OAuth 콜백 처리 중 오류가 발생했습니다.');
          break;
        case 'OAuthCreateAccount':
          setError('OAuth 계정 생성 중 오류가 발생했습니다.');
          break;
        case 'EmailCreateAccount':
          setError('이메일 계정 생성 중 오류가 발생했습니다.');
          break;
        case 'Callback':
          setError('콜백 처리 중 오류가 발생했습니다.');
          break;
        case 'OAuthAccountNotLinked':
          setError('이메일이 다른 계정에 이미 연결되어 있습니다.');
          break;
        case 'EmailSignin':
          setError('이메일 로그인 중 오류가 발생했습니다.');
          break;
        case 'CredentialsSignin':
          setError('자격 증명이 유효하지 않습니다.');
          break;
        case 'SessionRequired':
          setError('이 페이지에 접근하려면 로그인이 필요합니다.');
          break;
        default:
          setError('로그인 중 오류가 발생했습니다.');
          break;
      }
    }
  }, [errorType]);
  
  const handleSignIn = async () => {
    try {
      setLoading(true);
      console.log('로그인 시도 중... 콜백 URL:', callbackUrl);
      
      const result = await signIn('google', { 
        callbackUrl: callbackUrl,
        redirect: false
      });
      
      console.log('로그인 결과:', result);
      
      if (result?.error) {
        console.error('로그인 실패:', result.error);
        setError('로그인 중 오류가 발생했습니다: ' + result.error);
        setLoading(false);
      } else if (result?.url) {
        // 로그인 성공 시 리디렉션
        console.log('로그인 성공, 리디렉션 URL:', result.url);
        window.location.href = result.url;
      }
    } catch (err) {
      console.error('로그인 예외 발생:', err);
      setError('로그인 중 예기치 않은 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-black/80 backdrop-blur-sm p-6 shadow-xl border border-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Dynamic Island Todo</h1>
          <p className="mt-2 text-gray-400">로그인하여 할 일을 관리하세요</p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <button
          className="w-full flex items-center justify-center bg-white hover:bg-gray-200 text-black p-3 rounded-md"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              로그인 중...
            </span>
          ) : (
            <>
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
            </>
          )}
        </button>
        
        <div className="text-xs text-gray-500 mt-4">
          <p>디버그 정보: 현재 리디렉션 URL: {callbackUrl}</p>
          {errorType && <p>오류 유형: {errorType}</p>}
        </div>
      </div>
    </div>
  );
}

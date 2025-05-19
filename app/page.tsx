import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // 인증된 사용자는 대시보드로 리디렉션
  if (session) {
    redirect('/dashboard');
  } else {
    // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    redirect('/auth/signin');
  }
  
  // 아래 코드는 리디렉션이 작동하지 않을 경우 표시됨
  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage:
          'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11-CZKf7nC98t9BHERi9Ux0qB6xFiinSA.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Dynamic Island Todo</h1>
        <p className="mb-4">리디렉션 중...</p>
      </div>
    </main>
  );
}

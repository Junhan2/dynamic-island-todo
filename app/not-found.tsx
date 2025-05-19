export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <h2 className="mt-4 text-2xl font-medium text-gray-300">페이지를 찾을 수 없습니다</h2>
        <p className="mt-2 text-gray-400">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md bg-white px-6 py-2 text-gray-900 hover:bg-gray-200 transition-colors"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}

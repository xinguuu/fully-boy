'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
          <br />
          URL을 다시 확인해주세요.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors duration-200"
          >
            홈으로 가기
          </Link>
          <Link
            href="/browse"
            className="px-6 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-colors duration-200"
          >
            게임 둘러보기
          </Link>
        </div>
      </div>
    </div>
  );
}

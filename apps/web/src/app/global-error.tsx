'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center px-4 max-w-2xl">
            <h1 className="text-9xl font-bold text-red-500">500</h1>
            <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
              심각한 오류가 발생했습니다
            </h2>
            <p className="text-gray-600 mb-2">
              예상치 못한 문제가 발생했습니다. 관리자에게 문의해주세요.
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm text-red-800 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors duration-200"
              >
                새로고침
              </button>
              <Link
                href="/"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                홈으로 가기
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

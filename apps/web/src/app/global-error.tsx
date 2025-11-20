'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
          <div style={{ textAlign: 'center', padding: '0 1rem', maxWidth: '42rem' }}>
            <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#ef4444' }}>500</h1>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginTop: '1rem', marginBottom: '0.5rem' }}>
              심각한 오류가 발생했습니다
            </h2>
            <p style={{ color: '#4b5563', marginBottom: '0.5rem' }}>
              예상치 못한 문제가 발생했습니다. 관리자에게 문의해주세요.
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', textAlign: 'left' }}>
                <p style={{ fontSize: '0.875rem', color: '#991b1b', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {error.message}
                </p>
                {error.digest && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem' }}>
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => reset()}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                다시 시도
              </button>
              <a
                href="/"
                style={{ padding: '0.75rem 1.5rem', border: '2px solid #d1d5db', color: '#374151', fontWeight: '600', borderRadius: '0.5rem', textDecoration: 'none', display: 'inline-block' }}
              >
                홈으로 가기
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

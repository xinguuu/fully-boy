'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGame = () => {
    console.log('게임 만들기 버튼 클릭');
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      router.push('/browse');
    } else {
      router.push('/login?redirect=/browse');
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 6) {
      alert('6자리 PIN을 입력해주세요');
      return;
    }

    setIsLoading(true);
    console.log('입장하기 클릭, PIN:', pin);

    setTimeout(() => {
      router.push(`/room/${pin}`);
    }, 500);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setPin(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-sky-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Header with "게임 만들기" button */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-end">
          <button
            type="button"
            onClick={handleCreateGame}
            className="bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
          >
            게임 만들기
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
        {/* Logo and tagline */}
        <div className="text-center mb-12">
          <h1 className="text-7xl font-extrabold text-gray-900 mb-4">
            🎮 Xingu
          </h1>
          <p className="text-3xl text-gray-600 font-medium">
            파티를 더 즐겁게!
          </p>
        </div>

        {/* PIN entry card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              게임 PIN 입력
            </h2>
            <p className="text-sm text-gray-500">
              진행자가 알려준 6자리 코드를 입력하세요
            </p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-6">
            {/* PIN input */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={handlePinChange}
              placeholder="000000"
              disabled={isLoading}
              className="w-full h-20 text-center text-4xl font-bold tracking-widest border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none focus:bg-white transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={pin.length !== 6 || isLoading}
              className="w-full bg-orange-500 text-white font-semibold text-lg px-6 py-4 rounded-xl hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  입장 중...
                </span>
              ) : (
                '입장하기'
              )}
            </button>
          </form>

          {/* QR code option */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              또는 QR 코드로 입장
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

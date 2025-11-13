'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) return;

    setIsLoading(true);
    router.push(`/room/${pin}`);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Top right button */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-10">
        <Link
          href="/login"
          className="
            inline-block
            bg-primary-500 hover:bg-primary-600 active:bg-primary-700
            text-white font-semibold
            px-6 py-3 rounded-lg
            transition-all duration-200 ease-out
            hover:scale-105 hover:shadow-lg
            active:scale-100
            cursor-pointer
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
          "
        >
          게임 만들기
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        {/* Brand & Tagline */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-gray-900 mb-4">
            🎮 Xingu
          </h1>
          <p className="text-2xl sm:text-3xl text-gray-600 font-medium">
            파티를 더 즐겁게!
          </p>
        </div>

        {/* PIN Entry Card */}
        <div className="
          w-full max-w-md
          bg-white dark:bg-dark-2
          border border-gray-200 dark:border-dark-3
          rounded-2xl
          p-8 sm:p-10
          shadow-2xl
          animate-slide-up
        ">
          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                게임 PIN 입력
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                진행자가 알려준 6자리 코드를 입력하세요
              </p>
            </div>

            {/* PIN Input */}
            <div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="
                  w-full h-20
                  text-center text-4xl font-bold tracking-widest
                  border-2 border-gray-300 rounded-xl
                  bg-gray-50
                  text-gray-900 placeholder:text-gray-300
                  transition-all duration-200 ease-out
                  hover:border-gray-400
                  focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
                  focus:outline-none focus:bg-white
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                "
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pin.length !== 6 || isLoading}
              className="
                w-full
                bg-primary-500 hover:bg-primary-600 active:bg-primary-700
                text-white font-semibold text-lg
                px-6 py-4 rounded-xl
                transition-all duration-200 ease-out
                hover:scale-105 hover:shadow-lg
                active:scale-100
                disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none
                cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
              "
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  입장 중...
                </span>
              ) : (
                '입장하기'
              )}
            </button>
          </form>

          {/* QR Code Option */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <QrCode className="w-4 h-4" />
              <span>또는 QR 코드로 입장</span>
            </div>
          </div>
        </div>

        {/* Bottom spacing for mobile */}
        <div className="h-20" />
      </div>
    </main>
  );
}

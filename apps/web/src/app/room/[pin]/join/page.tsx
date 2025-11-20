'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { STORAGE_KEYS } from '@/lib/constants/storage';
import { INPUT_LIMITS } from '@/lib/constants/validation';

export default function JoinRoomPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params.pin as string;

  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요');
      return;
    }

    if (nickname.length > INPUT_LIMITS.NICKNAME) {
      alert(`닉네임은 ${INPUT_LIMITS.NICKNAME}자 이하로 입력해주세요`);
      return;
    }

    setIsLoading(true);

    // Store nickname in localStorage
    localStorage.setItem(STORAGE_KEYS.ROOM_NICKNAME(pin), nickname.trim());

    // Redirect to waiting room (WebSocket join happens there)
    router.push(`/room/${pin}/waiting`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">게임 참여</h1>
          <div className="text-5xl font-black text-primary-500 mb-4">{pin}</div>
          <p className="text-gray-600">닉네임을 입력하고 게임에 참여하세요</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="ex) 김철수"
              maxLength={INPUT_LIMITS.NICKNAME}
              disabled={isLoading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoFocus
            />
            <p className="mt-2 text-sm text-gray-500">{nickname.length} / {INPUT_LIMITS.NICKNAME}</p>
          </div>

          <button
            type="submit"
            disabled={!nickname.trim() || isLoading}
            className="w-full bg-primary-500 text-white font-semibold text-lg px-6 py-4 rounded-xl hover:bg-primary-600 active:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
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
                참여 중...
              </span>
            ) : (
              '참여하기'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

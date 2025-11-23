'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { STORAGE_KEYS } from '@/lib/constants/storage';
import { roomsApi } from '@/lib/api/rooms';
import { logger } from '@/lib/logger';

/**
 * Session Recovery & Redirect Page
 * Checks for existing session and redirects appropriately
 */
export default function RoomEntryPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params.pin as string;
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRoomAndRedirect = async () => {
      try {
        // Check room status first
        const room = await roomsApi.getRoomByPIN(pin);

        // Check for participant session
        const nickname = localStorage.getItem(STORAGE_KEYS.ROOM_NICKNAME(pin));
        const participantId = localStorage.getItem(STORAGE_KEYS.ROOM_PARTICIPANT_ID(pin));

        if (nickname && participantId) {
          // Participant with existing session → go to waiting/game (allow reconnection)
          logger.debug(`[Session Recovery] Found participant session: ${nickname} (${participantId})`);
          router.push(`/room/${pin}/waiting`);
          return;
        }

        // Check if user is organizer (logged in)
        if (user) {
          // Organizer → go to waiting room (allow always)
          logger.debug(`[Session Recovery] User is logged in, checking organizer status`);
          router.push(`/room/${pin}/waiting`);
          return;
        }

        // New participant (no session) → check if room is accepting joins
        if (room.status !== 'WAITING') {
          setError('이미 시작된 게임입니다. 새로운 참가자는 입장할 수 없습니다.');
          return;
        }

        // No session, room is waiting → redirect to join page for nickname input
        logger.debug(`[Session Recovery] No session found, redirecting to join page`);
        router.push(`/room/${pin}/join`);
      } catch (err) {
        logger.error('[Session Recovery] Error checking room:', err);
        setError('방을 찾을 수 없습니다. PIN 번호를 확인해주세요.');
      }
    };

    checkRoomAndRedirect();
  }, [pin, user, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">입장 불가</h1>
            <div className="text-5xl font-black text-primary-500 mb-4">{pin}</div>
            <p className="text-gray-700 text-lg">{error}</p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-primary-500 text-white font-semibold text-lg px-6 py-4 rounded-xl hover:bg-primary-600 active:bg-primary-700 transition-all shadow-md hover:shadow-lg"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
        <p className="text-xl font-semibold">세션 확인 중...</p>
      </div>
    </div>
  );
}

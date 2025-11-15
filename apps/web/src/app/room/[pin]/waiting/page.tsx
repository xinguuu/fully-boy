'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRoom, useParticipants } from '@/lib/hooks';
import { useGameSocket } from '@/lib/hooks/use-game-socket';
import { useEffect } from 'react';

export default function WaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params.pin as string;

  const { data: room, isLoading: roomLoading } = useRoom(pin);
  const { data: participants = [] } = useParticipants(pin);

  // WebSocket connection for organizer
  const { isConnected, startGame, roomState } = useGameSocket({
    pin,
    autoJoin: false, // Organizer doesn't join as participant
  });

  // Redirect to game page when game starts
  useEffect(() => {
    if (roomState?.status === 'playing') {
      router.push(`/room/${pin}/game`);
    }
  }, [roomState?.status, pin, router]);

  if (roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
        <div className="text-white text-2xl">로딩 중...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">방을 찾을 수 없습니다</h1>
          <p className="text-xl">올바른 PIN을 확인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">게임 PIN</h1>
          <div className="text-9xl font-black text-primary-500 tracking-wider mb-8">
            {pin}
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              참가자 ({participants.length}명)
            </h2>

            {participants.length === 0 ? (
              <p className="text-gray-500 text-lg">참가자를 기다리는 중...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-gray-100 rounded-xl p-4 text-lg font-medium text-gray-800"
                  >
                    {participant.nickname}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => startGame()}
              className="px-8 py-4 bg-primary-500 text-white text-xl font-bold rounded-xl hover:bg-primary-600 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={participants.length === 0 || !isConnected}
            >
              {isConnected ? '게임 시작' : '연결 중...'}
            </button>
            <button
              onClick={() => router.push('/browse')}
              className="px-8 py-4 bg-gray-200 text-gray-700 text-xl font-semibold rounded-xl hover:bg-gray-300 transition-colors cursor-pointer"
            >
              뒤로 가기
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-white text-lg">
          <p>참가자는 xingu.com에서 PIN을 입력하여 참여할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}

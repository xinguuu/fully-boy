'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGameSocket, useAuth } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function WaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params.pin as string;
  const { user } = useAuth();

  // Get participant session from localStorage
  const [nickname, setNickname] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);

  // Copy PIN to clipboard state (must be declared before any returns)
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const storedNickname = localStorage.getItem(`room_${pin}_nickname`);
    const storedParticipantId = localStorage.getItem(`room_${pin}_participantId`);

    setNickname(storedNickname);
    setParticipantId(storedParticipantId);
  }, [pin]);

  // Determine if organizer or participant
  const isOrganizer = !!user && !nickname;

  // WebSocket connection - everyone joins the room now
  const {
    isConnected,
    startGame,
    roomState,
    players,
    error,
    participantId: wsParticipantId,
  } = useGameSocket({
    pin,
    nickname: nickname || undefined,
    participantId: participantId || undefined,
    autoJoin: true, // Everyone auto-joins now (organizer without nickname, participants with nickname)
  });

  // Redirect to game page when game starts
  useEffect(() => {
    if (roomState?.status === 'playing') {
      setIsStarting(true);
      router.push(`/room/${pin}/game`);
    }
  }, [roomState?.status, pin, router]);

  // Update participantId state when received from WebSocket
  useEffect(() => {
    if (wsParticipantId && wsParticipantId !== participantId) {
      setParticipantId(wsParticipantId);
      // localStorage is already saved in useGameSocket
    }
  }, [wsParticipantId, participantId]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
        <div className="text-white text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-2xl">연결 중...</p>
        </div>
      </div>
    );
  }

  // Ignore "INVALID_STATE" error if game is already starting (prevents duplicate start requests)
  if (error && error.code !== 'INVALID_STATE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
        <div className="text-white text-center p-8">
          <h1 className="text-4xl font-bold mb-4">오류 발생</h1>
          <p className="text-xl mb-8">{error.message}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-primary-500 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!roomState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
        <div className="text-white text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-2xl">방 정보 로딩 중...</p>
        </div>
      </div>
    );
  }

  // Filter out organizer from participant list (organizer doesn't have nickname)
  const participants = players.filter((p) => !p.isOrganizer);

  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy PIN:', err);
    }
  };

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${pin}/join` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">게임 PIN</h1>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="text-9xl font-black text-primary-500 tracking-wider">{pin}</div>
            <button
              onClick={handleCopyPin}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-all hover:scale-105 cursor-pointer"
              title="PIN 복사"
            >
              {copied ? '✓ 복사됨!' : '📋 복사'}
            </button>
          </div>

          {/* QR Code section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <p className="text-gray-600 mb-4">또는 QR 코드 스캔</p>
            <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
              <QRCodeSVG value={joinUrl} size={160} level="M" />
            </div>
          </div>

          {isOrganizer && (
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-blue-700 font-semibold">
                🎮 주최자로 입장했습니다
              </p>
            </div>
          )}

          {!isOrganizer && nickname && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-green-700 font-semibold">
                👋 참가자: {nickname}
              </p>
            </div>
          )}

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
            {isOrganizer && (
              <button
                onClick={() => {
                  if (!isStarting) {
                    setIsStarting(true);
                    startGame();
                  }
                }}
                className="px-8 py-4 bg-primary-500 text-white text-xl font-bold rounded-xl hover:bg-primary-600 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={participants.length === 0 || isStarting}
              >
                {isStarting ? '게임 시작 중...' : '게임 시작'}
              </button>
            )}
            <button
              onClick={() => router.push(isOrganizer ? '/browse' : '/')}
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

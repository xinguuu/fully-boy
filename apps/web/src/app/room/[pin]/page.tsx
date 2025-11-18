'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';

/**
 * Session Recovery & Redirect Page
 * Checks for existing session and redirects appropriately
 */
export default function RoomEntryPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params.pin as string;
  const { user } = useAuth();

  useEffect(() => {
    // Check for participant session
    const nickname = localStorage.getItem(`room_${pin}_nickname`);
    const participantId = localStorage.getItem(`room_${pin}_participantId`);

    if (nickname && participantId) {
      // Participant with existing session → go to waiting/game
      // (waiting room will handle actual WebSocket session restoration)
      console.log(`[Session Recovery] Found participant session: ${nickname} (${participantId})`);
      router.push(`/room/${pin}/waiting`);
      return;
    }

    // Check if user is organizer (logged in)
    if (user) {
      // Organizer → go to waiting room
      // (will verify organizer role via JWT in waiting room)
      console.log(`[Session Recovery] User is logged in, checking organizer status`);
      router.push(`/room/${pin}/waiting`);
      return;
    }

    // No session → redirect to join page for nickname input
    console.log(`[Session Recovery] No session found, redirecting to join page`);
    router.push(`/room/${pin}/join`);
  }, [pin, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
        <p className="text-xl font-semibold">세션 확인 중...</p>
      </div>
    </div>
  );
}

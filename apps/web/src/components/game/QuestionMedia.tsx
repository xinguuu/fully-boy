'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface QuestionMediaProps {
  imageUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  autoPlay?: boolean;
}

export function QuestionMedia({
  imageUrl,
  videoUrl,
  audioUrl,
  autoPlay = true,
}: QuestionMediaProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Audio autoplay failed:', error);
      });
    }
  }, [audioUrl, autoPlay]);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Video autoplay failed:', error);
      });
    }
  }, [videoUrl, autoPlay]);

  if (!imageUrl && !videoUrl && !audioUrl) {
    return null;
  }

  return (
    <div className="mb-6">
      {imageUrl && (
        <div className="flex justify-center mb-4">
          <div className="relative w-full max-w-2xl h-96">
            <Image
              src={imageUrl}
              alt="Question visual"
              fill
              className="rounded-lg shadow-md object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
      )}

      {videoUrl && (
        <div className="flex justify-center mb-4">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="max-w-full max-h-96 rounded-lg shadow-md"
            playsInline
          >
            <track kind="captions" />
            Your browser does not support video playback.
          </video>
        </div>
      )}

      {audioUrl && (
        <div className="flex justify-center mb-4">
          <div className="w-full max-w-md bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-xl shadow-md border border-primary-200">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">음악 재생</p>
                <p className="text-xs text-gray-500">노래를 듣고 정답을 맞춰보세요</p>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full"
              controlsList="nodownload"
            >
              <track kind="captions" />
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>
      )}
    </div>
  );
}

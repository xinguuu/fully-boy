'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { logger } from '@/lib/logger';
import type { MediaSettings, CropArea, MaskType } from '@xingu/shared';

interface QuestionMediaProps {
  imageUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  mediaSettings?: MediaSettings | null;
  autoPlay?: boolean;
}

/**
 * Get image source - prioritize base64 data over URL
 */
function getImageSrc(
  imageUrl: string | null | undefined,
  mediaSettings: MediaSettings | null | undefined
): string | null {
  if (mediaSettings?.image?.data) {
    return mediaSettings.image.data;
  }
  return imageUrl || null;
}

/**
 * Get audio source - prioritize base64 data over URL
 */
function getAudioSrc(
  audioUrl: string | null | undefined,
  mediaSettings: MediaSettings | null | undefined
): string | null {
  if (mediaSettings?.audio?.data) {
    return mediaSettings.audio.data;
  }
  return audioUrl || null;
}

/**
 * Get video source - prioritize base64 data over URL
 */
function getVideoSrc(
  videoUrl: string | null | undefined,
  mediaSettings: MediaSettings | null | undefined
): string | null {
  if (mediaSettings?.video?.data) {
    return mediaSettings.video.data;
  }
  return videoUrl || null;
}

/**
 * Image with crop and mask effects
 */
function MaskedImage({
  src,
  cropArea,
  maskType = 'none',
  maskIntensity = 50,
}: {
  src: string;
  cropArea?: CropArea;
  maskType?: MaskType;
  maskIntensity?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // No crop area = show full image
  if (!cropArea || maskType === 'none') {
    return (
      <div className="relative w-full max-w-2xl h-96">
        <Image
          src={src}
          alt="Question visual"
          fill
          className="rounded-lg shadow-md object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={src.startsWith('data:')}
        />
      </div>
    );
  }

  // Calculate blur intensity (0-100 → 0-20px)
  const blurAmount = (maskIntensity / 100) * 20;

  // Spotlight: dark overlay with bright crop area
  if (maskType === 'spotlight') {
    return (
      <div ref={containerRef} className="relative w-full max-w-2xl h-96 overflow-hidden rounded-lg shadow-md">
        {/* Background image (dimmed) */}
        <Image
          src={src}
          alt="Question visual background"
          fill
          className="object-contain brightness-[0.2]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={src.startsWith('data:')}
        />
        {/* Spotlight area (bright) */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${cropArea.x}%`,
            top: `${cropArea.y}%`,
            width: `${cropArea.width}%`,
            height: `${cropArea.height}%`,
            borderRadius: '8px',
            boxShadow: '0 0 40px 10px rgba(255, 255, 255, 0.3)',
          }}
        >
          <div
            className="relative"
            style={{
              width: `${100 / (cropArea.width / 100)}%`,
              height: `${100 / (cropArea.height / 100)}%`,
              marginLeft: `-${(cropArea.x / cropArea.width) * 100}%`,
              marginTop: `-${(cropArea.y / cropArea.height) * 100}%`,
            }}
          >
            <Image
              src={src}
              alt="Question visual spotlight"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={src.startsWith('data:')}
            />
          </div>
        </div>
      </div>
    );
  }

  // Blur: blur everything except crop area
  if (maskType === 'blur') {
    return (
      <div ref={containerRef} className="relative w-full max-w-2xl h-96 overflow-hidden rounded-lg shadow-md">
        {/* Background image (blurred) */}
        <Image
          src={src}
          alt="Question visual background"
          fill
          className="object-contain"
          style={{ filter: `blur(${blurAmount}px)` }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={src.startsWith('data:')}
        />
        {/* Clear area (no blur) */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${cropArea.x}%`,
            top: `${cropArea.y}%`,
            width: `${cropArea.width}%`,
            height: `${cropArea.height}%`,
            borderRadius: '4px',
            border: '2px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <div
            className="relative"
            style={{
              width: `${100 / (cropArea.width / 100)}%`,
              height: `${100 / (cropArea.height / 100)}%`,
              marginLeft: `-${(cropArea.x / cropArea.width) * 100}%`,
              marginTop: `-${(cropArea.y / cropArea.height) * 100}%`,
            }}
          >
            <Image
              src={src}
              alt="Question visual clear"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={src.startsWith('data:')}
            />
          </div>
        </div>
      </div>
    );
  }

  // Mosaic: pixelate effect using CSS
  if (maskType === 'mosaic') {
    // Mosaic intensity: higher = more pixelated (scale down more)
    const pixelSize = Math.max(2, Math.floor(maskIntensity / 5));

    return (
      <div ref={containerRef} className="relative w-full max-w-2xl h-96 overflow-hidden rounded-lg shadow-md">
        {/* Background image (pixelated via image-rendering) */}
        <div className="absolute inset-0">
          <Image
            src={src}
            alt="Question visual background"
            fill
            className="object-contain"
            style={{
              imageRendering: 'pixelated',
              filter: `blur(${pixelSize}px)`,
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={src.startsWith('data:')}
          />
        </div>
        {/* Clear area (no mosaic) */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${cropArea.x}%`,
            top: `${cropArea.y}%`,
            width: `${cropArea.width}%`,
            height: `${cropArea.height}%`,
            borderRadius: '4px',
            border: '2px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <div
            className="relative"
            style={{
              width: `${100 / (cropArea.width / 100)}%`,
              height: `${100 / (cropArea.height / 100)}%`,
              marginLeft: `-${(cropArea.x / cropArea.width) * 100}%`,
              marginTop: `-${(cropArea.y / cropArea.height) * 100}%`,
            }}
          >
            <Image
              src={src}
              alt="Question visual clear"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={src.startsWith('data:')}
            />
          </div>
        </div>
      </div>
    );
  }

  // Default: show full image
  return (
    <div className="relative w-full max-w-2xl h-96">
      <Image
        src={src}
        alt="Question visual"
        fill
        className="rounded-lg shadow-md object-contain"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        unoptimized={src.startsWith('data:')}
      />
    </div>
  );
}

/**
 * Audio player with time range support
 */
function RangeAudioPlayer({
  src,
  startTime,
  endTime,
  autoPlay,
}: {
  src: string;
  startTime?: number;
  endTime?: number;
  autoPlay: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime || 0);
  const [duration, setDuration] = useState(0);

  const effectiveStart = startTime || 0;
  const effectiveEnd = endTime || duration;

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;

    const current = audioRef.current.currentTime;
    setCurrentTime(current);

    // Stop at end time
    if (endTime && current >= endTime) {
      audioRef.current.pause();
      audioRef.current.currentTime = effectiveStart;
      setIsPlaying(false);
    }
  }, [endTime, effectiveStart]);

  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);

    // Set initial position
    if (startTime) {
      audioRef.current.currentTime = startTime;
    }
  }, [startTime]);

  const handlePlay = useCallback(() => {
    if (!audioRef.current) return;

    // Ensure we start from the correct position
    if (audioRef.current.currentTime < effectiveStart) {
      audioRef.current.currentTime = effectiveStart;
    }

    audioRef.current.play().catch((error) => {
      logger.error('Audio play failed:', error);
    });
    setIsPlaying(true);
  }, [effectiveStart]);

  const handlePause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const handleRestart = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = effectiveStart;
    handlePlay();
  }, [effectiveStart, handlePlay]);

  useEffect(() => {
    if (autoPlay && audioRef.current && duration > 0) {
      handlePlay();
    }
  }, [autoPlay, duration, handlePlay]);

  // Format time as MM:SS
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasTimeRange = startTime !== undefined || endTime !== undefined;
  const rangeText = hasTimeRange
    ? `${formatTime(effectiveStart)} - ${formatTime(effectiveEnd || duration)}`
    : '';

  return (
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
          <p className="text-xs text-gray-500">
            {hasTimeRange ? `구간: ${rangeText}` : '노래를 듣고 정답을 맞춰보세요'}
          </p>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      >
        <track kind="captions" />
      </audio>

      {/* Custom controls */}
      <div className="space-y-3">
        {/* Progress bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-primary-500 transition-all duration-100"
            style={{
              left: `${(effectiveStart / (duration || 1)) * 100}%`,
              width: `${((Math.min(currentTime, effectiveEnd || duration) - effectiveStart) / (duration || 1)) * 100}%`,
            }}
          />
          {/* Range markers */}
          {hasTimeRange && (
            <>
              <div
                className="absolute top-0 h-full w-0.5 bg-primary-700"
                style={{ left: `${(effectiveStart / (duration || 1)) * 100}%` }}
              />
              {endTime && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-primary-700"
                  style={{ left: `${(endTime / (duration || 1)) * 100}%` }}
                />
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">
            {formatTime(currentTime)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="처음부터"
            >
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-500 hover:bg-primary-600 transition-colors cursor-pointer"
              aria-label={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          <span className="text-xs text-gray-500 font-mono">
            {formatTime(effectiveEnd || duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Video player with time range support
 */
function RangeVideoPlayer({
  src,
  startTime,
  endTime,
  autoPlay,
}: {
  src: string;
  startTime?: number;
  endTime?: number;
  autoPlay: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !endTime) return;

    if (videoRef.current.currentTime >= endTime) {
      videoRef.current.pause();
      videoRef.current.currentTime = startTime || 0;
    }
  }, [endTime, startTime]);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;

    if (startTime) {
      videoRef.current.currentTime = startTime;
    }

    if (autoPlay) {
      videoRef.current.play().catch((error) => {
        logger.error('Video autoplay failed:', error);
      });
    }
  }, [startTime, autoPlay]);

  const hasTimeRange = startTime !== undefined || endTime !== undefined;

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        controls
        className="max-w-full max-h-96 rounded-lg shadow-md"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      >
        <track kind="captions" />
        Your browser does not support video playback.
      </video>
      {hasTimeRange && (
        <div className="absolute bottom-14 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
          구간 재생 중
        </div>
      )}
    </div>
  );
}

export function QuestionMedia({
  imageUrl,
  videoUrl,
  audioUrl,
  mediaSettings,
  autoPlay = true,
}: QuestionMediaProps) {
  const imageSrc = getImageSrc(imageUrl, mediaSettings);
  const audioSrc = getAudioSrc(audioUrl, mediaSettings);
  const videoSrc = getVideoSrc(videoUrl, mediaSettings);

  if (!imageSrc && !videoSrc && !audioSrc) {
    return null;
  }

  return (
    <div className="mb-6">
      {imageSrc && (
        <div className="flex justify-center mb-4">
          <MaskedImage
            src={imageSrc}
            cropArea={mediaSettings?.image?.cropArea}
            maskType={mediaSettings?.image?.maskType}
            maskIntensity={mediaSettings?.image?.maskIntensity}
          />
        </div>
      )}

      {videoSrc && (
        <div className="flex justify-center mb-4">
          <RangeVideoPlayer
            src={videoSrc}
            startTime={mediaSettings?.video?.startTime}
            endTime={mediaSettings?.video?.endTime}
            autoPlay={autoPlay}
          />
        </div>
      )}

      {audioSrc && (
        <div className="flex justify-center mb-4">
          <RangeAudioPlayer
            src={audioSrc}
            startTime={mediaSettings?.audio?.startTime}
            endTime={mediaSettings?.audio?.endTime}
            autoPlay={autoPlay}
          />
        </div>
      )}
    </div>
  );
}

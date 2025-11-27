'use client';

import type { MediaSettings, CropArea, MaskType } from '@xingu/shared';

interface PreviewMediaProps {
  mediaSettings?: MediaSettings | null;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

/**
 * Compact media preview for edit screen thumbnails
 * Shows media with mask effects applied (simplified version for small preview areas)
 */
export function PreviewMedia({
  mediaSettings,
  imageUrl,
  videoUrl,
  audioUrl,
}: PreviewMediaProps) {
  // Get media data from mediaSettings (Base64) or fallback to URL
  const imageData = mediaSettings?.image?.data || imageUrl;
  const videoData = mediaSettings?.video?.data || videoUrl;
  const audioData = mediaSettings?.audio?.data || audioUrl;

  if (!imageData && !videoData && !audioData) {
    return null;
  }

  // Image with mask effects
  if (imageData) {
    const cropArea = mediaSettings?.image?.cropArea;
    const maskType = mediaSettings?.image?.maskType || 'none';
    const maskIntensity = mediaSettings?.image?.maskIntensity ?? 50;

    return (
      <div className="flex justify-center mb-2">
        <MaskedImageThumbnail
          src={imageData}
          cropArea={cropArea}
          maskType={maskType}
          maskIntensity={maskIntensity}
        />
      </div>
    );
  }

  // Video player (mini version like actual game)
  if (videoData) {
    return (
      <div className="flex justify-center mb-2">
        <MiniVideoPlayer
          src={videoData}
          startTime={mediaSettings?.video?.startTime}
          endTime={mediaSettings?.video?.endTime}
        />
      </div>
    );
  }

  // Audio player (mini version like actual game)
  if (audioData) {
    return (
      <div className="flex justify-center mb-2">
        <MiniAudioPlayer
          src={audioData}
          startTime={mediaSettings?.audio?.startTime}
          endTime={mediaSettings?.audio?.endTime}
        />
      </div>
    );
  }

  return null;
}

/**
 * Thumbnail image with mask effects (simplified for small preview)
 */
function MaskedImageThumbnail({
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
  // No mask = show plain image
  if (!cropArea || maskType === 'none') {
    return (
      <img
        src={src}
        alt=""
        className="max-h-12 rounded object-contain"
      />
    );
  }

  // Calculate blur intensity (0-100 → 0-10px for thumbnail)
  const blurAmount = (maskIntensity / 100) * 10;

  // Spotlight effect
  if (maskType === 'spotlight') {
    return (
      <div className="relative max-h-12 h-12 w-auto overflow-hidden rounded">
        {/* Background (dimmed) */}
        <img
          src={src}
          alt=""
          className="h-12 object-contain brightness-[0.2]"
        />
        {/* Spotlight area (bright) */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${cropArea.x}%`,
            top: `${cropArea.y}%`,
            width: `${cropArea.width}%`,
            height: `${cropArea.height}%`,
            borderRadius: '2px',
            boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.3)',
          }}
        >
          <div
            className="relative h-full"
            style={{
              width: `${100 / (cropArea.width / 100)}%`,
              height: `${100 / (cropArea.height / 100)}%`,
              marginLeft: `-${(cropArea.x / cropArea.width) * 100}%`,
              marginTop: `-${(cropArea.y / cropArea.height) * 100}%`,
            }}
          >
            <img
              src={src}
              alt=""
              className="h-12 object-contain"
            />
          </div>
        </div>
        {/* Mask indicator */}
        <div className="absolute top-0.5 right-0.5 bg-black/60 text-white text-[6px] px-1 rounded">
          스포트라이트
        </div>
      </div>
    );
  }

  // Blur effect
  if (maskType === 'blur') {
    return (
      <div className="relative max-h-12 h-12 w-auto overflow-hidden rounded">
        {/* Background (blurred) */}
        <img
          src={src}
          alt=""
          className="h-12 object-contain"
          style={{ filter: `blur(${blurAmount}px)` }}
        />
        {/* Clear area */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${cropArea.x}%`,
            top: `${cropArea.y}%`,
            width: `${cropArea.width}%`,
            height: `${cropArea.height}%`,
            borderRadius: '2px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <div
            className="relative h-full"
            style={{
              width: `${100 / (cropArea.width / 100)}%`,
              height: `${100 / (cropArea.height / 100)}%`,
              marginLeft: `-${(cropArea.x / cropArea.width) * 100}%`,
              marginTop: `-${(cropArea.y / cropArea.height) * 100}%`,
            }}
          >
            <img
              src={src}
              alt=""
              className="h-12 object-contain"
            />
          </div>
        </div>
        {/* Mask indicator */}
        <div className="absolute top-0.5 right-0.5 bg-black/60 text-white text-[6px] px-1 rounded">
          블러
        </div>
      </div>
    );
  }

  // Mosaic effect
  if (maskType === 'mosaic') {
    const pixelSize = Math.max(1, Math.floor(maskIntensity / 10));

    return (
      <div className="relative max-h-12 h-12 w-auto overflow-hidden rounded">
        {/* Background (pixelated) */}
        <img
          src={src}
          alt=""
          className="h-12 object-contain"
          style={{
            imageRendering: 'pixelated',
            filter: `blur(${pixelSize}px)`,
          }}
        />
        {/* Clear area */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${cropArea.x}%`,
            top: `${cropArea.y}%`,
            width: `${cropArea.width}%`,
            height: `${cropArea.height}%`,
            borderRadius: '2px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <div
            className="relative h-full"
            style={{
              width: `${100 / (cropArea.width / 100)}%`,
              height: `${100 / (cropArea.height / 100)}%`,
              marginLeft: `-${(cropArea.x / cropArea.width) * 100}%`,
              marginTop: `-${(cropArea.y / cropArea.height) * 100}%`,
            }}
          >
            <img
              src={src}
              alt=""
              className="h-12 object-contain"
            />
          </div>
        </div>
        {/* Mask indicator */}
        <div className="absolute top-0.5 right-0.5 bg-black/60 text-white text-[6px] px-1 rounded">
          모자이크
        </div>
      </div>
    );
  }

  // Default: plain image
  return (
    <img
      src={src}
      alt=""
      className="max-h-12 rounded object-contain"
    />
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Mini video player for preview (styled like actual game)
 */
function MiniVideoPlayer({
  src,
  startTime,
  endTime,
}: {
  src: string;
  startTime?: number;
  endTime?: number;
}) {
  const hasTimeRange = startTime !== undefined || endTime !== undefined;

  return (
    <div className="relative w-full max-w-[140px]">
      <video
        src={src}
        className="w-full h-16 rounded-lg shadow-md object-cover bg-black"
        muted
        playsInline
        controls
      />
      {hasTimeRange && (
        <div className="absolute bottom-6 left-1 px-1 py-0.5 bg-black/70 text-white text-[8px] rounded">
          {formatTime(startTime || 0)} - {formatTime(endTime || 0)}
        </div>
      )}
    </div>
  );
}

/**
 * Mini audio player for preview (styled like actual game)
 */
function MiniAudioPlayer({
  src,
  startTime,
  endTime,
}: {
  src: string;
  startTime?: number;
  endTime?: number;
}) {
  const hasTimeRange = startTime !== undefined || endTime !== undefined;
  const rangeText = hasTimeRange
    ? `${formatTime(startTime || 0)} - ${formatTime(endTime || 0)}`
    : '';

  return (
    <div className="w-full max-w-[160px] bg-gradient-to-r from-primary-50 to-secondary-50 p-2 rounded-lg shadow-md border border-primary-200">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-medium text-gray-700 truncate">음악 재생</p>
          {hasTimeRange && (
            <p className="text-[8px] text-gray-500 truncate">구간: {rangeText}</p>
          )}
        </div>
      </div>
      <audio src={src} controls className="w-full h-6" style={{ minHeight: '24px' }}>
        <track kind="captions" />
      </audio>
    </div>
  );
}

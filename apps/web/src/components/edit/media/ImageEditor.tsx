'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { MediaSettings, CropArea } from '@xingu/shared';

interface ImageEditorProps {
  data?: MediaSettings['image'];
  imageData?: string;
  onChange: (data: MediaSettings['image']) => void;
}

export function ImageEditor({ data, imageData, onChange }: ImageEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 블러 활성화 여부 (없음 / 블러)
  const blurEnabled = data?.maskType === 'blur';
  const cropArea = data?.cropArea || { x: 0, y: 0, width: 100, height: 100 };
  const blurIntensity = data?.maskIntensity ?? 50;

  // 블러 토글
  const toggleBlur = () => {
    const newMaskType = blurEnabled ? 'none' : 'blur';
    const defaultCropArea = { x: 20, y: 20, width: 60, height: 60 };

    onChange({
      data: data?.data,
      cropArea: newMaskType === 'blur' ? (data?.cropArea || defaultCropArea) : undefined,
      maskType: newMaskType,
      maskIntensity: blurIntensity,
    });
  };

  // 마우스 좌표를 컨테이너 기준 퍼센트로 변환
  const getPosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  }, []);

  // 드래그 시작
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!blurEnabled) return;
    e.preventDefault();

    const pos = getPosition(e.clientX, e.clientY);
    setDragStart(pos);
    setIsDragging(true);
  }, [blurEnabled, getPosition]);

  // 드래그 중
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const current = getPosition(e.clientX, e.clientY);

      // 드래그 방향에 관계없이 영역 계산
      const x = Math.min(dragStart.x, current.x);
      const y = Math.min(dragStart.y, current.y);
      const width = Math.abs(current.x - dragStart.x);
      const height = Math.abs(current.y - dragStart.y);

      // 최소 크기 10%
      const newCropArea: CropArea = {
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: Math.max(10, Math.min(100 - x, width)),
        height: Math.max(10, Math.min(100 - y, height)),
      };

      onChange({
        data: data?.data,
        cropArea: newCropArea,
        maskType: 'blur',
        maskIntensity: blurIntensity,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, data?.data, blurIntensity, getPosition, onChange]);

  if (!imageData) {
    return (
      <div className="text-center py-8 text-gray-500">
        이미지를 먼저 업로드하세요
      </div>
    );
  }

  // 블러 강도 (0-100 → 0-40px) - 2배 강화
  const blurPx = (blurIntensity / 100) * 40;

  return (
    <div className="space-y-4">
      {/* 블러 토글 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="font-medium text-gray-900">블러 효과</div>
          <div className="text-xs text-gray-500">선택 영역 외 흐리게 처리</div>
        </div>
        <button
          type="button"
          onClick={toggleBlur}
          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
            blurEnabled ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              blurEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* 이미지 편집 영역 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {blurEnabled ? '선명하게 보여줄 영역 선택 (드래그)' : '미리보기'}
        </label>

        <div
          ref={containerRef}
          className={`relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden select-none ${
            blurEnabled ? 'cursor-crosshair' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* 배경 이미지 (블러 적용) */}
          <Image
            src={imageData}
            alt="Preview"
            fill
            className="object-contain pointer-events-none"
            style={{
              filter: blurEnabled ? `blur(${blurPx}px)` : 'none',
            }}
            unoptimized
            draggable={false}
          />

          {/* 선명한 영역 (블러 활성화 시만) */}
          {blurEnabled && (
            <div
              className="absolute overflow-hidden border-2 border-white shadow-lg"
              style={{
                left: `${cropArea.x}%`,
                top: `${cropArea.y}%`,
                width: `${cropArea.width}%`,
                height: `${cropArea.height}%`,
              }}
            >
              {/* 선명한 이미지 표시 */}
              <div
                className="absolute"
                style={{
                  width: `${10000 / cropArea.width}%`,
                  height: `${10000 / cropArea.height}%`,
                  left: `-${(cropArea.x * 100) / cropArea.width}%`,
                  top: `-${(cropArea.y * 100) / cropArea.height}%`,
                }}
              >
                <Image
                  src={imageData}
                  alt="Clear area"
                  fill
                  className="object-contain pointer-events-none"
                  unoptimized
                  draggable={false}
                />
              </div>

              {/* 크기 표시 */}
              <div className="absolute -top-6 left-0 text-xs bg-white text-gray-700 px-2 py-0.5 rounded shadow whitespace-nowrap">
                {Math.round(cropArea.width)}% × {Math.round(cropArea.height)}%
              </div>
            </div>
          )}
        </div>

        {blurEnabled && (
          <p className="text-xs text-gray-500 mt-1">
            드래그하여 선명하게 보여줄 영역을 선택하세요
          </p>
        )}
      </div>

      {/* 블러 강도 */}
      {blurEnabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            블러 강도: {blurIntensity}%
          </label>
          <input
            type="range"
            min={10}
            max={100}
            value={blurIntensity}
            onChange={(e) => onChange({
              data: data?.data,
              cropArea,
              maskType: 'blur',
              maskIntensity: Number(e.target.value),
            })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}

      {/* 초기화 버튼 */}
      {blurEnabled && (
        <button
          type="button"
          onClick={() => onChange({
            data: data?.data,
            cropArea: { x: 20, y: 20, width: 60, height: 60 },
            maskType: 'blur',
            maskIntensity: 50,
          })}
          className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          영역 초기화
        </button>
      )}
    </div>
  );
}

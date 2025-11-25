'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import type { MediaSettings, CropArea, MaskType } from '@xingu/shared';

interface ImageEditorProps {
  data?: MediaSettings['image'];
  imageData?: string;
  onChange: (data: MediaSettings['image']) => void;
}

export function ImageEditor({ data, imageData, onChange }: ImageEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const cropArea = data?.cropArea || { x: 25, y: 25, width: 50, height: 50 };
  const maskType = data?.maskType || 'none';
  const maskIntensity = data?.maskIntensity ?? 50;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = ((e.clientX - rect.left) / rect.width) * 100;
      const currentY = ((e.clientY - rect.top) / rect.height) * 100;

      const newCropArea: CropArea = {
        x: Math.min(dragStart.x, currentX),
        y: Math.min(dragStart.y, currentY),
        width: Math.abs(currentX - dragStart.x),
        height: Math.abs(currentY - dragStart.y),
      };

      // Clamp values
      newCropArea.x = Math.max(0, Math.min(100 - newCropArea.width, newCropArea.x));
      newCropArea.y = Math.max(0, Math.min(100 - newCropArea.height, newCropArea.y));
      newCropArea.width = Math.min(100 - newCropArea.x, newCropArea.width);
      newCropArea.height = Math.min(100 - newCropArea.y, newCropArea.height);

      onChange({ ...data, cropArea: newCropArea });
    },
    [isDragging, dragStart, data, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!imageData) {
    return (
      <div className="text-center py-8 text-gray-500">
        이미지를 먼저 업로드하세요
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Crop Area Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          보여줄 영역 선택 (드래그)
        </label>
        <div
          ref={containerRef}
          className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden cursor-crosshair select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <Image
            src={imageData}
            alt="Preview"
            fill
            className="object-contain"
            unoptimized
          />
          {/* Crop overlay */}
          <div
            className="absolute border-2 border-primary-500 bg-primary-500/20"
            style={{
              left: `${cropArea.x}%`,
              top: `${cropArea.y}%`,
              width: `${cropArea.width}%`,
              height: `${cropArea.height}%`,
            }}
          >
            <div className="absolute -top-6 left-0 text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
              {Math.round(cropArea.width)}% × {Math.round(cropArea.height)}%
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          마우스로 드래그하여 보여줄 영역을 선택하세요
        </p>
      </div>

      {/* Mask Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          마스킹 효과
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'none', label: '없음', icon: '🖼️' },
            { value: 'blur', label: '블러', icon: '🌫️' },
            { value: 'mosaic', label: '모자이크', icon: '🧩' },
            { value: 'spotlight', label: '스포트라이트', icon: '🔦' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...data, maskType: option.value as MaskType })}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                maskType === option.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-xs font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Mask Intensity */}
      {maskType !== 'none' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            효과 강도: {maskIntensity}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={maskIntensity}
            onChange={(e) => onChange({ ...data, maskIntensity: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}

      {/* Reset button */}
      <button
        type="button"
        onClick={() => onChange({ data: data?.data })}
        className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        설정 초기화
      </button>
    </div>
  );
}

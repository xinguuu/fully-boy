'use client';

import { useState, useRef } from 'react';
import type { MediaSettings } from '@xingu/shared';
import { fileToBase64 } from './utils';
import { ImageEditor } from './ImageEditor';
import { AudioEditor } from './AudioEditor';
import { VideoEditor } from './VideoEditor';

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

interface MediaEditorProps {
  mediaSettings?: MediaSettings;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  onChange: (data: {
    mediaSettings?: MediaSettings;
    imageUrl?: string;
    audioUrl?: string;
    videoUrl?: string;
  }) => void;
}

type MediaTab = 'image' | 'sound';

export function MediaEditor({
  mediaSettings,
  imageUrl,
  audioUrl,
  videoUrl,
  onChange,
}: MediaEditorProps) {
  const [activeTab, setActiveTab] = useState<MediaTab>('image');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current media data (base64 or URL)
  const imageData = mediaSettings?.image?.data || imageUrl;
  const audioData = mediaSettings?.audio?.data || audioUrl;
  const videoData = mediaSettings?.video?.data || videoUrl;

  const hasAnyMedia = imageData || audioData || videoData;

  const processFile = async (file: File) => {
    setError(null);
    const fileType = file.type.split('/')[0]; // 'image', 'audio', 'video'

    // Validate file size
    let maxSize: number;
    let typeLabel: string;
    if (fileType === 'image') {
      maxSize = MAX_IMAGE_SIZE;
      typeLabel = '이미지';
    } else if (fileType === 'audio') {
      maxSize = MAX_AUDIO_SIZE;
      typeLabel = '오디오';
    } else if (fileType === 'video') {
      maxSize = MAX_VIDEO_SIZE;
      typeLabel = '비디오';
    } else {
      setError('지원하지 않는 파일 형식입니다.');
      return;
    }

    if (file.size > maxSize) {
      setError(`${typeLabel} 파일은 ${formatFileSize(maxSize)} 이하만 업로드 가능합니다. (현재: ${formatFileSize(file.size)})`);
      return;
    }

    const base64 = await fileToBase64(file);

    if (fileType === 'image') {
      onChange({
        mediaSettings: {
          ...mediaSettings,
          image: { ...mediaSettings?.image, data: base64 },
        },
      });
      setActiveTab('image');
    } else if (fileType === 'audio') {
      // Audio and video are mutually exclusive (sounds would overlap)
      // Clear video when uploading audio
      onChange({
        mediaSettings: {
          ...mediaSettings,
          audio: { ...mediaSettings?.audio, data: base64 },
          video: undefined,
        },
        videoUrl: undefined,
      });
      setActiveTab('sound');
    } else if (fileType === 'video') {
      // Audio and video are mutually exclusive (sounds would overlap)
      // Clear audio when uploading video
      onChange({
        mediaSettings: {
          ...mediaSettings,
          video: { ...mediaSettings?.video, data: base64 },
          audio: undefined,
        },
        audioUrl: undefined,
      });
      setActiveTab('sound');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processFile(file);

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the container (not entering a child)
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validTypes = ['image/', 'audio/', 'video/'];
      if (validTypes.some(type => file.type.startsWith(type))) {
        await processFile(file);
      }
    }
  };

  const handleRemoveMedia = (type: 'image' | 'audio' | 'video') => {
    const newSettings = { ...mediaSettings };
    if (type === 'image') {
      delete newSettings?.image;
      onChange({ mediaSettings: newSettings, imageUrl: undefined });
    } else if (type === 'audio') {
      delete newSettings?.audio;
      onChange({ mediaSettings: newSettings, audioUrl: undefined });
    } else if (type === 'video') {
      delete newSettings?.video;
      onChange({ mediaSettings: newSettings, videoUrl: undefined });
    }
  };

  const handleImageSettingsChange = (imageSettings: MediaSettings['image']) => {
    onChange({
      mediaSettings: { ...mediaSettings, image: imageSettings },
    });
  };

  const handleAudioSettingsChange = (audioSettings: MediaSettings['audio']) => {
    onChange({
      mediaSettings: { ...mediaSettings, audio: audioSettings },
    });
  };

  const handleVideoSettingsChange = (videoSettings: MediaSettings['video']) => {
    onChange({
      mediaSettings: { ...mediaSettings, video: videoSettings },
    });
  };

  return (
    <div
      className={`relative border-2 rounded-xl overflow-hidden transition-all ${
        isDragging
          ? 'border-primary-500 bg-primary-50 border-dashed'
          : 'border-gray-200'
      }`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary-50/90 pointer-events-none">
          <div className="text-center">
            <div className="text-5xl mb-2">📥</div>
            <p className="text-primary-600 font-semibold">파일을 여기에 놓으세요</p>
            <p className="text-sm text-primary-500">이미지, 오디오, 비디오 지원</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">📎 미디어 설정</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            + 파일 업로드
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <span className="text-red-500 flex-shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-xs text-red-500 mt-1">
              이미지: 최대 5MB | 오디오: 최대 10MB | 비디오: 최대 50MB
            </p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs - Image and Sound (Audio or Video) */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'image', label: '🖼️ 이미지', hasData: !!imageData },
          { key: 'sound', label: '🎵 오디오 / 비디오', hasData: !!(audioData || videoData) },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as MediaTab)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative cursor-pointer ${
              activeTab === tab.key
                ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.hasData && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {!hasAnyMedia && (
          <div
            className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-4xl mb-3">📁</div>
            <p className="text-gray-600 font-medium mb-1">파일을 드래그하거나 클릭하여 업로드</p>
            <p className="text-sm text-gray-400">
              이미지(5MB), 오디오(10MB), 비디오(50MB) 지원
            </p>
          </div>
        )}

        {activeTab === 'image' && imageData && (
          <div>
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => handleRemoveMedia('image')}
                className="text-sm text-red-500 hover:text-red-600 cursor-pointer"
              >
                🗑️ 이미지 삭제
              </button>
            </div>
            <ImageEditor
              data={mediaSettings?.image}
              imageData={imageData}
              onChange={handleImageSettingsChange}
            />
          </div>
        )}

        {/* Sound Tab - Audio or Video (mutually exclusive) */}
        {activeTab === 'sound' && audioData && (
          <div>
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => handleRemoveMedia('audio')}
                className="text-sm text-red-500 hover:text-red-600 cursor-pointer"
              >
                🗑️ 오디오 삭제
              </button>
            </div>
            <AudioEditor
              data={mediaSettings?.audio}
              audioData={audioData}
              onChange={handleAudioSettingsChange}
            />
          </div>
        )}

        {activeTab === 'sound' && videoData && (
          <div>
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => handleRemoveMedia('video')}
                className="text-sm text-red-500 hover:text-red-600 cursor-pointer"
              >
                🗑️ 비디오 삭제
              </button>
            </div>
            <VideoEditor
              data={mediaSettings?.video}
              videoData={videoData}
              onChange={handleVideoSettingsChange}
            />
          </div>
        )}

        {activeTab === 'image' && !imageData && hasAnyMedia && (
          <div
            className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-gray-500 mb-1">🖼️ 이미지가 없습니다</p>
            <p className="text-sm text-primary-500">드래그하거나 클릭하여 업로드</p>
          </div>
        )}

        {activeTab === 'sound' && !audioData && !videoData && hasAnyMedia && (
          <div
            className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-gray-500 mb-1">🎵 오디오 또는 비디오가 없습니다</p>
            <p className="text-sm text-primary-500">드래그하거나 클릭하여 업로드</p>
            <p className="text-xs text-gray-400 mt-1">오디오와 비디오는 둘 중 하나만 사용 가능</p>
          </div>
        )}
      </div>
    </div>
  );
}

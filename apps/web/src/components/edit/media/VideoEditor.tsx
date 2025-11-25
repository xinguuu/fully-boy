'use client';

import { useState, useRef, useEffect } from 'react';
import type { MediaSettings } from '@xingu/shared';
import { formatTime } from './utils';

interface VideoEditorProps {
  data?: MediaSettings['video'];
  videoData?: string;
  onChange: (data: MediaSettings['video']) => void;
}

export function VideoEditor({ data, videoData, onChange }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [dragging, setDragging] = useState<'start' | 'end' | 'range' | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const justFinishedDraggingRef = useRef(false);

  // Analyze video audio track waveform using Web Audio API
  useEffect(() => {
    if (!videoData) return;

    const analyzeVideoAudio = async () => {
      try {
        const audioContext = new AudioContext();

        // Fetch and decode video's audio track
        const response = await fetch(videoData);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Get audio channel data
        const channelData = audioBuffer.getChannelData(0);
        const samples = 100;
        const blockSize = Math.floor(channelData.length / samples);
        const waveform: number[] = [];

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[i * blockSize + j]);
          }
          const avg = sum / blockSize;
          waveform.push(Math.min(1, avg * 3));
        }

        setWaveformData(waveform);
        audioContext.close();
      } catch {
        // Fallback to static pattern for videos without audio or on error
        const fallback = Array.from({ length: 100 }, (_, i) =>
          0.3 + Math.sin(i * 0.3) * 0.2 + Math.sin(i * 0.7) * 0.15
        );
        setWaveformData(fallback);
      }
    };

    analyzeVideoAudio();
  }, [videoData]);

  // Use ref to store drag info to avoid useEffect re-runs
  const dragStartInfoRef = useRef<{
    mouseX: number;
    rectLeft: number;
    rectWidth: number;
    startTime: number;
    endTime: number;
    duration: number;
  } | null>(null);

  const startTime = data?.startTime ?? 0;
  const endTime = data?.endTime ?? duration;
  const selectedDuration = (endTime || duration) - startTime;

  // Store current values in refs for stable access in event handlers
  const dataRef = useRef(data);
  const durationRef = useRef(duration);
  dataRef.current = data;
  durationRef.current = duration;

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (endTime && videoRef.current.currentTime >= endTime) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.currentTime = startTime;
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const getTimeFromMouseEvent = (e: MouseEvent | React.MouseEvent) => {
    if (!timelineRef.current || duration === 0) return null;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    return percentage * duration;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) return;
    if (justFinishedDraggingRef.current) {
      justFinishedDraggingRef.current = false;
      return;
    }
    const clickedTime = getTimeFromMouseEvent(e);
    if (clickedTime === null) return;

    const distToStart = Math.abs(clickedTime - startTime);
    const distToEnd = Math.abs(clickedTime - (endTime || duration));

    if (distToStart < distToEnd) {
      onChange({ ...data, startTime: Math.max(0, Math.min(clickedTime, (endTime || duration) - 0.5)) });
    } else {
      onChange({ ...data, endTime: Math.max(startTime + 0.5, Math.min(clickedTime, duration)) });
    }
  };

  const handleHandleMouseDown = (handle: 'start' | 'end') => (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragging(handle);
  };

  const handleRangeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    dragStartInfoRef.current = {
      mouseX: e.clientX,
      rectLeft: rect.left,
      rectWidth: rect.width,
      startTime,
      endTime: endTime || duration,
      duration,
    };
    setDragging('range');
  };

  useEffect(() => {
    if (!dragging) return;

    const getTimeFromMouse = (e: MouseEvent) => {
      if (!timelineRef.current || durationRef.current === 0) return null;
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = clickX / rect.width;
      return percentage * durationRef.current;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const currentData = dataRef.current;
      const currentDuration = durationRef.current;
      const currentStartTime = currentData?.startTime ?? 0;
      const currentEndTime = currentData?.endTime ?? currentDuration;

      if (dragging === 'start') {
        const time = getTimeFromMouse(e);
        if (time === null) return;
        onChange({ ...currentData, startTime: Math.max(0, Math.min(time, (currentEndTime || currentDuration) - 0.5)) });
      } else if (dragging === 'end') {
        const time = getTimeFromMouse(e);
        if (time === null) return;
        onChange({ ...currentData, endTime: Math.max(currentStartTime + 0.5, Math.min(time, currentDuration)) });
      } else if (dragging === 'range' && dragStartInfoRef.current) {
        const info = dragStartInfoRef.current;
        // Calculate delta in pixels, then convert to time using stored rect
        const deltaX = e.clientX - info.mouseX;
        const deltaTime = (deltaX / info.rectWidth) * info.duration;
        const rangeDuration = info.endTime - info.startTime;
        let newStart = info.startTime + deltaTime;
        let newEnd = info.endTime + deltaTime;

        // Clamp to bounds
        if (newStart < 0) {
          newStart = 0;
          newEnd = rangeDuration;
        }
        if (newEnd > info.duration) {
          newEnd = info.duration;
          newStart = info.duration - rangeDuration;
        }

        onChange({ ...currentData, startTime: newStart, endTime: newEnd });
      }
    };

    const handleMouseUp = () => {
      if (dragging) {
        justFinishedDraggingRef.current = true;
      }
      setDragging(null);
      dragStartInfoRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, onChange]);

  if (!videoData) {
    return (
      <div className="text-center py-8 text-gray-500">
        비디오를 먼저 업로드하세요
      </div>
    );
  }

  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? ((endTime || duration) / duration) * 100 : 100;
  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoData}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-40 object-contain"
        />
        {/* Play overlay */}
        {!isPlaying && (
          <button
            type="button"
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-white/90 rounded-full shadow-lg">
              <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Visual Timeline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">재생 구간 선택</span>
          <span className="text-xs text-gray-500">전체 {formatTime(duration)}</span>
        </div>

        {/* Timeline Bar */}
        <div
          ref={timelineRef}
          className="relative h-10 bg-gray-200 rounded-lg cursor-pointer overflow-hidden"
          onClick={handleTimelineClick}
        >
          {/* Real audio waveform from video */}
          <div className="absolute inset-0 flex items-center justify-around px-1">
            {(waveformData.length > 0 ? waveformData : Array.from({ length: 100 }, () => 0.3)).map((amplitude, i) => (
              <div
                key={i}
                className="w-0.5 bg-gray-400 rounded-full transition-all"
                style={{ height: `${6 + amplitude * 26}px` }}
              />
            ))}
          </div>

          {/* Selected Range - Draggable */}
          <div
            className={`absolute top-0 bottom-0 bg-primary-500/40 ${dragging === 'range' ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
            onMouseDown={handleRangeMouseDown}
          />

          {/* Start Handle */}
          <div
            className={`absolute top-0 bottom-0 w-1 bg-primary-600 cursor-ew-resize ${dragging === 'start' ? 'z-20' : ''}`}
            style={{ left: `${startPercent}%` }}
            onMouseDown={handleHandleMouseDown('start')}
          >
            <div className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-4 h-6 bg-primary-600 rounded flex items-center justify-center transition-transform ${dragging === 'start' ? 'scale-110' : 'hover:scale-105'}`}>
              <span className="text-white text-[8px] font-bold">S</span>
            </div>
          </div>

          {/* End Handle */}
          <div
            className={`absolute top-0 bottom-0 w-1 bg-primary-600 cursor-ew-resize ${dragging === 'end' ? 'z-20' : ''}`}
            style={{ left: `${endPercent}%` }}
            onMouseDown={handleHandleMouseDown('end')}
          >
            <div className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-4 h-6 bg-primary-600 rounded flex items-center justify-center transition-transform ${dragging === 'end' ? 'scale-110' : 'hover:scale-105'}`}>
              <span className="text-white text-[8px] font-bold">E</span>
            </div>
          </div>

          {/* Current Position */}
          {isPlaying && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${currentPercent}%` }}
            />
          )}
        </div>

        {/* Time Labels */}
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0:00</span>
          <span className="text-primary-600 font-medium">
            {formatTime(startTime)} ~ {formatTime(endTime || duration)} ({formatTime(selectedDuration)})
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <button
          type="button"
          onClick={handlePlayPause}
          className="w-10 h-10 flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-all cursor-pointer shadow-md"
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            {isPlaying ? '재생 중...' : '구간 미리보기'}
          </div>
          <div className="text-xs text-gray-500">
            {formatTime(startTime)} ~ {formatTime(endTime || duration)}
          </div>
        </div>
      </div>
    </div>
  );
}

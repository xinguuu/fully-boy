'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeLimit: number | null;
  soundEnabled: boolean;
  onSave: (timeLimit: number | null, soundEnabled: boolean) => void;
}

export function SettingsModal({ isOpen, onClose, timeLimit, soundEnabled, onSave }: SettingsModalProps) {
  const [localTimeLimit, setLocalTimeLimit] = useState<number | null>(timeLimit);
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled);

  useEffect(() => {
    setLocalTimeLimit(timeLimit);
    setLocalSoundEnabled(soundEnabled);
  }, [timeLimit, soundEnabled, isOpen]);

  const handleSave = () => {
    onSave(localTimeLimit, localSoundEnabled);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>게임 설정</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Time Limit */}
          <div>
            <label htmlFor="time-limit" className="block text-sm font-medium text-gray-700 mb-2">
              질문당 제한 시간
            </label>
            <select
              id="time-limit"
              value={localTimeLimit || ''}
              onChange={(e) => setLocalTimeLimit(e.target.value ? Number(e.target.value) : null)}
              className="h-11 w-full px-4 border border-gray-300 rounded-lg bg-white text-gray-900 transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none cursor-pointer"
            >
              <option value="">제한 없음</option>
              <option value="10">10초</option>
              <option value="20">20초</option>
              <option value="30">30초</option>
              <option value="45">45초</option>
              <option value="60">60초</option>
              <option value="90">90초</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">각 질문마다 참가자들이 답변할 수 있는 시간입니다</p>
          </div>

          {/* Sound Effects */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="sound-toggle" className="block text-sm font-medium text-gray-700">
                  효과음
                </label>
                <p className="text-xs text-gray-500 mt-1">게임 진행 중 효과음을 재생합니다</p>
              </div>
              <button
                id="sound-toggle"
                type="button"
                role="switch"
                aria-checked={localSoundEnabled}
                onClick={() => setLocalSoundEnabled(!localSoundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  localSoundEnabled ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    localSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Additional Settings Hint */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-900 font-medium mb-1">💡 추가 설정</p>
            <p className="text-xs text-blue-700">
              참가자 수, 게임 시간 등은 게임 정보에서 기본 설정된 값을 사용합니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-2.5 bg-primary-500 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-primary-600 hover:scale-105 active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            저장
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

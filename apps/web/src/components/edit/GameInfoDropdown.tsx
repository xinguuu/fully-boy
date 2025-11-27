'use client';

import { ChevronDown, X } from 'lucide-react';

interface GameInfoDropdownProps {
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function GameInfoDropdown({
  title,
  description,
  isOpen,
  onToggle,
  onClose,
  onTitleChange,
  onDescriptionChange,
}: GameInfoDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="group flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 -mx-2 transition-colors"
      >
        <div className="text-left">
          <h1 className="text-lg font-bold text-gray-900 truncate max-w-[180px] sm:max-w-[280px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px]">
            {title || '새 게임'}
          </h1>
          {description && (
            <p className="text-xs text-gray-500 truncate max-w-[180px] sm:max-w-[280px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px]">
              {description}
            </p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={onClose}
          />
          {/* Panel */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-20 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">게임 정보</h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  게임 제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white text-gray-900 transition-all hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  placeholder="게임 제목을 입력하세요"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  설명
                </label>
                <textarea
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none transition-all hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-sm"
                  placeholder="게임에 대한 설명을 입력하세요"
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

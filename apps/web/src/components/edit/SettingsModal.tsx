'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Clock } from 'lucide-react';

interface QuestionFormData {
  id?: string;
  order: number;
  content: string;
  data: {
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'balance-game';
    options?: string[];
    correctAnswer?: string;
    duration?: number;
    optionA?: string;
    optionB?: string;
    scoringMode?: 'majority' | 'none';
  };
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionFormData[];
  soundEnabled: boolean;
  onSave: (updatedQuestions: QuestionFormData[], soundEnabled: boolean) => void;
}

export function SettingsModal({ isOpen, onClose, questions, soundEnabled, onSave }: SettingsModalProps) {
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled);
  const [mode, setMode] = useState<'all' | 'by-type'>('all');
  const [allDuration, setAllDuration] = useState<number>(30);
  const [multipleChoiceDuration, setMultipleChoiceDuration] = useState<number>(30);
  const [trueFalseDuration, setTrueFalseDuration] = useState<number>(20);
  const [shortAnswerDuration, setShortAnswerDuration] = useState<number>(45);
  const [balanceGameDuration, setBalanceGameDuration] = useState<number>(15);

  // Calculate statistics
  const stats = {
    total: questions.length,
    multipleChoice: questions.filter((q) => q.data.type === 'multiple-choice').length,
    trueFalse: questions.filter((q) => q.data.type === 'true-false').length,
    shortAnswer: questions.filter((q) => q.data.type === 'short-answer').length,
    balanceGame: questions.filter((q) => q.data.type === 'balance-game').length,
  };

  useEffect(() => {
    if (isOpen) {
      setLocalSoundEnabled(soundEnabled);
      setMode('all');
      setAllDuration(30);
      setMultipleChoiceDuration(30);
      setTrueFalseDuration(20);
      setShortAnswerDuration(45);
      setBalanceGameDuration(15);
    }
  }, [isOpen, soundEnabled]);

  const handleSave = () => {
    // Apply bulk time settings to questions
    const updatedQuestions = questions.map((question) => {
      let newDuration: number;

      if (mode === 'all') {
        newDuration = allDuration;
      } else {
        switch (question.data.type) {
          case 'multiple-choice':
            newDuration = multipleChoiceDuration;
            break;
          case 'true-false':
            newDuration = trueFalseDuration;
            break;
          case 'short-answer':
            newDuration = shortAnswerDuration;
            break;
          case 'balance-game':
            newDuration = balanceGameDuration;
            break;
          default:
            newDuration = allDuration;
        }
      }

      return {
        ...question,
        data: {
          ...question.data,
          duration: newDuration,
        },
      };
    });

    onSave(updatedQuestions, localSoundEnabled);
    onClose();
  };

  const quickSetAll = (duration: number) => {
    setAllDuration(duration);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>게임 설정</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Sound Effects */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="sound-toggle" className="block text-sm font-medium text-gray-700">
                  🔊 효과음
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

          {/* Bulk Time Settings - Only show if there are questions */}
          {stats.total > 0 && (
            <>
              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 질문 현황</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-xl font-bold text-primary-600">{stats.total}</div>
                    <div className="text-[10px] text-gray-600">전체</div>
                  </div>
                  {stats.multipleChoice > 0 && (
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-xl font-bold text-blue-600">{stats.multipleChoice}</div>
                      <div className="text-[10px] text-gray-600">객관식</div>
                    </div>
                  )}
                  {stats.trueFalse > 0 && (
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-xl font-bold text-green-600">{stats.trueFalse}</div>
                      <div className="text-[10px] text-gray-600">O/X</div>
                    </div>
                  )}
                  {stats.shortAnswer > 0 && (
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-xl font-bold text-purple-600">{stats.shortAnswer}</div>
                      <div className="text-[10px] text-gray-600">주관식</div>
                    </div>
                  )}
                  {stats.balanceGame > 0 && (
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-xl font-bold text-orange-600">{stats.balanceGame}</div>
                      <div className="text-[10px] text-gray-600">밸런스</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">⏱️ 제한 시간 일괄 설정</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('all')}
                    className={`p-3 rounded-lg border-2 font-semibold transition-all duration-200 cursor-pointer ${
                      mode === 'all'
                        ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                        : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    <div className="text-base mb-0.5">🎯</div>
                    <div className="text-xs">모든 질문 동일하게</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('by-type')}
                    className={`p-3 rounded-lg border-2 font-semibold transition-all duration-200 cursor-pointer ${
                      mode === 'by-type'
                        ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                        : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    <div className="text-base mb-0.5">🎨</div>
                    <div className="text-xs">유형별로 다르게</div>
                  </button>
                </div>
              </div>

              {/* Time Settings */}
              {mode === 'all' ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">제한 시간 (초)</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={allDuration}
                        onChange={(e) => setAllDuration(Number(e.target.value))}
                        min={5}
                        max={300}
                        className="h-11 w-28 px-4 border border-gray-300 rounded-lg bg-white text-gray-900 transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                      />
                      <span className="text-sm text-gray-600">초</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[10, 15, 20, 30, 45, 60].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => quickSetAll(dur)}
                          className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                            dur === 30
                              ? 'bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {dur}초{dur === 30 && ' (추천)'}
                        </button>
                      ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        💡 <strong>{stats.total}개</strong>의 모든 질문이 <strong>{allDuration}초</strong>로 설정됩니다
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Multiple Choice */}
                  {stats.multipleChoice > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-700">📝 객관식</span>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            {stats.multipleChoice}개
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={multipleChoiceDuration}
                          onChange={(e) => setMultipleChoiceDuration(Number(e.target.value))}
                          min={5}
                          max={300}
                          className="h-9 w-20 px-2 border border-blue-300 rounded-lg bg-white text-gray-900 text-sm"
                        />
                        <span className="text-sm text-blue-700">초</span>
                        <div className="flex gap-1 ml-2">
                          {[20, 30, 45].map((dur) => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => setMultipleChoiceDuration(dur)}
                              className="px-2 py-1 text-xs bg-white hover:bg-blue-100 text-blue-700 rounded border border-blue-200 cursor-pointer"
                            >
                              {dur}초
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* True/False */}
                  {stats.trueFalse > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-700">⭕ O/X 퀴즈</span>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            {stats.trueFalse}개
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={trueFalseDuration}
                          onChange={(e) => setTrueFalseDuration(Number(e.target.value))}
                          min={5}
                          max={300}
                          className="h-9 w-20 px-2 border border-green-300 rounded-lg bg-white text-gray-900 text-sm"
                        />
                        <span className="text-sm text-green-700">초</span>
                        <div className="flex gap-1 ml-2">
                          {[10, 15, 20].map((dur) => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => setTrueFalseDuration(dur)}
                              className="px-2 py-1 text-xs bg-white hover:bg-green-100 text-green-700 rounded border border-green-200 cursor-pointer"
                            >
                              {dur}초
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Short Answer */}
                  {stats.shortAnswer > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-purple-700">✍️ 주관식</span>
                          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                            {stats.shortAnswer}개
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={shortAnswerDuration}
                          onChange={(e) => setShortAnswerDuration(Number(e.target.value))}
                          min={5}
                          max={300}
                          className="h-9 w-20 px-2 border border-purple-300 rounded-lg bg-white text-gray-900 text-sm"
                        />
                        <span className="text-sm text-purple-700">초</span>
                        <div className="flex gap-1 ml-2">
                          {[30, 45, 60].map((dur) => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => setShortAnswerDuration(dur)}
                              className="px-2 py-1 text-xs bg-white hover:bg-purple-100 text-purple-700 rounded border border-purple-200 cursor-pointer"
                            >
                              {dur}초
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Balance Game */}
                  {stats.balanceGame > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-orange-700">⚖️ 밸런스 게임</span>
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                            {stats.balanceGame}개
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={balanceGameDuration}
                          onChange={(e) => setBalanceGameDuration(Number(e.target.value))}
                          min={5}
                          max={300}
                          className="h-9 w-20 px-2 border border-orange-300 rounded-lg bg-white text-gray-900 text-sm"
                        />
                        <span className="text-sm text-orange-700">초</span>
                        <div className="flex gap-1 ml-2">
                          {[10, 15, 20].map((dur) => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => setBalanceGameDuration(dur)}
                              className="px-2 py-1 text-xs bg-white hover:bg-orange-100 text-orange-700 rounded border border-orange-200 cursor-pointer"
                            >
                              {dur}초
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* No Questions Message */}
          {stats.total === 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
              <p className="text-sm text-gray-500">질문이 없습니다. 질문을 추가하면 제한 시간을 설정할 수 있습니다.</p>
            </div>
          )}
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

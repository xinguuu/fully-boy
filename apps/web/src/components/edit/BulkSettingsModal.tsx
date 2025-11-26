'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Clock, Zap } from 'lucide-react';

interface QuestionFormData {
  id?: string;
  order: number;
  content: string;
  data: {
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'balance-game';
    options?: string[];
    correctAnswer?: string;
    duration?: number;
    // Balance game specific
    optionA?: string;
    optionB?: string;
    scoringMode?: 'majority' | 'none';
  };
  imageUrl?: string;
}

interface BulkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionFormData[];
  onApply: (updatedQuestions: QuestionFormData[]) => void;
}

export function BulkSettingsModal({ isOpen, onClose, questions, onApply }: BulkSettingsModalProps) {
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
      // Reset to defaults when modal opens
      setMode('all');
      setAllDuration(30);
      setMultipleChoiceDuration(30);
      setTrueFalseDuration(20);
      setShortAnswerDuration(45);
      setBalanceGameDuration(15);
    }
  }, [isOpen]);

  const handleApply = () => {
    const updatedQuestions = questions.map((question) => {
      let newDuration: number;

      if (mode === 'all') {
        newDuration = allDuration;
      } else {
        // by-type mode
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

    onApply(updatedQuestions);
    onClose();
  };

  const quickSetAll = (duration: number) => {
    setAllDuration(duration);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-500" />
            질문 일괄 설정
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 현재 질문 현황</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
                <div className="text-xs text-gray-600 mt-1">전체</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.multipleChoice}</div>
                <div className="text-xs text-gray-600 mt-1">객관식</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.trueFalse}</div>
                <div className="text-xs text-gray-600 mt-1">O/X</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.shortAnswer}</div>
                <div className="text-xs text-gray-600 mt-1">주관식</div>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">⚙️ 설정 방식</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('all')}
                className={`p-4 rounded-lg border-2 font-semibold transition-all duration-200 cursor-pointer ${
                  mode === 'all'
                    ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                    : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <div className="text-lg mb-1">🎯</div>
                <div className="text-sm">모든 질문 동일하게</div>
              </button>
              <button
                type="button"
                onClick={() => setMode('by-type')}
                className={`p-4 rounded-lg border-2 font-semibold transition-all duration-200 cursor-pointer ${
                  mode === 'by-type'
                    ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                    : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <div className="text-lg mb-1">🎨</div>
                <div className="text-sm">유형별로 다르게</div>
              </button>
            </div>
          </div>

          {/* Settings */}
          {mode === 'all' ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                제한 시간 (초)
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={allDuration}
                    onChange={(e) => setAllDuration(Number(e.target.value))}
                    min={5}
                    max={300}
                    className="h-11 w-32 px-4 border border-gray-300 rounded-lg bg-white text-gray-900 transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                  />
                  <span className="text-sm text-gray-600">초</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => quickSetAll(10)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    10초
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSetAll(15)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    15초
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSetAll(20)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    20초
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSetAll(30)}
                    className="px-4 py-2 text-sm bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    30초 (추천)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSetAll(45)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    45초
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSetAll(60)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    60초
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    💡 <strong>{stats.total}개</strong>의 모든 질문이 <strong>{allDuration}초</strong>로 설정됩니다
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                유형별 제한 시간 (초)
              </h3>

              {/* Multiple Choice */}
              {stats.multipleChoice > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-700">📝 객관식</span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        {stats.multipleChoice}개
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={multipleChoiceDuration}
                      onChange={(e) => setMultipleChoiceDuration(Number(e.target.value))}
                      min={5}
                      max={300}
                      className="h-10 w-24 px-3 border border-blue-300 rounded-lg bg-white text-gray-900 transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    />
                    <span className="text-sm text-blue-700">초</span>
                    <div className="flex gap-2">
                      {[20, 30, 45].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setMultipleChoiceDuration(dur)}
                          className="px-3 py-1 text-xs bg-white hover:bg-blue-100 text-blue-700 rounded transition-colors cursor-pointer border border-blue-200"
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-700">⭕ O/X 퀴즈</span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        {stats.trueFalse}개
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={trueFalseDuration}
                      onChange={(e) => setTrueFalseDuration(Number(e.target.value))}
                      min={5}
                      max={300}
                      className="h-10 w-24 px-3 border border-green-300 rounded-lg bg-white text-gray-900 transition-all duration-200 hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none"
                    />
                    <span className="text-sm text-green-700">초</span>
                    <div className="flex gap-2">
                      {[10, 15, 20].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setTrueFalseDuration(dur)}
                          className="px-3 py-1 text-xs bg-white hover:bg-green-100 text-green-700 rounded transition-colors cursor-pointer border border-green-200"
                        >
                          {dur}초
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">💡 O/X는 보통 짧은 시간이 적합합니다</p>
                </div>
              )}

              {/* Short Answer */}
              {stats.shortAnswer > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-purple-700">✍️ 주관식</span>
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                        {stats.shortAnswer}개
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={shortAnswerDuration}
                      onChange={(e) => setShortAnswerDuration(Number(e.target.value))}
                      min={5}
                      max={300}
                      className="h-10 w-24 px-3 border border-purple-300 rounded-lg bg-white text-gray-900 transition-all duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none"
                    />
                    <span className="text-sm text-purple-700">초</span>
                    <div className="flex gap-2">
                      {[30, 45, 60].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setShortAnswerDuration(dur)}
                          className="px-3 py-1 text-xs bg-white hover:bg-purple-100 text-purple-700 rounded transition-colors cursor-pointer border border-purple-200"
                        >
                          {dur}초
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-purple-600 mt-2">💡 주관식은 입력 시간이 필요하므로 넉넉하게 설정하세요</p>
                </div>
              )}

              {/* Balance Game */}
              {stats.balanceGame > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-orange-700">⚖️ 밸런스 게임</span>
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        {stats.balanceGame}개
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={balanceGameDuration}
                      onChange={(e) => setBalanceGameDuration(Number(e.target.value))}
                      min={5}
                      max={300}
                      className="h-10 w-24 px-3 border border-orange-300 rounded-lg bg-white text-gray-900 transition-all duration-200 hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none"
                    />
                    <span className="text-sm text-orange-700">초</span>
                    <div className="flex gap-2">
                      {[10, 15, 20].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setBalanceGameDuration(dur)}
                          className="px-3 py-1 text-xs bg-white hover:bg-orange-100 text-orange-700 rounded transition-colors cursor-pointer border border-orange-200"
                        >
                          {dur}초
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-orange-600 mt-2">💡 밸런스 게임은 빠른 선택이 재미있어요</p>
                </div>
              )}
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
            onClick={handleApply}
            disabled={stats.total === 0}
            className="px-8 py-2.5 bg-primary-500 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-primary-600 hover:scale-105 active:scale-100 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            적용
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

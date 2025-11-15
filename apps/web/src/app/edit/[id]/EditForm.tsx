'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useGame, useTemplate, useCreateGame, useUpdateGame, useCreateRoom } from '@/lib/hooks';
import type { Game, Question } from '@xingu/shared';
import { ArrowLeft, Trash2, Plus, Settings, Edit, Check } from 'lucide-react';
import { QuestionModal } from '@/components/edit/QuestionModal';
import { SettingsModal } from '@/components/edit/SettingsModal';

type GameWithQuestions = Game & {
  questions: Question[];
};

interface QuestionFormData {
  id?: string;
  order: number;
  content: string;
  data: {
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer?: string;
  };
  imageUrl?: string;
}

export default function EditForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = params.id as string;
  const templateId = searchParams.get('templateId');
  const isDraftMode = gameId === 'new' && !!templateId;

  const { data: gameData, isLoading: gameLoading, error: gameError } = useGame(isDraftMode ? '' : gameId);
  const { data: templateData, isLoading: templateLoading, error: templateError } = useTemplate(templateId || '');
  const createGame = useCreateGame();
  const updateGame = useUpdateGame(gameId);
  const createRoom = useCreateRoom();

  const isLoading = isDraftMode ? templateLoading : gameLoading;
  const error = isDraftMode ? templateError : gameError;
  const sourceData = isDraftMode ? templateData : (gameData as GameWithQuestions | undefined);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Modal states
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (sourceData) {
      setTitle(isDraftMode ? `${sourceData.title} (복사본)` : sourceData.title);
      setDescription(sourceData.description || '');

      const settings = sourceData.settings || {};
      setTimeLimit((settings.timeLimit as number) || null);
      setSoundEnabled(!!(settings.soundEnabled as boolean));

      if (!isDraftMode) {
        const gameSource = sourceData as GameWithQuestions;
        if (gameSource.questions && gameSource.questions.length > 0) {
          setQuestions(
            gameSource.questions.map((q) => ({
              id: q.id,
              order: q.order,
              content: q.content,
              data: q.data as QuestionFormData['data'],
              imageUrl: q.imageUrl || undefined,
            }))
          );
        } else {
          setQuestions([]);
        }
      } else {
        setQuestions([]);
      }
    }
  }, [sourceData, isDraftMode]);

  const handleSave = async () => {
    try {
      if (isDraftMode) {
        if (!sourceData) {
          alert('템플릿을 찾을 수 없습니다.');
          return;
        }
        await createGame.mutateAsync({
          title,
          description: description || undefined,
          gameType: sourceData.gameType,
          category: sourceData.category,
          duration: sourceData.duration,
          minPlayers: sourceData.minPlayers,
          maxPlayers: sourceData.maxPlayers,
          needsMobile: sourceData.needsMobile,
          settings: {
            timeLimit,
            soundEnabled,
          },
          questions: questions.map((q) => ({
            order: q.order,
            content: q.content,
            data: q.data,
            imageUrl: q.imageUrl,
          })),
          sourceGameId: templateId || undefined,
        });
      } else {
        await updateGame.mutateAsync({
          title,
          description: description || undefined,
          settings: {
            timeLimit,
            soundEnabled,
          },
          questions: questions.map((q) => ({
            id: q.id,
            order: q.order,
            content: q.content,
            data: q.data,
            imageUrl: q.imageUrl,
          })),
        });
      }
      router.push('/browse');
    } catch (error) {
      console.error('Failed to save game:', error);
      alert('게임 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSaveAndCreateRoom = async () => {
    try {
      let finalGameId = gameId;

      if (isDraftMode) {
        if (!sourceData) {
          alert('템플릿을 찾을 수 없습니다.');
          return;
        }
        const newGame = await createGame.mutateAsync({
          title,
          description: description || undefined,
          gameType: sourceData.gameType,
          category: sourceData.category,
          duration: sourceData.duration,
          minPlayers: sourceData.minPlayers,
          maxPlayers: sourceData.maxPlayers,
          needsMobile: sourceData.needsMobile,
          settings: {
            timeLimit,
            soundEnabled,
          },
          questions: questions.map((q) => ({
            order: q.order,
            content: q.content,
            data: q.data,
            imageUrl: q.imageUrl,
          })),
          sourceGameId: templateId || undefined,
        });
        finalGameId = newGame.id;
      } else {
        await updateGame.mutateAsync({
          title,
          description: description || undefined,
          settings: {
            timeLimit,
            soundEnabled,
          },
          questions: questions.map((q) => ({
            id: q.id,
            order: q.order,
            content: q.content,
            data: q.data,
            imageUrl: q.imageUrl,
          })),
        });
      }

      const room = await createRoom.mutateAsync({
        gameId: finalGameId,
        expiresInMinutes: 60,
      });

      router.push(`/room/${room.pin}/waiting`);
    } catch (error) {
      console.error('Failed to save and create room:', error);
      alert('게임 저장 또는 방 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestionIndex(null);
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestionIndex(index);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    const reordered = updated.map((q, idx) => ({ ...q, order: idx }));
    setQuestions(reordered);
  };

  const handleSaveQuestion = (question: QuestionFormData) => {
    if (editingQuestionIndex !== null) {
      const updated = [...questions];
      updated[editingQuestionIndex] = { ...question, order: editingQuestionIndex };
      setQuestions(updated);
    } else {
      const newQuestion = { ...question, order: questions.length };
      setQuestions([...questions, newQuestion]);
    }
    setIsQuestionModalOpen(false);
    setEditingQuestionIndex(null);
  };

  const handleSaveSettings = (newTimeLimit: number | null, newSoundEnabled: boolean) => {
    setTimeLimit(newTimeLimit);
    setSoundEnabled(newSoundEnabled);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !sourceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isDraftMode ? '템플릿을 찾을 수 없습니다' : '게임을 찾을 수 없습니다'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isDraftMode
              ? '템플릿이 삭제되었거나 더 이상 사용할 수 없습니다.'
              : '게임이 삭제되었거나 접근 권한이 없습니다.'}
          </p>
          <button
            onClick={() => router.push('/browse')}
            className="text-primary-500 hover:text-primary-600 font-medium transition-colors cursor-pointer"
          >
            둘러보기로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">뒤로</span>
            </button>

            <h1 className="text-xl font-bold text-gray-900">게임 편집</h1>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
              aria-label="게임 설정"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">설정</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Game Info */}
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 게임 정보</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                게임 제목 <span className="text-error">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 w-full px-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                placeholder="예: 회사 MT 밸런스 게임"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg min-h-[120px] resize-y transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                placeholder="게임에 대한 설명을 입력하세요"
                maxLength={500}
              />
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 pt-2">
              <span className="flex items-center gap-1">
                📱 {sourceData.needsMobile ? '모바일 필요' : '모바일 불필요'}
              </span>
              <span className="flex items-center gap-1">⏱️ {sourceData.duration}분 예상</span>
              <span className="flex items-center gap-1">
                👥 {sourceData.minPlayers}-{sourceData.maxPlayers}명 권장
              </span>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">📝 질문 목록 ({questions.length}개)</h2>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Plus className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">질문을 추가해보세요</h3>
                <p className="text-sm text-gray-500 mb-6">게임에 사용할 질문들을 만들어보세요</p>
              </div>
              <button
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-primary-600 hover:scale-105 hover:shadow-lg active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Plus className="w-5 h-5" />
                첫 질문 추가하기
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {questions.map((question, qIndex) => {
                  const preview = question.content.length > 60 ? `${question.content.slice(0, 60)}...` : question.content;
                  const correctAnswerDisplay =
                    question.data.type === 'multiple-choice'
                      ? question.data.correctAnswer
                      : question.data.type === 'true-false'
                        ? question.data.correctAnswer
                        : '주관식';

                  return (
                    <div
                      key={question.id || qIndex}
                      className="group border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => handleEditQuestion(qIndex)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold text-lg flex items-center justify-center">
                          {qIndex + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {preview || '(질문 내용 없음)'}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500">
                              {question.data.type === 'multiple-choice' && '객관식'}
                              {question.data.type === 'true-false' && 'O/X 퀴즈'}
                              {question.data.type === 'short-answer' && '주관식'}
                            </span>
                            {correctAnswerDisplay && (
                              <span className="inline-flex items-center gap-1 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                                <Check className="w-3 h-3" />
                                정답: {correctAnswerDisplay}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditQuestion(qIndex);
                            }}
                            className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                            aria-label="질문 편집"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestion(qIndex);
                            }}
                            className="p-2 text-gray-400 hover:text-error hover:bg-error-light rounded-lg transition-colors cursor-pointer"
                            aria-label="질문 삭제"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleAddQuestion}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-lg hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                질문 추가
              </button>
            </>
          )}
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            취소
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={(isDraftMode ? createGame.isPending : updateGame.isPending) || !title.trim()}
              className="px-6 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-all duration-200 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
            >
              {(isDraftMode ? createGame.isPending : updateGame.isPending) ? '저장 중...' : '저장'}
            </button>

            <button
              onClick={handleSaveAndCreateRoom}
              disabled={(isDraftMode ? createGame.isPending : updateGame.isPending) || !title.trim()}
              className="px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-primary-600 hover:scale-105 hover:shadow-lg active:scale-100 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {(isDraftMode ? createGame.isPending : updateGame.isPending) ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  저장 중...
                </span>
              ) : (
                '저장하고 방 생성'
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestionIndex(null);
        }}
        question={editingQuestionIndex !== null ? questions[editingQuestionIndex] : null}
        questionNumber={editingQuestionIndex !== null ? editingQuestionIndex + 1 : questions.length + 1}
        onSave={handleSaveQuestion}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        timeLimit={timeLimit}
        soundEnabled={soundEnabled}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

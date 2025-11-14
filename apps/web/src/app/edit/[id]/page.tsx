'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useGame, useUpdateGame, useCreateRoom } from '@/lib/hooks';
import type { Game, Question } from '@xingu/shared';
import { ArrowLeft, Trash2, Plus, GripVertical } from 'lucide-react';

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

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const { data: gameData, isLoading, error } = useGame(gameId);
  const updateGame = useUpdateGame(gameId);
  const createRoom = useCreateRoom();

  const game = gameData as GameWithQuestions | undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setDescription(game.description || '');

      const settings = game.settings || {};
      setTimeLimit((settings.timeLimit as number) || null);
      setSoundEnabled(!!(settings.soundEnabled as boolean));

      if (game.questions && game.questions.length > 0) {
        setQuestions(
          game.questions.map((q) => ({
            id: q.id,
            order: q.order,
            content: q.content,
            data: q.data as QuestionFormData['data'],
            imageUrl: q.imageUrl || undefined,
          }))
        );
      }
    }
  }, [game]);

  const handleSave = async () => {
    try {
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
      router.push('/browse');
    } catch (error) {
      console.error('Failed to save game:', error);
      alert('게임 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSaveAndCreateRoom = async () => {
    try {
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

      const room = await createRoom.mutateAsync({
        gameId,
        expiresInMinutes: 60,
      });

      router.push(`/room/${room.pin}/waiting`);
    } catch (error) {
      console.error('Failed to save and create room:', error);
      alert('게임 저장 또는 방 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: QuestionFormData = {
      order: questions.length,
      content: '',
      data: {
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    const reordered = updated.map((q, idx) => ({ ...q, order: idx }));
    setQuestions(reordered);
  };

  const handleQuestionContentChange = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], content: value };
    setQuestions(updated);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    const options = [...(question.data.options || [])];
    options[optionIndex] = value;

    updated[questionIndex] = {
      ...question,
      data: {
        ...question.data,
        options,
      },
    };
    setQuestions(updated);
  };

  const handleAddOption = (questionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    const options = [...(question.data.options || []), ''];

    updated[questionIndex] = {
      ...question,
      data: {
        ...question.data,
        options,
      },
    };
    setQuestions(updated);
  };

  const handleDeleteOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    const options = (question.data.options || []).filter((_, i) => i !== optionIndex);

    updated[questionIndex] = {
      ...question,
      data: {
        ...question.data,
        options,
      },
    };
    setQuestions(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">게임을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">게임이 삭제되었거나 접근 권한이 없습니다.</p>
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

            <div className="w-20" />
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
                📱 {game.needsMobile ? '모바일 필요' : '모바일 불필요'}
              </span>
              <span className="flex items-center gap-1">⏱️ {game.duration}분 예상</span>
              <span className="flex items-center gap-1">
                👥 {game.minPlayers}-{game.maxPlayers}명 권장
              </span>
            </div>
          </div>
        </section>

        {/* Settings */}
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">⚙️ 게임 설정</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-2">
                질문당 제한 시간
              </label>
              <select
                id="timeLimit"
                value={timeLimit || ''}
                onChange={(e) => setTimeLimit(e.target.value ? Number(e.target.value) : null)}
                className="h-11 w-full px-4 border border-gray-300 rounded-lg bg-white text-gray-900 transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none cursor-pointer"
              >
                <option value="">제한 없음</option>
                <option value="10">10초</option>
                <option value="20">20초</option>
                <option value="30">30초</option>
                <option value="60">60초</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="sound" className="text-sm font-medium text-gray-700">
                효과음
              </label>
              <button
                id="sound"
                role="switch"
                aria-checked={soundEnabled}
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  soundEnabled ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">📝 질문 목록 ({questions.length}개)</h2>
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-primary-600 hover:scale-105 active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              질문 추가
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((question, qIndex) => (
              <div
                key={question.id || qIndex}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0 pt-2">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                    <span className="text-sm font-bold text-gray-500 w-6">{qIndex + 1}.</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={question.content}
                      onChange={(e) => handleQuestionContentChange(qIndex, e.target.value)}
                      className="h-11 w-full px-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                      placeholder="질문을 입력하세요"
                    />

                    {question.data.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700">선택지</p>
                          <button
                            onClick={() => handleAddOption(qIndex)}
                            className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors cursor-pointer"
                          >
                            + 선택지 추가
                          </button>
                        </div>

                        {(question.data.options || []).map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 font-medium w-8">
                              {String.fromCharCode(65 + oIndex)}
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              className="h-10 flex-1 px-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                              placeholder={`선택지 ${String.fromCharCode(65 + oIndex)}`}
                            />
                            {(question.data.options || []).length > 2 && (
                              <button
                                onClick={() => handleDeleteOption(qIndex, oIndex)}
                                className="p-2 text-gray-400 hover:text-error hover:bg-error-light rounded transition-colors cursor-pointer"
                                aria-label="선택지 삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(qIndex)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-error hover:bg-error-light rounded-lg transition-colors cursor-pointer"
                    aria-label="질문 삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">아직 질문이 없습니다</p>
                <button
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-primary-600 hover:scale-105 active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <Plus className="w-5 h-5" />
                  첫 질문 추가하기
                </button>
              </div>
            )}
          </div>
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
              disabled={updateGame.isPending || !title.trim()}
              className="px-6 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-all duration-200 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
            >
              {updateGame.isPending ? '저장 중...' : '저장'}
            </button>

            <button
              onClick={handleSaveAndCreateRoom}
              disabled={updateGame.isPending || !title.trim()}
              className="px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-primary-600 hover:scale-105 hover:shadow-lg active:scale-100 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {updateGame.isPending ? (
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
    </div>
  );
}

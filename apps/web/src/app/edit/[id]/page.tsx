'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useGame, useUpdateGame } from '@/lib/hooks';
import { ArrowLeft, Trash2, Plus, GripVertical } from 'lucide-react';

interface QuestionData {
  id?: string;
  order: number;
  content: string;
  data: Record<string, unknown>;
  imageUrl?: string;
}

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const { data: game, isLoading } = useGame(gameId);
  const updateGame = useUpdateGame(gameId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setDescription(game.description || '');
      setSettings(game.settings || {});
      setQuestions([]);
    }
  }, [game]);

  const handleSave = async () => {
    try {
      await updateGame.mutateAsync({
        title,
        description,
        settings,
        questions,
      });
      router.push('/browse');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };

  const handleSaveAndCreateRoom = async () => {
    try {
      await updateGame.mutateAsync({
        title,
        description,
        settings,
        questions,
      });

      // TODO: Create room API integration
      alert('게임이 저장되었습니다. 방 생성 기능은 곧 추가됩니다.');
      router.push('/browse');
    } catch (error) {
      console.error('Failed to save and create room:', error);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: QuestionData = {
      order: questions.length,
      content: '',
      data: {
        type: 'multiple-choice',
        options: ['', ''],
        correctAnswer: '',
      },
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: 'content' | 'imageUrl', value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const questionData = updated[questionIndex].data;
    const options = (questionData.options as string[]) || [];
    const newOptions = [...options];
    newOptions[optionIndex] = value;

    updated[questionIndex] = {
      ...updated[questionIndex],
      data: { ...questionData, options: newOptions },
    };
    setQuestions(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">게임을 찾을 수 없습니다</h2>
          <button
            onClick={() => router.push('/browse')}
            className="text-primary-500 hover:text-primary-600 font-medium cursor-pointer"
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">뒤로</span>
            </button>

            <h1 className="text-xl font-semibold text-gray-900">
              {title || '게임 편집'}
            </h1>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Info Section */}
        <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                게임 제목
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 w-full px-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                placeholder="예: 회사 MT 밸런스 게임"
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
              />
            </div>

            {game && (
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  📱 {game.needsMobile ? '모바일 필요' : '모바일 불필요'}
                </span>
                <span className="flex items-center gap-1">
                  ⏱️ {game.duration || 10}분 예상
                </span>
                <span className="flex items-center gap-1">
                  👥 {game.minPlayers || 2}-{game.maxPlayers || 50}명 권장
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Game Settings Section */}
        <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ 게임 설정</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-2">
                질문당 시간
              </label>
              <select
                id="timeLimit"
                value={(settings.timeLimit as number) || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    timeLimit: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="h-11 w-full px-4 border border-gray-300 rounded-lg bg-white text-gray-900 transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none cursor-pointer"
              >
                <option value="">제한없음</option>
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
                aria-checked={!!settings.soundEnabled}
                onClick={() =>
                  setSettings({ ...settings, soundEnabled: !settings.soundEnabled })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  settings.soundEnabled
                    ? 'bg-primary-500 hover:bg-primary-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </section>

        {/* Questions Section */}
        <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              📝 질문 목록 ({questions.length}개)
            </h2>
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              질문 추가
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id || index}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                    <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={question.content}
                      onChange={(e) => handleQuestionChange(index, 'content', e.target.value)}
                      className="h-10 w-full px-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                      placeholder="질문을 입력하세요"
                    />

                    {question.data.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {((question.data.options as string[]) || []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 w-16">
                              선택지 {optionIndex + 1}:
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(index, optionIndex, e.target.value)
                              }
                              className="h-9 flex-1 px-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                              placeholder={`선택지 ${optionIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(index)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-error hover:bg-error-light rounded-lg transition-colors cursor-pointer"
                    aria-label="질문 삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">아직 질문이 없습니다</p>
                <button
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  첫 질문 추가하기
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-transparent border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            취소
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={updateGame.isPending}
              className="px-6 py-3 bg-white border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-all duration-200 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {updateGame.isPending ? '저장 중...' : '저장'}
            </button>

            <button
              onClick={handleSaveAndCreateRoom}
              disabled={updateGame.isPending}
              className="px-8 py-3 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg active:scale-100 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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

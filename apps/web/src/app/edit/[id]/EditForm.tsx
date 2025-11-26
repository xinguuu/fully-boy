'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useGame, useTemplate, useCreateGame, useUpdateGame, useCreateRoom, useAuth } from '@/lib/hooks';
import type { Game, Question, MediaSettings } from '@xingu/shared';
import { GameType, Category, TemplateCategory } from '@xingu/shared';
import { ArrowLeft, Trash2, Plus, Settings, LayoutGrid, List, ChevronDown, X, FileText, Clock, Image, Volume2, Video, Check } from 'lucide-react';
import { SettingsModal } from '@/components/edit/SettingsModal';
import { QuestionEditPanel } from '@/components/edit/QuestionEditPanel';
import { OrganizerPreview } from '@/components/edit/OrganizerPreview';
import { ParticipantPreview } from '@/components/edit/ParticipantPreview';
import { logger } from '@/lib/logger';

type GameWithQuestions = Game & {
  questions: Question[];
};

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
  videoUrl?: string;
  audioUrl?: string;
  mediaSettings?: MediaSettings;
}

interface GameTypeDefaults {
  gameType: GameType;
  category: Category;
  gameCategory: TemplateCategory;
  needsMobile: boolean;
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  questionType: QuestionFormData['data']['type'];
}

const GAME_TYPE_DEFAULTS: Record<GameType, GameTypeDefaults> = {
  [GameType.OX_QUIZ]: {
    gameType: GameType.OX_QUIZ,
    category: Category.QUIZ,
    gameCategory: TemplateCategory.QUIZ,
    needsMobile: true,
    duration: 10,
    minPlayers: 2,
    maxPlayers: 50,
    questionType: 'true-false',
  },
  [GameType.FOUR_CHOICE_QUIZ]: {
    gameType: GameType.FOUR_CHOICE_QUIZ,
    category: Category.QUIZ,
    gameCategory: TemplateCategory.QUIZ,
    needsMobile: true,
    duration: 15,
    minPlayers: 2,
    maxPlayers: 50,
    questionType: 'multiple-choice',
  },
  [GameType.BALANCE_GAME]: {
    gameType: GameType.BALANCE_GAME,
    category: Category.ENTERTAINMENT,
    gameCategory: TemplateCategory.PARTY,
    needsMobile: false,
    duration: 20,
    minPlayers: 2,
    maxPlayers: 100,
    questionType: 'balance-game',
  },
  [GameType.LIAR_GAME]: {
    gameType: GameType.LIAR_GAME,
    category: Category.ENTERTAINMENT,
    gameCategory: TemplateCategory.PARTY,
    needsMobile: false,
    duration: 30,
    minPlayers: 4,
    maxPlayers: 10,
    questionType: 'short-answer',
  },
  [GameType.INITIAL_QUIZ]: {
    gameType: GameType.INITIAL_QUIZ,
    category: Category.QUIZ,
    gameCategory: TemplateCategory.QUIZ,
    needsMobile: true,
    duration: 10,
    minPlayers: 2,
    maxPlayers: 50,
    questionType: 'short-answer',
  },
  [GameType.SPEED_QUIZ]: {
    gameType: GameType.SPEED_QUIZ,
    category: Category.QUIZ,
    gameCategory: TemplateCategory.QUIZ,
    needsMobile: true,
    duration: 10,
    minPlayers: 2,
    maxPlayers: 50,
    questionType: 'short-answer',
  },
};

const GAME_TYPE_NAMES: Record<GameType, string> = {
  [GameType.OX_QUIZ]: 'OX 퀴즈',
  [GameType.FOUR_CHOICE_QUIZ]: '4지선다 퀴즈',
  [GameType.BALANCE_GAME]: '밸런스 게임',
  [GameType.LIAR_GAME]: '라이어 게임',
  [GameType.INITIAL_QUIZ]: '초성 퀴즈',
  [GameType.SPEED_QUIZ]: '스피드 퀴즈',
};

export default function EditForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = params.id as string;
  const templateId = searchParams.get('templateId');
  const gameTypeParam = searchParams.get('gameType') as GameType | null;

  const isDraftMode = gameId === 'new' && !!templateId;
  const isNewGameMode = gameId === 'new' && !!gameTypeParam && !templateId;
  const gameTypeDefaults = gameTypeParam ? GAME_TYPE_DEFAULTS[gameTypeParam] : null;

  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: gameData, isLoading: gameLoading, error: gameError } = useGame(isDraftMode || isNewGameMode ? '' : gameId);
  const { data: templateData, isLoading: templateLoading, error: templateError } = useTemplate(templateId || '');
  const createGame = useCreateGame();
  const updateGame = useUpdateGame(gameId);
  const createRoom = useCreateRoom();

  const isLoading = isNewGameMode ? false : (isDraftMode ? templateLoading : gameLoading);
  const error = isNewGameMode ? null : (isDraftMode ? templateError : gameError);
  const sourceData = isNewGameMode ? null : (isDraftMode ? templateData : (gameData as GameWithQuestions | undefined));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Selected question index: -1 = new question, null = no selection, number = question index
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  // Real-time preview data from QuestionEditPanel
  const [previewData, setPreviewData] = useState<QuestionFormData | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'grid'>('edit');
  const [isGameInfoOpen, setIsGameInfoOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Initialize new game mode with defaults
  useEffect(() => {
    if (isNewGameMode && gameTypeDefaults && gameTypeParam) {
      setTitle(`새 ${GAME_TYPE_NAMES[gameTypeParam]}`);
      setDescription('');
      setQuestions([]);
      setTimeLimit(null);
      setSoundEnabled(false);
    }
  }, [isNewGameMode, gameTypeDefaults, gameTypeParam]);

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
              videoUrl: q.videoUrl || undefined,
              audioUrl: q.audioUrl || undefined,
              mediaSettings: q.mediaSettings || undefined,
            }))
          );
        } else {
          setQuestions([]);
        }
      } else {
        const templateSource = sourceData as GameWithQuestions;
        if (templateSource.questions && templateSource.questions.length > 0) {
          setQuestions(
            templateSource.questions.map((q) => ({
              order: q.order,
              content: q.content,
              data: q.data as QuestionFormData['data'],
              imageUrl: q.imageUrl || undefined,
              videoUrl: q.videoUrl || undefined,
              audioUrl: q.audioUrl || undefined,
              mediaSettings: q.mediaSettings || undefined,
            }))
          );
        } else {
          setQuestions([]);
        }
      }
    }
  }, [sourceData, isDraftMode]);

  const handleSave = async () => {
    try {
      if (isNewGameMode) {
        if (!gameTypeDefaults) {
          alert('게임 타입을 찾을 수 없습니다.');
          return;
        }
        await createGame.mutateAsync({
          title,
          description: description || undefined,
          gameType: gameTypeDefaults.gameType,
          category: gameTypeDefaults.category,
          duration: gameTypeDefaults.duration,
          minPlayers: gameTypeDefaults.minPlayers,
          maxPlayers: gameTypeDefaults.maxPlayers,
          needsMobile: gameTypeDefaults.needsMobile,
          settings: {
            timeLimit,
            soundEnabled,
          },
          questions: questions.map((q) => ({
            order: q.order,
            content: q.content,
            data: q.data,
            imageUrl: q.imageUrl,
            videoUrl: q.videoUrl,
            audioUrl: q.audioUrl,
            mediaSettings: q.mediaSettings,
          })),
        });
      } else if (isDraftMode) {
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
            videoUrl: q.videoUrl,
            audioUrl: q.audioUrl,
            mediaSettings: q.mediaSettings,
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
            videoUrl: q.videoUrl,
            audioUrl: q.audioUrl,
            mediaSettings: q.mediaSettings,
          })),
        });
      }
      router.push('/browse');
    } catch (error) {
      logger.error('Failed to save game:', error);
      alert('게임 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSaveAndCreateRoom = async () => {
    try {
      let finalGameId = gameId;

      if (isNewGameMode) {
        if (!gameTypeDefaults) {
          alert('게임 타입을 찾을 수 없습니다.');
          return;
        }
        const newGame = await createGame.mutateAsync({
          title,
          description: description || undefined,
          gameType: gameTypeDefaults.gameType,
          category: gameTypeDefaults.category,
          duration: gameTypeDefaults.duration,
          minPlayers: gameTypeDefaults.minPlayers,
          maxPlayers: gameTypeDefaults.maxPlayers,
          needsMobile: gameTypeDefaults.needsMobile,
          settings: {
            timeLimit,
            soundEnabled,
          },
          questions: questions.map((q) => ({
            order: q.order,
            content: q.content,
            data: q.data,
            imageUrl: q.imageUrl,
            videoUrl: q.videoUrl,
            audioUrl: q.audioUrl,
            mediaSettings: q.mediaSettings,
          })),
        });
        finalGameId = newGame.id;
      } else if (isDraftMode) {
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
            videoUrl: q.videoUrl,
            audioUrl: q.audioUrl,
            mediaSettings: q.mediaSettings,
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
            videoUrl: q.videoUrl,
            audioUrl: q.audioUrl,
            mediaSettings: q.mediaSettings,
          })),
        });
      }

      const room = await createRoom.mutateAsync({
        gameId: finalGameId,
        expiresInMinutes: 60,
      });

      router.push(`/room/${room.pin}/waiting`);
    } catch (error) {
      logger.error('Failed to save and create room:', error);
      alert('게임 저장 또는 방 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleAddQuestion = () => {
    // Set to -1 to indicate new question
    setSelectedQuestion(-1);
  };

  const handleSelectQuestion = (index: number | null) => {
    setSelectedQuestion(index);
    setPreviewData(null); // Reset preview data when selection changes
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    const reordered = updated.map((q, idx) => ({ ...q, order: idx }));
    setQuestions(reordered);
    // Clear selection if deleting current question
    if (selectedQuestion === index) {
      setSelectedQuestion(null);
    } else if (selectedQuestion !== null && selectedQuestion > index) {
      // Adjust index if deleting before current selection
      setSelectedQuestion(selectedQuestion - 1);
    }
  };

  const handleSaveQuestion = (question: QuestionFormData) => {
    if (selectedQuestion === -1) {
      // Add new question
      const newQuestion = { ...question, order: questions.length };
      setQuestions([...questions, newQuestion]);
      setSelectedQuestion(questions.length); // Select the newly added question
    } else if (selectedQuestion !== null && selectedQuestion >= 0) {
      // Update existing question
      const updated = [...questions];
      updated[selectedQuestion] = { ...question, order: selectedQuestion };
      setQuestions(updated);
    }
  };

  const handleDeleteCurrentQuestion = () => {
    if (selectedQuestion !== null && selectedQuestion >= 0) {
      handleDeleteQuestion(selectedQuestion);
    }
  };

  const handleSaveSettings = (updatedQuestions: QuestionFormData[], newSoundEnabled: boolean) => {
    setQuestions(updatedQuestions);
    setSoundEnabled(newSoundEnabled);
  };

  // Check auth loading first
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // For new game mode, we don't need sourceData
  // For draft mode, we need templateData (sourceData)
  // For edit mode, we need gameData (sourceData)
  const hasRequiredData = isNewGameMode ? !!gameTypeDefaults : !!sourceData;

  if (error || !hasRequiredData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isNewGameMode
              ? '유효하지 않은 게임 타입입니다'
              : isDraftMode
                ? '템플릿을 찾을 수 없습니다'
                : '게임을 찾을 수 없습니다'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isNewGameMode
              ? '지원하지 않는 게임 타입입니다.'
              : isDraftMode
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm flex-shrink-0">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">뒤로</span>
              </button>
              <div className="h-6 w-px bg-gray-200" />

              {/* Game Info Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsGameInfoOpen(!isGameInfoOpen)}
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
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isGameInfoOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Panel */}
                {isGameInfoOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsGameInfoOpen(false)}
                    />
                    {/* Panel */}
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-20 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">게임 정보</h3>
                        <button
                          onClick={() => setIsGameInfoOpen(false)}
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
                            onChange={(e) => setTitle(e.target.value)}
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
                            onChange={(e) => setDescription(e.target.value)}
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
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${viewMode === 'edit'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">편집</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">전체보기</span>
                </button>
              </div>

              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">설정</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {viewMode === 'edit' ? (
          /* Edit Mode - Slide Deck Layout */
          <div className="h-full flex">
            {/* Left Sidebar - Slide Thumbnails (15-17% width) */}
            <div className="w-[200px] lg:w-[240px] bg-gray-100 border-r border-gray-200 flex flex-col flex-shrink-0">
              {/* Question Slides - Independent scroll area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {/* Question Slides */}
                {questions.map((question, qIndex) => {
                  const isSelected = selectedQuestion === qIndex;
                  const hasMedia = question.imageUrl || question.audioUrl || question.videoUrl;
                  const hasAnswer = question.data.type === 'balance-game'
                    ? (question.data.optionA && question.data.optionB)
                    : !!question.data.correctAnswer;

                  return (
                    <button
                      key={question.id || qIndex}
                      onClick={() => handleSelectQuestion(qIndex)}
                      className={`w-full rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${isSelected
                        ? 'border-primary-500 bg-white shadow-lg ring-2 ring-primary-500/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                    >
                      {/* Card Header */}
                      <div className={`px-3 py-2 flex items-center justify-between ${isSelected ? 'bg-primary-50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isSelected ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-600'
                            }`}>
                            {qIndex + 1}
                          </span>
                          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                            {question.data.type === 'multiple-choice' && '객관식'}
                            {question.data.type === 'true-false' && 'O/X'}
                            {question.data.type === 'short-answer' && '주관식'}
                            {question.data.type === 'balance-game' && '밸런스'}
                          </span>
                        </div>
                        {hasAnswer && (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="px-3 py-2">
                        <p className="text-xs text-gray-700 line-clamp-2 text-left min-h-[32px]">
                          {question.content || '질문을 입력하세요...'}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px]">{question.data.duration || 30}초</span>
                        </div>
                        {hasMedia && (
                          <div className="flex items-center gap-1">
                            {question.imageUrl && <Image className="w-3 h-3 text-blue-400" />}
                            {question.audioUrl && <Volume2 className="w-3 h-3 text-purple-400" />}
                            {question.videoUrl && <Video className="w-3 h-3 text-red-400" />}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Add Question Button */}
                <button
                  onClick={handleAddQuestion}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                >
                  <Plus className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">질문 추가</span>
                </button>
              </div>
            </div>

            {/* Right Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedQuestion === null && questions.length === 0 ? (
                /* Empty State - No Questions */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Plus className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">질문을 추가하세요</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    왼쪽 사이드바의 + 버튼을 클릭하거나 아래 버튼을 눌러 첫 번째 질문을 추가하세요.
                  </p>
                  <button
                    onClick={handleAddQuestion}
                    className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
                  >
                    첫 질문 추가하기
                  </button>
                </div>
              ) : selectedQuestion === null ? (
                /* No Selection State - Has Questions */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">질문을 선택하세요</h3>
                  <p className="text-gray-500 max-w-md">
                    왼쪽 사이드바에서 편집할 질문을 선택하세요.
                  </p>
                </div>
              ) : (
                /* Question Edit with Preview */
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                  {/* Preview Area (35%) */}
                  <div className="lg:w-[35%] bg-gray-900 p-4 overflow-y-auto">
                    {(() => {
                      // Use previewData for real-time updates, fallback to saved question
                      const displayQuestion = previewData ?? (selectedQuestion >= 0 ? questions[selectedQuestion] : null);
                      const questionNum = selectedQuestion >= 0 ? selectedQuestion + 1 : questions.length + 1;
                      const totalNum = questions.length || 1;

                      return (
                        <div className="flex flex-col gap-4 h-full">
                          {/* Organizer Preview (Top) */}
                          <div className="flex-1 min-h-0">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-medium">주최자 화면</div>
                            <div className="rounded-xl shadow-lg overflow-hidden h-[calc(100%-20px)]">
                              <OrganizerPreview
                                question={displayQuestion}
                                questionIndex={questionNum - 1}
                                totalQuestions={totalNum}
                              />
                            </div>
                          </div>

                          {/* Participant Preview (Bottom) */}
                          <div className="flex-1 min-h-0">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-medium">참가자 화면</div>
                            <div className="rounded-xl shadow-lg overflow-hidden h-[calc(100%-20px)]">
                              <ParticipantPreview
                                question={displayQuestion}
                                questionIndex={questionNum - 1}
                                totalQuestions={totalNum}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Edit Panel (65%) */}
                  <div className="lg:w-[65%] overflow-y-auto border-l border-gray-200">
                    <QuestionEditPanel
                      question={selectedQuestion === -1 ? null : (selectedQuestion >= 0 ? questions[selectedQuestion] : null)}
                      questionNumber={selectedQuestion === -1 ? questions.length + 1 : (selectedQuestion >= 0 ? selectedQuestion + 1 : 0)}
                      onSave={handleSaveQuestion}
                      onChange={setPreviewData}
                      onDelete={selectedQuestion >= 0 ? handleDeleteCurrentQuestion : undefined}
                      onCancel={selectedQuestion === -1 ? () => setSelectedQuestion(null) : undefined}
                      hidePreview
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Grid View Mode */
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-[1600px] mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {/* Question Cards */}
                {questions.map((question, qIndex) => (
                  <button
                    key={question.id || qIndex}
                    onClick={() => {
                      setSelectedQuestion(qIndex);
                      setViewMode('edit');
                    }}
                    className="aspect-[4/3] rounded-xl border-2 border-gray-200 bg-white hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group"
                  >
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">
                      {qIndex + 1}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(qIndex);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow text-gray-400 hover:text-error hover:bg-error-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-3 pt-10 h-full flex flex-col">
                      <p className="text-sm text-gray-700 line-clamp-3 text-left flex-1">
                        {question.content || '(질문 없음)'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        <span>
                          {question.data.type === 'multiple-choice' && '객관식'}
                          {question.data.type === 'true-false' && 'O/X'}
                          {question.data.type === 'short-answer' && '주관식'}
                          {question.data.type === 'balance-game' && '밸런스'}
                        </span>
                        <span>⏱️ {question.data.duration || 30}초</span>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Add Question Card */}
                <button
                  onClick={() => {
                    handleAddQuestion();
                    setViewMode('edit');
                  }}
                  className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <Plus className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">질문 추가</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Actions - Sticky Bottom */}
      <footer className="bg-white border-t border-gray-200 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
            >
              취소
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={((isNewGameMode || isDraftMode) ? createGame.isPending : updateGame.isPending) || !title.trim()}
                className="px-6 py-2.5 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-all duration-200 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
              >
                {((isNewGameMode || isDraftMode) ? createGame.isPending : updateGame.isPending) ? '저장 중...' : '저장'}
              </button>

              <button
                onClick={handleSaveAndCreateRoom}
                disabled={((isNewGameMode || isDraftMode) ? createGame.isPending : updateGame.isPending) || !title.trim()}
                className="px-8 py-2.5 bg-primary-500 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-primary-600 hover:scale-105 hover:shadow-lg active:scale-100 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                {((isNewGameMode || isDraftMode) ? createGame.isPending : updateGame.isPending) ? (
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
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        questions={questions}
        soundEnabled={soundEnabled}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

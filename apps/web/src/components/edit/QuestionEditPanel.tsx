'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Check, Eye, EyeOff } from 'lucide-react';
import { ParticipantView } from '@/components/game/ParticipantView';
import { OrganizerView } from '@/components/game/OrganizerView';
import { MediaEditor } from '@/components/edit/media';
import { Select } from '@/components/ui';
import type { Question, Player, LeaderboardEntry } from '@/lib/websocket/types';
import type { MediaSettings } from '@xingu/shared';

interface QuestionFormData {
  id?: string;
  order: number;
  content: string;
  data: {
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer?: string;
    duration?: number;
  };
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  mediaSettings?: MediaSettings;
}

interface QuestionEditPanelProps {
  question: QuestionFormData | null;
  questionNumber: number;
  onSave: (question: QuestionFormData) => void;
  onDelete?: () => void;
  onCancel?: () => void;
}

export function QuestionEditPanel({ question, questionNumber, onSave, onDelete, onCancel }: QuestionEditPanelProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'multiple-choice' | 'true-false' | 'short-answer'>('multiple-choice');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'participant' | 'organizer'>('participant');

  // Media state
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [mediaSettings, setMediaSettings] = useState<MediaSettings | undefined>();

  useEffect(() => {
    if (question) {
      setContent(question.content);
      setType(question.data.type);
      setOptions(question.data.options || ['', '', '', '']);
      setCorrectAnswer(question.data.correctAnswer || '');
      setDuration(question.data.duration || 30);
      // Media
      setImageUrl(question.imageUrl);
      setVideoUrl(question.videoUrl);
      setAudioUrl(question.audioUrl);
      setMediaSettings(question.mediaSettings);
    } else {
      // Reset for new question
      setContent('');
      setType('multiple-choice');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setDuration(30);
      // Media
      setImageUrl(undefined);
      setVideoUrl(undefined);
      setAudioUrl(undefined);
      setMediaSettings(undefined);
    }
  }, [question]);

  const handleSave = () => {
    const newQuestion: QuestionFormData = {
      id: question?.id,
      order: question?.order || 0,
      content,
      data: {
        type,
        options: type === 'multiple-choice' ? options : type === 'true-false' ? ['O', 'X'] : undefined,
        correctAnswer,
        duration,
      },
      imageUrl,
      videoUrl,
      audioUrl,
      mediaSettings,
    };
    onSave(newQuestion);
  };

  const handleMediaChange = (data: {
    mediaSettings?: MediaSettings;
    imageUrl?: string;
    audioUrl?: string;
    videoUrl?: string;
  }) => {
    if (data.mediaSettings !== undefined) setMediaSettings(data.mediaSettings);
    if (data.imageUrl !== undefined) setImageUrl(data.imageUrl);
    if (data.audioUrl !== undefined) setAudioUrl(data.audioUrl);
    if (data.videoUrl !== undefined) setVideoUrl(data.videoUrl);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleDeleteOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const isValid = content.trim() !== '' && (type !== 'multiple-choice' || options.some((opt) => opt.trim() !== ''));

  // Generate dummy data for preview
  const previewQuestion = useMemo<Question>(() => {
    const validOptions = type === 'multiple-choice' ? options.filter(o => o.trim()) : type === 'true-false' ? ['O', 'X'] : undefined;
    const defaultCorrectAnswer = type === 'true-false' ? 'O' : (validOptions?.[0] || '정답');

    return {
      id: 'preview',
      content: content || '질문을 입력하세요...',
      order: questionNumber - 1,
      data: {
        type,
        options: validOptions,
        correctAnswer: correctAnswer || defaultCorrectAnswer,
        duration,
      },
      imageUrl,
      videoUrl,
      audioUrl,
      mediaSettings,
    };
  }, [content, type, options, correctAnswer, duration, questionNumber, imageUrl, videoUrl, audioUrl, mediaSettings]);

  // Generate dummy players with answers (for organizer view statistics)
  const dummyPlayers = useMemo<Player[]>(() => {
    if (type === 'multiple-choice') {
      const validOptions = options.filter(o => o.trim());
      if (validOptions.length === 0) return [];

      const totalParticipants = 11;
      const players: Player[] = [];

      for (let i = 0; i < totalParticipants; i++) {
        const isCorrectAnswer = i < 6;
        const answerIndex = isCorrectAnswer
          ? validOptions.indexOf(correctAnswer) >= 0 ? validOptions.indexOf(correctAnswer) : 0
          : i % validOptions.length;

        const answer = validOptions[answerIndex] || validOptions[0];

        players.push({
          id: `dummy-${i}`,
          socketId: `socket-dummy-${i}`,
          nickname: `참가자${i + 1}`,
          score: Math.floor(Math.random() * 500),
          answers: {
            [questionNumber - 1]: {
              answer,
              isCorrect: answer === correctAnswer,
              points: answer === correctAnswer ? 100 : 0,
              responseTimeMs: Math.floor(Math.random() * 10000),
              submittedAt: new Date(),
            }
          },
          isOrganizer: false,
          joinedAt: new Date(),
        });
      }

      return players;
    } else if (type === 'true-false') {
      return Array.from({ length: 11 }, (_, i) => ({
        id: `dummy-${i}`,
        socketId: `socket-dummy-${i}`,
        nickname: `참가자${i + 1}`,
        score: Math.floor(Math.random() * 500),
        answers: {
          [questionNumber - 1]: {
            answer: i < 7 ? (correctAnswer || 'O') : (correctAnswer === 'O' ? 'X' : 'O'),
            isCorrect: i < 7,
            points: i < 7 ? 100 : 0,
            responseTimeMs: Math.floor(Math.random() * 10000),
            submittedAt: new Date(),
          }
        },
        isOrganizer: false,
        joinedAt: new Date(),
      }));
    }

    return [];
  }, [type, options, correctAnswer, questionNumber]);

  const dummyLeaderboard = useMemo<LeaderboardEntry[]>(() => {
    return dummyPlayers
      .map(p => ({ playerId: p.id, nickname: p.nickname, score: p.score, rank: 0 }))
      .sort((a, b) => b.score - a.score)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }, [dummyPlayers]);

  if (!question && !onCancel) {
    // Placeholder when no question is selected
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">질문을 선택하세요</h3>
          <p className="text-sm text-gray-500">왼쪽에서 질문을 클릭하거나<br />새 질문을 추가해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900">
          {question ? `질문 ${questionNumber} 편집` : `질문 ${questionNumber} 추가`}
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Question Content */}
          <div>
            <label htmlFor="question-content" className="block text-sm font-medium text-gray-700 mb-2">
              질문 내용 <span className="text-error">*</span>
            </label>
            <textarea
              id="question-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg min-h-[100px] resize-y transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
              placeholder="질문을 입력하세요 (예: 가장 좋아하는 음식은?)"
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              질문 유형
            </label>
            <Select
              value={type}
              onChange={(value) => setType(value as 'multiple-choice' | 'true-false' | 'short-answer')}
              options={[
                { value: 'multiple-choice', label: '객관식 (선택지)' },
                { value: 'true-false', label: 'O/X 퀴즈' },
                { value: 'short-answer', label: '주관식' },
              ]}
              fullWidth
            />
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              제한 시간 (초) <span className="text-error">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={5}
                max={300}
                className="h-11 w-32 px-4 border border-gray-300 rounded-lg bg-white text-gray-900 transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
              />
              <span className="text-sm text-gray-600">초</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDuration(15)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors cursor-pointer"
                >
                  15초
                </button>
                <button
                  type="button"
                  onClick={() => setDuration(30)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors cursor-pointer"
                >
                  30초
                </button>
                <button
                  type="button"
                  onClick={() => setDuration(60)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors cursor-pointer"
                >
                  60초
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">💡 참가자가 답변할 수 있는 시간입니다 (5~300초)</p>
          </div>

          {/* Options (Multiple Choice) */}
          {type === 'multiple-choice' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  선택지 <span className="text-error">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  선택지 추가
                </button>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(String.fromCharCode(65 + index))}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${correctAnswer === String.fromCharCode(65 + index)
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'border-gray-300 text-gray-400 hover:border-primary-300'
                        }`}
                      aria-label={`${String.fromCharCode(65 + index)}를 정답으로 선택`}
                    >
                      {correctAnswer === String.fromCharCode(65 + index) && <Check className="w-4 h-4" />}
                    </button>

                    <span className="text-sm text-gray-500 font-semibold w-6">{String.fromCharCode(65 + index)}</span>

                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="h-10 flex-1 px-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                      placeholder={`선택지 ${String.fromCharCode(65 + index)}`}
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteOption(index)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-error hover:bg-error-light rounded transition-colors cursor-pointer"
                        aria-label="선택지 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-2">💡 왼쪽 동그라미를 클릭해서 정답을 선택하세요</p>
            </div>
          )}

          {/* Correct Answer (O/X or Short Answer) */}
          {type === 'true-false' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                정답 <span className="text-error">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCorrectAnswer('O')}
                  className={`flex-1 py-4 rounded-lg border-2 font-semibold text-lg transition-all duration-200 cursor-pointer ${correctAnswer === 'O'
                    ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                    : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                >
                  ⭕ O (맞다)
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectAnswer('X')}
                  className={`flex-1 py-4 rounded-lg border-2 font-semibold text-lg transition-all duration-200 cursor-pointer ${correctAnswer === 'X'
                    ? 'bg-error border-error text-white shadow-md'
                    : 'border-gray-300 text-gray-700 hover:border-error/30 hover:bg-error-light'
                    }`}
                >
                  ❌ X (틀리다)
                </button>
              </div>
            </div>
          )}

          {type === 'short-answer' && (
            <div>
              <label htmlFor="correct-answer" className="block text-sm font-medium text-gray-700 mb-2">
                정답 <span className="text-error">*</span>
              </label>
              <input
                id="correct-answer"
                type="text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="h-11 w-full px-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                placeholder="정답을 입력하세요"
              />
            </div>
          )}

          {/* Media Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              미디어 (선택사항)
            </label>
            <MediaEditor
              mediaSettings={mediaSettings}
              imageUrl={imageUrl}
              audioUrl={audioUrl}
              videoUrl={videoUrl}
              onChange={handleMediaChange}
            />
            <p className="text-xs text-gray-500 mt-2">💡 이미지, 오디오, 비디오를 추가하고 크롭/마스킹/구간 재생을 설정할 수 있습니다</p>
          </div>

          {/* Preview Toggle Button */}
          {content.trim() && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200 hover:border-primary-300 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 font-medium text-primary-700 hover:shadow-md"
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-5 h-5" />
                  미리보기 숨기기
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  미리보기 켜기
                </>
              )}
            </button>
          )}

          {/* Preview */}
          {showPreview && content.trim() && (
            <div className="border-t border-gray-200 pt-6">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  미리보기
                </h4>

                {/* Tab Selector */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('participant')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${previewMode === 'participant'
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    👤 참가자
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('organizer')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${previewMode === 'organizer'
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    🎮 주최자
                  </button>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50" style={{ maxHeight: '400px' }}>
                {/* Scale down preview to fit */}
                <div className="transform scale-[0.5] origin-top-left" style={{ width: '200%' }}>
                  {previewMode === 'participant' ? (
                    <ParticipantView
                      currentQuestion={previewQuestion}
                      questionIndex={questionNumber - 1}
                      totalQuestions={questionNumber}
                      duration={duration}
                      currentQuestionStartedAt={new Date()}
                      selectedAnswer={null}
                      shortAnswerInput=""
                      hasAnswered={false}
                      questionEnded={false}
                      currentScore={0}
                      currentRank={undefined}
                      phase="ANSWERING"
                      onAnswerSelect={() => { }}
                      onShortAnswerChange={() => { }}
                      onShortAnswerSubmit={(e) => { e.preventDefault(); }}
                    />
                  ) : (
                    <OrganizerView
                      pin="1234"
                      currentQuestion={previewQuestion}
                      questionIndex={questionNumber - 1}
                      totalQuestions={questionNumber}
                      duration={duration}
                      currentQuestionStartedAt={new Date()}
                      players={dummyPlayers}
                      leaderboard={dummyLeaderboard}
                      showResults={true}
                      onEndQuestion={() => { }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div>
          {question && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 text-error hover:bg-error-light rounded-lg transition-colors cursor-pointer font-medium"
            >
              삭제
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
            >
              취소
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className="px-8 py-2.5 bg-primary-500 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-primary-600 hover:scale-105 active:scale-100 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

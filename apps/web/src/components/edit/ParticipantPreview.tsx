'use client';

import type { MediaSettings } from '@xingu/shared';
import { PreviewMedia } from './PreviewMedia';

interface QuestionData {
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'balance-game';
  options?: string[];
  correctAnswer?: string;
  duration?: number;
  optionA?: string;
  optionB?: string;
}

interface ParticipantPreviewProps {
  question: {
    content: string;
    data: QuestionData;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    mediaSettings?: MediaSettings | null;
  } | null;
  questionIndex: number;
  totalQuestions: number;
}

export function ParticipantPreview({
  question,
  questionIndex,
  totalQuestions,
}: ParticipantPreviewProps) {
  if (!question) {
    return (
      <div className="h-full bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center rounded-lg">
        <span className="text-xs text-gray-400">질문을 선택하세요</span>
      </div>
    );
  }

  const { content, data, mediaSettings } = question;
  const duration = data.duration || 30;

  return (
    <div className="h-full bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-3 flex flex-col overflow-hidden rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-gray-500">
          Q {questionIndex + 1} / {totalQuestions}
        </span>
        <div className="text-right">
          <div className="text-[10px] font-semibold text-primary-600">내 점수: 150점</div>
          <div className="text-[8px] text-gray-400">현재 3등</div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-bold text-primary-500">{Math.round(duration * 0.75)}초</span>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full" style={{ width: '75%' }} />
        </div>
      </div>

      {/* Question Content */}
      <h2 className="text-sm font-bold text-gray-900 text-center mb-2 line-clamp-2">
        {content || '질문을 입력하세요...'}
      </h2>

      {/* Media Preview */}
      <PreviewMedia
        mediaSettings={mediaSettings}
        imageUrl={question.imageUrl}
        videoUrl={question.videoUrl}
        audioUrl={question.audioUrl}
      />

      {/* Answer Options */}
      <div className="flex-1 overflow-hidden">
        {data.type === 'balance-game' ? (
          <BalanceAnswerPreview optionA={data.optionA} optionB={data.optionB} />
        ) : data.type === 'true-false' ? (
          <TrueFalseAnswerPreview />
        ) : data.type === 'multiple-choice' && data.options ? (
          <MultipleChoiceAnswerPreview options={data.options} />
        ) : (
          <ShortAnswerPreview />
        )}
      </div>

      {/* Help Text */}
      <div className="text-center text-[10px] text-gray-400 mt-1">
        답을 선택하세요
      </div>
    </div>
  );
}

function BalanceAnswerPreview({
  optionA,
  optionB,
}: {
  optionA?: string;
  optionB?: string;
}) {
  return (
    <div className="space-y-1">
      {/* Option A */}
      <button className="w-full p-2 rounded-lg border-2 border-red-300 bg-white hover:bg-red-50 transition-colors">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center">
            A
          </span>
          <span className="text-[11px] font-medium text-gray-700 line-clamp-1">{optionA || 'A 선택지'}</span>
        </div>
      </button>

      {/* VS Divider */}
      <div className="flex items-center justify-center">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="px-2 text-[10px] font-bold text-gray-300">VS</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Option B */}
      <button className="w-full p-2 rounded-lg border-2 border-blue-300 bg-white hover:bg-blue-50 transition-colors">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">
            B
          </span>
          <span className="text-[11px] font-medium text-gray-700 line-clamp-1">{optionB || 'B 선택지'}</span>
        </div>
      </button>
    </div>
  );
}

function TrueFalseAnswerPreview() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button className="p-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors">
        <div className="w-8 h-8 mx-auto rounded-full bg-blue-100 text-blue-600 text-lg font-bold flex items-center justify-center">
          O
        </div>
      </button>
      <button className="p-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-100 hover:border-gray-400 transition-colors">
        <div className="w-8 h-8 mx-auto rounded-full bg-gray-200 text-gray-600 text-lg font-bold flex items-center justify-center">
          X
        </div>
      </button>
    </div>
  );
}

function MultipleChoiceAnswerPreview({ options }: { options: string[] }) {
  return (
    <div className="grid grid-cols-1 gap-1">
      {options.map((option, idx) => (
        <button
          key={idx}
          className="w-full p-1.5 rounded-lg border-2 border-gray-200 bg-white hover:bg-primary-50 hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center shrink-0">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="text-[10px] font-medium text-gray-700 text-left line-clamp-1">{option}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function ShortAnswerPreview() {
  return (
    <div className="space-y-2">
      <div className="bg-white border-2 border-gray-200 rounded-lg p-2">
        <div className="text-[10px] text-gray-400 mb-1">답안 입력</div>
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
      </div>
      <button className="w-full py-1.5 px-3 bg-primary-500 text-white rounded-lg text-[10px] font-medium">
        제출
      </button>
    </div>
  );
}

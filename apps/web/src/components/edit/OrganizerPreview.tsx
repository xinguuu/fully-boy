'use client';

import type { MediaSettings } from '@xingu/shared';

interface QuestionData {
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'balance-game';
  options?: string[];
  correctAnswer?: string;
  duration?: number;
  optionA?: string;
  optionB?: string;
}

interface OrganizerPreviewProps {
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
  pin?: string;
}

export function OrganizerPreview({
  question,
  questionIndex,
  totalQuestions,
  pin = '123456',
}: OrganizerPreviewProps) {
  if (!question) {
    return (
      <div className="h-full bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center rounded-lg">
        <span className="text-xs text-gray-400">질문을 선택하세요</span>
      </div>
    );
  }

  const { content, data, imageUrl } = question;
  const duration = data.duration || 30;

  return (
    <div className="h-full bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-3 flex flex-col overflow-hidden rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-gray-500">
          Q {questionIndex + 1} / {totalQuestions}
        </span>
        <div className="bg-primary-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
          PIN: {pin}
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
      {imageUrl && (
        <div className="flex justify-center mb-2">
          <img src={imageUrl} alt="" className="max-h-12 rounded object-contain" />
        </div>
      )}

      {/* Answer Options */}
      <div className="flex-1 overflow-hidden">
        {data.type === 'balance-game' ? (
          <BalancePreview optionA={data.optionA} optionB={data.optionB} />
        ) : data.type === 'true-false' ? (
          <TrueFalsePreview correctAnswer={data.correctAnswer} />
        ) : data.type === 'multiple-choice' && data.options ? (
          <MultipleChoicePreview options={data.options} correctAnswer={data.correctAnswer} />
        ) : (
          <div className="text-center text-[10px] text-gray-400 mt-2">주관식 문제</div>
        )}
      </div>

      {/* Participants Count */}
      <div className="text-center text-[10px] text-gray-400 mt-1">
        15/20명 응답
      </div>
    </div>
  );
}

function BalancePreview({
  optionA,
  optionB,
}: {
  optionA?: string;
  optionB?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-1">
      <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
        <div className="w-6 h-6 mx-auto rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center mb-1">
          A
        </div>
        <div className="text-[10px] font-medium text-gray-700 line-clamp-2">{optionA || 'A 선택지'}</div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
        <div className="w-6 h-6 mx-auto rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center mb-1">
          B
        </div>
        <div className="text-[10px] font-medium text-gray-700 line-clamp-2">{optionB || 'B 선택지'}</div>
      </div>
    </div>
  );
}

function TrueFalsePreview({ correctAnswer }: { correctAnswer?: string }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {['O', 'X'].map((option) => {
        const isCorrect = option === correctAnswer;
        return (
          <div
            key={option}
            className={`rounded p-2 text-center ${
              isCorrect ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${
              isCorrect ? 'bg-green-500 text-white' : option === 'O' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
            }`}>
              {option}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MultipleChoicePreview({
  options,
  correctAnswer,
}: {
  options: string[];
  correctAnswer?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {options.map((option, idx) => {
        const isCorrect = option === correctAnswer;
        return (
          <div
            key={idx}
            className={`rounded p-1.5 ${
              isCorrect ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${
                isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-[10px] font-medium text-gray-700 line-clamp-1">{option}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

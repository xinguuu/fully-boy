'use client';

import { Check, Clock, Image as ImageIcon, Volume2, Video, Plus } from 'lucide-react';

export interface QuestionListItem {
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

interface QuestionListProps {
  questions: QuestionListItem[];
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string | null) => void;
  onAddQuestion: () => void;
}

export function QuestionList({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onAddQuestion,
}: QuestionListProps) {
  return (
    <div className="w-[200px] lg:w-[240px] bg-gray-100 border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Question Slides - Independent scroll area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {/* Question Slides */}
        {questions.map((question, qIndex) => {
          const isSelected = selectedQuestionId === question.id;
          const hasMedia = question.imageUrl || question.audioUrl || question.videoUrl;
          const hasAnswer = question.data.type === 'balance-game'
            ? (question.data.optionA && question.data.optionB)
            : !!question.data.correctAnswer;

          return (
            <button
              key={question.id}
              onClick={() => onSelectQuestion(question.id!)}
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
                    {question.imageUrl && <ImageIcon className="w-3 h-3 text-blue-400" />}
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
          onClick={onAddQuestion}
          className="w-full py-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
        >
          <Plus className="w-5 h-5 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">질문 추가</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Check } from 'lucide-react';

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

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuestionFormData | null;
  questionNumber: number;
  onSave: (question: QuestionFormData) => void;
}

export function QuestionModal({ isOpen, onClose, question, questionNumber, onSave }: QuestionModalProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'multiple-choice' | 'true-false' | 'short-answer'>('multiple-choice');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  useEffect(() => {
    if (question) {
      setContent(question.content);
      setType(question.data.type);
      setOptions(question.data.options || ['', '', '', '']);
      setCorrectAnswer(question.data.correctAnswer || '');
    } else {
      setContent('');
      setType('multiple-choice');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
    }
  }, [question, isOpen]);

  const handleSave = () => {
    const newQuestion: QuestionFormData = {
      id: question?.id,
      order: question?.order || 0,
      content,
      data: {
        type,
        options: type === 'multiple-choice' ? options : type === 'true-false' ? ['O', 'X'] : undefined,
        correctAnswer,
      },
      imageUrl: question?.imageUrl,
    };
    onSave(newQuestion);
    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? `질문 ${questionNumber} 편집` : `질문 ${questionNumber} 추가`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
            <label htmlFor="question-type" className="block text-sm font-medium text-gray-700 mb-2">
              질문 유형
            </label>
            <select
              id="question-type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="h-11 w-full px-4 border border-gray-300 rounded-lg bg-white text-gray-900 transition-all duration-200 ease-out hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none cursor-pointer"
            >
              <option value="multiple-choice">객관식 (선택지)</option>
              <option value="true-false">O/X 퀴즈</option>
              <option value="short-answer">주관식</option>
            </select>
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
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        correctAnswer === String.fromCharCode(65 + index)
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
                  className={`flex-1 py-4 rounded-lg border-2 font-semibold text-lg transition-all duration-200 cursor-pointer ${
                    correctAnswer === 'O'
                      ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                      : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  ⭕ O (맞다)
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectAnswer('X')}
                  className={`flex-1 py-4 rounded-lg border-2 font-semibold text-lg transition-all duration-200 cursor-pointer ${
                    correctAnswer === 'X'
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
            disabled={!isValid}
            className="px-8 py-2.5 bg-primary-500 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-primary-600 hover:scale-105 active:scale-100 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            저장
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

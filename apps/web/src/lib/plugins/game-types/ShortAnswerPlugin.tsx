import type { FrontendGameTypePlugin, ParticipantViewProps, OrganizerViewProps } from '../types';
import type { ShortAnswerQuestionData } from '@xingu/shared';
import { PluginCategory } from '@xingu/shared';

/**
 * ShortAnswer Frontend Plugin
 */
export class ShortAnswerFrontendPlugin implements FrontendGameTypePlugin {
  public readonly type = 'short-answer';
  public readonly name = 'Short Answer';
  public readonly category = PluginCategory.QUIZ;

  renderParticipantView(props: ParticipantViewProps) {
    const { shortAnswerInput, hasAnswered, onShortAnswerChange, onShortAnswerSubmit } = props;

    // Submitted state - show success card
    if (hasAnswered) {
      return (
        <div className="px-4">
          <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6 shadow-xl shadow-accent-500/30">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">제출 완료!</h3>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4">
              <p className="text-white/80 text-sm text-center mb-1">내 답변</p>
              <p className="text-white text-lg font-bold text-center truncate">{shortAnswerInput}</p>
            </div>
            <p className="text-white/70 text-sm text-center mt-4">결과를 기다려주세요...</p>
          </div>
        </div>
      );
    }

    // Input state
    return (
      <form onSubmit={onShortAnswerSubmit} className="space-y-5 px-4">
        {/* Input Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-xl border-2 border-primary-100">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <span className="text-base font-bold text-gray-800">정답을 입력하세요</span>
          </div>

          {/* Input Field */}
          <div className="relative">
            <input
              type="text"
              value={shortAnswerInput}
              onChange={(e) => onShortAnswerChange(e.target.value)}
              placeholder="정답 입력"
              className="h-16 w-full px-5 border-2 border-gray-200 rounded-xl bg-white text-gray-900 text-xl font-medium text-center placeholder:text-center placeholder:text-gray-400 transition-all duration-200 hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none"
              maxLength={100}
              autoFocus
            />
            {/* Character Counter */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className={`text-xs font-medium ${shortAnswerInput.length > 80 ? 'text-primary-500' : 'text-gray-300'}`}>
                {shortAnswerInput.length}/100
              </span>
            </div>
          </div>

          {/* Hint */}
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            띄어쓰기와 대소문자를 정확하게 입력해주세요
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!shortAnswerInput.trim()}
          className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl transition-all duration-200 hover:scale-105 active:scale-100 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
        >
          제출하기
        </button>
      </form>
    );
  }

  renderOrganizerView(props: OrganizerViewProps) {
    const { questionData, participants, showResults } = props;

    const saData = questionData as ShortAnswerQuestionData;
    const correctAnswer = saData.correctAnswer;
    const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

    const totalResponses = participants.filter((p) => p.hasAnswered).length;
    const correctCount = participants.filter((p) => p.hasAnswered && p.isCorrect).length;

    return (
      <div className="space-y-6">
        {/* Correct Answer Display - Only show when results revealed */}
        {showResults && (
          <div className="bg-accent-500 rounded-2xl p-6 shadow-xl shadow-accent-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">💡 정답</h3>
                <div className="text-2xl font-bold text-white">
                  {correctAnswers.map((ans: string, idx: number) => (
                    <span key={idx}>
                      {ans}
                      {idx < correctAnswers.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white text-accent-600 px-4 py-2 rounded-full">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-bold text-lg">정답</span>
              </div>
            </div>
          </div>
        )}

        {/* Statistics - Only show when results revealed */}
        {showResults && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">응답 통계</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 text-center p-4 bg-accent-50 rounded-xl">
                <div className="text-sm text-accent-600 mb-1">정답</div>
                <div className="text-3xl font-bold text-accent-600">{correctCount}명</div>
                <div className="text-sm text-accent-500">
                  {totalResponses > 0 ? ((correctCount / totalResponses) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div className="flex-1 text-center p-4 bg-red-50 rounded-xl">
                <div className="text-sm text-red-600 mb-1">오답</div>
                <div className="text-3xl font-bold text-red-600">{totalResponses - correctCount}명</div>
                <div className="text-sm text-red-500">
                  {totalResponses > 0 ? (((totalResponses - correctCount) / totalResponses) * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Answer Grid */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            참가자 답변 ({totalResponses}/{participants.length}명)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {participants.map((participant) => {
              // Only show correct/wrong styling when results are revealed
              const showCorrectness = showResults && participant.hasAnswered;
              const isCorrect = showCorrectness && participant.isCorrect;
              const isWrong = showCorrectness && !participant.isCorrect;

              return (
                <div
                  key={participant.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCorrect
                      ? 'border-accent-500 bg-accent-50'
                      : isWrong
                        ? 'border-red-500 bg-red-50'
                        : participant.hasAnswered
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{participant.nickname}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {participant.hasAnswered ? (
                          showResults ? (
                            <span className="font-mono">{String(participant.answer)}</span>
                          ) : (
                            <span className="text-primary-500 font-medium">응답 완료</span>
                          )
                        ) : (
                          <span className="text-gray-400">대기 중...</span>
                        )}
                      </div>
                    </div>
                    {participant.hasAnswered && (
                      <div className="ml-2 flex-shrink-0">
                        {showResults ? (
                          participant.isCorrect ? (
                            <span className="text-2xl text-accent-600">✓</span>
                          ) : (
                            <span className="text-2xl text-red-600">✗</span>
                          )
                        ) : (
                          <span className="text-lg text-primary-500">✔</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

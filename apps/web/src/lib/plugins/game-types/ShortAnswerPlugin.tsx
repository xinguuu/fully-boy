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

    return (
      <form onSubmit={onShortAnswerSubmit} className="space-y-4">
        <input
          type="text"
          value={shortAnswerInput}
          onChange={(e) => onShortAnswerChange(e.target.value)}
          disabled={hasAnswered}
          placeholder="정답을 입력하세요"
          className="h-14 w-full px-6 border-2 border-gray-300 rounded-xl bg-white text-gray-900 text-lg placeholder:text-gray-400 transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          maxLength={100}
          autoFocus
        />
        <button
          type="submit"
          disabled={hasAnswered || !shortAnswerInput.trim()}
          className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl transition-all duration-200 hover:scale-105 active:scale-100 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
        >
          {hasAnswered ? '제출 완료' : '제출하기'}
        </button>
      </form>
    );
  }

  renderOrganizerView(props: OrganizerViewProps) {
    const { questionData, participants } = props;

    const saData = questionData as ShortAnswerQuestionData;
    const correctAnswer = saData.correctAnswer;
    const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

    const totalResponses = participants.filter((p) => p.hasAnswered).length;
    const correctCount = participants.filter((p) => p.hasAnswered && p.isCorrect).length;

    return (
      <div className="space-y-6">
        {/* Correct Answer Display */}
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-900 mb-2">💡 정답</h3>
          <div className="text-lg text-green-700">
            {correctAnswers.map((ans: string, idx: number) => (
              <span key={idx}>
                <strong>{ans}</strong>
                {idx < correctAnswers.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            응답 현황 ({totalResponses}/{participants.length}명)
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">정답률</div>
              <div className="text-2xl font-bold text-green-600">
                {correctCount}/{totalResponses} (
                {totalResponses > 0 ? ((correctCount / totalResponses) * 100).toFixed(0) : 0}%)
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">오답</div>
              <div className="text-2xl font-bold text-red-600">{totalResponses - correctCount}</div>
            </div>
          </div>
        </div>

        {/* Answer Grid */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">참가자 답변</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`p-4 rounded-lg border-2 ${
                  participant.hasAnswered
                    ? participant.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{participant.nickname}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {participant.hasAnswered ? (
                        <span className="font-mono">{String(participant.answer)}</span>
                      ) : (
                        <span className="text-gray-400">대기 중...</span>
                      )}
                    </div>
                  </div>
                  {participant.hasAnswered && (
                    <div className="ml-2 flex-shrink-0">
                      {participant.isCorrect ? (
                        <span className="text-2xl text-green-600">✓</span>
                      ) : (
                        <span className="text-2xl text-red-600">✗</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

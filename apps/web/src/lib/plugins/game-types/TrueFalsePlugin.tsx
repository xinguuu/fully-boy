import type { FrontendGameTypePlugin, ParticipantViewProps, OrganizerViewProps } from '../types';
import type { TrueFalseQuestionData } from '@xingu/shared';
import { AnswerButton } from '@/components/game/AnswerButton';

/**
 * TrueFalse (O/X) Frontend Plugin
 */
export class TrueFalseFrontendPlugin implements FrontendGameTypePlugin {
  public readonly type = 'true-false';
  public readonly name = 'True/False (O/X)';

  renderParticipantView(props: ParticipantViewProps) {
    const { questionData, selectedAnswer, hasAnswered, lastAnswer, questionEnded, onAnswerSelect } = props;

    const tfData = questionData as TrueFalseQuestionData;
    const options = tfData.options || ['O', 'X'];

    return (
      <div className="grid grid-cols-1 gap-4">
        {options.map((option: string, idx: number) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = questionEnded && lastAnswer?.answer === option && lastAnswer?.isCorrect;
          const isWrong = questionEnded && lastAnswer?.answer === option && !lastAnswer?.isCorrect;

          return (
            <AnswerButton
              key={idx}
              option={option}
              index={idx}
              isSelected={isSelected}
              isCorrect={isCorrect}
              isWrong={isWrong}
              isDisabled={hasAnswered}
              showLabel={false} // O/X doesn't need numbered labels
              onClick={() => onAnswerSelect(option)}
            />
          );
        })}
      </div>
    );
  }

  renderOrganizerView(props: OrganizerViewProps) {
    const { questionData, participants, answerStats } = props;

    const tfData = questionData as TrueFalseQuestionData;
    const options = tfData.options || ['O', 'X'];
    const totalResponses = participants.filter((p) => p.hasAnswered).length;

    return (
      <div className="space-y-6">
        {/* Answer Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            응답 현황 ({totalResponses}/{participants.length}명)
          </h3>
          <div className="space-y-3">
            {options.map((option: string) => {
              const count = answerStats?.[option] || 0;
              const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;

              return (
                <div key={option}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-lg font-semibold text-gray-700">{option}</span>
                    <span className="text-sm text-gray-500">
                      {count}명 ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-300 ${
                        option === 'O' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Participant List */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">참가자 응답</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`p-3 rounded-lg border-2 ${
                  participant.hasAnswered
                    ? participant.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm truncate">{participant.nickname}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {participant.hasAnswered ? (
                    <>
                      {participant.answer}{' '}
                      {participant.isCorrect ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-600">✗</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">대기 중...</span>
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

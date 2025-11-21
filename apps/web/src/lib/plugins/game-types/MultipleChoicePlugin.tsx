import type { FrontendGameTypePlugin, ParticipantViewProps, OrganizerViewProps } from '../types';
import type { MultipleChoiceQuestionData } from '@xingu/shared';
import { PluginCategory } from '@xingu/shared';
import { AnswerButton } from '@/components/game/AnswerButton';

/**
 * MultipleChoice Frontend Plugin
 */
export class MultipleChoiceFrontendPlugin implements FrontendGameTypePlugin {
  public readonly type = 'multiple-choice';
  public readonly name = 'Multiple Choice';
  public readonly category = PluginCategory.QUIZ;

  renderParticipantView(props: ParticipantViewProps) {
    const { questionData, selectedAnswer, hasAnswered, lastAnswer, questionEnded, onAnswerSelect } = props;

    const mcData = questionData as MultipleChoiceQuestionData;
    const options = mcData.options || [];

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
              showLabel={true} // Multiple choice shows numbered labels
              onClick={() => onAnswerSelect(option)}
            />
          );
        })}
      </div>
    );
  }

  renderOrganizerView(props: OrganizerViewProps) {
    const { questionData, participants, answerStats, showResults } = props;

    const mcData = questionData as MultipleChoiceQuestionData;
    const options = mcData.options || [];
    const correctAnswer = mcData.correctAnswer;
    const totalResponses = participants.filter((p) => p.hasAnswered).length;

    return (
      <div className="space-y-6">
        {/* Answer Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option: string, idx: number) => {
            const count = answerStats?.[option] || 0;
            const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
            const isCorrect = showResults && option === correctAnswer;

            return (
              <div
                key={option}
                className={`p-6 rounded-2xl border-4 transition-all ${
                  isCorrect
                    ? 'bg-green-500 border-green-600 shadow-xl shadow-green-300'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold ${
                        isCorrect ? 'bg-white text-green-600' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className={`text-xl font-bold ${isCorrect ? 'text-white' : 'text-gray-900'}`}>
                      {option}
                    </span>
                  </div>
                  {isCorrect && (
                    <div className="flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-full">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-bold text-lg">정답</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isCorrect ? 'text-white font-semibold' : 'text-gray-600'}>
                      {count}명 응답
                    </span>
                    <span className={isCorrect ? 'text-white font-semibold' : 'text-gray-500'}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-3 ${isCorrect ? 'bg-green-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isCorrect ? 'bg-white' : 'bg-primary-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

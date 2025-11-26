import type { FrontendGameTypePlugin, ParticipantViewProps, OrganizerViewProps } from '../types';
import type { BalanceQuestionData } from '@xingu/shared';
import { PluginCategory } from '@xingu/shared';

/**
 * Balance Game Frontend Plugin
 *
 * A vs B voting game - players choose between two options.
 * Shows vote distribution after everyone has voted.
 */
export class BalanceGameFrontendPlugin implements FrontendGameTypePlugin {
  public readonly type = 'balance-game';
  public readonly name = '밸런스 게임';
  public readonly category = PluginCategory.QUIZ;

  renderParticipantView(props: ParticipantViewProps) {
    const { questionData, selectedAnswer, hasAnswered, onAnswerSelect } = props;

    const balanceData = questionData as BalanceQuestionData;
    const { optionA, optionB, imageA, imageB } = balanceData;

    return (
      <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
        {/* VS Header */}
        <div className="text-center text-2xl font-bold text-gray-400 mb-2">
          당신의 선택은?
        </div>

        {/* Option A */}
        <button
          onClick={() => onAnswerSelect('A')}
          disabled={hasAnswered}
          className={`
            relative p-6 rounded-2xl border-4 transition-all duration-300
            ${selectedAnswer === 'A'
              ? 'bg-red-500 border-red-600 text-white scale-105 shadow-xl shadow-red-300'
              : hasAnswered
                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-white border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50 active:scale-95'
            }
          `}
        >
          {imageA && (
            <div className="mb-3 flex justify-center">
              <img
                src={imageA}
                alt="Option A"
                className="max-h-32 rounded-lg object-contain"
              />
            </div>
          )}
          <div className="flex items-center justify-center gap-3">
            <span className={`
              w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold
              ${selectedAnswer === 'A' ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'}
            `}>
              A
            </span>
            <span className="text-xl font-bold">{optionA}</span>
          </div>
        </button>

        {/* VS Divider */}
        <div className="flex items-center justify-center">
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <span className="px-4 text-3xl font-black text-gray-300">VS</span>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>

        {/* Option B */}
        <button
          onClick={() => onAnswerSelect('B')}
          disabled={hasAnswered}
          className={`
            relative p-6 rounded-2xl border-4 transition-all duration-300
            ${selectedAnswer === 'B'
              ? 'bg-blue-500 border-blue-600 text-white scale-105 shadow-xl shadow-blue-300'
              : hasAnswered
                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-white border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 active:scale-95'
            }
          `}
        >
          {imageB && (
            <div className="mb-3 flex justify-center">
              <img
                src={imageB}
                alt="Option B"
                className="max-h-32 rounded-lg object-contain"
              />
            </div>
          )}
          <div className="flex items-center justify-center gap-3">
            <span className={`
              w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold
              ${selectedAnswer === 'B' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}
            `}>
              B
            </span>
            <span className="text-xl font-bold">{optionB}</span>
          </div>
        </button>

        {/* Selected feedback */}
        {hasAnswered && (
          <div className="text-center text-gray-500 mt-4 animate-pulse">
            투표 완료! 결과를 기다리는 중...
          </div>
        )}
      </div>
    );
  }

  renderOrganizerView(props: OrganizerViewProps) {
    const { questionData, participants, answerStats, showResults } = props;

    const balanceData = questionData as BalanceQuestionData;
    const { optionA, optionB, imageA, imageB, explanation } = balanceData;

    const totalResponses = participants.filter((p) => p.hasAnswered).length;
    const countA = answerStats?.['A'] || 0;
    const countB = answerStats?.['B'] || 0;
    const percentA = totalResponses > 0 ? (countA / totalResponses) * 100 : 50;
    const percentB = totalResponses > 0 ? (countB / totalResponses) * 100 : 50;

    // Determine winner (for highlighting after results)
    const winner = countA > countB ? 'A' : countB > countA ? 'B' : 'tie';

    return (
      <div className="space-y-6">
        {/* Main VS Display */}
        <div className="flex items-stretch gap-4">
          {/* Option A */}
          <div
            className={`
              flex-1 p-8 rounded-2xl border-4 transition-all duration-500
              ${showResults && winner === 'A'
                ? 'bg-red-500 border-red-600 shadow-xl shadow-red-300 scale-105'
                : 'bg-white border-red-300'
              }
            `}
          >
            <div className="text-center">
              {imageA && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={imageA}
                    alt="Option A"
                    className="max-h-40 rounded-lg object-contain"
                  />
                </div>
              )}
              <div
                className={`
                  w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl font-bold mb-4
                  ${showResults && winner === 'A' ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'}
                `}
              >
                A
              </div>
              <div className={`text-2xl font-bold mb-4 ${showResults && winner === 'A' ? 'text-white' : 'text-gray-900'}`}>
                {optionA}
              </div>

              {/* Vote count & percentage */}
              <div className={`text-4xl font-black ${showResults && winner === 'A' ? 'text-white' : 'text-red-500'}`}>
                {showResults ? `${percentA.toFixed(0)}%` : '?'}
              </div>
              <div className={`text-sm mt-1 ${showResults && winner === 'A' ? 'text-red-100' : 'text-gray-500'}`}>
                {showResults ? `${countA}명` : `${countA}명 투표 중`}
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-4xl font-black text-gray-300">VS</div>
          </div>

          {/* Option B */}
          <div
            className={`
              flex-1 p-8 rounded-2xl border-4 transition-all duration-500
              ${showResults && winner === 'B'
                ? 'bg-blue-500 border-blue-600 shadow-xl shadow-blue-300 scale-105'
                : 'bg-white border-blue-300'
              }
            `}
          >
            <div className="text-center">
              {imageB && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={imageB}
                    alt="Option B"
                    className="max-h-40 rounded-lg object-contain"
                  />
                </div>
              )}
              <div
                className={`
                  w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl font-bold mb-4
                  ${showResults && winner === 'B' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}
                `}
              >
                B
              </div>
              <div className={`text-2xl font-bold mb-4 ${showResults && winner === 'B' ? 'text-white' : 'text-gray-900'}`}>
                {optionB}
              </div>

              {/* Vote count & percentage */}
              <div className={`text-4xl font-black ${showResults && winner === 'B' ? 'text-white' : 'text-blue-500'}`}>
                {showResults ? `${percentB.toFixed(0)}%` : '?'}
              </div>
              <div className={`text-sm mt-1 ${showResults && winner === 'B' ? 'text-blue-100' : 'text-gray-500'}`}>
                {showResults ? `${countB}명` : `${countB}명 투표 중`}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar (always visible) */}
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
            style={{ width: showResults ? `${percentA}%` : '50%' }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-blue-500 to-blue-400 transition-all duration-500"
            style={{ width: showResults ? `${percentB}%` : '50%' }}
          />
          {/* Center divider */}
          <div className="absolute left-1/2 top-0 w-1 h-full bg-white transform -translate-x-1/2" />
        </div>

        {/* Tie message */}
        {showResults && winner === 'tie' && (
          <div className="text-center py-4 bg-yellow-100 rounded-xl border-2 border-yellow-300">
            <span className="text-2xl font-bold text-yellow-700">
              무승부! 양쪽 의견이 동등해요
            </span>
          </div>
        )}

        {/* Explanation (if provided and showing results) */}
        {showResults && explanation && (
          <div className="p-4 bg-gray-100 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">해설</div>
            <div className="text-gray-800">{explanation}</div>
          </div>
        )}
      </div>
    );
  }
}

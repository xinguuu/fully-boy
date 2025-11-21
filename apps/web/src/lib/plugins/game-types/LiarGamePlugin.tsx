import type {
  FrontendGameTypePlugin,
  SessionParticipantViewProps,
  SessionOrganizerViewProps,
  SettingsViewProps,
} from '../types';
import { PluginCategory } from '@xingu/shared';
import type { LiarGameSessionData, LiarGamePhase } from '@xingu/shared';

/**
 * Liar Game Frontend Plugin
 */
export class LiarGameFrontendPlugin implements FrontendGameTypePlugin {
  public readonly type = 'liar-game';
  public readonly name = 'Liar Game';
  public readonly category = PluginCategory.PARTY;

  /**
   * Render participant view (player's mobile screen)
   */
  renderSessionParticipantView(props: SessionParticipantViewProps) {
    const { sessionState, myPlayer, onAction } = props;
    const gameData = sessionState.data as unknown as LiarGameSessionData;
    const phase = sessionState.phase as LiarGamePhase;

    const isLiar = gameData.liarId === myPlayer.id;
    const myHint = gameData.hints[myPlayer.id];
    const myVote = gameData.votes[myPlayer.id];

    switch (phase) {
      case 'setup':
      case 'reveal':
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">{isLiar ? '🎭' : '🔍'}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {isLiar ? '당신은 라이어입니다!' : '당신은 시민입니다'}
              </h2>
              {!isLiar && (
                <div className="mt-6 p-6 bg-primary-100 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">제시어</p>
                  <p className="text-4xl font-bold text-primary-600">{gameData.keyword}</p>
                </div>
              )}
              {isLiar && (
                <p className="text-lg text-gray-600 mt-4">
                  다른 사람들의 힌트를 듣고<br />제시어를 추리하세요!
                </p>
              )}
            </div>
            <p className="text-gray-500">곧 힌트 단계가 시작됩니다...</p>
          </div>
        );

      case 'hints':
        const hasGivenHint = !!myHint;
        return (
          <div className="p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">힌트를 말하세요</h2>
              <p className="text-gray-600">
                {isLiar ? '들키지 않도록 조심하세요!' : '제시어와 관련된 힌트를 주세요'}
              </p>
            </div>

            {!hasGivenHint ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="hint" className="block text-sm font-medium text-gray-700 mb-2">
                    내 힌트
                  </label>
                  <input
                    id="hint"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="힌트 입력..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        onAction({
                          type: 'give-hint',
                          payload: { hint: e.currentTarget.value.trim() },
                        });
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter를 눌러 제출</p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-600 text-5xl mb-3">✓</div>
                <p className="text-lg font-semibold text-green-900 mb-1">힌트 제출 완료!</p>
                <p className="text-sm text-gray-600 mb-4">다른 참가자를 기다리는 중...</p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">내가 말한 힌트</p>
                  <p className="text-lg font-medium text-gray-900">&ldquo;{myHint}&rdquo;</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'vote':
        const hasVoted = !!myVote;
        const otherPlayers = sessionState.players.filter((p) => p.id !== myPlayer.id);

        return (
          <div className="p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">투표하기</h2>
              <p className="text-gray-600">누가 라이어일까요?</p>
            </div>

            {!hasVoted ? (
              <div className="grid grid-cols-1 gap-3">
                {otherPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() =>
                      onAction({
                        type: 'submit-vote',
                        payload: { votedPlayerId: player.id },
                      })
                    }
                    className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                  >
                    <p className="font-semibold text-gray-900">{player.nickname}</p>
                    <p className="text-sm text-gray-500">클릭하여 투표</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-600 text-5xl mb-3">✓</div>
                <p className="text-lg font-semibold text-green-900 mb-1">투표 완료!</p>
                <p className="text-sm text-gray-600">결과를 기다리는 중...</p>
              </div>
            )}
          </div>
        );

      case 'guess':
        if (!isLiar) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">라이어가 추리 중...</h2>
              <p className="text-gray-600">라이어가 제시어를 맞출 수 있을까요?</p>
            </div>
          );
        }

        return (
          <div className="p-6">
            <div className="mb-6 text-center">
              <div className="text-6xl mb-4">🎭</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">제시어를 추리하세요!</h2>
              <p className="text-gray-600">마지막 기회입니다</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="guess" className="block text-sm font-medium text-gray-700 mb-2">
                  제시어 추리
                </label>
                <input
                  id="guess"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="제시어를 입력하세요..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      onAction({
                        type: 'guess-keyword',
                        payload: { keyword: e.currentTarget.value.trim() },
                      });
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Enter를 눌러 제출</p>
              </div>
            </div>
          </div>
        );

      case 'result':
        const liarGuessed = gameData.guessedKeyword;
        const liarWon =
          liarGuessed && liarGuessed.toLowerCase().trim() === gameData.keyword.toLowerCase().trim();

        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <div className="text-6xl mb-4">{liarWon ? '🎉' : isLiar ? '😔' : '🎉'}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {liarWon ? '라이어 승리!' : '시민 승리!'}
            </h2>

            <div className="mb-6 p-6 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">제시어</p>
              <p className="text-3xl font-bold text-gray-900 mb-4">{gameData.keyword}</p>

              {liarGuessed && (
                <>
                  <p className="text-sm text-gray-600 mb-2">라이어의 추리</p>
                  <p className="text-2xl font-semibold text-primary-600">{liarGuessed}</p>
                </>
              )}
            </div>

            <div className="text-left w-full max-w-md">
              <p className="text-sm font-semibold text-gray-700 mb-2">결과</p>
              <p className="text-gray-600">
                {isLiar
                  ? liarWon
                    ? '제시어를 맞춰서 역전 승리했습니다!'
                    : '제시어를 맞추지 못했습니다.'
                  : liarWon
                    ? '라이어가 제시어를 맞췄습니다.'
                    : '라이어를 찾아냈습니다!'}
              </p>
            </div>
          </div>
        );

      default:
        return <div className="p-6 text-center text-gray-500">게임 준비 중...</div>;
    }
  }

  /**
   * Render organizer view (host's presenter screen)
   */
  renderSessionOrganizerView(props: SessionOrganizerViewProps) {
    const { sessionState, onNextPhase } = props;
    const gameData = sessionState.data as unknown as LiarGameSessionData;
    const phase = sessionState.phase as LiarGamePhase;

    const liarPlayer = sessionState.players.find((p) => p.id === gameData.liarId);

    switch (phase) {
      case 'setup':
      case 'reveal':
        return (
          <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
            <div className="text-center mb-8">
              <div className="text-8xl mb-6">🎭</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">라이어 게임</h1>
              <p className="text-xl text-gray-600 mb-8">
                참가자들이 자신의 역할을 확인하고 있습니다...
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">참가자 수</p>
              <p className="text-3xl font-bold text-gray-900">{sessionState.players.length}명</p>
            </div>

            {onNextPhase && (
              <button
                onClick={onNextPhase}
                className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-lg transition-all hover:scale-105"
              >
                힌트 단계 시작 →
              </button>
            )}
          </div>
        );

      case 'hints':
        const hintCount = Object.keys(gameData.hints).length;
        const totalPlayers = sessionState.players.length;

        return (
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">힌트 단계</h1>
              <p className="text-xl text-gray-600 mb-2">
                참가자들이 힌트를 말하고 있습니다
              </p>
              <p className="text-lg text-primary-600 font-semibold">
                {hintCount} / {totalPlayers}명 완료
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {sessionState.players.map((player) => {
                  const hint = gameData.hints[player.id];
                  const isLiar = player.id === gameData.liarId;

                  return (
                    <div
                      key={player.id}
                      className={`p-4 rounded-lg border-2 ${
                        hint
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          {player.nickname} {isLiar && '🎭'}
                        </p>
                        {hint && <span className="text-green-600">✓</span>}
                      </div>
                      {hint ? (
                        <p className="text-gray-700">&ldquo;{hint}&rdquo;</p>
                      ) : (
                        <p className="text-gray-400 text-sm">대기 중...</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {hintCount === totalPlayers && onNextPhase && (
                <div className="text-center">
                  <button
                    onClick={onNextPhase}
                    className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-lg transition-all hover:scale-105"
                  >
                    투표 단계로 →
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'vote':
        const voteCount = Object.keys(gameData.votes).length;
        const voteCounts: Record<string, number> = {};
        Object.values(gameData.votes).forEach((votedId) => {
          voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
        });

        return (
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">투표 단계</h1>
              <p className="text-xl text-gray-600 mb-2">
                참가자들이 라이어를 찾고 있습니다
              </p>
              <p className="text-lg text-primary-600 font-semibold">
                {voteCount} / {sessionState.players.length}명 투표 완료
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessionState.players.map((player) => {
                  const votes = voteCounts[player.id] || 0;
                  const isLiar = player.id === gameData.liarId;

                  return (
                    <div
                      key={player.id}
                      className={`p-4 rounded-lg border-2 ${
                        isLiar
                          ? 'bg-red-50 border-red-300'
                          : votes > 0
                            ? 'bg-yellow-50 border-yellow-300'
                            : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">
                          {player.nickname} {isLiar && '🎭'}
                        </p>
                        <span className="text-2xl font-bold text-primary-600">
                          {votes > 0 ? `${votes}표` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'guess':
        return (
          <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
            <div className="text-8xl mb-6">🎭</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">라이어의 반격!</h1>
            <p className="text-xl text-gray-600 mb-8">
              <span className="font-semibold text-primary-600">{liarPlayer?.nickname}</span>님이
              제시어를 추리하고 있습니다...
            </p>
            <div className="bg-gray-100 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">제시어</p>
              <p className="text-3xl font-bold text-gray-900">{gameData.keyword}</p>
            </div>
          </div>
        );

      case 'result':
        const liarGuessed = gameData.guessedKeyword;
        const liarWon =
          liarGuessed && liarGuessed.toLowerCase().trim() === gameData.keyword.toLowerCase().trim();

        return (
          <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
            <div className="text-8xl mb-6">{liarWon ? '🎭' : '🎉'}</div>
            <h1 className="text-5xl font-bold text-gray-900 mb-8">
              {liarWon ? '라이어 승리!' : '시민 승리!'}
            </h1>

            <div className="bg-gray-100 rounded-lg p-8 mb-8 max-w-md">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">제시어</p>
                <p className="text-4xl font-bold text-gray-900 mb-6">{gameData.keyword}</p>

                {liarGuessed && (
                  <>
                    <p className="text-sm text-gray-600 mb-2">라이어의 추리</p>
                    <p className="text-3xl font-semibold text-primary-600 mb-4">{liarGuessed}</p>
                  </>
                )}
              </div>

              <div className="border-t border-gray-300 pt-4">
                <p className="text-sm text-gray-600 mb-2">라이어</p>
                <p className="text-xl font-semibold text-gray-900">{liarPlayer?.nickname} 🎭</p>
              </div>
            </div>

            <p className="text-lg text-gray-600 text-center max-w-md">
              {liarWon
                ? '라이어가 제시어를 맞춰서 역전 승리했습니다!'
                : '시민들이 라이어를 찾아냈습니다!'}
            </p>
          </div>
        );

      default:
        return <div className="p-8 text-center text-gray-500">게임 준비 중...</div>;
    }
  }

  /**
   * Render settings view (game configuration)
   */
  renderSettingsView(props: SettingsViewProps) {
    const { settings, onChange } = props;

    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
            제시어
          </label>
          <input
            id="keyword"
            type="text"
            value={(settings.keyword as string) || ''}
            onChange={(e) => onChange({ ...settings, keyword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="예: 사과, 강아지, 여행..."
          />
          <p className="text-xs text-gray-500 mt-1">
            참가자들이 힌트를 말할 때 사용할 제시어를 입력하세요
          </p>
        </div>
      </div>
    );
  }
}

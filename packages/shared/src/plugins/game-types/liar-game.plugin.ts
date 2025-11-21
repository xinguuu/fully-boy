import {
  PluginCategory,
  type GameTypePlugin,
  type SessionState,
  type PlayerState,
  type GameAction,
} from '../../types/plugin.types';

/**
 * Liar Game Session Data
 */
export interface LiarGameSessionData extends Record<string, unknown> {
  keyword: string; // The secret keyword (e.g., "사과")
  liarId: string; // Player ID of the liar
  currentRound: number; // Current hint round (0-based)
  playerOrder: string[]; // Order of players for hints
  hints: Record<string, string>; // playerId -> hint text
  votes: Record<string, string>; // playerId -> voted playerId
  guessedKeyword?: string; // Liar's guess for the keyword
}

/**
 * Liar Game Phase
 */
export type LiarGamePhase =
  | 'setup' // Assigning roles
  | 'reveal' // Players viewing their role
  | 'hints' // Players giving hints
  | 'vote' // Voting for the liar
  | 'guess' // Liar guessing the keyword
  | 'result'; // Game over

/**
 * Liar Game Action Types
 */
export type LiarGameActionType =
  | 'start-game' // Organizer starts the game
  | 'give-hint' // Player gives a hint
  | 'submit-vote' // Player votes for who they think is the liar
  | 'guess-keyword' // Liar guesses the keyword
  | 'next-round'; // Organizer advances to next phase

/**
 * Liar Game Plugin
 *
 * Game Flow:
 * 1. Setup: Assign one player as liar, others get keyword
 * 2. Reveal: Players view their role on their device
 * 3. Hints: Each player gives a hint (30 seconds each)
 * 4. Vote: Everyone votes for who they think is the liar
 * 5. Guess: If liar gets most votes, they try to guess keyword
 * 6. Result: Show winner (liar or citizens)
 */
export class LiarGamePlugin implements GameTypePlugin {
  public readonly type = 'liar-game';
  public readonly name = 'Liar Game';
  public readonly category = PluginCategory.PARTY;

  /**
   * Process game action and return updated session state
   */
  processAction(session: SessionState, action: GameAction): SessionState {
    const { type: actionType, payload } = action;

    switch (actionType) {
      case 'start-game':
        return this.handleStartGame(session);

      case 'give-hint':
        return this.handleGiveHint(session, action.playerId, payload as { hint: string });

      case 'submit-vote':
        return this.handleSubmitVote(session, action.playerId, payload as { votedPlayerId: string });

      case 'guess-keyword':
        return this.handleGuessKeyword(session, payload as { keyword: string });

      case 'next-round':
        return this.handleNextRound(session);

      default:
        return session;
    }
  }

  /**
   * Start the game: Assign liar and keyword
   */
  private handleStartGame(session: SessionState): SessionState {
    const players = session.players;

    if (players.length < 4) {
      throw new Error('Liar Game requires at least 4 players');
    }

    // Randomly select liar
    const liarIndex = Math.floor(Math.random() * players.length);
    const liarId = players[liarIndex].id;

    // Shuffle player order for hints
    const playerOrder = [...players].sort(() => Math.random() - 0.5).map((p) => p.id);

    // Get keyword from session settings (or use default)
    const sessionSettings = session.data as Record<string, unknown>;
    const keyword = (sessionSettings.keyword as string) || '사과';

    const gameData: LiarGameSessionData = {
      keyword,
      liarId,
      currentRound: 0,
      playerOrder,
      hints: {},
      votes: {},
    };

    return {
      ...session,
      phase: 'reveal',
      data: gameData,
    };
  }

  /**
   * Handle player giving a hint
   */
  private handleGiveHint(
    session: SessionState,
    playerId: string,
    data: { hint: string }
  ): SessionState {
    const gameData = session.data as unknown as LiarGameSessionData;

    // Add hint to the record
    const updatedHints = {
      ...gameData.hints,
      [playerId]: data.hint,
    };

    // Check if all players have given hints
    const allHintsGiven = session.players.every((p: PlayerState) => updatedHints[p.id]);

    return {
      ...session,
      data: {
        ...gameData,
        hints: updatedHints,
      },
      // Auto-advance to voting phase if all hints are in
      ...(allHintsGiven && { phase: 'vote' }),
    };
  }

  /**
   * Handle player voting
   */
  private handleSubmitVote(
    session: SessionState,
    playerId: string,
    data: { votedPlayerId: string }
  ): SessionState {
    const gameData = session.data as unknown as LiarGameSessionData;

    // Record vote
    const updatedVotes = {
      ...gameData.votes,
      [playerId]: data.votedPlayerId,
    };

    // Check if all players have voted
    const allVotesIn = session.players.every((p: PlayerState) => updatedVotes[p.id]);

    // Calculate vote results
    let newPhase = session.phase;
    if (allVotesIn) {
      const voteCounts: Record<string, number> = {};
      Object.values(updatedVotes).forEach((votedId) => {
        voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
      });

      // Find player with most votes
      const maxVotes = Math.max(...Object.values(voteCounts));
      const playersWithMaxVotes = Object.keys(voteCounts).filter((id) => voteCounts[id] === maxVotes);

      // If liar got most votes (and no tie), give them a chance to guess
      if (playersWithMaxVotes.length === 1 && playersWithMaxVotes[0] === gameData.liarId) {
        newPhase = 'guess';
      } else {
        // Citizens win (liar not found or tie)
        newPhase = 'result';
      }
    }

    return {
      ...session,
      phase: newPhase,
      data: {
        ...gameData,
        votes: updatedVotes,
      },
    };
  }

  /**
   * Handle liar guessing the keyword
   */
  private handleGuessKeyword(session: SessionState, data: { keyword: string }): SessionState {
    const gameData = session.data as unknown as LiarGameSessionData;

    // Liar's guess is stored for display in the result phase
    // The frontend will handle checking if it's correct

    return {
      ...session,
      phase: 'result',
      data: {
        ...gameData,
        guessedKeyword: data.keyword,
      },
    };
  }

  /**
   * Organizer advances to next phase
   */
  private handleNextRound(session: SessionState): SessionState {
    const phase = session.phase as LiarGamePhase;

    let nextPhase: LiarGamePhase = phase;

    switch (phase) {
      case 'setup':
        nextPhase = 'reveal';
        break;
      case 'reveal':
        nextPhase = 'hints';
        break;
      case 'hints':
        nextPhase = 'vote';
        break;
      case 'vote':
        nextPhase = 'guess';
        break;
      case 'guess':
      case 'result':
        // Game over, no next phase
        nextPhase = 'result';
        break;
    }

    return {
      ...session,
      phase: nextPhase,
      round: session.round + 1,
    };
  }
}

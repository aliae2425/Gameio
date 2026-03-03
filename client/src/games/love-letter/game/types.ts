// ============================================================
// Card Types
// ============================================================

export type CardName =
  | 'guard'
  | 'priest'
  | 'baron'
  | 'handmaid'
  | 'prince'
  | 'king'
  | 'countess'
  | 'princess';

export interface LLCard {
  id: string;
  name: CardName;
  value: number;
}

// ============================================================
// Player State
// ============================================================

export interface LLPlayer {
  id: string;
  playerName: string;
  hand: LLCard[];
  discardPile: LLCard[];
  protected: boolean; // Handmaid
  active: boolean;    // Still in this round
  tokens: number;     // Tokens of affection won
}

// ============================================================
// Effects requiring UI acknowledgement
// ============================================================

export type PendingEffect =
  | { type: 'priest_reveal'; initiatorID: string; targetID: string; revealedCard: LLCard }
  | { type: 'baron_result'; initiatorID: string; targetID: string; eliminatedID: string | null };

// ============================================================
// Game State (G)
// ============================================================

export interface LastAction {
  playerID: string;
  card: LLCard;
  targetID?: string;
  guessedCard?: CardName;
  result?: string; // human-readable result description
}

export interface LoveLetterGameState {
  players: Record<string, LLPlayer>;
  playerOrder: string[];
  deck: LLCard[];
  burnedCard: LLCard | null;        // face-down set-aside card
  burnedCardVisible: LLCard | null; // face-up set-aside (2-player only)
  phase: 'playing' | 'roundEnd';
  roundWinner: string | null;
  gameWinner: string | null;
  roundNumber: number;
  tokensToWin: number;
  pendingEffect: PendingEffect | null;
  lastAction: LastAction | null;
}

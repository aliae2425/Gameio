// ============================================================
// Card Types
// ============================================================

export type Suit = 'yellow' | 'blue' | 'purple' | 'green';

export type SpecialCardType =
  | 'skull_king'
  | 'pirate'
  | 'mermaid'
  | 'escape'
  | 'scary_mary'
  | 'kraken'
  | 'white_whale';

export type PirateName = 'rascal' | 'juanita' | 'abdul' | 'eric' | 'bettina';

export interface NumberedCard {
  id: string;
  kind: 'numbered';
  suit: Suit;
  value: number;
}

export interface SpecialCard {
  id: string;
  kind: 'special';
  type: SpecialCardType;
  pirateName?: PirateName;
}

export type Card = NumberedCard | SpecialCard;

export type ScaryMaryChoice = 'pirate' | 'escape';

export interface PlayedCard {
  card: Card;
  playerId: string;
  scaryMaryChoice?: ScaryMaryChoice;
}

// ============================================================
// Player State
// ============================================================

export interface PlayerState {
  id: string;
  name: string;
  hand: Card[];
  bid: number | null;
  tricksWon: number;
  roundBonuses: number;
  totalScore: number;
}

// ============================================================
// Game State (G)
// ============================================================

export interface TrickState {
  leadPlayerId: string;
  leadSuit: Suit | null;
  cards: PlayedCard[];
  winnerId: string | null;
}

export interface RoundState {
  roundNumber: number;
  currentTrick: TrickState | null;
  completedTricks: TrickState[];
  trickLeaderId: string;
}

export interface RoundScore {
  round: number;
  scores: Record<string, {
    bid: number;
    tricksWon: number;
    bonuses: number;
    roundPoints: number;
  }>;
}

export interface SkullKingGameState {
  players: Record<string, PlayerState>;
  playerOrder: string[];
  round: RoundState | null;
  phase: 'bidding' | 'playing' | 'scoring';
  pendingScaryMary: { playerId: string; cardId: string } | null;
  pendingWhaleChange: { winnerId: string; changeAmount: number } | null;
  scoreHistory: RoundScore[];
  useKraken: boolean;
  useWhiteWhale: boolean;
}

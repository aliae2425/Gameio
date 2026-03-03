import { PlayedCard, Suit } from './types';

export interface TrickResult {
  winnerId: string;
  krakenPresent: boolean;
  piratesCapturedBySkullKing: number;
  mermaidCapturedSkullKing: boolean;
  whiteWhalePresent: boolean;
  trickSize: number;
}

function isEscapeCard(played: PlayedCard): boolean {
  const { card, scaryMaryChoice } = played;
  if (card.kind !== 'special') return false;
  if (card.type === 'escape') return true;
  if (card.type === 'scary_mary') return scaryMaryChoice === 'escape';
  return false;
}

function isPirateCard(played: PlayedCard): boolean {
  const { card, scaryMaryChoice } = played;
  if (card.kind !== 'special') return false;
  if (card.type === 'pirate') return true;
  if (card.type === 'scary_mary') return scaryMaryChoice === 'pirate';
  return false;
}

function cardRank(played: PlayedCard, leadSuit: Suit | null): number {
  const { card, scaryMaryChoice } = played;

  if (card.kind === 'special') {
    switch (card.type) {
      case 'skull_king':  return 1000;
      case 'mermaid':     return 900;
      case 'pirate':      return 800;
      case 'scary_mary':  return scaryMaryChoice === 'pirate' ? 800 : -1;
      case 'kraken':      return -1;
      case 'white_whale': return -1;
      case 'escape':      return -1;
      default:            return -1;
    }
  }

  // Carte numérotée
  if (card.suit === 'purple') return 100 + card.value; // atout
  if (leadSuit && card.suit === leadSuit) return 10 + card.value;
  return card.value - 100; // couleur non jouable
}

export function resolveTrick(cards: PlayedCard[], leadSuit: Suit | null): TrickResult {
  const krakenPresent = cards.some(p => p.card.kind === 'special' && p.card.type === 'kraken');
  const whiteWhalePresent = cards.some(p => p.card.kind === 'special' && p.card.type === 'white_whale');

  // Règle : tous fuites → le leader gagne
  const nonFugitiveCards = cards.filter(p =>
    !isEscapeCard(p) &&
    !(p.card.kind === 'special' && (p.card.type === 'kraken' || p.card.type === 'white_whale'))
  );

  if (nonFugitiveCards.length === 0) {
    return {
      winnerId: cards[0].playerId,
      krakenPresent,
      piratesCapturedBySkullKing: 0,
      mermaidCapturedSkullKing: false,
      whiteWhalePresent,
      trickSize: cards.length,
    };
  }

  // Interaction Skull King vs Sirène
  const skullKingPlayed = cards.find(p => p.card.kind === 'special' && p.card.type === 'skull_king');
  const mermaidsPlayed = cards.filter(p => p.card.kind === 'special' && p.card.type === 'mermaid');

  let winner: PlayedCard;
  let mermaidCapturedSkullKing = false;

  if (skullKingPlayed && mermaidsPlayed.length > 0) {
    // La sirène bat le Skull King
    mermaidCapturedSkullKing = true;
    winner = mermaidsPlayed[0];
  } else {
    winner = cards.reduce((best, current) =>
      cardRank(current, leadSuit) > cardRank(best, leadSuit) ? current : best
    , cards[0]);
  }

  // Compter les pirates capturés par Skull King (annulé si Kraken)
  let piratesCapturedBySkullKing = 0;
  if (
    winner.card.kind === 'special' &&
    winner.card.type === 'skull_king' &&
    !krakenPresent
  ) {
    piratesCapturedBySkullKing = cards.filter(isPirateCard).length;
  }

  return {
    winnerId: winner.playerId,
    krakenPresent,
    piratesCapturedBySkullKing,
    mermaidCapturedSkullKing,
    whiteWhalePresent,
    trickSize: cards.length,
  };
}

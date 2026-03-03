import { PlayedCard, Suit } from './types';

export interface TrickResult {
  winnerId: string;
  krakenPresent: boolean;
  piratesCapturedBySkullKing: number;
  mermaidCapturedSkullKing: boolean;
  mermaidsCapturedByPirate: number;
  bonusFourteens: number;           // +10 per yellow 14, +20 per purple 14
  whiteWhalePresent: boolean;
  whaleNumberedCount: number;        // only numbered cards (for whale bid change)
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

function isMermaidCard(played: PlayedCard): boolean {
  return played.card.kind === 'special' && played.card.type === 'mermaid';
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

  // Whale: ne compte que les cartes numérotées
  const whaleNumberedCount = cards.filter(p => p.card.kind === 'numbered').length;

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
      mermaidsCapturedByPirate: 0,
      bonusFourteens: 0,
      whiteWhalePresent,
      whaleNumberedCount,
    };
  }

  // Interaction Skull King vs Sirène
  const skullKingPlayed = cards.find(p => p.card.kind === 'special' && p.card.type === 'skull_king');
  const mermaidsPlayed = cards.filter(isMermaidCard);

  let winner: PlayedCard;
  let mermaidCapturedSkullKing = false;

  if (skullKingPlayed && mermaidsPlayed.length > 0) {
    mermaidCapturedSkullKing = true;
    winner = mermaidsPlayed[0];
  } else {
    winner = cards.reduce((best, current) =>
      cardRank(current, leadSuit) > cardRank(best, leadSuit) ? current : best
    , cards[0]);
  }

  // Pirates capturés par Skull King (annulé si Kraken)
  let piratesCapturedBySkullKing = 0;
  if (
    winner.card.kind === 'special' &&
    winner.card.type === 'skull_king' &&
    !krakenPresent
  ) {
    piratesCapturedBySkullKing = cards.filter(isPirateCard).length;
  }

  // Sirènes capturées par un Pirate
  let mermaidsCapturedByPirate = 0;
  if (isPirateCard(winner) && !krakenPresent) {
    mermaidsCapturedByPirate = cards.filter(isMermaidCard).length;
  }

  // Bonus 14 : +10 pour un 14 jaune, +20 pour un 14 violet
  let bonusFourteens = 0;
  if (!krakenPresent) {
    for (const p of cards) {
      if (p.card.kind === 'numbered' && p.card.value === 14) {
        bonusFourteens += p.card.suit === 'purple' ? 20 : 10;
      }
    }
  }

  return {
    winnerId: winner.playerId,
    krakenPresent,
    piratesCapturedBySkullKing,
    mermaidCapturedSkullKing,
    mermaidsCapturedByPirate,
    bonusFourteens,
    whiteWhalePresent,
    whaleNumberedCount,
  };
}

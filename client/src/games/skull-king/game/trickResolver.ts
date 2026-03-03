import { PlayedCard, Suit } from './types';

export interface TrickResult {
  winnerId: string;
  krakenPresent: boolean;
  piratesCapturedBySkullKing: number;
  mermaidCapturedSkullKing: boolean;
  mermaidsCapturedByPirate: number;
  bonusFourteens: number;   // +10 per yellow 14, +20 per purple 14
  whiteWhalePresent: boolean;
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

  if (card.suit === 'purple') return 100 + card.value; // atout
  if (leadSuit && card.suit === leadSuit) return 10 + card.value;
  return card.value - 100;
}

export function resolveTrick(cards: PlayedCard[], leadSuit: Suit | null): TrickResult {
  const krakenPresent = cards.some(p => p.card.kind === 'special' && p.card.type === 'kraken');
  const whiteWhalePresent = cards.some(p => p.card.kind === 'special' && p.card.type === 'white_whale');

  let winner: PlayedCard;
  let mermaidCapturedSkullKing = false;

  if (whiteWhalePresent) {
    // Baleine Blanche : gagne le joueur avec la plus haute carte numérotée,
    // toutes couleurs confondues. Les figures comptent pour 0.
    // En cas d'égalité à 0 (que des figures), c'est le leader (cards[0]) qui gagne.
    winner = cards.reduce((best, current) => {
      const bestVal = best.card.kind === 'numbered' ? best.card.value : 0;
      const curVal = current.card.kind === 'numbered' ? current.card.value : 0;
      return curVal > bestVal ? current : best;
    }, cards[0]);
  } else {
    // Règle : tous fuites → le leader gagne
    const nonFugitiveCards = cards.filter(p =>
      !isEscapeCard(p) &&
      !(p.card.kind === 'special' && (p.card.type === 'kraken' || p.card.type === 'white_whale'))
    );

    if (nonFugitiveCards.length === 0) {
      winner = cards[0];
    } else {
      const skullKingPlayed = cards.find(p => p.card.kind === 'special' && p.card.type === 'skull_king');
      const mermaidsPlayed = cards.filter(isMermaidCard);

      if (skullKingPlayed && mermaidsPlayed.length > 0) {
        // Sirène bat le Skull King
        mermaidCapturedSkullKing = true;
        winner = mermaidsPlayed[0];
      } else {
        winner = cards.reduce((best, current) =>
          cardRank(current, leadSuit) > cardRank(best, leadSuit) ? current : best
        , cards[0]);
      }
    }
  }

  // Bonus spéciaux — annulés si Kraken ou Baleine (la Baleine neutralise les figures)
  let piratesCapturedBySkullKing = 0;
  let mermaidsCapturedByPirate = 0;

  if (!krakenPresent && !whiteWhalePresent) {
    if (winner.card.kind === 'special' && winner.card.type === 'skull_king') {
      piratesCapturedBySkullKing = cards.filter(isPirateCard).length;
    }
    if (isPirateCard(winner)) {
      mermaidsCapturedByPirate = cards.filter(isMermaidCard).length;
    }
    if (mermaidCapturedSkullKing) {
      // already set above
    }
  } else {
    mermaidCapturedSkullKing = false;
  }

  // Bonus 14 : s'applique même avec la Baleine (cartes numérotées valides)
  // Annulé uniquement si Kraken
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
  };
}

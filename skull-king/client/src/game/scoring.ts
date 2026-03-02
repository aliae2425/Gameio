import { PlayerState } from './types';

export interface RoundScoreResult {
  roundPoints: number;
  bonuses: number;
}

export function calculateRoundScore(
  player: PlayerState,
  roundNumber: number
): RoundScoreResult {
  const { bid, tricksWon, roundBonuses } = player;
  if (bid === null) throw new Error('Player has no bid');

  if (bid === 0) {
    if (tricksWon === 0) {
      return { roundPoints: 10 * roundNumber, bonuses: 0 };
    } else {
      return { roundPoints: -(10 * roundNumber), bonuses: 0 };
    }
  }

  // mise > 0
  if (tricksWon === bid) {
    return { roundPoints: 20 * bid + roundBonuses, bonuses: roundBonuses };
  } else {
    return { roundPoints: -(10 * Math.abs(bid - tricksWon)), bonuses: 0 };
  }
}

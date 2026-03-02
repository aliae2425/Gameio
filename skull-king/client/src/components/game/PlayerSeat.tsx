import { PlayerState } from '../../game/types';

interface Props {
  player: PlayerState;
  isActive: boolean;
  isCurrentTurn: boolean;
}

export function PlayerSeat({ player, isActive, isCurrentTurn }: Props) {
  const cardCount = player.hand.length;

  // Bid display
  let bidDisplay: string;
  if (player.bid === null) bidDisplay = '?';
  else if (player.bid === -1) bidDisplay = '✓'; // has bid, amount hidden
  else bidDisplay = String(player.bid);

  return (
    <div className={`player-seat ${isCurrentTurn ? 'active' : ''}`}>
      {/* Mini card backs */}
      <div className="seat-cards">
        {Array.from({ length: cardCount }, (_, i) => (
          <div key={i} className="seat-card-mini" />
        ))}
        {cardCount === 0 && <span style={{ fontSize: 10, color: 'var(--c-text-dim)' }}>∅</span>}
      </div>

      {/* Name */}
      <span className="seat-name" title={player.name}>{player.name}</span>

      {/* Bid badge */}
      <span className={`seat-bid ${player.bid !== null && player.bid !== -1 ? 'revealed' : ''}`}>
        {bidDisplay !== '?' && '🎯 '}{bidDisplay}
      </span>

      {/* Tricks won (during play) */}
      {isActive && player.tricksWon > 0 && (
        <span className="seat-tricks">🃏 {player.tricksWon}</span>
      )}

      {/* Total score */}
      <span className="seat-score">{player.totalScore} pts</span>
    </div>
  );
}

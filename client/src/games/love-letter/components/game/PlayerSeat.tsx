import { LLPlayer } from '../../game/types';

interface Props {
  player: LLPlayer;
  isCurrentTurn: boolean;
  className?: string;
}

export function PlayerSeat({ player, isCurrentTurn, className = '' }: Props) {
  const cardCount = player.hand.length;

  return (
    <div className={`seat-pos ${className}`}>
      {/* Avatar */}
      <div className={`player-avatar ${isCurrentTurn ? 'active' : ''} ${!player.active ? 'eliminated' : ''}`}>
        <span style={{ fontSize: 18, fontWeight: 700, color: player.active ? '#fff' : 'rgba(255,255,255,0.3)' }}>
          {player.playerName.substring(0, 2).toUpperCase()}
        </span>

        {/* Token Badge */}
        <div className="player-bid-badge" title="Jetons d'affection">
          {'💌'.repeat(Math.min(player.tokens, 5))}{player.tokens > 5 ? `+${player.tokens - 5}` : ''}
          {player.tokens === 0 ? '0' : ''}
        </div>
      </div>

      {/* Name */}
      <div className="player-info-pill" style={{ opacity: player.active ? 1 : 0.4 }}>
        {player.active ? '' : '💀 '}{player.playerName}
        {player.protected && <span title="Protégé·e"> 🛡️</span>}
      </div>

      {/* Hand stack */}
      {cardCount > 0 && player.active && (
        <div className="opp-hand-stack" style={{ marginTop: 10 }}>
          {Array.from({ length: Math.min(cardCount, 3) }).map((_, i) => (
            <div
              key={i}
              className="opp-card-back"
              style={{ top: i * -2, left: i * 2, transform: `rotate(${i * 3 - cardCount}deg)`, zIndex: i }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

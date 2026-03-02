import { PlayerState } from '../../game/types';

interface Props {
  player: PlayerState;
  isActive: boolean;
  isCurrentTurn: boolean;
  className?: string;
}

export function PlayerSeat({ player, isActive, isCurrentTurn, className = '' }: Props) {
  const cardCount = player.hand.length;

  // Bid display
  let bidDisplay: string;
  if (player.bid === null) bidDisplay = '?';
  else if (player.bid === -1) bidDisplay = '…'; 
  else bidDisplay = String(player.bid);

  return (
    <div className={`seat-pos ${className}`}>
      {/* Avatar Circle */}
      <div className={`player-avatar ${isCurrentTurn ? 'active' : ''}`}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
          {player.name.substring(0, 2).toUpperCase()}
        </span>
        
        {/* Bid Status Badge */}
        {player.bid !== null && (
          <div className="player-bid-badge" title="Mise / Plis gagnés">
            {bidDisplay}
            {isActive && player.tricksWon > 0 && (
               <span style={{ color: 'var(--c-success)', marginLeft: 2 }}>
                 / {player.tricksWon}
               </span>
            )}
          </div>
        )}
      </div>

      {/* Name Pill */}
      <div className="player-info-pill">
        {player.name}
      </div>

      {/* Hand Stack (visual only for opponents) */}
      {cardCount > 0 && (
        <div className="opp-hand-stack" style={{ marginTop: 10 }}>
          {Array.from({ length: Math.min(cardCount, 10) }).map((_, i) => (
             <div 
               key={i} 
               className="opp-card-back" 
               style={{ 
                 top: i * -2, 
                 left: i * (className.includes('left') || className.includes('right') ? 0 : 2), /* Vertical stack for side players? No, slight fan usually */
                 transform: `rotate(${i * 2 - (cardCount*1)}deg)`,
                 zIndex: i
               }} 
             />
          ))}
        </div>
      )}
    </div>
  );
}

import { TrickState, PlayerState } from '../../game/types';
import { CardComponent } from './CardComponent';

interface Props {
  trick: TrickState | null;
  players: Record<string, PlayerState>;
}

// Random-ish rotation per player slot for visual variety
const ROTATIONS = ['-4deg', '3deg', '-2deg', '5deg', '-3deg', '2deg'];

export function CenterTrick({ trick, players }: Props) {
  if (!trick || trick.cards.length === 0) {
    return (
      <div style={{ 
        color: 'rgba(255,255,255,0.15)', 
        fontSize: 14, 
        fontWeight: 600,
        letterSpacing: 1,
        textAlign: 'center',
        border: '2px dashed rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '20px 40px'
      }}>
        TAPIS
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: 220, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Trick Cards Pile */}
      {trick.cards.map((play, idx) => {
        const player = players[play.playerId];
        const rot = (idx % 2 === 0 ? -5 : 5) + (play.card.id.charCodeAt(0) % 10 - 5);
        const offsetX = (idx - (trick.cards.length - 1) / 2) * 20; 

        return (
          <div
            key={`${play.playerId}-${play.card.id}`}
            style={{
               position: 'absolute',
               transform: `translateX(${offsetX}px) rotate(${rot}deg)`,
               zIndex: idx, 
               transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
             <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CardComponent card={play.card} />
                <div style={{
                  marginTop: 6,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                }}>
                  {player?.name ?? play.playerId}
                  {play.scaryMaryChoice && (
                    <span style={{ marginLeft: 4 }}>
                      {play.scaryMaryChoice === 'pirate' ? '🏴‍☠️' : '🏳️'}
                    </span>
                  )}
                </div>
             </div>
          </div>
        );
      })}

      {/* WINNER BANNER */}
      {trick.winnerId && (
        <div style={{
           position: 'absolute', 
           bottom: -50, 
           background: 'linear-gradient(45deg, #f1c40f, #f39c12)', 
           color: '#fff', 
           padding: '8px 16px', 
           borderRadius: 20,
           whiteSpace: 'nowrap',
           zIndex: 100,
           boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
           fontSize: 14,
           fontWeight: 'bold',
           textTransform: 'uppercase',
           animation: 'popIn 0.4s ease forwards'
        }}>
           🏆 {players[trick.winnerId]?.name ?? trick.winnerId} remporte !
        </div>
      )}
    </div>
  );
}

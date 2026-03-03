import { TrickState, PlayerState } from '../../game/types';
import { CardComponent } from './CardComponent';

interface Props {
  trick: TrickState | null;
  players: Record<string, PlayerState>;
}

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
        padding: '20px 40px',
      }}>
        TAPIS
      </div>
    );
  }

  const winnerIdx = trick.winnerId
    ? trick.cards.findIndex(p => p.playerId === trick.winnerId)
    : -1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

      {/* Cards row — each fully visible */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        {trick.cards.map((play, idx) => {
          const player = players[play.playerId];
          const isWinner = idx === winnerIdx;
          const rot = (idx % 2 === 0 ? -1.5 : 1.5);

          return (
            <div
              key={`${play.playerId}-${play.card.id}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `rotate(${rot}deg) ${isWinner ? 'translateY(-8px)' : ''}`,
                transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                filter: isWinner ? 'drop-shadow(0 0 10px rgba(241,196,15,0.8))' : undefined,
              }}
            >
              <CardComponent card={play.card} />
              <div style={{
                marginTop: 5,
                background: isWinner ? 'rgba(241,196,15,0.9)' : 'rgba(0,0,0,0.65)',
                color: isWinner ? '#1a1a00' : '#fff',
                fontSize: 11,
                fontWeight: isWinner ? 700 : 400,
                padding: '2px 8px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                maxWidth: 90,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
              }}>
                {isWinner && '🏆 '}
                {player?.name ?? play.playerId}
                {play.scaryMaryChoice && (
                  <span style={{ marginLeft: 4 }}>
                    {play.scaryMaryChoice === 'pirate' ? '🏴‍☠️' : '🏳️'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Winner banner — shown only when trick is complete */}
      {trick.winnerId && (
        <div style={{
          background: 'linear-gradient(45deg, #f1c40f, #f39c12)',
          color: '#fff',
          padding: '6px 18px',
          borderRadius: 20,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          fontSize: 13,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          animation: 'popIn 0.4s ease forwards',
        }}>
          🏆 {players[trick.winnerId]?.name ?? trick.winnerId} remporte !
        </div>
      )}
    </div>
  );
}

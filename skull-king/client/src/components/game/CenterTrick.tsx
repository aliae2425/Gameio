import { TrickState, PlayerState } from '../../game/types';
import { CardComponent } from './CardComponent';

interface Props {
  trick: TrickState | null;
  players: Record<string, PlayerState>;
}

// Random-ish rotation per player slot for visual variety
const ROTATIONS = ['-4deg', '3deg', '-2deg', '5deg', '-3deg', '2deg'];

export function CenterTrick({ trick, players }: Props) {
  if (!trick) {
    return (
      <div className="trick-label">
        En attente du premier joueur…
      </div>
    );
  }

  const playerIds = Object.keys(players);

  return (
    <div>
      {trick.winnerId && (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span className="trick-winner-badge">
            ✨ {players[trick.winnerId]?.name ?? trick.winnerId} remporte le pli !
          </span>
        </div>
      )}

      {trick.cards.length === 0 && (
        <div className="trick-label">Jouez une carte…</div>
      )}

      <div className="trick-cards-grid">
        {trick.cards.map(({ card, playerId, scaryMaryChoice }, idx) => {
          const isWinner = trick.winnerId === playerId;
          const rot = ROTATIONS[playerIds.indexOf(playerId) % ROTATIONS.length];

          return (
            <div
              key={`${playerId}-${card.id}`}
              className={`trick-card-wrap ${isWinner ? 'winner-glow' : ''}`}
              style={{ '--r': rot } as React.CSSProperties}
            >
              <CardComponent card={card} />
              <span className="trick-card-player">
                {players[playerId]?.name ?? playerId}
                {scaryMaryChoice && (
                  <span style={{ marginLeft: 3 }}>
                    {scaryMaryChoice === 'pirate' ? '🏴‍☠️' : '🏳️'}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

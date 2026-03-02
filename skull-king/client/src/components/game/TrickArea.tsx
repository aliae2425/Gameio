import { TrickState, PlayerState } from '../../game/types';
import { CardComponent } from './CardComponent';

interface Props {
  trick: TrickState | null;
  players: Record<string, PlayerState>;
}

export function TrickArea({ trick, players }: Props) {
  if (!trick) return null;

  return (
    <div className="trick-area">
      <h3>Pli en cours</h3>
      <div className="trick-cards">
        {trick.cards.map(({ card, playerId, scaryMaryChoice }) => (
          <div key={`${playerId}-${card.id}`} className="trick-played-card">
            <CardComponent card={card} />
            <span className="trick-player-name">
              {players[playerId]?.name ?? playerId}
              {scaryMaryChoice && ` (${scaryMaryChoice === 'pirate' ? '🏴‍☠️' : '🏳️'})`}
            </span>
          </div>
        ))}

        {trick.winnerId && (
          <div className="trick-winner">
            ✅ {players[trick.winnerId]?.name ?? trick.winnerId} remporte le pli !
          </div>
        )}
      </div>
    </div>
  );
}

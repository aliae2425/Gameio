import { SkullKingGameState } from '../../game/types';

interface Props {
  G: SkullKingGameState;
  playerID: string | null;
}

export function ScoreBoard({ G, playerID }: Props) {
  return (
    <div className="scoreboard">
      <h3>Scores — Manche {G.round?.roundNumber ?? 0}/10</h3>
      <table>
        <thead>
          <tr>
            <th>Joueur</th>
            <th>Mise</th>
            <th>Plis</th>
            <th>Total</th>
            {G.scoreHistory.map(rs => (
              <th key={rs.round}>M{rs.round}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {G.playerOrder.map(id => {
            const p = G.players[id];
            const isMe = id === playerID;
            return (
              <tr key={id} className={isMe ? 'me' : ''}>
                <td>{p.name}{isMe ? ' (vous)' : ''}</td>
                <td>
                  {p.bid === null ? '?' : p.bid === -1 ? '✓' : p.bid}
                </td>
                <td>{G.phase === 'playing' ? p.tricksWon : '-'}</td>
                <td><strong>{p.totalScore}</strong></td>
                {G.scoreHistory.map(rs => (
                  <td key={rs.round}>{rs.scores[id]?.roundPoints ?? ''}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

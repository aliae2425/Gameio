import { SkullKingGameState } from '../../game/types';

interface Props {
  G: SkullKingGameState;
  playerID: string | null;
  onClose?: () => void;
}

export function ScoreBoard({ G, playerID, onClose }: Props) {
  // Sort players by total score simply for display? Or keep seat order.
  // Usually scoreboard sorted by score is nice, but history table often matches seat order.
  // Let's keep G.playerOrder for consistency.
  
  return (
    <div className="scoreboard-modal">
      <div className="scoreboard-title">
        Tableau des Scores
        {onClose && (
           <button 
             onClick={onClose} 
             style={{ float: 'right', fontSize: 24, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
           >
             ×
           </button>
        )}
      </div>
      
      <table className="scoreboard-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Joueur</th>
            {G.scoreHistory.map(rs => (
              <th key={rs.round}>M{rs.round}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {G.playerOrder.map(id => {
            const p = G.players[id];
            const isMe = id === playerID;
            return (
              <tr key={id} className={isMe ? 'me' : ''}>
                <td style={{ textAlign: 'left' }}>
                  {p.name} {isMe && '(Moi)'}
                </td>
                {G.scoreHistory.map(rs => {
                    const score = rs.scores[id]?.roundPoints ?? 0;
                    return (
                      <td key={rs.round} className={score < 0 ? 'score-negative' : score > 0 ? 'score-positive' : ''}>
                        {score}
                      </td>
                    );
                })}
                <td style={{ fontWeight: 800, fontSize: 16 }}>
                   {p.totalScore}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

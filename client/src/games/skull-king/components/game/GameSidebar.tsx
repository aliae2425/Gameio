import { SkullKingGameState } from '../../game/types';

interface Props {
  G: SkullKingGameState;
  playerID: string | null;
  matchID?: string;
}

export function GameSidebar({ G, playerID, matchID }: Props) {
  const roundNum = G.round?.roundNumber ?? 0;

  return (
    <aside className="sk-sidebar side-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div className="side-header">
        <div className="side-title">Skull King</div>
        <div className="side-round">Manche {roundNum} / 10</div>
      </div>

      {/* Current round — bid / tricks */}
      <div className="side-list">
        <div style={{ padding: '0 10px 4px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#aaa', textTransform: 'uppercase' }}>
          <span>Joueur</span>
          <span style={{ display: 'flex', gap: 12 }}>
            <span>Mise</span>
            <span>Plis</span>
          </span>
        </div>

        {G.playerOrder.map(id => {
          const p = G.players[id];
          const isMe = id === playerID;
          return (
            <div key={id} className={`side-player ${isMe ? 'active' : ''}`}>
              <div className="side-p-avatar">
                {p.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="side-p-info">
                <span className="side-p-name">
                  {p.name}{isMe ? ' (Moi)' : ''}
                </span>
                <div className="side-p-stats">
                  <span style={{ fontWeight: 700, color: 'var(--c-gold)' }}>{p.totalScore} pts</span>
                  <div className="stat-box">
                    <span className="stat-val" style={{ color: '#f1c40f' }}>{p.bid ?? '-'}</span>
                    <span style={{ margin: '0 4px', color: '#555' }}>/</span>
                    <span className="stat-val" style={{ color: '#2ecc71' }}>{p.tricksWon}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Score history table — always visible, scrollable */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--c-border)', margin: '0 0' }}>
        <div style={{ padding: '6px 10px 4px', fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Historique des scores
        </div>

        {G.scoreHistory.length === 0 ? (
          <div style={{ padding: '8px 10px', fontSize: 12, color: 'var(--c-text-dim)', fontStyle: 'italic' }}>
            Aucune manche complétée
          </div>
        ) : (
          <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, padding: '0 6px 8px' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '3px 4px', color: '#888', position: 'sticky', left: 0, background: 'var(--c-surface)', whiteSpace: 'nowrap' }}>
                    Joueur
                  </th>
                  {G.scoreHistory.map(rs => (
                    <th key={rs.round} style={{ padding: '3px 4px', color: '#888', minWidth: 28, textAlign: 'center' }}>
                      M{rs.round}
                    </th>
                  ))}
                  <th style={{ padding: '3px 4px', color: 'var(--c-gold)', fontWeight: 700, textAlign: 'center', minWidth: 40 }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {G.playerOrder.map(id => {
                  const p = G.players[id];
                  const isMe = id === playerID;
                  return (
                    <tr key={id} style={{ background: isMe ? 'rgba(241,196,15,0.06)' : undefined }}>
                      <td style={{
                        textAlign: 'left', padding: '3px 4px',
                        color: isMe ? 'var(--c-gold)' : '#ccc',
                        fontWeight: isMe ? 700 : 400,
                        whiteSpace: 'nowrap', maxWidth: 64,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        position: 'sticky', left: 0,
                        background: isMe ? 'rgba(241,196,15,0.06)' : 'var(--c-surface)',
                      }}>
                        {p.name.substring(0, 9)}
                      </td>
                      {G.scoreHistory.map(rs => {
                        const score = rs.scores[id]?.roundPoints ?? 0;
                        const bonus = rs.scores[id]?.bonuses ?? 0;
                        return (
                          <td key={rs.round} style={{
                            padding: '3px 4px', textAlign: 'center',
                            color: score < 0 ? '#e74c3c' : score > 0 ? '#2ecc71' : '#666',
                          }}
                            title={bonus > 0 ? `dont ${bonus} pts de bonus` : undefined}
                          >
                            {score > 0 ? `+${score}` : score}
                          </td>
                        );
                      })}
                      <td style={{ padding: '3px 4px', textAlign: 'center', fontWeight: 800, color: 'var(--c-gold)', fontSize: 12 }}>
                        {p.totalScore}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="side-footer">
        <div style={{ fontSize: 11 }}>Game ID: <span style={{ fontFamily: 'monospace', color: '#7289da' }}>{matchID || 'LOCAL'}</span></div>
      </div>

    </aside>
  );
}

import { SkullKingGameState } from '../../game/types';
import { PLAYER_COLORS } from './ScoreChart';

interface Props {
  G: SkullKingGameState;
  playerID: string | null;
  matchID?: string;
}

export function GameSidebar({ G, playerID, matchID }: Props) {
  const roundNum = G.round?.roundNumber ?? 0;

  return (
    <aside className="sk-sidebar side-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>

      {/* Header */}
      <div className="side-header" style={{ padding: '16px 14px 12px' }}>
        <div className="side-title">Skull King</div>
        <div className="side-round">Manche {roundNum} / 10</div>
      </div>

      {/* Current round — bid / tricks per player */}
      <div style={{ padding: '0 10px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', textTransform: 'uppercase', padding: '0 2px' }}>
          <span>Joueur</span>
          <span style={{ display: 'flex', gap: 12 }}>
            <span>Mise</span>
            <span>Plis</span>
          </span>
        </div>
        {G.playerOrder.map((id, idx) => {
          const p = G.players[id];
          const isMe = id === playerID;
          const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
          return (
            <div key={id} className={`side-player ${isMe ? 'active' : ''}`}
              style={{ borderLeftColor: isMe ? color : 'transparent' }}>
              <div className="side-p-avatar" style={{ background: color, color: '#18191c', border: 'none' }}>
                {p.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="side-p-info">
                <span className="side-p-name">{p.name}{isMe ? ' (Moi)' : ''}</span>
                <div className="side-p-stats">
                  <span style={{ fontWeight: 700, color }}>{p.totalScore} pts</span>
                  <div className="stat-box">
                    <span className="stat-val" style={{ color: '#f1c40f' }}>{p.bid ?? '–'}</span>
                    <span style={{ margin: '0 4px', color: '#555' }}>/</span>
                    <span className="stat-val" style={{ color: '#2ecc71' }}>{p.tricksWon}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Score history — transposed: avatars as columns, manches as rows */}
      <div style={{
        flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        borderTop: '1px solid #2a2a2a',
      }}>
        <div style={{ padding: '6px 10px 4px', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Historique
        </div>

        {G.scoreHistory.length === 0 ? (
          <div style={{ padding: '6px 12px', fontSize: 11, color: '#444', fontStyle: 'italic' }}>
            Aucune manche complétée
          </div>
        ) : (
          <div style={{ overflowY: 'auto', overflowX: 'auto', flex: 1, padding: '0 8px 8px' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '3px 4px 5px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 10, width: 22 }}>
                    M
                  </th>
                  {G.playerOrder.map((id, idx) => {
                    const p = G.players[id];
                    const isMe = id === playerID;
                    const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
                    return (
                      <th key={id} style={{ padding: '2px 3px 5px', textAlign: 'center' }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto',
                          fontSize: 9, fontWeight: 800, color: '#18191c',
                          outline: isMe ? '2px solid rgba(255,255,255,0.7)' : 'none',
                          outlineOffset: 1,
                        }} title={p.name}>
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {G.scoreHistory.map((rs) => (
                  <tr key={rs.round} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '3px 4px', color: '#555', fontWeight: 600, fontSize: 10 }}>
                      {rs.round}
                    </td>
                    {G.playerOrder.map((id) => {
                      const score = rs.scores[id]?.roundPoints ?? 0;
                      const bonus = rs.scores[id]?.bonuses ?? 0;
                      return (
                        <td key={id}
                          style={{
                            padding: '3px 3px', textAlign: 'center',
                            color: score < 0 ? '#e74c3c' : score > 0 ? '#2ecc71' : '#444',
                            fontWeight: score !== 0 ? 600 : 400,
                          }}
                          title={bonus > 0 ? `dont +${bonus} pts bonus` : undefined}
                        >
                          {score > 0 ? `+${score}` : score === 0 ? '·' : score}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Total row */}
                <tr style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                  <td style={{ padding: '4px 4px', color: '#888', fontSize: 10, fontWeight: 700 }}>Σ</td>
                  {G.playerOrder.map((id, idx) => {
                    const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
                    const isMe = id === playerID;
                    return (
                      <td key={id} style={{
                        padding: '4px 3px', textAlign: 'center',
                        fontWeight: 800, fontSize: 12,
                        color: isMe ? color : '#ccc',
                      }}>
                        {G.players[id].totalScore}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="side-footer" style={{ padding: '8px 14px' }}>
        <div style={{ fontSize: 10, color: '#444' }}>
          ID: <span style={{ fontFamily: 'monospace', color: '#555' }}>{matchID || 'LOCAL'}</span>
        </div>
      </div>

    </aside>
  );
}

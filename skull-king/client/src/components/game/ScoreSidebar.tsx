import { useState } from 'react';
import { SkullKingGameState } from '../../game/types';

interface Props {
  G: SkullKingGameState;
  playerID: string | null;
}

export function ScoreSidebar({ G, playerID }: Props) {
  const [open, setOpen] = useState(false);

  const roundNum = G.round?.roundNumber ?? 0;
  const lastRound = G.scoreHistory[G.scoreHistory.length - 1];

  return (
    <>
      {/* Burger button — always visible */}
      <button className="burger-btn" onClick={() => setOpen(true)} title="Scores">
        ☰
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <>
          <div className="sidebar-overlay" onClick={() => setOpen(false)} />
          <aside className="sidebar">
            <div className="sidebar-header">
              <span className="sidebar-title">Scores — Manche {roundNum}/10</span>
              <button className="sidebar-close" onClick={() => setOpen(false)}>×</button>
            </div>

            <div className="sidebar-body">
              {/* Current round summary */}
              {G.playerOrder.map(id => {
                const p = G.players[id];
                const isMe = id === playerID;
                const lastScore = lastRound?.scores[id];
                const pts = lastScore?.roundPoints;
                const positive = pts !== undefined && pts > 0;
                const negative = pts !== undefined && pts < 0;

                return (
                  <div key={id} className={`score-player-card ${isMe ? 'me' : ''}`}>
                    <div className="score-player-header">
                      <span className="score-player-name">
                        {p.name}{isMe ? ' 👤' : ''}
                      </span>
                      <span className="score-player-total">{p.totalScore}</span>
                    </div>

                    <div className="score-player-detail">
                      {G.phase !== 'bidding' && (
                        <span>Mise : <strong>{p.bid ?? '?'}</strong></span>
                      )}
                      {G.phase === 'playing' && (
                        <span>Plis : <strong>{p.tricksWon}</strong></span>
                      )}
                      {p.roundBonuses > 0 && (
                        <span>Bonus : <strong>+{p.roundBonuses}</strong></span>
                      )}
                    </div>

                    {lastScore && (
                      <div className={`score-player-result ${positive ? 'score-positive' : negative ? 'score-negative' : ''}`}>
                        M{lastRound.round} : {pts !== undefined && pts > 0 ? '+' : ''}{pts} pts
                        {lastScore.bonuses > 0 && ` (dont +${lastScore.bonuses} bonus)`}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* History table */}
              {G.scoreHistory.length > 0 && (
                <div className="score-history">
                  <h4>Historique</h4>
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Joueur</th>
                        {G.scoreHistory.map(rs => (
                          <th key={rs.round}>M{rs.round}</th>
                        ))}
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {G.playerOrder.map(id => {
                        const isMe = id === playerID;
                        return (
                          <tr key={id} className={isMe ? 'me-row' : ''}>
                            <td>{G.players[id].name}</td>
                            {G.scoreHistory.map(rs => {
                              const pts = rs.scores[id]?.roundPoints;
                              return (
                                <td key={rs.round} style={{ color: pts === undefined ? undefined : pts > 0 ? 'var(--c-success)' : pts < 0 ? 'var(--c-danger)' : undefined }}>
                                  {pts !== undefined ? (pts > 0 ? `+${pts}` : pts) : '-'}
                                </td>
                              );
                            })}
                            <td><strong>{G.players[id].totalScore}</strong></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}

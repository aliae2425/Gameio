import { SkullKingGameState } from '../../game/types';

interface Props {
  G: SkullKingGameState;
  playerID: string | null;
  matchID?: string;
  onToggleScore: () => void;
}

export function GameSidebar({ G, playerID, matchID, onToggleScore }: Props) {
  const roundNum = G.round?.roundNumber ?? 0;
  
  return (
    <aside className="sk-sidebar side-panel">
      <div className="side-header">
        <div className="side-title">Skull King</div>
        <div className="side-round">Manche {roundNum} / 10</div>
      </div>

      <div className="side-list">
        <div style={{ padding: '0 10px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#aaa', textTransform: 'uppercase' }}>
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
                  {p.name} {isMe && '(Moi)'}
                </span>
                <div className="side-p-stats">
                  <span>{p.totalScore} pts</span>
                  
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

      <div className="side-footer">
        <button 
          onClick={onToggleScore}
          style={{ 
            width: '100%', 
            marginBottom: 10, 
            background: 'var(--c-surface2)', 
            border: '1px solid var(--c-border)',
            color: 'var(--c-gold)',
            padding: '8px 0',
            fontSize: 12,
            textTransform: 'uppercase',
            fontWeight: 700
          }}
        >
          Voir les scores 📊
        </button>
        <div>Game ID: <span style={{ fontFamily: 'monospace', color: '#7289da' }}>{matchID || 'LOCAL'}</span></div>
      </div>
    </aside>
  );
}

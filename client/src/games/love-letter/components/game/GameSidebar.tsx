import { LoveLetterGameState } from '../../game/types';

interface Props {
  G: LoveLetterGameState;
  playerID: string | null;
  matchID?: string;
}

export function GameSidebar({ G, playerID, matchID }: Props) {
  return (
    <div className="game-sidebar">
      <div className="sidebar-title">💌 Love Letter</div>

      <div className="sidebar-section">
        <div className="sidebar-label">Manche {G.roundNumber}</div>
        <div style={{ color: 'var(--c-text-dim)', fontSize: 12, marginTop: 2 }}>
          {G.deck.length} carte{G.deck.length > 1 ? 's' : ''} restante{G.deck.length > 1 ? 's' : ''}
        </div>
        <div style={{ color: 'var(--c-text-dim)', fontSize: 12 }}>
          Objectif : {G.tokensToWin} 💌
        </div>
      </div>

      <div className="sidebar-section">
        {G.playerOrder.map(id => {
          const p = G.players[id];
          const isMe = id === playerID;
          const tokens = p.tokens;
          return (
            <div
              key={id}
              className={`sidebar-player ${isMe ? 'sidebar-player-me' : ''} ${!p.active ? 'sidebar-player-out' : ''}`}
            >
              <span className="sidebar-player-name">
                {!p.active && '💀 '}
                {p.playerName}
                {p.protected && ' 🛡️'}
                {isMe && ' (vous)'}
              </span>
              <span className="sidebar-player-score">
                {'💌'.repeat(Math.min(tokens, 7))}{tokens === 0 ? '—' : ''}
              </span>
            </div>
          );
        })}
      </div>

      {G.burnedCardVisible && (
        <div className="sidebar-section">
          <div className="sidebar-label">Carte retirée (visible)</div>
          <div style={{ color: 'var(--c-gold)', fontSize: 14 }}>
            {G.burnedCardVisible.value} — {G.burnedCardVisible.name}
          </div>
        </div>
      )}

      {G.lastAction && (
        <div className="sidebar-section">
          <div className="sidebar-label">Dernière action</div>
          <div style={{ color: 'var(--c-text-dim)', fontSize: 12, lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--c-gold)' }}>
              {G.players[G.lastAction.playerID]?.playerName}
            </strong>{' '}
            joue{' '}
            <strong>{G.lastAction.card.name}</strong>
            {G.lastAction.targetID && (
              <> sur <strong>{G.players[G.lastAction.targetID]?.playerName}</strong></>
            )}
            {G.lastAction.result && (
              <div style={{ color: 'var(--c-text-muted)', marginTop: 4 }}>{G.lastAction.result}</div>
            )}
          </div>
        </div>
      )}

      {matchID && (
        <div className="sidebar-section">
          <div className="sidebar-label" style={{ fontSize: 10 }}>Match #{matchID.slice(-6)}</div>
        </div>
      )}
    </div>
  );
}

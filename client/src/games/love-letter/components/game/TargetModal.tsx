import { LLPlayer } from '../../game/types';

interface Props {
  players: LLPlayer[];
  currentPlayerID: string;
  onSelect: (targetID: string) => void;
  onCancel: () => void;
  canTargetSelf?: boolean;
}

export function TargetModal({ players, currentPlayerID, onSelect, onCancel, canTargetSelf = false }: Props) {
  const targets = players.filter(p =>
    p.active &&
    !p.protected &&
    (canTargetSelf || p.id !== currentPlayerID)
  );

  // If all others are protected, allow selecting any active other player (no effect)
  const fallback = players.filter(p => p.active && p.id !== currentPlayerID);
  const displayTargets = targets.length > 0 ? targets : fallback;

  return (
    <div className="bid-overlay" style={{ pointerEvents: 'auto' }}>
      <div className="bid-panel" style={{ maxWidth: 320 }}>
        <div className="bid-label">Choisir une cible</div>
        {displayTargets.length === 0 ? (
          <div style={{ color: 'var(--c-text-dim)', marginBottom: 16 }}>
            Aucune cible disponible
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {displayTargets.map(p => (
              <button
                key={p.id}
                className="bid-btn"
                onClick={() => onSelect(p.id)}
                style={{ padding: '10px 24px', fontSize: 15 }}
              >
                {p.playerName} {p.protected ? '🛡️' : ''}
              </button>
            ))}
            {canTargetSelf && (
              <button
                className="bid-btn"
                onClick={() => onSelect(currentPlayerID)}
                style={{ padding: '10px 24px', fontSize: 15, borderColor: 'var(--c-gold)' }}
              >
                Vous-même
              </button>
            )}
          </div>
        )}
        <button onClick={onCancel} style={{ color: 'var(--c-text-dim)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
          ← Annuler
        </button>
      </div>
    </div>
  );
}

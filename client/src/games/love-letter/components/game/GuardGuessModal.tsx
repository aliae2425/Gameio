import { CardName } from '../../game/types';

const GUESSABLE: { name: CardName; label: string; icon: string; value: number }[] = [
  { name: 'priest',   label: 'Prêtre',   icon: '🙏', value: 2 },
  { name: 'baron',    label: 'Baron',    icon: '⚖️', value: 3 },
  { name: 'handmaid', label: 'Servante', icon: '🛡️', value: 4 },
  { name: 'prince',   label: 'Prince',   icon: '👑', value: 5 },
  { name: 'king',     label: 'Roi',      icon: '♟️', value: 6 },
  { name: 'countess', label: 'Comtesse', icon: '💃', value: 7 },
  { name: 'princess', label: 'Princesse',icon: '👸', value: 8 },
];

interface Props {
  targetName: string;
  onGuess: (card: CardName) => void;
  onCancel: () => void;
}

export function GuardGuessModal({ targetName, onGuess, onCancel }: Props) {
  return (
    <div className="bid-overlay" style={{ pointerEvents: 'auto' }}>
      <div className="bid-panel" style={{ maxWidth: 360 }}>
        <div className="bid-label">Deviner la carte de {targetName}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          {GUESSABLE.map(c => (
            <button
              key={c.name}
              className="bid-btn"
              onClick={() => onGuess(c.name)}
              style={{ padding: '8px 16px', fontSize: 14, minWidth: 110 }}
            >
              {c.icon} {c.label} <span style={{ opacity: 0.6, fontSize: 12 }}>({c.value})</span>
            </button>
          ))}
        </div>
        <button onClick={onCancel} style={{ color: 'var(--c-text-dim)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
          ← Annuler
        </button>
      </div>
    </div>
  );
}

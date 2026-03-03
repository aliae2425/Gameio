import { PendingEffect, LoveLetterGameState } from '../../game/types';

interface Props {
  effect: Extract<PendingEffect, { type: 'baron_result' }>;
  G: LoveLetterGameState;
  playerID: string | null;
  onAcknowledge: () => void;
}

export function BaronResultModal({ effect, G, playerID, onAcknowledge }: Props) {
  const isInitiator = playerID === effect.initiatorID;

  if (!isInitiator) return null;

  const initiatorName = G.players[effect.initiatorID]?.playerName ?? effect.initiatorID;
  const targetName = G.players[effect.targetID]?.playerName ?? effect.targetID;

  let resultText: string;
  if (effect.eliminatedID === null) {
    resultText = `Égalité — personne n'est éliminé !`;
  } else if (effect.eliminatedID === effect.initiatorID) {
    resultText = `Vous avez perdu ! ${targetName} avait une carte plus haute.`;
  } else {
    resultText = `${targetName} est éliminé·e !`;
  }

  return (
    <div className="bid-overlay" style={{ pointerEvents: 'auto' }}>
      <div className="bid-panel" style={{ maxWidth: 320, textAlign: 'center' }}>
        <div className="bid-label">⚖️ Baron — Comparaison</div>
        <p style={{ color: 'var(--c-text-muted)', marginBottom: 8, fontSize: 14 }}>
          {initiatorName} vs {targetName}
        </p>
        <p style={{ color: 'var(--c-gold)', fontSize: 16, marginBottom: 20 }}>
          {resultText}
        </p>
        <button className="bid-btn" onClick={onAcknowledge} style={{ padding: '10px 32px' }}>
          Continuer
        </button>
      </div>
    </div>
  );
}

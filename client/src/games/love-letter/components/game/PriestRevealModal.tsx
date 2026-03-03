import { PendingEffect } from '../../game/types';
import { CardComponent } from './CardComponent';

interface Props {
  effect: Extract<PendingEffect, { type: 'priest_reveal' }>;
  targetName: string;
  isInitiator: boolean;
  onAcknowledge: () => void;
}

export function PriestRevealModal({ effect, targetName, isInitiator, onAcknowledge }: Props) {
  if (!isInitiator) {
    return (
      <div className="bid-overlay" style={{ pointerEvents: 'auto' }}>
        <div className="bid-panel" style={{ maxWidth: 300, textAlign: 'center' }}>
          <div className="bid-label">🙏 Prêtre</div>
          <p style={{ color: 'var(--c-text-dim)', marginBottom: 16 }}>
            Un joueur regarde votre main…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bid-overlay" style={{ pointerEvents: 'auto' }}>
      <div className="bid-panel" style={{ maxWidth: 300, textAlign: 'center' }}>
        <div className="bid-label">🙏 Prêtre — Révélation</div>
        <p style={{ color: 'var(--c-text-dim)', marginBottom: 16 }}>
          {targetName} a en main :
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <CardComponent card={effect.revealedCard} showDesc />
        </div>
        <button className="bid-btn" onClick={onAcknowledge} style={{ padding: '10px 32px' }}>
          Compris
        </button>
      </div>
    </div>
  );
}

interface Props {
  roundNumber: number;
  handSize: number;
  currentBid: number | null;
  onBid: (bid: number) => void;
  isActive: boolean;
}

export function BiddingPanel({ roundNumber, handSize, currentBid, onBid, isActive }: Props) {
  // Bid placed — waiting for others
  if (currentBid !== null) {
    return (
      <div className="sk-my-area">
        <div className="bid-waiting">
          <span className="bid-placed-value">{currentBid}</span>
          Vous avez misé {currentBid} pli{currentBid > 1 ? 's' : ''} — en attente des autres joueurs…
        </div>
      </div>
    );
  }

  // Not yet active
  if (!isActive) {
    return (
      <div className="sk-my-area">
        <div className="bid-waiting">En attente…</div>
      </div>
    );
  }

  // Bid selection overlay
  return (
    <div className="bid-overlay">
      <div className="bid-panel">
        <div className="bid-title">
          ⚓ Manche {roundNumber} — Combien de plis allez-vous remporter ?
        </div>
        <div className="bid-buttons">
          {Array.from({ length: handSize + 1 }, (_, i) => (
            <button key={i} className="bid-btn" onClick={() => onBid(i)}>
              {i}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Props {
  changeAmount: number;
  currentBid: number;
  onChoice: (direction: 'up' | 'down') => void;
}

export function WhaleModal({ changeAmount, currentBid, onChoice }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>🐋 Baleine Blanche</h2>
        <p>
          Vous avez remporté le pli de la Baleine Blanche !<br />
          Vous devez modifier votre mise de ±{changeAmount}.
        </p>
        <p>Mise actuelle : <strong>{currentBid}</strong></p>
        <div className="modal-buttons">
          <button className="btn-up" onClick={() => onChoice('up')}>
            +{changeAmount} → {currentBid + changeAmount}
          </button>
          <button className="btn-down" onClick={() => onChoice('down')}>
            -{changeAmount} → {Math.max(0, currentBid - changeAmount)}
          </button>
        </div>
      </div>
    </div>
  );
}

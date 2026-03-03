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
      <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '20px 40px',
          borderRadius: 16,
          backdropFilter: 'blur(4px)',
          textAlign: 'center',
          zIndex: 40,
          border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Mise validée : {currentBid}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
           En attente des autres joueurs...
        </div>
      </div>
    );
  }

  // Not yet active (should rarely happen in simultaneous bidding)
  if (!isActive) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        color: 'rgba(255,255,255,0.5)'
      }}>
        En attente…
      </div>
    );
  }

  // Bid selection overlay
  return (
    <div className="bid-overlay">
      <div className="bid-panel">
        <div className="bid-title" style={{ fontSize: 20, marginBottom: 20, fontWeight: 800, color: '#fff' }}>
          ⚓ Manche {roundNumber} <br/> <span style={{fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.7)'}}>Combien de plis allez-vous remporter ?</span>
        </div>
        
        <div className="bid-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {Array.from({ length: handSize + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => onBid(i)}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                 e.currentTarget.style.background = '#f1c40f'; 
                 e.currentTarget.style.borderColor = '#f1c40f';
                 e.currentTarget.style.color = '#000';
                 e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                 e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; 
                 e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                 e.currentTarget.style.color = '#fff';
                 e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

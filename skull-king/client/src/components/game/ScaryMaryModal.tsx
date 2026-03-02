import { ScaryMaryChoice } from '../../game/types';

interface Props {
  onChoice: (choice: ScaryMaryChoice) => void;
}

export function ScaryMaryModal({ onChoice }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>💀 Scary Mary</h2>
        <p>Comment voulez-vous jouer cette carte ?</p>
        <div className="modal-buttons">
          <button className="btn-pirate" onClick={() => onChoice('pirate')}>
            🏴‍☠️ Pirate
          </button>
          <button className="btn-escape" onClick={() => onChoice('escape')}>
            🏳️ Fuite
          </button>
        </div>
      </div>
    </div>
  );
}

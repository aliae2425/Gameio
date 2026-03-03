import { LLCard, CardName } from '../../game/types';

const CARD_CFG: Record<CardName, { icon: string; label: string; bg: string; border: string; textColor: string; desc: string }> = {
  guard:    { icon: '⚔️',  label: 'Garde',     bg: '#ffffff', border: '#7f8c8d', textColor: '#2c3e50', desc: 'Devinez la carte d\'un joueur' },
  priest:   { icon: '🙏',  label: 'Prêtre',    bg: '#ffffff', border: '#2980b9', textColor: '#1a5276', desc: 'Regardez la main d\'un joueur' },
  baron:    { icon: '⚖️',  label: 'Baron',     bg: '#ffffff', border: '#c0392b', textColor: '#922b21', desc: 'Comparez vos mains' },
  handmaid: { icon: '🛡️',  label: 'Servante',  bg: '#ffffff', border: '#27ae60', textColor: '#1e8449', desc: 'Protection jusqu\'à votre prochain tour' },
  prince:   { icon: '👑',  label: 'Prince',    bg: '#ffffff', border: '#f39c12', textColor: '#9a7d0a', desc: 'Forcez un joueur à défausser' },
  king:     { icon: '♟️',  label: 'Roi',       bg: '#2c3e50', border: '#f1c40f', textColor: '#f1c40f', desc: 'Échangez vos mains' },
  countess: { icon: '💃',  label: 'Comtesse',  bg: '#ffffff', border: '#8e44ad', textColor: '#7d3c98', desc: 'Jouez-la si vous avez Roi ou Prince' },
  princess: { icon: '👸',  label: 'Princesse', bg: '#ffffff', border: '#e91e8c', textColor: '#c0186e', desc: 'Vous êtes éliminé·e si défaussée' },
};

interface Props {
  card: LLCard | { id: string; name: 'hidden'; value: 0 };
  onClick?: () => void;
  disabled?: boolean;
  back?: boolean;
  showDesc?: boolean;
  className?: string;
}

export function CardComponent({ card, onClick, disabled, back, showDesc, className = '' }: Props) {
  if (back || card.name === 'hidden') {
    return <div className={`card card-back ${className}`} />;
  }

  const cfg = CARD_CFG[card.name as CardName];
  if (!cfg) return null;

  return (
    <div
      className={`card card-special ${disabled ? 'card-disabled' : ''} ${className}`}
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.textColor }}
      onClick={!disabled ? onClick : undefined}
      title={cfg.label}
    >
      <div className="card-corner card-corner-tl">
        <span className="card-corner-value" style={{ color: cfg.textColor }}>{card.value}</span>
      </div>
      <span className="card-special-icon">{cfg.icon}</span>
      <span className="card-special-name">{cfg.label}</span>
      {showDesc && <span className="card-special-sub" style={{ fontSize: 9, opacity: 0.75, textAlign: 'center', padding: '0 4px' }}>{cfg.desc}</span>}
      <div className="card-corner card-corner-br">
        <span className="card-corner-value" style={{ color: cfg.textColor }}>{card.value}</span>
      </div>
    </div>
  );
}

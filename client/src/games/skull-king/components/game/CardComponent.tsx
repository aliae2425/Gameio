import { Card, Suit } from '../../game/types';

const SUIT_CFG: Record<Suit, { sym: string; color: string; bg: string }> = {
  yellow: { sym: '💰', color: '#d4ac0d', bg: '#ffffff' },
  blue:   { sym: '⚓', color: '#2e86c1', bg: '#ffffff' },
  purple: { sym: '🐦‍⬛', color: '#18101b', bg: '#ffffff' },
  green:  { sym: '🌿', color: '#27ae60', bg: '#ffffff' },
};

const SPECIAL_CFG: Record<string, { icon: string; name: string; bg: string; border: string; textColor: string }> = {
  skull_king:  { icon: '👑',  name: 'Skull King',  bg: '#2c3e50', border: '#f1c40f', textColor: '#f1c40f' },
  pirate:      { icon: '🏴‍☠️', name: 'Pirate',     bg: '#ffffff', border: '#c0392b', textColor: '#c0392b' },
  mermaid:     { icon: '🧜',  name: 'Sirène',      bg: '#ffffff', border: '#1abc9c', textColor: '#16a085' },
  escape:      { icon: '🏳️',  name: 'Fuite',       bg: '#ffffff', border: '#bdc3c7', textColor: '#95a5a6' },
  scary_mary:  { icon: '👰‍♀️',  name: 'Scary Mary',  bg: '#ffffff', border: '#8e44ad', textColor: '#8e44ad' },
  kraken:      { icon: '🦑',  name: 'Kraken',      bg: '#ffffff', border: '#27ae60', textColor: '#27ae60' },
  white_whale: { icon: '🐋',  name: 'Baleine',     bg: '#ffffff', border: '#3498db', textColor: '#3498db' },
};

const PIRATE_NAMES: Record<string, string> = {
  rascal: 'Rascal', juanita: 'Juanita', abdul: 'Abdul', eric: 'Eric', bettina: 'Bettina',
};

interface Props {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  back?: boolean;
  className?: string;
}

export function CardComponent({ card, onClick, disabled, back, className = '' }: Props) {
  if (back || (card as { kind: string }).kind === 'hidden') {
    return <div className={`card card-back ${className}`} />;
  }

  if (card.kind === 'numbered') {
    const cfg = SUIT_CFG[card.suit];
    const isTrump = card.suit === 'purple';
    return (
      <div
        className={`card card-numbered ${isTrump ? 'card-trump' : ''} ${disabled ? 'card-disabled' : ''} ${className}`}
        style={{ background: cfg.bg }}
        onClick={!disabled ? onClick : undefined}
        title={`${card.value} ${cfg.sym}`}
      >
        <div className="card-corner card-corner-tl">
          <span className="card-corner-value" style={{ color: cfg.color }}>{card.value}</span>
          <span className="card-corner-sym">{cfg.sym}</span>
        </div>
        <span className="card-center-sym">{cfg.sym}</span>
        <div className="card-corner card-corner-br">
          <span className="card-corner-value" style={{ color: cfg.color }}>{card.value}</span>
          <span className="card-corner-sym">{cfg.sym}</span>
        </div>
      </div>
    );
  }

  const cfg = SPECIAL_CFG[card.type] ?? SPECIAL_CFG['escape'];
  const sub = card.type === 'pirate' && card.pirateName ? PIRATE_NAMES[card.pirateName] : undefined;

  return (
    <div
      className={`card card-special ${disabled ? 'card-disabled' : ''} ${className}`}
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.textColor }}
      onClick={!disabled ? onClick : undefined}
      title={cfg.name}
    >
      <span className="card-special-icon">{cfg.icon}</span>
      <span className="card-special-name">{cfg.name}</span>
      {sub && <span className="card-special-sub">{sub}</span>}
    </div>
  );
}

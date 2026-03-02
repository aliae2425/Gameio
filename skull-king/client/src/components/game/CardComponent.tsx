import { Card, Suit } from '../../game/types';

const SUIT_CFG: Record<Suit, { sym: string; color: string; bg: string }> = {
  yellow: { sym: '🦜', color: '#b8900a', bg: '#fdf6dc' },
  blue:   { sym: '⚓', color: '#2060b0', bg: '#deeeff' },
  purple: { sym: '☠️', color: '#7030a0', bg: '#f0e8ff' },
  green:  { sym: '💰', color: '#1a7030', bg: '#ddf5e4' },
};

const SPECIAL_CFG: Record<string, { icon: string; name: string; bg: string; border: string; textColor: string }> = {
  skull_king:  { icon: '☠️',  name: 'Skull King',  bg: '#06000f', border: '#f0d060', textColor: '#f0d060' },
  pirate:      { icon: '🏴‍☠️', name: 'Pirate',     bg: '#18080a', border: '#c0392b', textColor: '#f5b8b0' },
  mermaid:     { icon: '🧜',  name: 'Sirène',      bg: '#050e1e', border: '#00bcd4', textColor: '#b2ebf2' },
  escape:      { icon: '🏳️',  name: 'Fuite',       bg: '#d0cec8', border: '#888888', textColor: '#444444' },
  scary_mary:  { icon: '💀',  name: 'Scary Mary',  bg: '#100010', border: '#e91e63', textColor: '#f48fb1' },
  kraken:      { icon: '🦑',  name: 'Kraken',      bg: '#080020', border: '#7c4dff', textColor: '#ce93d8' },
  white_whale: { icon: '🐋',  name: 'Baleine Bl.', bg: '#e8f4ff', border: '#4fc3f7', textColor: '#01579b' },
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

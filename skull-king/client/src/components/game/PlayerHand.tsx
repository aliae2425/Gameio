import { Card, Suit } from '../../game/types';
import { CardComponent } from './CardComponent';

function canPlay(card: Card, leadSuit: Suit | null, hand: Card[]): boolean {
  if (card.kind === 'special') return true;
  if (!leadSuit) return true;
  if (card.suit === leadSuit) return true;
  return !hand.some(c => c.kind === 'numbered' && c.suit === leadSuit);
}

interface Props {
  cards: Card[];
  isActive: boolean;
  leadSuit: Suit | null;
  onPlayCard: (cardId: string) => void;
  /** Masque le message "en attente" — utile quand le bid panel overlay est affiché */
  silent?: boolean;
}

export function PlayerHand({ cards, isActive, leadSuit, onPlayCard, silent }: Props) {
  if (!isActive) {
    return (
      <div className="sk-my-area">
        <span className="my-hand-label">Ma main</span>
        <div className="my-hand-cards">
          {cards.map(card => (
            <CardComponent key={card.id} card={card} disabled />
          ))}
        </div>
        {!silent && <p className="waiting-turn">En attente de votre tour…</p>}
      </div>
    );
  }

  return (
    <div className="sk-my-area">
      <span className="my-hand-label">Ma main — cliquez une carte pour jouer</span>
      <div className="my-hand-cards">
        {cards.map(card => {
          const playable = canPlay(card, leadSuit, cards);
          return (
            <CardComponent
              key={card.id}
              card={card}
              disabled={!playable}
              onClick={playable ? () => onPlayCard(card.id) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

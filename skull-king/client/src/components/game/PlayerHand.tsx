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
  silent?: boolean;
}

export function PlayerHand({ cards, isActive, leadSuit, onPlayCard, silent }: Props) {
  // If not active, just show cards dimmed
  if (!isActive) {
    return (
      <>
        {cards.map(card => (
          <div key={card.id} style={{ margin: '0 -15px' }}>
             <CardComponent card={card} disabled />
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {cards.map(card => {
        const playable = canPlay(card, leadSuit, cards);
        return (
          <div key={card.id} style={{ margin: '0 -15px', transition: 'margin 0.2s' }} className="hand-card-wrapper">
            <CardComponent
              card={card}
              disabled={!playable}
              onClick={playable ? () => onPlayCard(card.id) : undefined}
            />
          </div>
        );
      })}
    </>
  );
}

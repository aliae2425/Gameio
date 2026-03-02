import { Card, Suit, PirateName } from './types';

const SUITS: Suit[] = ['yellow', 'blue', 'purple', 'green'];
const PIRATE_NAMES: PirateName[] = ['rascal', 'juanita', 'abdul', 'eric', 'bettina'];

export function buildDeck(useKraken: boolean, useWhiteWhale: boolean): Card[] {
  const deck: Card[] = [];

  // 56 cartes numérotées (4 couleurs × 14 valeurs)
  for (const suit of SUITS) {
    for (let v = 1; v <= 14; v++) {
      deck.push({ id: `${suit}_${v}`, kind: 'numbered', suit, value: v });
    }
  }

  // Skull King ×1
  deck.push({ id: 'skull_king', kind: 'special', type: 'skull_king' });

  // Pirates ×5
  for (const name of PIRATE_NAMES) {
    deck.push({ id: `pirate_${name}`, kind: 'special', type: 'pirate', pirateName: name });
  }

  // Sirènes ×2
  deck.push({ id: 'mermaid_1', kind: 'special', type: 'mermaid' });
  deck.push({ id: 'mermaid_2', kind: 'special', type: 'mermaid' });

  // Fuites ×5
  for (let i = 1; i <= 5; i++) {
    deck.push({ id: `escape_${i}`, kind: 'special', type: 'escape' });
  }

  // Scary Mary ×1
  deck.push({ id: 'scary_mary', kind: 'special', type: 'scary_mary' });

  // Extensions
  if (useKraken) {
    deck.push({ id: 'kraken', kind: 'special', type: 'kraken' });
  }
  if (useWhiteWhale) {
    deck.push({ id: 'white_whale', kind: 'special', type: 'white_whale' });
  }

  return deck;
}

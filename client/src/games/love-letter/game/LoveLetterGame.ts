import type { Game, Move, Ctx } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import {
  LoveLetterGameState,
  LLCard,
  LLPlayer,
  CardName,
} from './types';

// ============================================================
// Deck
// ============================================================

function buildDeck(): LLCard[] {
  const cards: LLCard[] = [];
  let id = 0;
  const add = (name: CardName, value: number, count: number) => {
    for (let i = 0; i < count; i++) {
      cards.push({ id: `${name}_${++id}`, name, value });
    }
  };
  add('guard',    1, 5);
  add('priest',   2, 2);
  add('baron',    3, 2);
  add('handmaid', 4, 2);
  add('prince',   5, 2);
  add('king',     6, 1);
  add('countess', 7, 1);
  add('princess', 8, 1);
  return cards;
}

// ============================================================
// Helpers
// ============================================================

function tokensToWin(numPlayers: number): number {
  if (numPlayers === 2) return 7;
  if (numPlayers === 3) return 5;
  if (numPlayers === 4) return 4;
  return 3; // 5-6 players
}

function activePlayers(G: LoveLetterGameState): LLPlayer[] {
  return G.playerOrder.map(id => G.players[id]).filter(p => p.active);
}

function setupRound(G: LoveLetterGameState, shuffled: LLCard[]): void {
  const deck = [...shuffled];

  // Reset players for new round
  for (const id of G.playerOrder) {
    G.players[id].hand = [];
    G.players[id].discardPile = [];
    G.players[id].protected = false;
    G.players[id].active = true;
  }

  // Burn 1 card face-down
  G.burnedCard = deck.shift()!;
  G.burnedCardVisible = null;

  // 2-player: burn 3 more face-up
  if (G.playerOrder.length === 2) {
    const faceUp: LLCard[] = [];
    for (let i = 0; i < 3 && deck.length > 0; i++) {
      faceUp.push(deck.shift()!);
    }
    G.burnedCardVisible = faceUp[faceUp.length - 1] ?? null; // show last one
  }

  // Deal 1 card to each player
  for (const id of G.playerOrder) {
    G.players[id].hand = [deck.shift()!];
  }

  G.deck = deck;
  G.pendingEffect = null;
  G.lastAction = null;
  G.roundWinner = null;
  G.phase = 'playing';
}

function endRound(G: LoveLetterGameState, events: { endGame: (r: { winner: string }) => void; endPhase: () => void }): void {
  const alive = activePlayers(G);

  let winner: LLPlayer;
  if (alive.length === 1) {
    winner = alive[0];
  } else {
    // Highest card value; tiebreak by highest total discard value
    winner = alive.reduce((best, p) => {
      const myVal = p.hand[0]?.value ?? 0;
      const bestVal = best.hand[0]?.value ?? 0;
      if (myVal > bestVal) return p;
      if (myVal === bestVal) {
        const mySum = p.discardPile.reduce((s, c) => s + c.value, 0);
        const bestSum = best.discardPile.reduce((s, c) => s + c.value, 0);
        return mySum > bestSum ? p : best;
      }
      return best;
    });
  }

  G.roundWinner = winner.id;
  G.players[winner.id].tokens += 1;
  G.phase = 'roundEnd';

  if (G.players[winner.id].tokens >= G.tokensToWin) {
    G.gameWinner = winner.id;
    events.endGame({ winner: winner.id });
  } else {
    events.endPhase();
  }
}

function checkRoundEnd(
  G: LoveLetterGameState,
  events: { endGame: (r: { winner: string }) => void; endPhase: () => void; endTurn: () => void },
): boolean {
  const alive = activePlayers(G);
  if (alive.length <= 1 || G.deck.length === 0) {
    endRound(G, events);
    return true;
  }
  return false;
}

function allOthersProtected(G: LoveLetterGameState, playerID: string): boolean {
  return G.playerOrder
    .filter(id => id !== playerID && G.players[id].active)
    .every(id => G.players[id].protected);
}

// ============================================================
// Moves
// ============================================================

const PlayCard: Move<LoveLetterGameState> = (
  { G, ctx, playerID, events },
  cardIndex: number,
  targetID?: string,
  guessedCard?: CardName,
) => {
  if (!playerID || playerID !== ctx.currentPlayer) return INVALID_MOVE;

  const player = G.players[playerID];
  if (!player.active) return INVALID_MOVE;
  if (cardIndex < 0 || cardIndex >= player.hand.length) return INVALID_MOVE;

  const card = player.hand[cardIndex];

  // Countess rule: must play Countess if holding King or Prince
  const hasCountess = player.hand.some(c => c.name === 'countess');
  const hasKingOrPrince = player.hand.some(c => c.name === 'king' || c.name === 'prince');
  if (hasCountess && hasKingOrPrince && card.name !== 'countess') return INVALID_MOVE;

  // Cards needing a target (other than self)
  const needsOtherTarget = ['guard', 'priest', 'baron', 'king'].includes(card.name);
  // Prince can target self
  const needsAnyTarget = card.name === 'prince';

  if (needsOtherTarget) {
    const othersProtected = allOthersProtected(G, playerID);
    if (!othersProtected) {
      // Must provide a valid, unprotected target (not self)
      if (!targetID || targetID === playerID) return INVALID_MOVE;
      if (!G.players[targetID]?.active) return INVALID_MOVE;
      if (G.players[targetID].protected) return INVALID_MOVE;
    }
    // If all others are protected: can play with any target (no effect)
  }

  if (needsAnyTarget) {
    if (!targetID) return INVALID_MOVE;
    if (!G.players[targetID]?.active) return INVALID_MOVE;
    if (G.players[targetID].protected && targetID !== playerID) {
      const othersProtected = allOthersProtected(G, playerID);
      if (!othersProtected) return INVALID_MOVE;
    }
  }

  // Guard needs a guessed card name
  if (card.name === 'guard' && !allOthersProtected(G, playerID)) {
    if (!guessedCard || guessedCard === 'guard') return INVALID_MOVE;
  }

  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  player.discardPile.push(card);
  G.lastAction = { playerID, card, targetID, guessedCard };

  // Apply effect
  switch (card.name) {

    case 'guard': {
      if (targetID && guessedCard && G.players[targetID]?.active && !G.players[targetID].protected) {
        const target = G.players[targetID];
        if (target.hand.some(c => c.name === guessedCard)) {
          target.discardPile.push(...target.hand);
          target.hand = [];
          target.active = false;
          G.lastAction!.result = `${target.playerName} éliminé·e !`;
        } else {
          G.lastAction!.result = `Raté ! ${targetID ? G.players[targetID].playerName : ''} n'avait pas cette carte.`;
        }
      }
      break;
    }

    case 'priest': {
      if (targetID && G.players[targetID]?.active && !G.players[targetID].protected) {
        G.pendingEffect = {
          type: 'priest_reveal',
          initiatorID: playerID,
          targetID,
          revealedCard: G.players[targetID].hand[0],
        };
        // Don't end turn — wait for AcknowledgeEffect
        return;
      }
      break;
    }

    case 'baron': {
      if (targetID && G.players[targetID]?.active && !G.players[targetID].protected) {
        const myCard = player.hand[0];
        const theirCard = G.players[targetID].hand[0];
        if (myCard && theirCard) {
          let eliminatedID: string | null = null;
          if (myCard.value > theirCard.value) {
            G.players[targetID].discardPile.push(...G.players[targetID].hand);
            G.players[targetID].hand = [];
            G.players[targetID].active = false;
            eliminatedID = targetID;
          } else if (theirCard.value > myCard.value) {
            player.discardPile.push(...player.hand);
            player.hand = [];
            player.active = false;
            eliminatedID = playerID;
          }
          G.pendingEffect = {
            type: 'baron_result',
            initiatorID: playerID,
            targetID,
            eliminatedID,
          };
          return; // Wait for AcknowledgeEffect
        }
      }
      break;
    }

    case 'handmaid': {
      player.protected = true;
      break;
    }

    case 'prince': {
      const target = targetID ? G.players[targetID] : player;
      if (target && target.active) {
        const discarded = target.hand.splice(0);
        target.discardPile.push(...discarded);
        if (discarded.some(c => c.name === 'princess')) {
          target.active = false;
          G.lastAction!.result = `${target.playerName} a défaussé la Princesse et est éliminé·e !`;
        } else if (G.deck.length > 0) {
          target.hand.push(G.deck.shift()!);
        } else if (G.burnedCard) {
          target.hand.push(G.burnedCard);
          G.burnedCard = null;
        }
      }
      break;
    }

    case 'king': {
      if (targetID && G.players[targetID]?.active && !G.players[targetID].protected) {
        const myHand = [...player.hand];
        const theirHand = [...G.players[targetID].hand];
        player.hand = theirHand;
        G.players[targetID].hand = myHand;
      }
      break;
    }

    case 'countess': {
      // No effect
      break;
    }

    case 'princess': {
      // Playing the Princess eliminates you
      player.active = false;
      G.lastAction!.result = `${player.playerName} a joué la Princesse et est éliminé·e !`;
      break;
    }
  }

  if (!checkRoundEnd(G, events)) {
    events.endTurn();
  }
};

// Called after priest/baron reveal to acknowledge and end turn
const AcknowledgeEffect: Move<LoveLetterGameState> = ({ G, ctx, playerID, events }) => {
  if (!G.pendingEffect) return INVALID_MOVE;
  if (G.pendingEffect.initiatorID !== playerID) return INVALID_MOVE;

  G.pendingEffect = null;

  if (!checkRoundEnd(G, events)) {
    events.endTurn();
  }
};

// ============================================================
// Game Config
// ============================================================

export const LoveLetterGame: Game<LoveLetterGameState> = {
  name: 'love-letter',
  minPlayers: 2,
  maxPlayers: 6,

  setup: ({ ctx, random }) => {
    const playerOrder = ctx.playOrder;
    const players: Record<string, LLPlayer> = {};
    for (const id of playerOrder) {
      players[id] = {
        id,
        playerName: `Player ${id}`,
        hand: [],
        discardPile: [],
        protected: false,
        active: true,
        tokens: 0,
      };
    }

    const G: LoveLetterGameState = {
      players,
      playerOrder,
      deck: [],
      burnedCard: null,
      burnedCardVisible: null,
      phase: 'playing',
      roundWinner: null,
      gameWinner: null,
      roundNumber: 1,
      tokensToWin: tokensToWin(playerOrder.length),
      pendingEffect: null,
      lastAction: null,
    };

    setupRound(G, random.Shuffle(buildDeck()));
    return G;
  },

  playerView: ({ G, ctx, playerID }) => {
    const filteredPlayers: typeof G.players = {};
    for (const [id, p] of Object.entries(G.players)) {
      filteredPlayers[id] = {
        ...p,
        hand: id === playerID
          ? p.hand
          : new Array(p.hand.length).fill({ id: 'hidden', name: 'hidden', value: 0 }),
      };
    }

    // Priest reveal: only the initiator sees the revealed card
    let pendingEffect = G.pendingEffect;
    if (
      pendingEffect?.type === 'priest_reveal' &&
      pendingEffect.initiatorID !== playerID
    ) {
      pendingEffect = null;
    }

    return {
      ...G,
      players: filteredPlayers,
      burnedCard: null, // always hidden
      pendingEffect,
    };
  },

  phases: {
    playing: {
      start: true,

      moves: { PlayCard, AcknowledgeEffect },

      turn: {
        order: {
          first: ({ G, ctx }) => {
            // First active player
            for (let i = 0; i < ctx.numPlayers; i++) {
              if (G.players[ctx.playOrder[i]]?.active) return i;
            }
            return 0;
          },
          next: ({ G, ctx }) => {
            const total = ctx.numPlayers;
            for (let i = 1; i <= total; i++) {
              const pos = (ctx.playOrderPos + i) % total;
              if (G.players[ctx.playOrder[pos]]?.active) return pos;
            }
            return ctx.playOrderPos;
          },
        },

        onBegin: ({ G, ctx }) => {
          // Remove Handmaid protection at start of player's turn
          G.players[ctx.currentPlayer].protected = false;
          // Draw a card
          if (G.deck.length > 0 && G.players[ctx.currentPlayer].active) {
            G.players[ctx.currentPlayer].hand.push(G.deck.shift()!);
          }
        },
      },

      next: 'roundEnd',
    },

    roundEnd: {
      onBegin: ({ G, random, events }) => {
        G.roundNumber += 1;
        setupRound(G, random.Shuffle(buildDeck()));
        events.endPhase();
      },
      next: 'playing',
    },
  },

  endIf: ({ G }) => {
    if (G.gameWinner) return { winner: G.gameWinner };
  },

  // ============================================================
  // AI — enumerate for bots
  // ============================================================
  ai: {
    enumerate: (G: LoveLetterGameState, ctx: Ctx, playerID: string) => {
      if (G.pendingEffect?.initiatorID === playerID) {
        return [{ move: 'AcknowledgeEffect', args: [] }];
      }

      if (ctx.currentPlayer !== playerID) return [];

      const player = G.players[playerID];
      if (!player || !player.active || player.hand.length < 2) return [];

      const otherActive = G.playerOrder.filter(
        id => id !== playerID && G.players[id].active && !G.players[id].protected,
      );
      const anyTarget = otherActive[0];

      const hasCountess = player.hand.some(c => c.name === 'countess');
      const hasKingOrPrince = player.hand.some(c => c.name === 'king' || c.name === 'prince');

      const moves: { move: string; args: unknown[] }[] = [];

      player.hand.forEach((card, idx) => {
        if (hasCountess && hasKingOrPrince && card.name !== 'countess') return;

        switch (card.name) {
          case 'guard':
            if (anyTarget) {
              (['priest','baron','handmaid','prince','king','countess','princess'] as CardName[])
                .forEach(guess => moves.push({ move: 'PlayCard', args: [idx, anyTarget, guess] }));
            } else {
              moves.push({ move: 'PlayCard', args: [idx, G.playerOrder.find(id => id !== playerID) ?? playerID] });
            }
            break;
          case 'priest':
          case 'baron':
          case 'king':
            if (anyTarget) {
              moves.push({ move: 'PlayCard', args: [idx, anyTarget] });
            } else {
              moves.push({ move: 'PlayCard', args: [idx, G.playerOrder.find(id => id !== playerID) ?? playerID] });
            }
            break;
          case 'prince':
            moves.push({ move: 'PlayCard', args: [idx, playerID] });
            break;
          case 'handmaid':
          case 'countess':
            moves.push({ move: 'PlayCard', args: [idx] });
            break;
          case 'princess':
            // Only play if forced (no other card)
            if (player.hand.length <= 1) {
              moves.push({ move: 'PlayCard', args: [idx] });
            }
            break;
        }
      });

      if (moves.length === 0) {
        moves.push({ move: 'PlayCard', args: [0] });
      }

      return moves;
    },
  },
};

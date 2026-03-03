import type { Game, Move, Ctx } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import {
  SkullKingGameState,
  PlayerState,
  TrickState,
  RoundScore,
  ScaryMaryChoice,
} from './types';
import { buildDeck } from './cards';
import { resolveTrick } from './trickResolver';
import { calculateRoundScore } from './scoring';

// ============================================================
// Moves
// ============================================================

const PlaceBid: Move<SkullKingGameState> = {
  move: ({ G, playerID }, bid: number) => {
    if (playerID === undefined) return INVALID_MOVE;
    const roundCards = G.round?.roundNumber ?? 1;
    if (bid < 0 || bid > roundCards) return INVALID_MOVE;
    if (G.players[playerID].bid !== null) return INVALID_MOVE;
    G.players[playerID].bid = bid;
  },
  redact: true, // cache la mise aux autres joueurs pendant la phase
};

const PlayCard: Move<SkullKingGameState> = ({ G, ctx, playerID, events }, cardId: string, scaryMaryChoice?: ScaryMaryChoice) => {
  if (playerID === undefined || playerID !== ctx.currentPlayer) return INVALID_MOVE;

  const player = G.players[playerID];
  const cardIndex = player.hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return INVALID_MOVE;

  const card = player.hand[cardIndex];

  // Scary Mary : choix requis si non fourni — on suspend sans avancer le tour
  if (card.kind === 'special' && card.type === 'scary_mary' && scaryMaryChoice === undefined) {
    G.pendingScaryMary = { playerId: playerID, cardId };
    return;
  }

  // Vérification : obligation de suivre la couleur menée
  const trick = G.round!.currentTrick!;
  if (trick.leadSuit && card.kind === 'numbered' && card.suit !== trick.leadSuit) {
    const hasSuit = player.hand.some(c => c.kind === 'numbered' && c.suit === trick.leadSuit);
    if (hasSuit) return INVALID_MOVE;
  }

  // Jouer la carte
  player.hand.splice(cardIndex, 1);
  trick.cards.push({ card, playerId: playerID, scaryMaryChoice });

  // Définir la couleur menée si c'est la première carte numérotée
  if (trick.leadSuit === null && card.kind === 'numbered') {
    trick.leadSuit = card.suit;
  }

  G.pendingScaryMary = null;

  // Avancer au joueur suivant (ou déclencher onEnd si dernier joueur)
  events.endTurn();
};

const DeclareScareMary: Move<SkullKingGameState> = ({ G, ctx, playerID, events }, choice: ScaryMaryChoice) => {
  if (!G.pendingScaryMary || G.pendingScaryMary.playerId !== playerID) return INVALID_MOVE;

  const player = G.players[playerID];
  const cardIndex = player.hand.findIndex(c => c.id === G.pendingScaryMary!.cardId);
  if (cardIndex === -1) return INVALID_MOVE;

  const card = player.hand.splice(cardIndex, 1)[0];
  const trick = G.round!.currentTrick!;
  trick.cards.push({ card, playerId: playerID, scaryMaryChoice: choice });

  if (trick.leadSuit === null && card.kind === 'numbered') {
    trick.leadSuit = card.suit;
  }

  G.pendingScaryMary = null;
  events.endTurn();
};

const ConfirmWhaleChange: Move<SkullKingGameState> = ({ G, playerID }, direction: 'up' | 'down') => {
  if (!G.pendingWhaleChange || G.pendingWhaleChange.winnerId !== playerID) return INVALID_MOVE;

  const player = G.players[playerID];
  const roundCards = G.round!.roundNumber;
  const delta = direction === 'up' ? G.pendingWhaleChange.changeAmount : -G.pendingWhaleChange.changeAmount;
  player.bid = Math.max(0, Math.min(roundCards, (player.bid ?? 0) + delta));
  G.pendingWhaleChange = null;
};

// ============================================================
// Helpers
// ============================================================

function findWinner(G: SkullKingGameState): string {
  return Object.values(G.players).reduce((best, p) =>
    p.totalScore > best.totalScore ? p : best
  ).id;
}

function dealRound(G: SkullKingGameState, roundNum: number, shuffledDeck: ReturnType<typeof buildDeck>) {
  for (const id of G.playerOrder) {
    G.players[id].hand = shuffledDeck.splice(0, roundNum);
    G.players[id].bid = null;
    G.players[id].tricksWon = 0;
    G.players[id].roundBonuses = 0;
  }
}

function startNewTrick(G: SkullKingGameState): TrickState {
  return {
    leadPlayerId: G.round!.trickLeaderId,
    leadSuit: null,
    cards: [],
    winnerId: null,
  };
}

// ============================================================
// Game Config
// ============================================================

export const SkullKingGame: Game<SkullKingGameState> = {
  name: 'skull-king',
  minPlayers: 2,
  maxPlayers: 6,

  setup: ({ ctx, random }, setupData?: { useKraken?: boolean; useWhiteWhale?: boolean }) => {
    const useKraken = setupData?.useKraken ?? true;
    const useWhiteWhale = setupData?.useWhiteWhale ?? true;
    const playerOrder = ctx.playOrder;

    const players: Record<string, PlayerState> = {};
    for (const id of playerOrder) {
      players[id] = {
        id,
        name: `Player ${id}`,
        hand: [],
        bid: null,
        tricksWon: 0,
        roundBonuses: 0,
        totalScore: 0,
      };
    }

    return {
      players,
      playerOrder,
      round: null,
      phase: 'bidding',
      pendingScaryMary: null,
      pendingWhaleChange: null,
      scoreHistory: [],
      useKraken,
      useWhiteWhale,
    };
  },

  playerView: ({ G, ctx, playerID }) => {
    const allBid = Object.values(G.players).every(p => p.bid !== null);

    const filteredPlayers: typeof G.players = {};
    for (const [id, p] of Object.entries(G.players)) {
      filteredPlayers[id] = {
        ...p,
        // Masquer la main des autres joueurs
        hand: id === playerID
          ? p.hand
          : new Array(p.hand.length).fill({ id: 'hidden', kind: 'hidden' }),
        // Masquer les mises tant que tout le monde n'a pas misé
        bid: id === playerID || allBid
          ? p.bid
          : p.bid !== null ? -1 : null, // -1 = "a misé, montant inconnu"
      };
    }

    return { ...G, players: filteredPlayers };
  },

  phases: {
    // ===== PHASE ENCHÈRES =====
    bidding: {
      start: true,

      onBegin: ({ G, random }) => {
        const roundNum = G.scoreHistory.length + 1;
        const deck = buildDeck(G.useKraken, G.useWhiteWhale);
        const shuffled = random.Shuffle(deck);

        dealRound(G, roundNum, shuffled);

        const leaderIndex = (roundNum - 1) % G.playerOrder.length;
        G.round = {
          roundNumber: roundNum,
          currentTrick: null,
          completedTricks: [],
          trickLeaderId: G.playerOrder[leaderIndex],
        };
        G.phase = 'bidding';
      },

      turn: {
        activePlayers: {
          all: 'bid',
          moveLimit: 1,
        },
        stages: {
          bid: {
            moves: { PlaceBid },
          },
        },
      },

      endIf: ({ G }) => Object.values(G.players).every(p => p.bid !== null),

      next: 'playing',
    },

    // ===== PHASE JEU =====
    playing: {
      onBegin: ({ G }) => {
        G.phase = 'playing';
        G.round!.currentTrick = startNewTrick(G);
      },

      moves: { PlayCard, DeclareScareMary, ConfirmWhaleChange },

      turn: {
        order: {
          first: ({ G, ctx }) => {
            const leader = G.round!.trickLeaderId;
            return ctx.playOrder.indexOf(leader);
          },
          next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        },

        onEnd: ({ G, ctx, events }) => {
          const trick = G.round!.currentTrick!;
          if (trick.cards.length < ctx.numPlayers) return;

          const result = resolveTrick(trick.cards, trick.leadSuit);

          trick.winnerId = result.krakenPresent ? null : result.winnerId;

          if (!result.krakenPresent) {
            G.players[result.winnerId].tricksWon += 1;

            if (result.piratesCapturedBySkullKing > 0) {
              G.players[result.winnerId].roundBonuses += 30 * result.piratesCapturedBySkullKing;
            }
            if (result.mermaidCapturedSkullKing) {
              G.players[result.winnerId].roundBonuses += 50;
            }

            if (result.whiteWhalePresent) {
              G.pendingWhaleChange = {
                winnerId: result.winnerId,
                changeAmount: result.trickSize,
              };
            }
          }

          G.round!.completedTricks.push({ ...trick });

          const roundOver = G.round!.completedTricks.length === G.round!.roundNumber;

          if (roundOver) {
            events.endPhase();
          } else {
            G.round!.trickLeaderId = result.krakenPresent
              ? G.round!.trickLeaderId
              : result.winnerId;
            G.round!.currentTrick = startNewTrick(G);
          }
        },
      },

      endIf: ({ G }) => G.round!.completedTricks.length === G.round!.roundNumber,

      next: 'scoring',
    },

    // ===== PHASE SCORE =====
    scoring: {
      onBegin: ({ G, events }) => {
        G.phase = 'scoring';

        const roundScores: RoundScore = {
          round: G.round!.roundNumber,
          scores: {},
        };

        for (const id of G.playerOrder) {
          const player = G.players[id];
          const { roundPoints, bonuses } = calculateRoundScore(player, G.round!.roundNumber);
          player.totalScore += roundPoints;
          roundScores.scores[id] = {
            bid: player.bid!,
            tricksWon: player.tricksWon,
            bonuses,
            roundPoints,
          };
        }

        G.scoreHistory.push(roundScores);

        // Réinitialiser les mises pour éviter que la phase d'enchères ne soit sautée (endIf true)
        for (const id of G.playerOrder) {
          G.players[id].bid = null;
        }

        if (G.round!.roundNumber === 10) {
          events.endGame({ winner: findWinner(G) });
        } else {
          events.endPhase();
        }
      },

      next: 'bidding',
    },
  },

  // ============================================================
  // AI — enumerate les moves valides pour les bots
  // ============================================================
  ai: {
    enumerate: (G: SkullKingGameState, ctx: Ctx, playerID: string) => {
      // États bloquants : Scary Mary ou Baleine blanche en attente
      if (G.pendingScaryMary?.playerId === playerID) {
        return [
          { move: 'DeclareScareMary', args: ['pirate'] },
          { move: 'DeclareScareMary', args: ['escape'] },
        ];
      }
      if (G.pendingWhaleChange?.winnerId === playerID) {
        return [
          { move: 'ConfirmWhaleChange', args: ['up'] },
          { move: 'ConfirmWhaleChange', args: ['down'] },
        ];
      }

      // Phase enchères : miser entre 0 et N
      if (G.phase === 'bidding' && G.players[playerID]?.bid === null) {
        const max = G.round?.roundNumber ?? 1;
        return Array.from({ length: max + 1 }, (_, i) => ({ move: 'PlaceBid', args: [i] }));
      }

      // Phase jeu : jouer une carte valide
      if (G.phase === 'playing' && ctx.currentPlayer === playerID) {
        const player = G.players[playerID];
        const leadSuit = G.round?.currentTrick?.leadSuit ?? null;
        const moves: { move: string; args: unknown[] }[] = [];

        for (const card of player.hand) {
          // Vérifier l'obligation de suivre la couleur
          if (card.kind === 'numbered' && leadSuit && card.suit !== leadSuit) {
            const hasSuit = player.hand.some(c => c.kind === 'numbered' && c.suit === leadSuit);
            if (hasSuit) continue;
          }
          // Scary Mary : proposer les deux choix
          if (card.kind === 'special' && card.type === 'scary_mary') {
            moves.push({ move: 'PlayCard', args: [card.id, 'pirate'] });
            moves.push({ move: 'PlayCard', args: [card.id, 'escape'] });
          } else {
            moves.push({ move: 'PlayCard', args: [card.id] });
          }
        }
        return moves;
      }

      return [];
    },
  },
};

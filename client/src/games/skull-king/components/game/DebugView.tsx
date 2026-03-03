import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { RandomBot } from 'boardgame.io/ai';
import { SkullKingGame } from '../../game/SkullKingGame';
import { SkullKingBoard } from './SkullKingBoard';

// Pré-construire un client par nombre de joueurs (2 à 6)
// Le joueur 0 est humain, les autres sont des bots RandomBot
function buildDebugClient(numPlayers: number) {
  const bots: Record<string, typeof RandomBot> = {};
  for (let i = 1; i < numPlayers; i++) {
    bots[String(i)] = RandomBot;
  }
  return Client({
    game: SkullKingGame,
    board: SkullKingBoard,
    numPlayers,
    multiplayer: Local({ bots }),
    debug: true, // panneau debug boardgame.io visible
  });
}

const DEBUG_CLIENTS = {
  2: buildDebugClient(2),
  3: buildDebugClient(3),
  4: buildDebugClient(4),
  5: buildDebugClient(5),
  6: buildDebugClient(6),
} as const;

interface Props {
  numPlayers: 2 | 3 | 4 | 5 | 6;
  onLeave: () => void;
}

export function DebugView({ numPlayers, onLeave }: Props) {
  const DebugClient = DEBUG_CLIENTS[numPlayers];

  return (
    <div className="debug-wrapper">
      <div className="debug-header">
        <button onClick={onLeave} className="leave-btn">← Quitter</button>
        <span className="debug-badge">
          🤖 Mode Debug — 1 humain + {numPlayers - 1} bot{numPlayers > 2 ? 's' : ''} RandomBot
        </span>
      </div>
      {/* playerID="0" = vous (humain) ; bots 1..N jouent automatiquement */}
      <DebugClient playerID="0" matchID="debug-local" />
    </div>
  );
}

import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { SkullKingGame } from '../../game/SkullKingGame';
import { SkullKingBoard } from './SkullKingBoard';
import type { MatchInfo } from '../lobby/LobbyPage';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:8000';

const SkullKingClient = Client({
  game: SkullKingGame,
  board: SkullKingBoard,
  multiplayer: SocketIO({ server: SERVER }),
  debug: import.meta.env.DEV,
});

export function GameView({ matchID, playerID, credentials }: MatchInfo) {
  return (
    <SkullKingClient
      matchID={matchID}
      playerID={playerID}
      credentials={credentials}
    />
  );
}

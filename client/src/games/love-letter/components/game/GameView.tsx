import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { LoveLetterGame } from '../../game/LoveLetterGame';
import { LoveLetterBoard } from './LoveLetterBoard';
import type { MatchInfo } from '../lobby/LobbyPage';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:8000';

const LoveLetterClient = Client({
  game: LoveLetterGame,
  board: LoveLetterBoard,
  multiplayer: SocketIO({ server: SERVER }),
  debug: import.meta.env.DEV,
});

export function GameView({ matchID, playerID, credentials }: MatchInfo) {
  return (
    <LoveLetterClient
      matchID={matchID}
      playerID={playerID}
      credentials={credentials}
    />
  );
}

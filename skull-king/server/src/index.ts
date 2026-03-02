import { Server, Origins } from 'boardgame.io/server';
import { SkullKingGame } from '@game/SkullKingGame';

const server = Server({
  games: [SkullKingGame],
  origins: [
    Origins.LOCALHOST_IN_DEVELOPMENT,
  ],
});

const PORT = Number(process.env.PORT ?? 8000);
server.run(PORT, () => {
  console.log(`Skull King server running on http://localhost:${PORT}`);
});

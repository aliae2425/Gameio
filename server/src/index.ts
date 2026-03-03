import { Server, Origins } from 'boardgame.io/server';
import { SkullKingGame } from '@skull-king/SkullKingGame';
import { LoveLetterGame } from '@love-letter/LoveLetterGame';

const server = Server({
  games: [SkullKingGame, LoveLetterGame],
  origins: [
    Origins.LOCALHOST_IN_DEVELOPMENT,
  ],
});

const PORT = Number(process.env.PORT ?? 8000);
server.run(PORT, () => {
  console.log(`Gameio server running on http://localhost:${PORT}`);
  console.log(`  - Skull King  : /games/skull-king`);
  console.log(`  - Love Letter : /games/love-letter`);
});

import { Server, Origins } from 'boardgame.io/server';
import { SkullKingGame } from '@skull-king/SkullKingGame';
import { LoveLetterGame } from '@love-letter/LoveLetterGame';

const origins = [Origins.LOCALHOST_IN_DEVELOPMENT] as (string | RegExp | boolean)[];
if (process.env.ALLOWED_ORIGINS) {
  origins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
}

const server = Server({
  games: [SkullKingGame, LoveLetterGame],
  origins,
});

const PORT = Number(process.env.PORT ?? 8000);
server.run(PORT, () => {
  console.log(`Gameio server running on http://localhost:${PORT}`);
  console.log(`  - Skull King  : /games/skull-king`);
  console.log(`  - Love Letter : /games/love-letter`);
});

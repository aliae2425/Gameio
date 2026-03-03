import { Server, Origins, FlatFile } from 'boardgame.io/server';
import { SkullKingGame } from '@skull-king/SkullKingGame';
import { LoveLetterGame } from '@love-letter/LoveLetterGame';
// import { SymfonyConnector } from './SymfonyConnector';

const server = Server({
  games: [SkullKingGame, LoveLetterGame],
  origins: [
    Origins.LOCALHOST_IN_DEVELOPMENT,
    // Ajoutez ici l'origine de votre app Symfony si différente
    // "http://127.0.0.1:8000",
  ],
  
  // Utilise un stockage fichier simple pour que les parties survivent au redémarrage
  db: new FlatFile({
    dir: './storage',
    logging: true,
  }),
  
  // Pour activer les webhooks vers Symfony, utilisez ceci à la place :
  // db: new SymfonyConnector(),
});

const PORT = Number(process.env.PORT ?? 8000);
server.run(PORT, () => {
  console.log(`Gameio server running on http://localhost:${PORT}`);
  console.log(`  - Skull King  : /games/skull-king`);
  console.log(`  - Love Letter : /games/love-letter`);
});

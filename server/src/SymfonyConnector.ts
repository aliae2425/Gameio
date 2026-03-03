// URL de votre API Symfony (à configurer)
const SYMFONY_API_URL = process.env.SYMFONY_API_URL || 'http://localhost:8000/api/game/end';
const SYMFONY_API_TOKEN = process.env.SYMFONY_API_TOKEN || 'secret_token';

/**
 * Interface simplifiée du StorageAPI de boardgame.io
 * Ce connecteur stocke les parties en mémoire (Map) mais surveille
 * activement la fin de partie pour notifier Symfony.
 */
export class SymfonyConnector {
  private games: Map<string, any>;

  constructor() {
    this.games = new Map();
  }

  async connect() {
    // Pas de connexion DB réelle nécessaire ici
    return;
  }

  async createGame(matchID: string, opts: any): Promise<void> {
    this.games.set(matchID, opts);
  }

  async fetch(matchID: string, opts: any): Promise<any> {
    return this.games.get(matchID);
  }

  async clear(): Promise<void> {
    this.games.clear();
  }

  async setState(matchID: string, state: any, deltalog?: any[]): Promise<void> {
    // Sauvegarder l'état
    this.games.set(matchID, state);

    // VÉRIFICATION CLÉ : Est-ce que la partie vient de se terminer ?
    // On regarde si 'gameover' est défini dans le nouvel état
    if (state.ctx.gameover) {
      console.log(`[SymfonyConnector] Partie ${matchID} terminée. Envoi des résultats...`);
      await this.sendResultsToSymfony(matchID, state);
    }
  }

  async getMetadata(matchID: string, shim: any): Promise<any> {
    // Implémentation simplifiée pour les métadonnées
    const state = this.games.get(matchID);
    return state ? state.metadata : null;
  }
  
  async setMetadata(matchID: string, metadata: any): Promise<void> {
     // Si besoin de mettre à jour les métadonnées séparément
     const state = this.games.get(matchID) || {};
     state.metadata = metadata;
     this.games.set(matchID, state);
  }

  async listGames(opts: any): Promise<string[]> {
      return Array.from(this.games.keys());
  }

  async listMatches(opts: any): Promise<any[]> {
      // Simplification pour l'exemple
      return Array.from(this.games.values()).map(g => g.metadata || {});
  }
  
  async wipe(matchID: string): Promise<void> {
      this.games.delete(matchID);
  }

  // --- Méthode privée pour parler à Symfony ---

  private async sendResultsToSymfony(matchID: string, state: any) {
    try {
      // Si vous utilisez Node 18+, fetch est natif. Sinon installez 'node-fetch'.
      // @ts-ignore
      const response = await fetch(SYMFONY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SYMFONY_API_TOKEN}` // Sécurité basique
        },
        body: JSON.stringify({
          matchID: matchID,
          gameName: state.G.name || 'unknown', // Assurez-vous d'avoir le nom du jeu quelque part
          players: state.ctx.numPlayers,
          gameover: state.ctx.gameover, // Le résultat (gagnant, scores, etc.)
          metadata: state.metadata, // Infos sur les joueurs (noms, ids)
          log: state.log // Historique si besoin
        })
      });

      if (!response.ok) {
        console.error(`[SymfonyConnector] Erreur API Symfony: ${response.status} ${response.statusText}`);
      } else {
        console.log(`[SymfonyConnector] Résultats envoyés avec succès pour ${matchID}`);
      }
    } catch (error) {
      console.error(`[SymfonyConnector] Impossible de contacter Symfony:`, error);
    }
  }
}

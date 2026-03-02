import { useState, useEffect } from 'react';
import { LobbyClient } from 'boardgame.io/client';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:8000';
const lobbyClient = new LobbyClient({ server: SERVER });

export interface MatchInfo {
  matchID: string;
  playerID: string;
  credentials: string;
  playerName: string;
}

export interface DebugInfo {
  debug: true;
  numPlayers: 2 | 3 | 4 | 5 | 6;
}

interface Match {
  matchID: string;
  players: Array<{ id: number; name?: string }>;
  createdAt: number;
}

interface Props {
  onJoinMatch: (info: MatchInfo) => void;
  onDebug: (info: DebugInfo) => void;
}

export function LobbyPage({ onJoinMatch, onDebug }: Props) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [numPlayers, setNumPlayers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshMatches = async () => {
    try {
      const { matches: m } = await lobbyClient.listMatches('skull-king');
      setMatches(m as Match[]);
    } catch {
      setError('Impossible de contacter le serveur');
    }
  };

  useEffect(() => {
    refreshMatches();
    const interval = setInterval(refreshMatches, 3000);
    return () => clearInterval(interval);
  }, []);

  const joinMatch = async (matchID: string) => {
    if (!playerName.trim()) {
      setError('Entrez votre nom');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const match = await lobbyClient.getMatch('skull-king', matchID);
      const openSlot = (match.players as Array<{ id: number; name?: string }>).find(p => !p.name);
      if (!openSlot) {
        setError('La partie est complète');
        setLoading(false);
        return;
      }
      const { playerCredentials } = await lobbyClient.joinMatch('skull-king', matchID, {
        playerID: String(openSlot.id),
        playerName: playerName.trim(),
      });
      onJoinMatch({ matchID, playerID: String(openSlot.id), credentials: playerCredentials, playerName: playerName.trim() });
    } catch {
      setError('Erreur lors de la connexion');
    }
    setLoading(false);
  };

  const createAndJoin = async () => {
    if (!playerName.trim()) {
      setError('Entrez votre nom');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { matchID } = await lobbyClient.createMatch('skull-king', {
        numPlayers,
        setupData: { useKraken: true, useWhiteWhale: true },
      });
      await joinMatch(matchID);
    } catch {
      setError('Erreur lors de la création de la partie');
    }
    setLoading(false);
  };

  const [debugPlayers, setDebugPlayers] = useState<2 | 3 | 4 | 5 | 6>(4);
  const openMatches = matches.filter(m => m.players.some(p => !p.name));

  return (
    <div className="lobby">
      <h1>☠️ Skull King</h1>

      {/* ===== MODE DEBUG ===== */}
      <div className="debug-section">
        <h2>🤖 Mode Debug (local, sans serveur)</h2>
        <div className="create-section">
          <label>
            Joueurs total :
            <select
              value={debugPlayers}
              onChange={e => setDebugPlayers(Number(e.target.value) as 2 | 3 | 4 | 5 | 6)}
            >
              {([2, 3, 4, 5, 6] as const).map(n => (
                <option key={n} value={n}>{n} ({n - 1} bot{n > 2 ? 's' : ''})</option>
              ))}
            </select>
          </label>
          <button
            className="btn-debug"
            onClick={() => onDebug({ debug: true, numPlayers: debugPlayers })}
          >
            Jouer vs Bots
          </button>
        </div>
      </div>

      <hr className="lobby-divider" />

      <div className="lobby-form">
        <input
          type="text"
          placeholder="Votre nom"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          maxLength={20}
        />

        <div className="create-section">
          <label>
            Joueurs :
            <select value={numPlayers} onChange={e => setNumPlayers(Number(e.target.value))}>
              {[2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <button onClick={createAndJoin} disabled={loading}>
            Créer une partie
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="match-list">
        <div className="match-list-header">
          <h2>Parties disponibles</h2>
          <button onClick={refreshMatches} className="refresh-btn">↻</button>
        </div>

        {openMatches.length === 0 ? (
          <p className="no-matches">Aucune partie en attente</p>
        ) : (
          openMatches.map(m => {
            const joined = m.players.filter(p => p.name).length;
            const total = m.players.length;
            return (
              <div key={m.matchID} className="match-item">
                <span>Partie #{m.matchID.slice(-6)} — {joined}/{total} joueurs</span>
                <button onClick={() => joinMatch(m.matchID)} disabled={loading}>
                  Rejoindre
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

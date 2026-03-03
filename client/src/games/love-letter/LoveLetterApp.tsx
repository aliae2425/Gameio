import { useState } from 'react';
import { LobbyPage, MatchInfo, DebugInfo } from './components/lobby/LobbyPage';
import { GameView } from './components/game/GameView';
import { DebugView } from './components/game/DebugView';

type AppState =
  | { mode: 'lobby' }
  | { mode: 'network'; match: MatchInfo }
  | { mode: 'debug'; info: DebugInfo };

export function LoveLetterApp() {
  const [state, setState] = useState<AppState>({ mode: 'lobby' });

  if (state.mode === 'network') {
    return (
      <div className="app">
        <button className="leave-btn" onClick={() => setState({ mode: 'lobby' })}>
          ← Quitter la partie
        </button>
        <GameView {...state.match} />
      </div>
    );
  }

  if (state.mode === 'debug') {
    return (
      <DebugView
        numPlayers={state.info.numPlayers}
        onLeave={() => setState({ mode: 'lobby' })}
      />
    );
  }

  return (
    <LobbyPage
      onJoinMatch={match => setState({ mode: 'network', match })}
      onDebug={info => setState({ mode: 'debug', info })}
    />
  );
}

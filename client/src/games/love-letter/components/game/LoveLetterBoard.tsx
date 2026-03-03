import { useState } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import { LoveLetterGameState, CardName } from '../../game/types';
import { CardComponent } from './CardComponent';
import { PlayerSeat } from './PlayerSeat';
import { GameSidebar } from './GameSidebar';
import { TargetModal } from './TargetModal';
import { GuardGuessModal } from './GuardGuessModal';
import { PriestRevealModal } from './PriestRevealModal';
import { BaronResultModal } from './BaronResultModal';

// Same position logic as Skull King
function getPositionClass(myIndex: number, targetIndex: number, total: number) {
  if (myIndex === -1) return '';
  const diff = (targetIndex - myIndex + total) % total;
  if (diff === 0) return 'seat-bottom';
  if (total === 2) return 'seat-top';
  if (total === 3) {
    if (diff === 1) return 'seat-top-left';
    return 'seat-top-right';
  }
  if (total === 4) {
    if (diff === 1) return 'seat-left';
    if (diff === 2) return 'seat-top';
    return 'seat-right';
  }
  if (total === 5) {
    if (diff === 1) return 'seat-left';
    if (diff === 2) return 'seat-top-left';
    if (diff === 3) return 'seat-top-right';
    return 'seat-right';
  }
  if (total === 6) {
    if (diff === 1) return 'seat-left';
    if (diff === 2) return 'seat-top-left';
    if (diff === 3) return 'seat-top';
    if (diff === 4) return 'seat-top-right';
    return 'seat-right';
  }
  return '';
}

// UI state machine for playing a card
type PlayState =
  | { step: 'idle' }
  | { step: 'selectTarget'; cardIndex: number; needsSelf: boolean }
  | { step: 'guardGuess'; cardIndex: number; targetID: string };

export function LoveLetterBoard({
  G,
  ctx,
  moves,
  playerID,
  isActive,
  matchID,
}: BoardProps<LoveLetterGameState> & { matchID?: string }) {
  const [playState, setPlayState] = useState<PlayState>({ step: 'idle' });

  const myPlayer = playerID ? G.players[playerID] : null;
  const myIndex = playerID ? G.playerOrder.indexOf(playerID) : -1;
  const total = G.playerOrder.length;
  const isMyTurn = isActive && ctx.currentPlayer === playerID;

  // Cards needing target interactions
  const NEEDS_OTHER_TARGET = new Set(['guard', 'priest', 'baron', 'king']);
  const NEEDS_ANY_TARGET = new Set(['prince']);
  const NO_TARGET = new Set(['handmaid', 'countess', 'princess']);

  function handleCardClick(cardIndex: number) {
    if (!isMyTurn) return;
    const card = myPlayer!.hand[cardIndex];
    if (!card || (card.name as string) === 'hidden') return;

    // Countess forced play
    const hasCountess = myPlayer!.hand.some(c => c.name === 'countess');
    const hasKingOrPrince = myPlayer!.hand.some(c => c.name === 'king' || c.name === 'prince');
    if (hasCountess && hasKingOrPrince && card.name !== 'countess') return;

    if (NO_TARGET.has(card.name)) {
      moves.PlayCard(cardIndex);
    } else if (NEEDS_ANY_TARGET.has(card.name)) {
      setPlayState({ step: 'selectTarget', cardIndex, needsSelf: true });
    } else if (NEEDS_OTHER_TARGET.has(card.name)) {
      setPlayState({ step: 'selectTarget', cardIndex, needsSelf: false });
    }
  }

  function handleTargetSelect(targetID: string) {
    if (playState.step !== 'selectTarget') return;
    const card = myPlayer!.hand[playState.cardIndex];
    if (card.name === 'guard') {
      setPlayState({ step: 'guardGuess', cardIndex: playState.cardIndex, targetID });
    } else {
      moves.PlayCard(playState.cardIndex, targetID);
      setPlayState({ step: 'idle' });
    }
  }

  function handleGuardGuess(guess: CardName) {
    if (playState.step !== 'guardGuess') return;
    moves.PlayCard(playState.cardIndex, playState.targetID, guess);
    setPlayState({ step: 'idle' });
  }

  /* ---- Game Over ---- */
  if (ctx.gameover) {
    const winner = G.players[ctx.gameover.winner];
    return (
      <div className="gameover">
        <div className="gameover-title">💌 Partie terminée !</div>
        <div className="gameover-winner">
          🏆 Vainqueur : {winner?.playerName ?? ctx.gameover.winner}
        </div>
        <div style={{ marginTop: 8, color: 'var(--c-text-dim)', fontSize: 14 }}>
          {G.playerOrder.map(id => (
            <div key={id} style={{ margin: '4px 0' }}>
              {G.players[id].playerName} — {G.players[id].tokens} 💌
            </div>
          ))}
        </div>
      </div>
    );
  }

  const allPlayersInOrder = Object.values(G.players);

  return (
    <div className="sk-board">

      {/* ===== LEFT: Game Area ===== */}
      <div className="sk-game-area">
        <div className="sk-table-felt">

          {/* Center: Deck pile info */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5, textAlign: 'center' }}>
            {G.deck.length > 0 ? (
              <div>
                <div className="card card-back" style={{ margin: '0 auto 8px' }} />
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                  {G.deck.length} carte{G.deck.length > 1 ? 's' : ''}
                </div>
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>🂠</div>
                Pioche vide
              </div>
            )}
            {G.lastAction && (
              <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.6)', fontSize: 12, maxWidth: 160 }}>
                <strong style={{ color: 'var(--c-gold)' }}>
                  {G.players[G.lastAction.playerID]?.playerName}
                </strong>{' '}joue {G.lastAction.card.name}
              </div>
            )}
          </div>

          {/* Players */}
          {G.playerOrder.map((id, index) => {
            const posClass = getPositionClass(myIndex, index, total);
            return (
              <PlayerSeat
                key={id}
                player={G.players[id]}
                isCurrentTurn={ctx.currentPlayer === id}
                discardPile={G.players[id].discardPile}
                className={posClass}
              />
            );
          })}

          {/* My Hand */}
          {myPlayer && myPlayer.active && (
            <div className="my-hand-container">
              {/* My discard pile */}
              {myPlayer.discardPile.length > 0 && (
                <div className="my-discard-row">
                  <span className="my-discard-label">Défausse :</span>
                  {myPlayer.discardPile.map(card => (
                    <CardComponent key={card.id} card={card} mini />
                  ))}
                </div>
              )}
              <div className="player-hand">
                {myPlayer.hand.map((card, i) => {
                  if ((card.name as string) === 'hidden') return null;
                  const hasCountess = myPlayer.hand.some(c => c.name === 'countess');
                  const hasKingOrPrince = myPlayer.hand.some(c => c.name === 'king' || c.name === 'prince');
                  const isDisabled = !isMyTurn ||
                    (hasCountess && hasKingOrPrince && card.name !== 'countess') ||
                    playState.step !== 'idle';
                  return (
                    <CardComponent
                      key={card.id}
                      card={card}
                      onClick={() => handleCardClick(i)}
                      disabled={isDisabled}
                      showDesc
                      className={isMyTurn && !isDisabled ? 'card-playable' : ''}
                    />
                  );
                })}
              </div>
              {isMyTurn && (
                <div style={{ color: 'var(--c-gold)', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                  Votre tour — jouez une carte
                </div>
              )}
              {myPlayer.protected && (
                <div style={{ color: 'var(--c-success)', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                  🛡️ Vous êtes protégé·e ce tour
                </div>
              )}
            </div>
          )}

          {/* Eliminated player message */}
          {myPlayer && !myPlayer.active && (
            <div className="my-hand-container" style={{ textAlign: 'center', color: 'var(--c-text-dim)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>💀</div>
              Vous êtes éliminé·e de cette manche
              {myPlayer.discardPile.length > 0 && (
                <div className="my-discard-row" style={{ justifyContent: 'center', marginTop: 10 }}>
                  <span className="my-discard-label">Défausse :</span>
                  {myPlayer.discardPile.map(card => (
                    <CardComponent key={card.id} card={card} mini />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ===== RIGHT: Sidebar ===== */}
      <GameSidebar G={G} playerID={playerID ?? null} matchID={matchID} />

      {/* ===== MODALS ===== */}

      {playState.step === 'selectTarget' && myPlayer && (
        <TargetModal
          players={allPlayersInOrder}
          currentPlayerID={playerID!}
          onSelect={handleTargetSelect}
          onCancel={() => setPlayState({ step: 'idle' })}
          canTargetSelf={playState.needsSelf}
        />
      )}

      {playState.step === 'guardGuess' && (
        <GuardGuessModal
          targetName={G.players[playState.targetID]?.playerName ?? playState.targetID}
          onGuess={handleGuardGuess}
          onCancel={() => setPlayState({ step: 'idle' })}
        />
      )}

      {G.pendingEffect?.type === 'priest_reveal' && (
        <PriestRevealModal
          effect={G.pendingEffect as Extract<typeof G.pendingEffect, { type: 'priest_reveal' }>}
          targetName={G.players[G.pendingEffect.targetID]?.playerName ?? ''}
          isInitiator={G.pendingEffect.initiatorID === playerID}
          onAcknowledge={() => moves.AcknowledgeEffect()}
        />
      )}

      {G.pendingEffect?.type === 'baron_result' && (
        <BaronResultModal
          effect={G.pendingEffect as Extract<typeof G.pendingEffect, { type: 'baron_result' }>}
          G={G}
          playerID={playerID ?? null}
          onAcknowledge={() => moves.AcknowledgeEffect()}
        />
      )}
    </div>
  );
}

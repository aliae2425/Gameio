import type { BoardProps } from 'boardgame.io/react';
import { SkullKingGameState } from '../../game/types';
import { PlayerHand } from './PlayerHand';
import { BiddingPanel } from './BiddingPanel';
import { ScoreSidebar } from './ScoreSidebar';
import { PlayerSeat } from './PlayerSeat';
import { CenterTrick } from './CenterTrick';
import { ScaryMaryModal } from './ScaryMaryModal';
import { WhaleModal } from './WhaleModal';

export function SkullKingBoard({
  G,
  ctx,
  moves,
  playerID,
  isActive,
}: BoardProps<SkullKingGameState>) {
  const myPlayer = playerID ? G.players[playerID] : null;
  const isBidding = G.phase === 'bidding';
  const isPlaying = G.phase === 'playing';

  // Opponents = everyone except me, in display order
  const opponents = G.playerOrder.filter(id => id !== playerID);

  /* ---- Game Over ---- */
  if (ctx.gameover) {
    const winner = G.players[ctx.gameover.winner];
    return (
      <div className="gameover">
        <div className="gameover-title">☠️ Partie terminée !</div>
        <div className="gameover-winner">
          🏆 Vainqueur : {winner?.name ?? ctx.gameover.winner}
        </div>
        <div style={{ marginTop: 8, color: 'var(--c-text-dim)', fontSize: 14 }}>
          {G.playerOrder.map(id => (
            <div key={id} style={{ margin: '4px 0' }}>
              {G.players[id].name} — {G.players[id].totalScore} pts
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---- Phase label ---- */
  const phaseLabel = isBidding
    ? '🎯 Enchères'
    : isPlaying
      ? `🃏 Tour de ${G.players[ctx.currentPlayer]?.name ?? '?'}`
      : '📊 Calcul des scores…';

  return (
    <div className="sk-board">
      {/* ===== HEADER ===== */}
      <header className="sk-header">
        <div className="sk-header-info">
          <span className="sk-header-round">M {G.round?.roundNumber ?? 0}/10</span>
          <span className="sk-header-phase">{phaseLabel}</span>
        </div>
        <ScoreSidebar G={G} playerID={playerID ?? null} />
      </header>

      {/* ===== MIDDLE : opponents + table ===== */}
      <div className="sk-middle">
        {/* Opponent seats */}
        <div className="sk-opponents">
          {opponents.map(id => (
            <PlayerSeat
              key={id}
              player={G.players[id]}
              isActive={G.phase !== 'bidding'}
              isCurrentTurn={ctx.currentPlayer === id}
            />
          ))}
        </div>

        {/* Table felt with trick */}
        <div className="sk-table">
          <div className="sk-felt">
            {isPlaying && (
              <CenterTrick
                trick={G.round?.currentTrick ?? null}
                players={G.players}
              />
            )}
            {isBidding && (
              <div style={{ color: 'var(--c-text-dim)', fontSize: 13, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
                Tous les joueurs misent simultanément…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== BOTTOM : main toujours visible ===== */}
      {myPlayer && (
        <PlayerHand
          cards={myPlayer.hand}
          isActive={isPlaying && isActive && ctx.currentPlayer === playerID}
          leadSuit={G.round?.currentTrick?.leadSuit ?? null}
          onPlayCard={(cardId) => moves.PlayCard(cardId)}
          silent={isBidding}
        />
      )}

      {/* BiddingPanel en overlay par-dessus la main (position: fixed) */}
      {isBidding && myPlayer && (
        <BiddingPanel
          roundNumber={G.round?.roundNumber ?? 1}
          handSize={myPlayer.hand.length}
          currentBid={myPlayer.bid}
          onBid={(bid) => moves.PlaceBid(bid)}
          isActive={isActive}
        />
      )}

      {/* ===== MODALES ===== */}
      {G.pendingScaryMary?.playerId === playerID && (
        <ScaryMaryModal onChoice={(choice) => moves.DeclareScareMary(choice)} />
      )}

      {G.pendingWhaleChange?.winnerId === playerID && myPlayer && (
        <WhaleModal
          changeAmount={G.pendingWhaleChange.changeAmount}
          currentBid={myPlayer.bid ?? 0}
          onChoice={(direction) => moves.ConfirmWhaleChange(direction)}
        />
      )}
    </div>
  );
}

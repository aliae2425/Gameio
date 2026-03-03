import type { BoardProps } from 'boardgame.io/react';
import { SkullKingGameState } from '../../game/types';
import { PlayerHand } from './PlayerHand';
import { BiddingPanel } from './BiddingPanel';
import { GameSidebar } from './GameSidebar';
import { PlayerSeat } from './PlayerSeat';
import { CenterTrick } from './CenterTrick';
import { ScaryMaryModal } from './ScaryMaryModal';
import { WhaleModal } from './WhaleModal';
import { ScoreChart, PLAYER_COLORS } from './ScoreChart';

function getPositionClass(myIndex: number, targetIndex: number, total: number) {
  if (myIndex === -1) return ''; // Should handle spectator logic if needed
  
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

export function SkullKingBoard({
  G,
  ctx,
  moves,
  playerID,
  isActive,
  matchID,
}: BoardProps<SkullKingGameState> & { matchID?: string }) {
  const myPlayer = playerID ? G.players[playerID] : null;
  const isBidding = G.phase === 'bidding';
  const isPlaying = G.phase === 'playing';

  const myIndex = playerID ? G.playerOrder.indexOf(playerID) : -1;
  const totalPlayers = G.playerOrder.length;

  /* ---- Game Over ---- */
  if (ctx.gameover) {
    const winner = G.players[ctx.gameover.winner];
    const sorted = [...G.playerOrder].sort(
      (a, b) => G.players[b].totalScore - G.players[a].totalScore
    );
    return (
      <div className="sk-board">
        {/* Left: chart + winner */}
        <div className="sk-game-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32, background: '#1a1b1e' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="gameover-title" style={{ marginBottom: 6 }}>☠️ Partie terminée !</div>
            <div className="gameover-winner">
              🏆 {winner?.name ?? ctx.gameover.winner}
            </div>
          </div>

          {/* SVG score evolution chart */}
          <div style={{ width: '100%', maxWidth: 520, padding: '0 8px' }}>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, textAlign: 'center' }}>
              Évolution des scores
            </div>
            <ScoreChart G={G} playerID={playerID ?? null} />
          </div>

          {/* Ranking */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 220 }}>
            {sorted.map((id, rank) => {
              const p = G.players[id];
              const isMe = id === playerID;
              const origIdx = G.playerOrder.indexOf(id);
              const color = PLAYER_COLORS[origIdx % PLAYER_COLORS.length];
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: isMe ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isMe ? color : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 8, padding: '8px 14px',
                }}>
                  <span style={{ fontSize: 18, width: 24 }}>{medals[rank] ?? `${rank + 1}.`}</span>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: color, color: '#18191c',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 12,
                  }}>
                    {p.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span style={{ flex: 1, color: isMe ? '#fff' : '#ccc', fontWeight: isMe ? 700 : 400 }}>
                    {p.name}{isMe ? ' (Moi)' : ''}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 15, color }}>
                    {p.totalScore} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: sidebar with full score history */}
        <GameSidebar G={G} playerID={playerID ?? null} matchID={matchID} />
      </div>
    );
  }

  return (
    <div className="sk-board">
      
      {/* ===== LEFT: Game Area ===== */}
      <div className="sk-game-area">
        <div className="sk-table-felt">
          
          {/* Center Trick */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }}>
             {/* CenterTrick logic needs update to center properly */}
             {isPlaying && (
              <CenterTrick
                trick={G.round?.currentTrick ?? null}
                players={G.players}
              />
            )}
            {isBidding && (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                Phase d'enchères
              </div>
            )}
          </div>

          {/* Players */}
          {G.playerOrder.map((id, index) => {
             const posClass = getPositionClass(myIndex, index, totalPlayers);
             // Skip rendering My Seat logic via PlayerSeat component if we want custom handler for Bottom
             // Actually PlayerSeat handles avatar/name/bid. Hand logic is separate.
             // But for 'seat-bottom', we might want to hide hand stack since we show real cards.
             // PlayerSeat handles showing stack only if useful.
             
             return (
                <PlayerSeat
                  key={id}
                  player={G.players[id]}
                  isActive={G.phase !== 'bidding'}
                  isCurrentTurn={ctx.currentPlayer === id}
                  className={posClass}
                />
             );
          })}

          {/* MY HAND (Absolute Bottom) */}
          {myPlayer && (
            <div className="my-hand-container">
               <PlayerHand
                 cards={myPlayer.hand}
                 isActive={isPlaying && isActive && ctx.currentPlayer === playerID}
                 leadSuit={G.round?.currentTrick?.leadSuit ?? null}
                 onPlayCard={(cardId) => moves.PlayCard(cardId)}
                 silent={isBidding}
               />
            </div>
          )}

          {/* Bidding Overlay */}
          {isBidding && myPlayer && (
             <BiddingPanel
                roundNumber={G.round?.roundNumber ?? 1}
                handSize={myPlayer.hand.length}
                currentBid={myPlayer.bid}
                onBid={(bid) => moves.PlaceBid(bid)}
                isActive={isActive}
             />
          )}

        </div>
      </div>

      {/* ===== RIGHT: Sidebar ===== */}
      <GameSidebar G={G} playerID={playerID ?? null} matchID={matchID} />

      {/* ===== MODALS ===== */}
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

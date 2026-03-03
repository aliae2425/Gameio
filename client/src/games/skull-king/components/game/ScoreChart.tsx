import { SkullKingGameState } from '../../game/types';

export const PLAYER_COLORS = ['#f1c40f', '#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#e67e22'];

interface Props {
  G: SkullKingGameState;
  playerID: string | null;
}

export function ScoreChart({ G, playerID }: Props) {
  const rounds = G.scoreHistory.length;
  if (rounds === 0) return null;

  const VW = 460, VH = 200;
  const pad = { top: 16, right: 82, bottom: 26, left: 44 };
  const plotW = VW - pad.left - pad.right;
  const plotH = VH - pad.top - pad.bottom;

  // Cumulative score per player: index i = total after round i (index 0 = 0)
  const cumul: Record<string, number[]> = {};
  for (const id of G.playerOrder) {
    cumul[id] = [0];
    let sum = 0;
    for (const rs of G.scoreHistory) {
      sum += rs.scores[id]?.roundPoints ?? 0;
      cumul[id].push(sum);
    }
  }

  const allVals = Object.values(cumul).flat();
  const minY = Math.min(0, ...allVals);
  const maxY = Math.max(0, ...allVals);
  const rangeY = maxY - minY || 1;

  const xScale = (i: number) => pad.left + (i / rounds) * plotW;
  const yScale = (v: number) => pad.top + plotH - ((v - minY) / rangeY) * plotH;

  // Y axis ticks (at most 5)
  const rawStep = rangeY / 4;
  const step = Math.max(10, Math.ceil(rawStep / 10) * 10);
  const yTicks: number[] = [];
  let t = Math.ceil(minY / step) * step;
  while (t <= maxY + step * 0.5) { yTicks.push(t); t += step; }

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      style={{ width: '100%', maxWidth: VW, overflow: 'visible' }}
    >
      {/* Horizontal grid + Y labels */}
      {yTicks.map(v => (
        <g key={v}>
          <line
            x1={pad.left} y1={yScale(v)}
            x2={pad.left + plotW} y2={yScale(v)}
            stroke="rgba(255,255,255,0.08)" strokeDasharray="4 3"
          />
          <text x={pad.left - 6} y={yScale(v) + 4}
            textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.4)">
            {v}
          </text>
        </g>
      ))}

      {/* Zero line */}
      {minY < 0 && (
        <line
          x1={pad.left} y1={yScale(0)}
          x2={pad.left + plotW} y2={yScale(0)}
          stroke="rgba(255,255,255,0.25)" strokeWidth={1}
        />
      )}

      {/* X axis ticks */}
      {G.scoreHistory.map((rs, i) => (
        <g key={rs.round}>
          <line
            x1={xScale(i + 1)} y1={yScale(minY)}
            x2={xScale(i + 1)} y2={yScale(minY) + 4}
            stroke="rgba(255,255,255,0.25)"
          />
          <text x={xScale(i + 1)} y={yScale(minY) + 15}
            textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">
            M{rs.round}
          </text>
        </g>
      ))}

      {/* Player lines */}
      {G.playerOrder.map((id, idx) => {
        const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
        const isMe = id === playerID;
        const data = cumul[id];
        const pts = data.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
        const lastVal = data[data.length - 1];

        return (
          <g key={id}>
            <polyline
              points={pts}
              fill="none"
              stroke={color}
              strokeWidth={isMe ? 2.5 : 1.5}
              strokeOpacity={isMe ? 1 : 0.75}
              strokeLinejoin="round"
            />
            {/* Data points (skip index 0 = start) */}
            {data.map((v, i) => i === 0 ? null : (
              <circle key={i}
                cx={xScale(i)} cy={yScale(v)}
                r={isMe ? 3.5 : 2.5}
                fill={color} stroke="#18191c" strokeWidth={1}
              />
            ))}
            {/* End label */}
            <circle
              cx={xScale(rounds)} cy={yScale(lastVal)}
              r={isMe ? 4 : 3}
              fill={color} stroke="#18191c" strokeWidth={1.5}
            />
            <text
              x={xScale(rounds) + 8}
              y={yScale(lastVal) + 4}
              fontSize={9}
              fontWeight={isMe ? 700 : 400}
              fill={isMe ? color : 'rgba(255,255,255,0.7)'}
            >
              {G.players[id].name.substring(0, 9)} ({lastVal})
            </text>
          </g>
        );
      })}
    </svg>
  );
}

import type { AIVisual } from '../../types/hunter';

const FALLBACK_COLORS = [
  '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#f59e0b', '#10b981', '#3b82f6',
];

function color(colors: string[] | undefined, i: number): string {
  return colors?.[i % (colors.length || 1)] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
}

// ── Bar chart ─────────────────────────────────────────────────────────────────

function BarChart({ visual }: { visual: AIVisual }) {
  const W = 320, H = 160;
  const pad = { top: 16, right: 8, bottom: 36, left: 40 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const maxVal = Math.max(...visual.values, 1);
  const count = visual.labels.length;
  const barW = Math.min((innerW / count) * 0.65, 32);
  const gap = (innerW / count - barW) / 2;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    val: Math.round(maxVal * f),
    y: pad.top + innerH * (1 - f),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label={visual.title}>
      {yTicks.map(t => (
        <g key={t.val}>
          <line
            x1={pad.left} y1={t.y} x2={W - pad.right} y2={t.y}
            stroke="rgba(255,255,255,0.06)" strokeWidth={1}
          />
          <text
            x={pad.left - 4} y={t.y + 3.5}
            textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.3)"
          >
            {t.val >= 1000 ? `${Math.round(t.val / 1000)}k` : t.val}
          </text>
        </g>
      ))}

      {visual.values.map((val, i) => {
        const x = pad.left + gap + i * (innerW / count);
        const barH = (val / maxVal) * innerH;
        const y = pad.top + innerH - barH;
        return (
          <rect
            key={i}
            x={x} y={y} width={barW} height={barH}
            rx={3} fill={color(visual.colors, i)} opacity={0.85}
          />
        );
      })}

      {visual.labels.map((label, i) => (
        <text
          key={i}
          x={pad.left + gap + i * (innerW / count) + barW / 2}
          y={H - pad.bottom + 14}
          textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)"
        >
          {label.length > 10 ? label.slice(0, 9) + '…' : label}
        </text>
      ))}
    </svg>
  );
}

// ── Line chart ────────────────────────────────────────────────────────────────

function LineChart({ visual }: { visual: AIVisual }) {
  const W = 320, H = 150;
  const pad = { top: 16, right: 8, bottom: 28, left: 40 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const maxVal = Math.max(...visual.values, 1);
  const count = visual.labels.length;
  const clr = color(visual.colors, 0);

  function pt(i: number, val: number) {
    return {
      x: pad.left + (i / Math.max(count - 1, 1)) * innerW,
      y: pad.top + innerH * (1 - val / maxVal),
    };
  }

  const points = visual.values.map((v, i) => pt(i, v));
  const polyPts = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label={visual.title}>
      {[0, 0.5, 1].map(f => {
        const y = pad.top + innerH * (1 - f);
        return (
          <line key={f} x1={pad.left} y1={y} x2={W - pad.right} y2={y}
            stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        );
      })}

      <polyline points={polyPts} fill="none" stroke={clr} strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={clr} />
      ))}

      {visual.labels.map((label, i) => {
        const p = pt(i, 0);
        return (
          <text key={i} x={p.x} y={H - pad.bottom + 14}
            textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">
            {label.length > 8 ? label.slice(0, 7) + '…' : label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Pie / Donut chart ─────────────────────────────────────────────────────────

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function PieChart({ visual, donut }: { visual: AIVisual; donut?: boolean }) {
  const cx = 75, cy = 75, r = 60;
  const inner = donut ? 32 : 0;
  const total = visual.values.reduce((a, b) => a + b, 0) || 1;
  let angle = 0;

  return (
    <svg viewBox="0 0 150 150" className="w-full max-w-[140px]" aria-label={visual.title}>
      {visual.values.map((val, i) => {
        const sweep = (val / total) * 360;
        const start = angle;
        const end = angle + sweep;
        const clr = color(visual.colors, i);
        angle += sweep;

        if (inner > 0) {
          const sO = polar(cx, cy, r, start);
          const eO = polar(cx, cy, r, end);
          const sI = polar(cx, cy, inner, end);
          const eI = polar(cx, cy, inner, start);
          const large = sweep > 180 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M ${sO.x} ${sO.y} A ${r} ${r} 0 ${large} 1 ${eO.x} ${eO.y} L ${sI.x} ${sI.y} A ${inner} ${inner} 0 ${large} 0 ${eI.x} ${eI.y} Z`}
              fill={clr} opacity={0.85}
            />
          );
        }

        const sO = polar(cx, cy, r, start);
        const eO = polar(cx, cy, r, end);
        const large = sweep > 180 ? 1 : 0;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${sO.x} ${sO.y} A ${r} ${r} 0 ${large} 1 ${eO.x} ${eO.y} Z`}
            fill={clr} opacity={0.85}
          />
        );
      })}
    </svg>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend({ visual }: { visual: AIVisual }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 px-1">
      {visual.labels.map((label, i) => (
        <span key={label} className="flex items-center gap-1.5 text-[10px] font-semibold text-white/50">
          <span className="h-2 w-2 rounded-full" style={{ background: color(visual.colors, i) }} />
          {label}
        </span>
      ))}
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

export function HunterChartBlock({ visual }: { visual: AIVisual }) {
  const isPie = visual.kind === 'pie' || visual.kind === 'donut';

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
      <div className="border-b border-white/[0.06] px-4 py-2.5">
        <p className="text-xs font-black text-white/70">{visual.title}</p>
      </div>
      <div className="px-3 pt-3">
        {visual.kind === 'bar' && <BarChart visual={visual} />}
        {visual.kind === 'line' && <LineChart visual={visual} />}
        {isPie && (
          <div className="flex items-center gap-4">
            <PieChart visual={visual} donut={visual.kind === 'donut'} />
            <Legend visual={visual} />
          </div>
        )}
        {!isPie && (
          <div className="mt-1 pb-1">
            <Legend visual={visual} />
          </div>
        )}
      </div>
    </div>
  );
}

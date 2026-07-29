/**
 * AreaChart / Sparkline — dependency-free SVG charts (keeps the bundle small).
 *
 * Skill "Charts & Data": legend/tooltip affordances, accessible colours, never
 * colour-only meaning — each point exposes a title and the axis labels render as
 * text. The drawing animation is a stroke dash reveal (transform-free).
 */
import { memo, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '../../lib/cn.js';
import { EASE_2 } from '../../lib/motion.js';

function buildPath(points, w, h, pad, max) {
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  return points.map((p, i) => {
    const x = pad + i * step;
    const y = h - pad - (max ? (p.count / max) * (h - pad * 2) : 0);
    return { x, y, ...p };
  });
}

export const AreaChart = memo(function AreaChart({
  data = [],
  height = 200,
  className,
  showAxis = true,
}) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(null);
  const w = 640;
  const pad = 24;

  const { pts, line, area, max } = useMemo(() => {
    const m = Math.max(1, ...data.map((d) => d.count));
    const p = buildPath(data, w, height, pad, m);
    const l = p.map((q, i) => `${i === 0 ? 'M' : 'L'} ${q.x} ${q.y}`).join(' ');
    const a = p.length
      ? `${l} L ${p[p.length - 1].x} ${height - pad} L ${p[0].x} ${height - pad} Z`
      : '';
    return { pts: p, line: l, area: a, max: m };
  }, [data, height]);

  if (!data.length) {
    return (
      <div className={cn('flex h-40 items-center justify-center text-sm text-muted-foreground', className)}>
        No data for this period
      </div>
    );
  }

  return (
    <div className={cn('relative w-full', className)}>
      <svg
        viewBox={`0 0 ${w} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Booking trend: ${data.map((d) => `${d.date} ${d.count}`).join(', ')}`}
      >
        <defs>
          <linearGradient id="rf-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--c-primary))" stopOpacity="0.32" />
            <stop offset="100%" stopColor="rgb(var(--c-primary))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rf-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--c-primary))" />
            <stop offset="100%" stopColor="rgb(var(--c-violet))" />
          </linearGradient>
        </defs>

        {/* horizontal guides */}
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={w - pad}
            y1={pad + f * (height - pad * 2)}
            y2={pad + f * (height - pad * 2)}
            className="stroke-border"
            strokeDasharray="4 6"
          />
        ))}

        <motion.path
          d={area}
          fill="url(#rf-area)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="url(#rf-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE_2 }}
        />

        {pts.map((p) => (
          <g key={p.date}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === p.date ? 5 : 3.5}
              fill="rgb(var(--c-surface))"
              stroke="rgb(var(--c-primary))"
              strokeWidth="2.5"
              className="transition-all"
            />
            {/* generous invisible hit area for hover/touch */}
            <rect
              x={p.x - 16}
              y={0}
              width={32}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHover(p.date)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${p.date}: ${p.count} bookings`}</title>
            </rect>
          </g>
        ))}
      </svg>

      {showAxis && (
        <div className="mt-1 flex justify-between px-6 text-[10px] text-muted-foreground">
          {data.map((d) => (
            <span key={d.date}>{d.date.slice(5)}</span>
          ))}
        </div>
      )}
      <div className="absolute right-0 top-0 text-[10px] text-muted-foreground">peak {max}</div>
    </div>
  );
});

/** Tiny inline trend line for KPI cards. */
export const Sparkline = memo(function Sparkline({ data = [], className }) {
  const w = 100;
  const h = 28;
  const max = Math.max(1, ...data);
  const d = data
    .map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * w;
      const y = h - (v / max) * h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn('h-7 w-24', className)} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
});

export default AreaChart;

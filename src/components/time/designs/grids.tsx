/**
 * File: src/components/time/designs/grids.tsx
 * Description: The four stripe and grid designs of /time: warming stripes (one stripe per month, coloured by memory density, with a
 * thin mood stripe under it), life in weeks (a grid of every week, one row per year), small multiples (a tiny calendar of weeks for
 * every year, tiled) and week rhythm (a punchcard of weekday against month). The two week grids are drawn as a few paths, one per
 * level of colour, and read the pointer by position, so thousands of cells cost a handful of elements.
 */
import { useMemo } from 'react';
import type { PointerEvent } from 'react';
import { anim } from '@/components/chartstudy/shared';
import { f, gauss } from '@/lib/time/geometry';
import {
  DENSITY,
  MONTHS,
  MONTH_LONG,
  MOOD,
  N_MONTHS,
  NOW,
  NY,
  WEEKDAY_MONTH,
  WEEKDAYS,
  WEEKS,
  Y0,
  YEAR_TOTAL,
} from '@/lib/time/data';
import { accent, dens, moodHue } from '../colour';
import { plural, svgPoint, Txt, type DesignProps } from '../kit';

const level = (c: number) => (c === 0 ? 0 : c === 1 ? 1 : c === 2 ? 2 : c === 3 ? 3 : 4);
const LEVEL_T = [0, 0.25, 0.5, 0.75, 1];
const cellPath = (x: number, y: number, w: number, h: number) => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}z`;

/** The week of year that has not happened yet, in the current year. */
const FUTURE_FROM = Math.floor((NOW - Math.floor(NOW)) * 52);

/* ── T05 Warming stripes ──────────────────────────────────────────────────────────────────────────────────────────── */
export function WarmingStripes({ mode, live }: DesignProps) {
  const { dn, mood, max } = useMemo(() => {
    const d = gauss(DENSITY, 0.8);
    return { dn: d, mood: gauss(MOOD, 1.2), max: Math.max(...d) };
  }, []);
  const w = 452 / N_MONTHS;
  return (
    <g>
      <Txt x={14} y={24} size={10}>
        Memories per month
      </Txt>
      <g style={anim(live, 'fw-tm-wipe', 1400)}>
        {dn.map((v, i) => (
          <rect
            key={i}
            x={f(14 + i * w)}
            y={30}
            width={f(w + 0.35)}
            height={180}
            fill={dens(mode, v / max)}
            data-hint={`${MONTHS[i % 12]} ${Y0 + Math.floor(i / 12)} · ${plural(DENSITY[i], 'memory', 'memories')} · mood ${MOOD[i] >= 0 ? '+' : ''}${MOOD[i].toFixed(2)}`}
          />
        ))}
      </g>
      <Txt x={14} y={226} size={10}>
        Average mood
      </Txt>
      <g style={anim(live, 'fw-tm-wipe', 1400, { delay: 200 })}>
        {mood.map((v, i) => (
          <rect key={i} x={f(14 + i * w)} y={232} width={f(w + 0.35)} height={26} fill={DENSITY[i] ? moodHue(mode, v * 2.2) : 'var(--rail)'} fillOpacity={DENSITY[i] ? 0.95 : 0.4} />
        ))}
      </g>
      {Array.from({ length: 7 }, (_, k) => 1995 + k * 5).map((y) => (
        <Txt key={y} x={14 + (y - Y0) * 12 * w} y={278} size={10} anchor="middle">
          {y}
        </Txt>
      ))}
      <Txt x={14} y={312} size={10}>
        One stripe is one month. Dim is quiet, bright is full; the lower band is how it felt.
      </Txt>
    </g>
  );
}

/* ── T06 Life in weeks ────────────────────────────────────────────────────────────────────────────────────────────── */
const LW = { x0: 44, y0: 26, p: 8.1, c: 6.6 };

export function LifeInWeeks({ mode, live, hint }: DesignProps) {
  const paths = useMemo(() => {
    const out: string[] = ['', '', '', '', '', ''];
    for (let yi = 0; yi < NY; yi++) {
      for (let w = 0; w < 52; w++) {
        const future = yi === NY - 1 && w >= FUTURE_FROM;
        const k = future ? 5 : level(WEEKS[yi][w]);
        out[k] += cellPath(LW.x0 + w * LW.p, LW.y0 + yi * LW.p, LW.c, LW.c);
      }
    }
    return out;
  }, []);
  const onMove = (e: PointerEvent<SVGElement>) => {
    const [px, py] = svgPoint(e);
    const col = Math.floor((px - LW.x0) / LW.p);
    const row = Math.floor((py - LW.y0) / LW.p);
    if (col < 0 || col > 51 || row < 0 || row >= NY) return hint(null);
    const c = WEEKS[row][col];
    hint(`${Y0 + row} · week ${col + 1} · ${plural(c, 'memory', 'memories')}`);
  };
  return (
    <g>
      <g style={anim(live, 'fw-tm-fade', 900)}>
        {paths.map((d, k) => (
          <path key={k} d={d} fill={k === 5 ? 'var(--rail)' : k === 0 ? 'var(--rail)' : dens(mode, LEVEL_T[k])} fillOpacity={k === 0 ? 0.45 : k === 5 ? 0.18 : 1} />
        ))}
      </g>
      {[0, 3, 6, 9].map((m) => (
        <Txt key={m} x={LW.x0 + (m / 12) * 52 * LW.p} y={18} size={10}>
          {MONTHS[m]}
        </Txt>
      ))}
      {Array.from({ length: 8 }, (_, k) => k * 5).map((yi) => (
        <Txt key={yi} x={LW.x0 - 6} y={LW.y0 + yi * LW.p + 6} anchor="end" size={9}>
          {Y0 + yi}
        </Txt>
      ))}
      <Txt x={LW.x0 + 52 * LW.p + 6} y={LW.y0 + (NY - 1) * LW.p + 6} size={9} fill={accent(mode)}>
        now
      </Txt>
      <rect x={LW.x0} y={LW.y0} width={52 * LW.p} height={NY * LW.p} fill="rgba(0,0,0,0)" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => hint(null)} />
    </g>
  );
}

/* ── T07 Small multiples ──────────────────────────────────────────────────────────────────────────────────────────── */
const SM = { cols: 7, tw: 64.5, th: 61, x0: 14, y0: 6, bx: 2, by: 14, cw: 3.7, ch: 9, px: 4.5, py: 10.5 };

export function SmallMultiples({ mode, live, hint }: DesignProps) {
  const paths = useMemo(() => {
    const out: string[] = ['', '', '', '', '', ''];
    for (let yi = 0; yi < NY; yi++) {
      const ox = SM.x0 + (yi % SM.cols) * SM.tw + SM.bx;
      const oy = SM.y0 + Math.floor(yi / SM.cols) * SM.th + SM.by;
      for (let w = 0; w < 52; w++) {
        const future = yi === NY - 1 && w >= FUTURE_FROM;
        const k = future ? 5 : level(WEEKS[yi][w]);
        out[k] += cellPath(ox + (w % 13) * SM.px, oy + Math.floor(w / 13) * SM.py, SM.cw, SM.ch);
      }
    }
    return out;
  }, []);
  const maxYear = Math.max(...YEAR_TOTAL);
  const onMove = (e: PointerEvent<SVGElement>) => {
    const [px, py] = svgPoint(e);
    const tc = Math.floor((px - SM.x0) / SM.tw);
    const tr = Math.floor((py - SM.y0) / SM.th);
    const yi = tr * SM.cols + tc;
    if (tc < 0 || tc >= SM.cols || tr < 0 || yi >= NY) return hint(null);
    const bx = SM.x0 + tc * SM.tw + SM.bx;
    const by = SM.y0 + tr * SM.th + SM.by;
    const col = Math.floor((px - bx) / SM.px);
    const row = Math.floor((py - by) / SM.py);
    if (col < 0 || col > 12 || row < 0 || row > 3) return hint(`${Y0 + yi} · ${plural(YEAR_TOTAL[yi], 'memory', 'memories')}`);
    const w = row * 13 + col;
    hint(`${Y0 + yi} · week ${w + 1} · ${plural(WEEKS[yi][w], 'memory', 'memories')}`);
  };
  return (
    <g>
      <g style={anim(live, 'fw-tm-fade', 900)}>
        {paths.map((d, k) => (
          <path key={k} d={d} fill={k === 5 ? 'var(--rail)' : k === 0 ? 'var(--rail)' : dens(mode, LEVEL_T[k])} fillOpacity={k === 0 ? 0.4 : k === 5 ? 0.15 : 1} />
        ))}
      </g>
      {Array.from({ length: NY }, (_, yi) => (
        <Txt key={yi} x={SM.x0 + (yi % SM.cols) * SM.tw + SM.bx} y={SM.y0 + Math.floor(yi / SM.cols) * SM.th + 9} size={9} hi={YEAR_TOTAL[yi] >= maxYear * 0.85} fill={YEAR_TOTAL[yi] >= maxYear * 0.85 ? accent(mode) : undefined}>
          {Y0 + yi}
        </Txt>
      ))}
      <rect x={SM.x0} y={SM.y0} width={SM.cols * SM.tw} height={5 * SM.th} fill="rgba(0,0,0,0)" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => hint(null)} />
    </g>
  );
}

/* ── T08 Week rhythm ──────────────────────────────────────────────────────────────────────────────────────────────── */
export function WeekRhythm({ mode, live }: DesignProps) {
  const max = Math.max(...WEEKDAY_MONTH.flat());
  const rowTot = WEEKDAY_MONTH.map((r) => r.reduce((a, b) => a + b, 0));
  const colTot = MONTHS.map((_, m) => WEEKDAY_MONTH.reduce((a, r) => a + r[m], 0));
  let best: [number, number] = [0, 0];
  WEEKDAY_MONTH.forEach((r, d) => r.forEach((c, m) => c > WEEKDAY_MONTH[best[0]][best[1]] && (best = [d, m])));
  const may = 4;
  const X = (m: number) => 100 + m * 30;
  const Y = (d: number) => 66 + d * 30;
  return (
    <g>
      {MONTHS.map((n, m) => (
        <Txt key={n} x={X(m)} y={42} anchor="middle" size={10} hi={m === colTot.indexOf(Math.max(...colTot))} fill={m === may ? accent(mode) : undefined}>
          {n}
        </Txt>
      ))}
      {WEEKDAYS.map((n, d) => (
        <g key={n}>
          <Txt x={78} y={Y(d) + 3} anchor="end" size={10}>
            {n}
          </Txt>
          <line x1={92} x2={X(11) + 14} y1={Y(d)} y2={Y(d)} stroke="var(--rail)" strokeWidth={0.6} />
          <Txt x={X(11) + 26} y={Y(d) + 3} size={9}>
            {rowTot[d]}
          </Txt>
        </g>
      ))}
      {WEEKDAY_MONTH.map((row, d) =>
        row.map((c, m) => {
          const t = c / max;
          const r = 1.6 + 11.5 * Math.sqrt(t);
          return (
            <g key={`${d}-${m}`} style={anim(live, 'fw-tm-pop', 450, { delay: (d * 12 + m) * 8 })} className="fw-tm-box" data-hint={`${WEEKDAYS[d]} in ${MONTH_LONG[m]} · ${plural(c, 'memory', 'memories')} over 35 years`}>
              <circle cx={X(m)} cy={Y(d)} r={r * 1.7} fill={dens(mode, t * 0.45)} />
              <circle cx={X(m)} cy={Y(d)} r={r} fill={dens(mode, 0.35 + 0.65 * t)} />
            </g>
          );
        })
      )}
      {colTot.map((c, m) => (
        <Txt key={m} x={X(m)} y={Y(7) + 4} anchor="middle" size={9}>
          {c}
        </Txt>
      ))}
      <Txt x={14} y={312} size={10}>
        Busiest: {WEEKDAYS[best[0]]} in {MONTH_LONG[best[1]]}, {WEEKDAY_MONTH[best[0]][best[1]]} memories. Bubble area is the count.
      </Txt>
    </g>
  );
}

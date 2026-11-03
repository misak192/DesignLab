/**
 * File: src/components/time/designs/links.tsx
 * Description: The four period and link designs of /time: period lanes (the chapters of a life as soft bars, one lane each), the
 * arc diagram (arcs join the memories that share a person, above and below the line), dot lanes (a beeswarm per label over a soft
 * density glow) and the constellation (the strongest memory of each year joined into a star chart, height is mood).
 */
import { useMemo } from 'react';
import { anim, bright, shiftRgb, tint } from '@/components/chartstudy/shared';
import { f, gauss, smooth } from '@/lib/time/geometry';
import { LABEL_YEAR, LABELS, LANES, MEMORIES, MONTHS, NOW, NY, PEOPLE, periodsIn, Y0 } from '@/lib/time/data';
import { accent, kindHue, labelHue } from '../colour';
import { plural, Txt, xT, type DesignProps } from '../kit';

const yearTicks = (x0: number, x1: number, y: number) =>
  Array.from({ length: 7 }, (_, k) => 1995 + k * 5).map((yr) => (
    <Txt key={yr} x={xT(yr, x0, x1)} y={y} size={10} anchor="middle">
      {yr}
    </Txt>
  ));

/* ── T13 Period lanes ─────────────────────────────────────────────────────────────────────────────────────────────── */
export function PeriodLanes({ mode, live }: DesignProps) {
  const x0 = 78;
  const x1 = 466;
  const X = (t: number) => xT(t, x0, x1);
  const bars = LANES.flatMap((lane, li) => {
    let above = 0;
    return periodsIn(lane.id).map((p, i) => {
      const w = X(p.end) - X(p.start);
      const fits = w >= p.name.length * 5.4 + 16;
      // A name that does not fit goes above its bar, on alternating heights so neighbours do not run together.
      const lift = fits ? 0 : 21 + (above++ % 2) * 12;
      return { p, li, i, cy: 62 + li * 66, x: X(p.start), w, fits, lift, hue: kindHue(mode, li, i) };
    });
  });
  return (
    <g>
      <defs>
        {bars.map((b) => (
          <linearGradient key={b.p.id} id={`tm-pl-${b.p.id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={b.hue} stopOpacity="0" />
            <stop offset="0.08" stopColor={shiftRgb(b.hue, 30)} stopOpacity="0.92" />
            <stop offset="0.92" stopColor={shiftRgb(b.hue, -30)} stopOpacity="0.92" />
            <stop offset="1" stopColor={b.hue} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {LANES.map((lane, li) => (
        <g key={lane.id}>
          <line x1={x0} x2={x1} y1={62 + li * 66} y2={62 + li * 66} stroke="var(--rail)" strokeWidth={0.6} />
          <Txt x={70} y={65 + li * 66} anchor="end" size={10}>
            {lane.name}
          </Txt>
        </g>
      ))}
      {bars.map((b, k) => (
        <g key={b.p.id} style={anim(live, 'fw-tm-wipe', 700, { delay: k * 60 })} data-hint={`${b.p.name} · ${Math.floor(b.p.start)} to ${b.p.end >= NOW ? 'now' : Math.floor(b.p.end)} · ${(b.p.end - b.p.start).toFixed(1)} years`}>
          <rect x={f(b.x)} y={b.cy - 15} width={f(b.w)} height={30} fill={`url(#tm-pl-${b.p.id})`} />
          <Txt x={b.fits ? b.x + b.w / 2 : b.x + 2} y={b.fits ? b.cy + 3 : b.cy - b.lift} anchor={b.fits ? 'middle' : 'start'} size={10} hi>
            {b.p.name}
          </Txt>
        </g>
      ))}
      <line x1={X(NOW)} x2={X(NOW)} y1={30} y2={290} stroke={accent(mode)} strokeWidth={0.8} strokeDasharray="1 3" />
      <Txt x={X(NOW)} y={22} anchor="middle" size={10} fill={accent(mode)}>
        now
      </Txt>
      {yearTicks(x0, x1, 312)}
    </g>
  );
}

/* ── T14 Arc diagram ──────────────────────────────────────────────────────────────────────────────────────────────── */
export function ArcDiagram({ mode, live }: DesignProps) {
  const people = useMemo(() => {
    const counts = PEOPLE.map((_, i) => MEMORIES.filter((m) => m.person === i).length);
    const top = counts.map((c, i) => ({ c, i })).sort((a, b) => b.c - a.c).slice(0, 5).map((o) => o.i);
    return top.map((pi, k) => {
      const ms = MEMORIES.filter((m) => m.person === pi).sort((a, b) => a.t - b.t);
      const n = Math.min(13, ms.length);
      const chosen = Array.from({ length: n }, (_, j) => ms[Math.round((j * (ms.length - 1)) / (n - 1))]);
      // Each memory joins the next one and the one after that, so short arcs sit under long ones.
      const arcs: { a: number; b: number }[] = [];
      for (let j = 0; j < chosen.length - 1; j++) {
        for (const step of [1, 3]) {
          const to = chosen[j + step];
          if (to && xT(to.t) - xT(chosen[j].t) > 14) arcs.push({ a: chosen[j].t, b: to.t });
        }
      }
      return { pi, k, name: PEOPLE[pi].name, count: ms.length, chosen, arcs };
    });
  }, []);
  const base = 165;
  return (
    <g>
      <line x1={14} x2={466} y1={base} y2={base} stroke="var(--rail)" strokeWidth={0.6} />
      {people.map((p) => {
        const hue = labelHue(mode, p.k);
        const up = p.k % 2 === 0;
        return (
          <g key={p.pi} style={anim(live, 'fw-tm-fade', 600, { delay: p.k * 160 })}>
            {p.arcs.map((a, j) => {
              const xa = xT(a.a);
              const xb = xT(a.b);
              const rx = (xb - xa) / 2;
              const ry = Math.min(rx, 120);
              return (
                <path
                  key={j}
                  d={`M${f(xa)} ${base}A${f(rx)} ${f(ry)} 0 0 ${up ? 1 : 0} ${f(xb)} ${base}`}
                  fill="none"
                  stroke={tint(hue, 0.7)}
                  strokeWidth={1.2}
                  data-hint={`${p.name} · ${Math.floor(a.a)} to ${Math.floor(a.b)} · ${plural(p.count, 'memory', 'memories')} in all`}
                />
              );
            })}
            {p.chosen.map((m) => (
              <circle key={m.id} cx={f(xT(m.t))} cy={base} r={2.2} fill={hue} />
            ))}
          </g>
        );
      })}
      {yearTicks(14, 466, 300)}
      {people.map((p) => (
        <g key={p.pi}>
          <circle cx={20 + p.k * 88} cy={313} r={3} fill={labelHue(mode, p.k)} />
          <Txt x={28 + p.k * 88} y={316} size={10} hi>
            {p.name}
          </Txt>
        </g>
      ))}
    </g>
  );
}

/* ── T15 Dot lanes (beeswarm) ─────────────────────────────────────────────────────────────────────────────────────── */
export function DotLanes({ mode, live }: DesignProps) {
  const x0 = 70;
  const x1 = 466;
  const rows = useMemo(() => {
    const maxAll = Math.max(...LABEL_YEAR.map((a) => Math.max(...gauss(a, 1.0))));
    return LABELS.map((_, l) => {
      const ms = MEMORIES.filter((m) => m.label === l).sort((a, b) => a.t - b.t);
      const placed: { x: number; y: number; r: number }[] = [];
      for (const m of ms) {
        const x = xT(m.t, x0, x1);
        const r = 1.3 + m.weight * 0.45;
        let y = 0;
        for (let k = 0; k < 24; k++) {
          const cand = k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 1.7;
          if (placed.every((p) => Math.abs(p.x - x) > 8 || (p.x - x) ** 2 + (p.y - cand) ** 2 >= (p.r + r + 0.3) ** 2)) {
            y = cand;
            break;
          }
        }
        placed.push({ x, y, r });
      }
      const sm = gauss(LABEL_YEAR[l], 1.0);
      const xs = sm.map((_, i) => xT(Y0 + i + 0.5, x0, x1));
      const half = sm.map((v) => 2 + (16 * v) / maxAll);
      return { l, placed, count: ms.length, xs, half };
    });
  }, []);
  return (
    <g>
      <defs>
        {rows.map((r) => (
          <linearGradient key={r.l} id={`tm-dl-${r.l}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={labelHue(mode, r.l)} stopOpacity="0" />
            <stop offset="0.5" stopColor={labelHue(mode, r.l)} stopOpacity="0.4" />
            <stop offset="1" stopColor={labelHue(mode, r.l)} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {rows.map((r) => {
        const cy = 46 + r.l * 47;
        const hue = labelHue(mode, r.l);
        const top = r.xs.map((x, i) => [x, cy - r.half[i]] as [number, number]);
        const bot = r.xs.map((x, i) => [x, cy + r.half[i]] as [number, number]).reverse();
        return (
          <g key={r.l} style={anim(live, 'fw-tm-fade', 600, { delay: r.l * 120 })} data-hint={`${LABELS[r.l].name} · ${plural(r.count, 'memory', 'memories')}`}>
            <path d={`${smooth(top)}${smooth(bot, true)}Z`} fill={`url(#tm-dl-${r.l})`} />
            {r.placed.map((p, i) => (
              <circle key={i} cx={f(p.x)} cy={f(cy + p.y)} r={f(p.r)} fill={hue} fillOpacity={0.9} />
            ))}
            <Txt x={62} y={cy + 3} anchor="end" size={10} fill={hue}>
              {LABELS[r.l].name}
            </Txt>
          </g>
        );
      })}
      {yearTicks(x0, x1, 314)}
    </g>
  );
}

/* ── T16 Constellation ────────────────────────────────────────────────────────────────────────────────────────────── */
const STAR = 'M0 -1Q0.07 -0.07 1 0Q0.07 0.07 0 1Q-0.07 0.07 -1 0Q-0.07 -0.07 0 -1Z';

export function Constellation({ mode, live }: DesignProps) {
  const geo = useMemo(() => {
    const Y = (mood: number) => Math.min(286, Math.max(34, 160 - mood * 120));
    const stars = [];
    const star = new Set<number>();
    for (let yi = 0; yi < NY; yi++) {
      const ms = MEMORIES.filter((m) => m.year === Y0 + yi).sort((a, b) => b.weight - a.weight || a.id - b.id).slice(0, 2);
      for (const m of ms) star.add(m.id);
    }
    for (const m of MEMORIES) if (star.has(m.id)) stars.push({ m, x: xT(m.t), y: Y(m.mood) });
    stars.sort((a, b) => a.m.t - b.m.t);
    const dust = MEMORIES.filter((m) => !star.has(m.id)).map((m) => `M${f(xT(m.t))} ${f(Y(m.mood))}h1v1h-1z`).join('');
    const line = stars.map((s, i) => `${i ? 'L' : 'M'}${f(s.x)} ${f(s.y)}`).join('');
    return { stars, dust, line };
  }, []);
  return (
    <g>
      <defs>
        {LABELS.map((_, l) => (
          <radialGradient key={l} id={`tm-cs-${l}`}>
            <stop offset="0" stopColor={labelHue(mode, l)} stopOpacity="0.65" />
            <stop offset="1" stopColor={labelHue(mode, l)} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      <path d={geo.dust} fill="var(--ink-3)" fillOpacity={0.5} style={anim(live, 'fw-tm-fade', 900)} />
      <path d={geo.line} fill="none" stroke={tint(accent(mode), 0.55)} strokeWidth={0.8} strokeLinejoin="round" style={anim(live, 'fw-tm-wipe', 1800, { delay: 300 })} />
      {geo.stars.map(({ m, x, y }, i) => {
        const size = 2.2 + m.weight * 0.9;
        const hue = labelHue(mode, m.label);
        return (
          <g key={m.id} style={anim(live, 'fw-tm-fade', 500, { delay: 300 + i * 22 })} data-hint={`${MONTHS[m.month]} ${m.year} · ${LABELS[m.label].name} · weight ${m.weight} of 5 · mood ${m.mood >= 0 ? '+' : ''}${m.mood.toFixed(2)}`}>
            <circle cx={f(x)} cy={f(y)} r={f(size * 2.6)} fill={`url(#tm-cs-${m.label})`} />
            <path d={STAR} transform={`translate(${f(x)} ${f(y)}) scale(${f(size)})`} fill={bright(hue, 0.85)} />
          </g>
        );
      })}
      <Txt x={14} y={20} size={10}>
        a good day
      </Txt>
      <Txt x={14} y={300} size={10}>
        a hard one
      </Txt>
      {yearTicks(14, 466, 318)}
    </g>
  );
}

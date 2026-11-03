/**
 * File: src/components/time/designs/flows.tsx
 * Description: The four flow and density designs of /time: the streamgraph (labels swell and shrink over the years around a
 * moving centre), the ridgeline (one curve per year showing when in the year memories cluster), the glowing timeline (one line of
 * light that swells with density, with the richest months as stems) and the sankey of chapters (places, work and focus, joined
 * by the time they overlapped). Gradients, masks and paths only: no blur filter.
 */
import { useMemo } from 'react';
import { anim, bright, shiftRgb } from '@/components/chartstudy/shared';
import { argmax, f, gauss, smooth } from '@/lib/time/geometry';
import { DENSITY, LABEL_YEAR, LABELS, MONTHS, N_MONTHS, NL, NOW, NY, WEEKS, Y0, type Lane, type Period, periodsIn } from '@/lib/time/data';
import { accent, hueOf, kindHue, labelHue } from '../colour';
import { Txt, W, xT, type DesignProps } from '../kit';

/* ── T09 Streamgraph ──────────────────────────────────────────────────────────────────────────────────────────────── */
export function Streamgraph({ mode, live }: DesignProps) {
  const geo = useMemo(() => {
    const S = LABEL_YEAR.map((a) => gauss(a, 1.0));
    const tot = Array.from({ length: NY }, (_, i) => S.reduce((a, s) => a + s[i], 0));
    const k = 230 / Math.max(...tot);
    const cy = 150;
    const xs = Array.from({ length: NY }, (_, i) => xT(Y0 + i + 0.5));
    const cum = Array.from({ length: NL + 1 }, () => Array.from({ length: NY }, () => 0));
    for (let i = 0; i < NY; i++) {
      cum[0][i] = cy - (tot[i] * k) / 2;
      for (let l = 0; l < NL; l++) cum[l + 1][i] = cum[l][i] + S[l][i] * k;
    }
    return { S, xs, cum, tot };
  }, []);
  return (
    <g>
      <defs>
        <linearGradient id="tm-sg-fx" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.07" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.93" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="tm-sg-m" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height="320">
          <rect width={W} height="320" fill="url(#tm-sg-fx)" />
        </mask>
        {LABELS.map((_, l) => {
          const h = labelHue(mode, l);
          return (
            <linearGradient key={l} id={`tm-sg-g${l}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={shiftRgb(h, 34)} stopOpacity="0.95" />
              <stop offset="1" stopColor={shiftRgb(h, -34)} stopOpacity="0.8" />
            </linearGradient>
          );
        })}
      </defs>
      <g mask="url(#tm-sg-m)" style={anim(live, 'fw-tm-wipe', 1300)}>
        {LABELS.map((lab, l) => {
          const top = geo.xs.map((x, i) => [x, geo.cum[l][i]] as [number, number]);
          const bot = geo.xs.map((x, i) => [x, geo.cum[l + 1][i]] as [number, number]).reverse();
          const d = `${smooth(top)}${smooth(bot, true)}Z`;
          return <path key={lab.id} d={d} fill={`url(#tm-sg-g${l})`} data-hint={`${lab.name} · ${LABEL_YEAR[l].reduce((a, b) => a + b, 0)} memories, busiest around ${Y0 + argmax(geo.S[l])}`} />;
        })}
      </g>
      {LABELS.map((lab, l) => {
        const i = argmax(geo.S[l]);
        const y = (geo.cum[l][i] + geo.cum[l + 1][i]) / 2;
        return (
          <g key={lab.id} style={{ pointerEvents: 'none' }}>
            <Txt x={geo.xs[i]} y={y + 3} anchor="middle" size={10} hi>
              {lab.name}
            </Txt>
          </g>
        );
      })}
      {Array.from({ length: 7 }, (_, k) => 1995 + k * 5).map((y) => (
        <Txt key={y} x={xT(y)} y={312} size={10} anchor="middle">
          {y}
        </Txt>
      ))}
    </g>
  );
}

/* ── T10 Ridgeline ────────────────────────────────────────────────────────────────────────────────────────────────── */
const RIDGE_FROM = 2007;

export function Ridgeline({ mode, live }: DesignProps) {
  const ridges = useMemo(() => {
    const years = Array.from({ length: Y0 + NY - RIDGE_FROM }, (_, i) => RIDGE_FROM + i);
    const sm = years.map((y) => gauss(WEEKS[y - Y0], 1.5));
    const max = Math.max(...sm.flat());
    const x0 = 46;
    const x1 = 466;
    return years.map((y, i) => {
      const base = 70 + (i * (300 - 70)) / (years.length - 1);
      const pts = sm[i].map((v, w) => [x0 + ((w + 0.5) / 52) * (x1 - x0), base - 40 * (v / max)] as [number, number]);
      return { y, i, base, line: smooth(pts), area: `M${x0} ${f(base)}${smooth(pts, true)}L${x1} ${f(base)}Z`, n: years.length };
    });
  }, []);
  const hue = (i: number, n: number) => (mode === 'labels' || mode === 'ramp' ? hueOf(mode, i / (n - 1)) : shiftRgb(hueOf(mode, 0.5), (i - (n - 1) / 2) * 7));
  const xMay = 46 + (4.5 / 12) * 420;
  return (
    <g>
      <defs>
        {ridges.map((r) => (
          <linearGradient key={r.y} id={`tm-rg-${r.y}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={hue(r.i, r.n)} stopOpacity="0.62" />
            <stop offset="1" stopColor={hue(r.i, r.n)} stopOpacity="0.03" />
          </linearGradient>
        ))}
      </defs>
      <line x1={xMay} x2={xMay} y1={34} y2={300} stroke={accent(mode)} strokeWidth={0.7} strokeDasharray="1 3" />
      <Txt x={xMay} y={26} anchor="middle" size={10} fill={accent(mode)}>
        May
      </Txt>
      {ridges.map((r) => (
        <g key={r.y} style={anim(live, 'fw-tm-fade', 600, { delay: r.i * 55 })} data-hint={`${r.y} · ${WEEKS[r.y - Y0].reduce((a, b) => a + b, 0)} memories`}>
          <path d={r.area} fill={`url(#tm-rg-${r.y})`} />
          <path d={r.line} fill="none" stroke={bright(hue(r.i, r.n), 0.35)} strokeWidth={1} strokeLinejoin="round" />
          {r.i % 2 === 0 && (
            <Txt x={38} y={r.base + 3} anchor="end" size={9}>
              {r.y}
            </Txt>
          )}
        </g>
      ))}
      {MONTHS.map((m, i) => (
        <Txt key={m} x={46 + ((i + 0.5) / 12) * 420} y={314} anchor="middle" size={9}>
          {m.slice(0, 1)}
        </Txt>
      ))}
    </g>
  );
}

/* ── T11 Glowing timeline ─────────────────────────────────────────────────────────────────────────────────────────── */
export function GlowTimeline({ mode, live }: DesignProps) {
  const geo = useMemo(() => {
    const dn = gauss(DENSITY, 3.6);
    const max = Math.max(...dn);
    const xAt = (i: number) => xT(Y0 + i / 12 + 1 / 24);
    const idx = Array.from({ length: N_MONTHS }, (_, i) => i).filter((i) => i % 3 === 0 || i === N_MONTHS - 1);
    const half = (i: number) => 4 + 50 * Math.pow(dn[i] / max, 0.9);
    // The richest months, at least 20 months apart, become stems.
    const order = DENSITY.map((c, i) => ({ c, i })).sort((a, b) => b.c - a.c);
    const picked: number[] = [];
    for (const { i } of order) {
      if (picked.length >= 9) break;
      if (picked.every((p) => Math.abs(p - i) >= 20)) picked.push(i);
    }
    picked.sort((a, b) => a - b);
    return { xAt, idx, half, picked };
  }, []);
  const cy = 165;
  const layers = [
    { s: 1, o: 0.13 },
    { s: 0.66, o: 0.18 },
    { s: 0.38, o: 0.28 },
    { s: 0.16, o: 0.55 },
  ];
  return (
    <g>
      <defs>
        <linearGradient id="tm-gl-h" x1="0" x2="1" y1="0" y2="0">
          {Array.from({ length: 6 }, (_, k) => (
            <stop key={k} offset={k / 5} stopColor={hueOf(mode, k / 5)} />
          ))}
        </linearGradient>
        <linearGradient id="tm-gl-fx" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.06" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.96" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="tm-gl-m" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height="320">
          <rect width={W} height="320" fill="url(#tm-gl-fx)" />
        </mask>
      </defs>
      <g mask="url(#tm-gl-m)" style={anim(live, 'fw-tm-wipe', 1500)}>
        {layers.map((l) => {
          const top = geo.idx.map((i) => [geo.xAt(i), cy - l.s * geo.half(i)] as [number, number]);
          const bot = geo.idx.map((i) => [geo.xAt(i), cy + l.s * geo.half(i)] as [number, number]).reverse();
          return <path key={l.s} d={`${smooth(top)}${smooth(bot, true)}Z`} fill="url(#tm-gl-h)" fillOpacity={l.o} />;
        })}
        <line x1={14} x2={466} y1={cy} y2={cy} stroke="url(#tm-gl-h)" strokeWidth={1} />
      </g>
      {geo.picked.map((i, k) => {
        const up = k % 2 === 0;
        const len = 40 + (k % 3) * 20;
        const x = geo.xAt(i);
        const y0 = cy + (up ? -1 : 1) * (geo.half(i) + 3);
        const y1 = y0 + (up ? -1 : 1) * len;
        const hue = hueOf(mode, i / N_MONTHS);
        return (
          <g key={i} style={anim(live, 'fw-tm-fade', 500, { delay: 900 + k * 120 })} data-hint={`${MONTHS[i % 12]} ${Y0 + Math.floor(i / 12)} · ${DENSITY[i]} memories`}>
            <line x1={f(x)} x2={f(x)} y1={f(y0)} y2={f(y1)} stroke={hue} strokeWidth={1} />
            <circle cx={f(x)} cy={f(y1)} r={2.6} fill={bright(hue, 0.5)} />
            <Txt x={x} y={y1 + (up ? -8 : 15)} anchor="middle" size={10} hi>
              {MONTHS[i % 12]} {Y0 + Math.floor(i / 12)} · {DENSITY[i]}
            </Txt>
          </g>
        );
      })}
      {Array.from({ length: 7 }, (_, k) => 1995 + k * 5).map((y) => (
        <Txt key={y} x={xT(y)} y={312} size={10} anchor="middle">
          {y}
        </Txt>
      ))}
    </g>
  );
}

/* ── T12 Sankey of chapters ───────────────────────────────────────────────────────────────────────────────────────── */
const COLS: Lane[] = ['place', 'work', 'focus'];
const COL_X = [14, 214, 414];
const NODE_W = 8;
const overlap = (a: Period, b: Period) => Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));

export function Sankey({ mode, live }: DesignProps) {
  const geo = useMemo(() => {
    const span = NOW - Y0;
    const top = 34;
    const height = 272;
    const s = (height - 36) / span;
    const cols = COLS.map((lane) => {
      const ps = periodsIn(lane);
      const gap = (height - span * s) / (ps.length - 1);
      let y = top;
      return ps.map((p) => {
        const h = (p.end - p.start) * s;
        const node = { p, y, h };
        y += h + gap;
        return node;
      });
    });
    const flows: { a: number; i: number; j: number; ya: number; yb: number; h: number; years: number }[] = [];
    for (let c = 0; c < COLS.length - 1; c++) {
      const outCur = cols[c].map((n) => n.y);
      const inCur = cols[c + 1].map((n) => n.y);
      cols[c].forEach((na, i) => {
        cols[c + 1].forEach((nb, j) => {
          const years = overlap(na.p, nb.p);
          if (years < 0.05) return;
          const h = years * s;
          flows.push({ a: c, i, j, ya: outCur[i], yb: inCur[j], h, years });
          outCur[i] += h;
          inCur[j] += h;
        });
      });
    }
    return { cols, flows };
  }, []);
  const hue = (c: number, i: number) => kindHue(mode, c, i);
  return (
    <g>
      <defs>
        {geo.flows.map((fl, k) => (
          <linearGradient key={k} id={`tm-sk-${k}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={hue(fl.a, fl.i)} stopOpacity="0.55" />
            <stop offset="1" stopColor={hue(fl.a + 1, fl.j)} stopOpacity="0.55" />
          </linearGradient>
        ))}
      </defs>
      <g style={anim(live, 'fw-tm-wipe', 1200)}>
        {geo.flows.map((fl, k) => {
          const xa = COL_X[fl.a] + NODE_W;
          const xb = COL_X[fl.a + 1];
          const xm = (xa + xb) / 2;
          const d = `M${xa} ${f(fl.ya)}C${f(xm)} ${f(fl.ya)} ${f(xm)} ${f(fl.yb)} ${xb} ${f(fl.yb)}L${xb} ${f(fl.yb + fl.h)}C${f(xm)} ${f(fl.yb + fl.h)} ${f(xm)} ${f(fl.ya + fl.h)} ${xa} ${f(fl.ya + fl.h)}Z`;
          return <path key={k} d={d} fill={`url(#tm-sk-${k})`} data-hint={`${geo.cols[fl.a][fl.i].p.name} and ${geo.cols[fl.a + 1][fl.j].p.name} overlapped for ${fl.years.toFixed(1)} years`} />;
        })}
      </g>
      {geo.cols.map((col, c) =>
        col.map((n, i) => (
          <g key={n.p.id} data-hint={`${n.p.name} · ${(n.p.end - n.p.start).toFixed(1)} years`}>
            <rect x={COL_X[c]} y={f(n.y)} width={NODE_W} height={f(Math.max(1, n.h))} fill={hue(c, i)} />
            {n.h >= 9 && (
              <Txt x={c === 2 ? COL_X[c] - 6 : COL_X[c] + NODE_W + 6} y={n.y + n.h / 2 + 3} anchor={c === 2 ? 'end' : 'start'} size={10} hi>
                {n.p.name}
              </Txt>
            )}
          </g>
        ))
      )}
      {COLS.map((lane, c) => (
        <Txt key={lane} x={COL_X[c]} y={22} size={10}>
          {['Places', 'Work', 'Focus'][c]}
        </Txt>
      ))}
      <Txt x={14} y={318} size={10}>
        Ribbon width is the time two chapters overlapped.
      </Txt>
    </g>
  );
}

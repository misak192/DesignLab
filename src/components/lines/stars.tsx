/**
 * File: src/components/lines/stars.tsx
 * Description: Group T of the Lines page (T01 to T08): a ray made of stars. A cluster of stars is one element (a gradient per star), so a
 * dense band costs one node; the stars twinkle, drift past, form a constellation, or race as a meteor. T05 and T06 are made of real star
 * elements you can press: the stars fly apart and dissipate, then gather again. T06 is the button idea: only words on the screen, a cloud of
 * stars floating behind them, and a press dissipates the cloud.
 */
"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FC, KeyboardEvent, ReactNode } from 'react';
import { Sparkle, anim, rand, tint } from '@/components/chartstudy/shared';
import { mask } from '@/components/chartstudy/dots/kit';
import { Root, Runner, Sheet, WHITE, alongDir, bell, ends, isH, starField, starLayer, tail } from './kit';
import type { RayProps } from './kit';

const clip = (p: RayProps, m?: string): CSSProperties => ({ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...(m ? mask(m) : {}) });
/** Where a star sits at `at` percent along the line, as the left and top of a Sparkle. */
const sparkAt = (p: RayProps, at: number, across = 50): { x: string; y: string } => (isH(p) ? { x: `${at}%`, y: `${across}%` } : { x: `${across}%`, y: `${100 - at}%` });

/** T01 Star dust: a ray that is only stars, thickest in the middle and thinning out at both ends. One element. */
export const T01: FC<RayProps> = (p) => (
  <Root p={p}>
    <span aria-hidden style={starLayer(p, starField(p, { n: 90, tile: p.len, spread: p.box * 0.46, seed: p.seed, tintEvery: 4 }), p.len, 0, mask(ends(p, 6, 94)))} />
  </Root>
);

/** T02 Twinkle: two star fields that take turns, and a few stars that flash with a glint. */
export const T02: FC<RayProps> = (p) => (
  <Root p={p}>
    <span aria-hidden style={starLayer(p, starField(p, { n: 70, tile: p.len, spread: p.box * 0.46, seed: p.seed }), p.len, 0, { ...mask(ends(p, 6, 94)), ...anim(p.live, 'fw-ce-lit', 2600, { loop: true }) })} />
    <span aria-hidden style={starLayer(p, starField(p, { n: 70, tile: p.len, spread: p.box * 0.46, seed: p.seed + 40, tintEvery: 3 }), p.len, 0, { ...mask(ends(p, 6, 94)), ...anim(p.live, 'fw-ce-lit', 2600, { loop: true, delay: -1300 }) })} />
    {[22, 50, 78].map((at, i) => {
      const s = sparkAt(p, at, 50 + (i - 1) * 8);
      return <Sparkle key={at} size={p.t * 3.4} hue={p.hi} x={s.x} y={s.y} style={{ transform: 'scale(0.9)', ...anim(p.live, 'fw-ce-twinkle-slow', 2800, { loop: true, delay: -i * 900 }) }} />;
    })}
  </Root>
);

/** T03 Drift: two layers of stars slide past the window at different speeds, with no seam. */
export const T03: FC<RayProps> = (p) => {
  const h = isH(p);
  const layer = (tile: number, n: number, seed: number, size: [number, number], dur: number): CSSProperties => ({
    ...starLayer(p, starField(p, { n, tile, spread: p.box * 0.46, seed, size, tintEvery: 4 }), tile, tile),
    '--tile': `${tile}px`,
    ...anim(p.live, h ? 'fw-ln-drift-h' : 'fw-ln-drift-v', dur, { loop: true, ease: 'linear' }),
  } as CSSProperties);
  return (
    <Root p={p}>
      <span aria-hidden style={clip(p, ends(p, 8, 92))}>
        <span style={layer(90, 24, p.seed, [0.6, 1.2], 9000)} />
        <span style={layer(140, 18, p.seed + 7, [1.1, 2.1], 15000)} />
      </span>
    </Root>
  );
};

/** T04 Constellation: stars joined by hairlines, as on a star chart. */
export const T04: FC<RayProps> = (p) => {
  const h = isH(p);
  const n = 8;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = 6 + (i / (n - 1)) * (p.len - 12);
    const across = p.box / 2 + (rand(i, p.seed) - 0.5) * p.box * 0.62;
    return h ? { x: a, y: across, r: 1.2 + rand(i, p.seed + 1) * 1.6 } : { x: across, y: p.len - a, r: 1.2 + rand(i, p.seed + 1) * 1.6 };
  });
  const w = h ? p.len : p.box;
  const ht = h ? p.box : p.len;
  return (
    <Root p={p}>
      <svg width={w} height={ht} viewBox={`0 0 ${w} ${ht}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <polyline points={pts.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')} fill="none" stroke={WHITE(0.32)} strokeWidth={1} />
        {pts.map((q, i) => (
          <g key={i}>
            <circle cx={q.x} cy={q.y} r={q.r * 3.2} fill={tint(p.hi, 0.16)} />
            <circle cx={q.x} cy={q.y} r={q.r} fill={WHITE(0.97)} />
          </g>
        ))}
      </svg>
    </Root>
  );
};

/* ── stars you can press ──────────────────────────────────────────────────────────────────────────────────────── */

interface Star {
  along: number;
  across: number;
  size: number;
  a: number;
  dx: number;
  dy: number;
  delay: number;
  dur: number;
  fx: number;
  fy: number;
}

/**
 * A cloud of star elements. Idle, each drifts a little. Pressed, each flies away from the centre, shrinks and fades, in a ripple from the
 * middle outward; after a moment they come back. `shape` 'ray' gathers them along the line, 'cloud' in an ellipse around it.
 */
function StarCloud({ p, n, shape, label, children }: { p: RayProps; n: number; shape: 'ray' | 'cloud'; label: string; children?: ReactNode }) {
  const [gone, setGone] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const h = isH(p);

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: n }, (_, i) => {
        let along: number;
        let across: number;
        if (shape === 'ray') {
          along = rand(i, p.seed) * p.len;
          across = ((rand(i, p.seed + 1) + rand(i, p.seed + 2) + rand(i, p.seed + 3)) / 3 - 0.5) * p.box * 0.95;
        } else {
          const ang = rand(i, p.seed) * Math.PI * 2;
          const rad = Math.sqrt(rand(i, p.seed + 1));
          along = p.len / 2 + Math.cos(ang) * rad * p.len * 0.5;
          across = Math.sin(ang) * rad * p.box * 0.95;
        }
        const cx = along - p.len / 2;
        const out = Math.hypot(cx, across) || 1;
        const throwBy = 28 + rand(i, p.seed + 4) * 46;
        const ux = (cx / out) * 0.8 + (rand(i, p.seed + 5) - 0.5) * 0.9;
        const uy = (across / out) * 0.8 + (rand(i, p.seed + 6) - 0.5) * 0.9;
        const [dx, dy] = h ? [ux * throwBy, uy * throwBy] : [uy * throwBy, -ux * throwBy];
        return {
          along: along / p.len,
          across,
          size: 1.4 + rand(i, p.seed + 7) * 2.2,
          a: 0.55 + rand(i, p.seed + 8) * 0.45,
          dx,
          dy,
          delay: Math.round((out / (p.len / 2)) * 260),
          dur: 3200 + rand(i, p.seed + 9) * 3000,
          fx: (rand(i, p.seed + 10) - 0.5) * 6,
          fy: (rand(i, p.seed + 11) - 0.5) * 6,
        };
      }),
    [n, shape, p.len, p.box, p.seed, h]
  );

  const press = () => {
    setGone(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setGone(false), 2100);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      press();
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={press}
      onKeyDown={onKey}
      style={{ position: 'relative', display: 'block', width: h ? p.len : p.box, height: h ? p.box : p.len, cursor: 'pointer', outlineOffset: 6 }}
    >
      {stars.map((s, i) => {
        const place: CSSProperties = h
          ? { left: `${s.along * 100}%`, top: `calc(50% + ${s.across}px)` }
          : { left: `calc(50% + ${s.across}px)`, bottom: `${s.along * 100}%` };
        const idle = !gone && p.live ? anim(true, 'fw-ln-float', s.dur, { loop: true, delay: -s.dur * rand(i, p.seed + 12) }) : {};
        return (
          <span
            key={i}
            aria-hidden
            style={
              {
                position: 'absolute',
                ...place,
                width: s.size,
                height: s.size,
                marginLeft: -s.size / 2,
                marginTop: -s.size / 2,
                borderRadius: '50%',
                background: WHITE(1),
                boxShadow: `0 0 ${s.size * 2.4}px ${tint(i % 3 ? p.hi : WHITE(1), 0.8)}`,
                opacity: gone ? 0 : s.a,
                transform: gone ? `translate(${s.dx}px, ${s.dy}px) scale(0.2)` : 'translate(0, 0) scale(1)',
                transition: gone
                  ? `transform 1200ms cubic-bezier(0.22, 1, 0.36, 1) ${s.delay}ms, opacity 1000ms ease ${s.delay}ms`
                  : `transform 1100ms cubic-bezier(0.22, 1, 0.36, 1) ${s.delay}ms, opacity 900ms ease ${s.delay}ms`,
                '--fx': `${s.fx}px`,
                '--fy': `${s.fy}px`,
                ...idle,
              } as CSSProperties
            }
          />
        );
      })}
      {children}
    </span>
  );
};

/** T05 Star ray, press to dissipate: a ray of nothing but stars. Press it and the stars fly apart; then they come back. */
export const T05: FC<RayProps> = (p) => <StarCloud p={p} n={isH(p) ? 70 : 46} shape="ray" label="Press to dissipate the star ray" />;

/** T06 Words on stars: no button, only the words, and a cloud of stars floating behind them. Press and the cloud dissipates. */
export const T06: FC<RayProps> = (p) => {
  return (
    <StarCloud p={p} n={44} shape="cloud" label="Press to dissipate the stars behind the words">
      <span
        aria-hidden
        className="fw-big"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          whiteSpace: 'nowrap',
          fontSize: '1.0625rem',
          fontWeight: 300,
          color: 'var(--ink)',
          pointerEvents: 'none',
        }}
      >
        Press me
      </span>
    </StarCloud>
  );
};

/** T07 Meteor: one bright star races along the line, trailing a fading tail and small stars. */
export const T07: FC<RayProps> = (p) => {
  const h = isH(p);
  const m = `linear-gradient(${h ? 'to bottom' : 'to right'}, transparent 38%, #000 47%, #000 53%, transparent 62%)`;
  return (
    <Root p={p}>
      <Sheet p={p} th={1} bg={tint(p.c, 0.25)} masks={[ends(p, 6, 94)]} />
      <Runner p={p} seg={p.len * 0.42} dur={2800}>
        <span aria-hidden style={{ position: 'absolute', inset: 0, background: `linear-gradient(${alongDir(p)}, transparent, ${tint(p.hi, 0.7)} 80%, ${WHITE(1)})`, ...mask(m) }} />
        <span aria-hidden style={{ position: 'absolute', inset: 0, background: starField(p, { n: 16, tile: p.len * 0.42, spread: p.box * 0.3, seed: p.seed + 3 }), ...mask(tail(p, 100, 100)) }} />
        <Sparkle size={p.t * 4.4} hue={p.hi} x={h ? '100%' : '50%'} y={h ? '50%' : '0%'} />
      </Runner>
    </Root>
  );
};

/** T08 Galaxy band: a soft nebula of two colours with a dense field of stars through it and a thread of dust in the middle. */
export const T08: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.box * 0.95} bg={`linear-gradient(${alongDir(p)}, ${tint(p.lo, 0.34)}, ${tint(p.hi, 0.42)}, ${tint(p.c, 0.3)})`} masks={[bell(p, 0.3), ends(p, 8, 92)]} />
    <span aria-hidden style={starLayer(p, starField(p, { n: 110, tile: p.len, spread: p.box * 0.46, seed: p.seed + 5, tintEvery: 5 }), p.len, 0, mask(ends(p, 8, 92)))} />
    <Sheet p={p} th={p.t * 0.6} bg={WHITE(0.5)} masks={[bell(p, 0.5), ends(p, 20, 80)]} />
    {[30, 72].map((at, i) => {
      const s = sparkAt(p, at, 50);
      return <Sparkle key={at} size={p.t * 3.6} hue={p.hi} x={s.x} y={s.y} style={{ transform: 'scale(0.9)', ...anim(p.live, 'fw-ce-twinkle-slow', 3400, { loop: true, delay: -i * 1500 }) }} />;
    })}
  </Root>
);

export const STAR_LINES: Record<string, FC<RayProps>> = { T01, T02, T03, T04, T05, T06, T07, T08 };

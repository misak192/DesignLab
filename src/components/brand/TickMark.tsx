/**
 * File: src/components/brand/TickMark.tsx
 * Description: The tick-L brand pieces. `TickMonogram` is the reference hero ("Tick-fold"): a letter with a tick beside it;
 * the tick's short stroke folds through the corner and the L stands up as the raised L; mirror and name around it. The maths
 * is pure (src/lib/brand/tickfold.ts); this file only draws it. Also here: `TickGlyph` (the tick/L as a small inline glyph),
 * `FWTickMark` (the parent mark: F and a W built from two ticks), `LystWordmark` (Action✓yst), `LystTip` (the L of "Lyst"
 * tipping into the tick), `GlassPill`, and `useClock`. Removable visual layers are marked ── ELEMENT: … (removable) ──.
 * Static icons pass t={Infinity}: that is always the FINAL state. Reduced motion or MOTION off shows the final state too.
 */
"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { bigLetter, type BrandApp, type BrandParent } from '@/lib/brand/apps';
import {
  REFERENCE_OPTIONS,
  SCHEDULES,
  STAGE,
  TICK,
  easeInOutCubic,
  frame,
  glyphEnd,
  kAt,
  scaleSchedule,
  shortEnd,
  totalOf,
  type FoldFrame,
  type Glyph,
  type Mirror,
  type ScheduleName,
} from '@/lib/brand/tickfold';
import { gradText, useCalm } from './kit';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** Milliseconds since mount, up to `total`. `paused` holds it at 0. */
export function useClock(total: number, paused = false): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (paused) return;
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const x = Math.min(now - start, total);
      setT(x);
      if (x < total) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [total, paused]);
  return t;
}

type Stops = { colour: string; colour2: string };

/* ─────────────────────────────── TickGlyph: the tick / L as an inline glyph ─────────────────────────────── */

interface TickGlyphProps extends Stops {
  /** 1 = tick, -1 = L. */
  k: number;
  /** Degrees around the corner. */
  rot: number;
  /** CSS height, e.g. "0.84em" or "30px". */
  height: string;
  verticalAlign?: string;
  /** Pen progress 0..1 (omit for fully drawn). */
  draw?: number;
  /** Stroke width in the glyph's own 80-unit box (default 8). */
  stroke?: number;
  /** A flat colour instead of the gradient (themed icon). */
  flat?: string;
  style?: CSSProperties;
}

export function TickGlyph({ k, rot, colour, colour2, height, verticalAlign = '-0.08em', flat, draw = 1, stroke = TICK.stroke, style }: TickGlyphProps) {
  const gid = useId();
  const [sx, sy] = shortEnd(k);
  const [cx, cy] = TICK.corner;
  const [lx, ly] = TICK.longEnd;
  return (
    <svg viewBox="12 6 52 62" aria-hidden style={{ height, aspectRatio: '52 / 62', overflow: 'visible', verticalAlign, ...style }}>
      {!flat && (
        <defs>
          <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="15" y1="58" x2="62" y2="22">
            <stop offset="0" stopColor={colour} />
            <stop offset="1" stopColor={colour2} />
          </linearGradient>
        </defs>
      )}
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        <polyline points={`${sx},${sy} ${cx},${cy} ${lx},${ly}`} fill="none" stroke={flat ?? `url(#${gid})`} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...(draw < 1 ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw, opacity: draw > 0 ? 1 : 0 } : {})} />
      </g>
    </svg>
  );
}

/* ─────────────────────────────── TickMonogram: the reference hero ─────────────────────────────── */

function useParallax(on: boolean) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const x = useSpring(px, { stiffness: 90, damping: 18 });
  const y = useSpring(py, { stiffness: 90, damping: 18 });
  useEffect(() => {
    if (!on) return;
    const move = (e: PointerEvent) => {
      px.set(clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1));
      py.set(clamp((e.clientY / window.innerHeight - 0.5) * 2, -1, 1));
    };
    const tilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      px.set(clamp(e.gamma / 25, -1, 1));
      py.set(clamp(((e.beta ?? 45) - 45) / 25, -1, 1));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('deviceorientation', tilt);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('deviceorientation', tilt);
    };
  }, [on, px, py]);
  return { x, y };
}

export type MonoTheme = 'dark' | 'light' | 'mono';

interface LayerProps extends Stops {
  size: number;
  letter: string;
  f: FoldFrame;
  LW: number;
  B: number;
  theme: MonoTheme;
  spark: boolean;
  gid: string;
  px: MotionValue<number>;
  py: MotionValue<number>;
  ink?: string;
  /** Parallax depth of the letter and of the tick (px at full tilt). */
  dl: number;
  dt: number;
  tickScale: number;
}

/** Letter + tick, absolutely positioned: drawn once for the monogram and once, reflected, for the mirror. */
function MonoLayer({ colour, colour2, size, letter, f, LW, B, theme, spark, gid, px, py, dl, dt, ink: inkProp, tickScale }: LayerProps) {
  const u = size / 120;
  const lx = useTransform(px, (v) => v * dl);
  const ly = useTransform(py, (v) => v * dl * 0.6);
  const tx = useTransform(px, (v) => v * dt);
  const ty = useTransform(py, (v) => v * dt * 0.6);
  const ink = theme === 'mono' ? (inkProp ?? 'var(--fw-white)') : undefined;
  const letterStyle: CSSProperties =
    theme === 'mono'
      ? { color: ink }
      : theme === 'light'
        ? gradText(`color-mix(in srgb, var(--fw-night) 45%, ${colour})`, `color-mix(in srgb, var(--fw-night) 45%, ${colour2})`)
        : gradText(colour, colour2);
  const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
  const finalBox = 80 * tickScale * u;
  const stageBox = 80 * STAGE.scale * u;
  const tr = f.travel;
  const box = lerp(stageBox, finalBox, tr);
  const left = lerp(LW + STAGE.dx * size - stageBox / 2, LW + 4 * u, tr);
  const top = lerp(B - STAGE.dy * size - stageBox / 2, B - 0.7 * size - 9.8 * tickScale * u, tr);
  const drawing = f.draw < 1;
  const [sx, sy] = shortEnd(f.k);
  const [cx, cy] = TICK.corner;
  const [lex, ley] = TICK.longEnd;
  // The tick is part of "Lyst", and Lyst is white in every app (the letter carries the app colour).
  const stroke = theme === 'mono' ? (inkProp ?? 'var(--fw-white)') : theme === 'light' ? 'var(--fw-night)' : 'var(--fw-white)';
  return (
    <>
      <motion.span style={{ position: 'absolute', left: 0, top: 0, x: lx, y: ly }}>
        <span style={{ display: 'inline-block', fontSize: size, lineHeight: 1, fontWeight: 500, whiteSpace: 'nowrap', opacity: f.letterO, transform: `translateY(${f.letterY * u}px)`, ...letterStyle }}>{letter}</span>
      </motion.span>
      <motion.div style={{ position: 'absolute', left, top, width: box, height: box, x: tx, y: ty }}>
        <svg viewBox="0 0 80 80" width={box} height={box} aria-hidden style={{ overflow: 'visible', opacity: f.tickO && f.draw > 0 ? 1 : 0 }}>
          <defs>
            <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="15" y1="58" x2="62" y2="22">
              <stop offset="0" stopColor={colour} />
              <stop offset="1" stopColor={colour2} />
            </linearGradient>
            <radialGradient id={`${gid}g`}>
              <stop offset="0" stopColor="var(--fw-white)" stopOpacity="0.9" />
              <stop offset="0.35" stopColor={colour2} stopOpacity="0.5" />
              <stop offset="1" stopColor={colour2} stopOpacity="0" />
            </radialGradient>
          </defs>
          <g transform={`rotate(${f.rot} ${cx} ${cy})`}>
            <polyline points={`${sx},${sy} ${cx},${cy} ${lex},${ley}`} fill="none" stroke={stroke} strokeWidth={TICK.stroke} strokeLinecap="round" strokeLinejoin="round" {...(drawing ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - f.draw } : {})} />
            {/* ── ELEMENT: spark, a light trail along the folding stroke (removable) ── */}
            {spark && f.foldP > 0 && f.foldP < 1 && (
              <g>
                {[5, 4, 3, 2, 1, 0].map((j) => {
                  const [ex, ey] = shortEnd(kAt(f.foldP, j * 0.035));
                  const a = (1 - j / 6) * Math.sin(Math.PI * f.foldP);
                  return <circle key={j} cx={ex} cy={ey} r={j === 0 ? 5 : 4 - j * 0.5} fill={j === 0 ? 'var(--fw-white)' : colour2} opacity={a} />;
                })}
                <circle cx={shortEnd(f.k)[0]} cy={shortEnd(f.k)[1]} r="16" fill={`url(#${gid}g)`} opacity={Math.sin(Math.PI * f.foldP)} />
              </g>
            )}
            {/* ── END ELEMENT: spark ── */}
          </g>
        </svg>
      </motion.div>
    </>
  );
}

export interface TickMonogramProps {
  app: BrandApp;
  /** Font size of the letter, px (120 is the reference; everything else scales with it). */
  size?: number;
  letter?: string;
  /** Controlled time in ms. Infinity = the final state (what static icons use). Omit to play. */
  t?: number;
  schedule?: ScheduleName;
  /** Multiplier on every duration (1.6 = slower). */
  speed?: number;
  glyph?: Glyph;
  mirror?: Mirror;
  overshoot?: number;
  /** The app name that fades in under the monogram: plain, per-letter bar-chart fill, or none. */
  name?: 'plain' | 'bars' | 'none';
  spark?: boolean;
  parallax?: boolean;
  theme?: MonoTheme;
  /** Flat colour for theme 'mono' (default white). */
  ink?: string;
  /** Size of the raised L relative to the reference (0.62 = the 80×80 box scaled to 62 %). Try 0.85 or 1.1 for a bigger exponent. */
  tickScale?: number;
  /** Only the letter and tick: no room for mirror or name (icons). */
  compact?: boolean;
  /** Called once when the last step ends. */
  onTime?: (t: number) => void;
}

export default function TickMonogram({
  app,
  size = 120,
  letter,
  t: controlled,
  schedule = 'reference',
  speed = 1,
  glyph = 'upright',
  mirror = 'fade',
  overshoot = 1.1,
  name = 'plain',
  spark = false,
  parallax = false,
  theme = 'dark',
  ink,
  tickScale = TICK.scale,
  compact = false,
}: TickMonogramProps) {
  const calm = useCalm();
  const gid = useId();
  const u = size / 120;
  const ch = letter ?? bigLetter(app);
  const sched = scaleSchedule(SCHEDULES[schedule], speed);
  const clock = useClock(totalOf(sched), calm || controlled !== undefined);
  const time = calm ? Infinity : (controlled ?? clock);
  const f = frame(time, { schedule: sched, glyph, mirror, overshoot });

  // Measure the letter: its width and the baseline (needed to place the tick at cap height).
  const mRef = useRef<HTMLSpanElement>(null);
  const bRef = useRef<HTMLElement>(null);
  const [m, setM] = useState({ LW: 0.62 * size, B: 0.82 * size });
  useLayoutEffect(() => {
    const measure = () => {
      const r = mRef.current?.getBoundingClientRect();
      const b = bRef.current?.getBoundingClientRect();
      if (r && b && r.width > 0) setM({ LW: r.width, B: b.bottom - r.top });
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [size, ch]);

  const par = useParallax(parallax && !calm);
  const zero = useMotionValue(0);
  const px = parallax && !calm ? par.x : zero;
  const py = parallax && !calm ? par.y : zero;
  const mirrorX = useTransform(px, (v) => v * 3);

  const monoW = m.LW + 4 * u + 54 * tickScale * u;
  const mirrorH = 60 * u;
  const lightMirror = theme === 'light' ? 0.45 : 1;
  const nameText = `${app.prefix}Lyst`.toUpperCase();
  const spacing = f.nameSpacing;
  const layer: Omit<LayerProps, 'gid' | 'dl' | 'dt' | 'f'> = { colour: app.colour, colour2: app.colour2, size, letter: ch, LW: m.LW, B: m.B, theme, spark, px, py, ink, tickScale };
  if (compact) {
    mirror = 'none';
    name = 'none';
  }

  return (
    <div style={{ position: 'relative', width: monoW, height: compact ? m.B : m.B + mirrorH + 26 * u }} role="img" aria-label={`${app.prefix}Lyst`}>
      <span ref={mRef} aria-hidden style={{ position: 'absolute', visibility: 'hidden', fontSize: size, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap' }}>
        {ch}
        <i ref={bRef} style={{ display: 'inline-block', width: 0, height: 0 }} />
      </span>

      <MonoLayer {...layer} gid={`${gid}a`} f={f} dl={9} dt={20} />

      {/* ── ELEMENT: mirror, the monogram reflected below the baseline (removable) ── */}
      {mirror !== 'none' && (
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: m.B,
            width: monoW,
            height: mirrorH,
            overflow: 'hidden',
            opacity: f.mirrorO * lightMirror,
            WebkitMaskImage: 'linear-gradient(to bottom, rgb(0 0 0 / 0.55), transparent)',
            maskImage: 'linear-gradient(to bottom, rgb(0 0 0 / 0.55), transparent)',
            x: mirrorX,
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, width: monoW, height: m.B, transformOrigin: '0 0', transform: `translateY(${m.B}px) scaleY(-1)` }}>
            <MonoLayer {...layer} gid={`${gid}b`} f={f} dl={9} dt={20} spark={false} />
          </div>
        </motion.div>
      )}
      {/* ── END ELEMENT: mirror ── */}

      {name !== 'none' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: m.B + 18 * u,
            width: monoW,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontSize: Math.max(9, 13 * u),
            fontWeight: 300,
            textTransform: 'uppercase',
            letterSpacing: `${spacing}em`,
            paddingLeft: `${spacing}em`,
            opacity: f.nameO,
            color: theme === 'light' ? 'var(--fw-night)' : 'var(--fw-white)',
            textShadow: theme === 'light' ? 'none' : '0 1px 2px rgb(0 0 0 / 0.85)',
          }}
        >
          {name === 'plain' ? nameText : [...nameText].map((c, i, a) => <BarLetter key={i} c={c} i={i} n={a.length} p={f.nameP} colour={app.colour} colour2={app.colour2} />)}
        </div>
      )}
    </div>
  );
}

/** A name letter filled from the bottom like a bar in a bar chart, in the colour its position has on the app gradient. */
function BarLetter({ c, i, n, p, colour, colour2 }: { c: string; i: number; n: number; p: number; colour: string; colour2: string }) {
  const r = clamp(p * (n + 3) - i);
  const stop = `color-mix(in srgb, ${colour2} ${Math.round((i / Math.max(1, n - 1)) * 100)}%, ${colour})`;
  const pct = Math.round(r * 100);
  return (
    <span
      style={{
        display: 'inline-block',
        backgroundImage: `linear-gradient(to top, ${stop} ${pct}%, var(--fw-white) ${pct}%)`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: 'none',
        filter: 'var(--halo-drop)',
      }}
    >
      {c}
    </span>
  );
}

/* ─────────────────────────────── Glass pill ─────────────────────────────── */

/** A glassmorphism pill (one backdrop blur) over two soft blobs of the app gradient: the Android pill icon, in brand colours. */
export function GlassPill({ app, width, height, children }: { app: Stops; width: number; height: number; children: ReactNode }) {
  return (
    <div style={{ position: 'relative', width, height, borderRadius: 999, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <i aria-hidden style={{ position: 'absolute', left: '-8%', top: '-30%', width: height * 1.3, height: height * 1.3, borderRadius: 999, background: `radial-gradient(circle, ${app.colour}, transparent 68%)` }} />
      <i aria-hidden style={{ position: 'absolute', right: '-6%', bottom: '-40%', width: height * 1.4, height: height * 1.4, borderRadius: 999, background: `radial-gradient(circle, ${app.colour2}, transparent 68%)` }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 999,
          backdropFilter: 'blur(14px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
          background: 'linear-gradient(160deg, color-mix(in srgb, var(--fw-white) 22%, transparent), color-mix(in srgb, var(--fw-white) 5%, transparent))',
          boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--fw-white) 45%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--fw-white) 16%, transparent)',
        }}
      />
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────── The parent mark: F + W from two ticks ─────────────────────────────── */

const W_PATH = 'M3 8 L12 26 L25 3 L34 26 L47 6';

export function FWTickMark({ parent, size = 120, t: controlled, mirror = 'fade', name = true }: { parent: BrandParent; size?: number; t?: number; mirror?: Mirror; name?: boolean }) {
  const calm = useCalm();
  const gid = useId();
  const total = 3300;
  const clock = useClock(total, calm || controlled !== undefined);
  const time = calm ? Infinity : (controlled ?? clock);
  const u = size / 120;
  const lp = 1 - Math.pow(1 - clamp(time / 700), 3);
  const d1 = clamp((time - 700) / 500);
  const d2 = clamp((time - 1200) / 500);
  const draw = (d1 < 1 ? easeInOutCubic(d1) * 0.5 : 0.5) + (d2 > 0 ? easeInOutCubic(d2) * 0.5 : 0);
  const np = clamp((time - 1900) / 1000);
  const mp = mirror === 'fade' ? 1 - clamp((time - 1900) / 900) : mirror === 'keep' ? 1 : 0;
  const stops = parent.stops;
  const grad = (
    <linearGradient id={gid} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="1">
      {stops.map((s, i) => (
        <stop key={s} offset={i / Math.max(1, stops.length - 1)} stopColor={`var(--fw-${s})`} />
      ))}
    </linearGradient>
  );
  const wH = 0.36 * size;
  const wW = (wH * 50) / 30;
  const fW = 0.58 * size;
  const mono = (
    <div style={{ position: 'relative', width: fW + 4 * u + wW, height: size }}>
      <span style={{ position: 'absolute', left: 0, top: 0, fontSize: size, lineHeight: 1, fontWeight: 500, opacity: lp, transform: `translateY(${26 * u * (1 - lp)}px)`, ...gradText(`var(--fw-${stops[0]})`, `var(--fw-${stops[stops.length - 1]})`) }}>F</span>
      <svg viewBox="0 0 50 30" width={wW} height={wH} aria-hidden style={{ position: 'absolute', left: fW + 4 * u, top: 0.18 * size, overflow: 'visible' }}>
        <defs>{grad}</defs>
        <path d={W_PATH} pathLength={1} fill="none" stroke={`url(#${gid})`} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - draw} />
      </svg>
    </div>
  );
  return (
    <div style={{ position: 'relative', width: fW + 4 * u + wW, height: size + 60 * u }} role="img" aria-label="FrissonWorks">
      {mono}
      {mirror !== 'none' && (
        <div aria-hidden style={{ position: 'absolute', left: 0, top: 0.82 * size, width: '100%', height: 60 * u, overflow: 'hidden', opacity: mp, WebkitMaskImage: 'linear-gradient(to bottom, rgb(0 0 0 / 0.55), transparent)', maskImage: 'linear-gradient(to bottom, rgb(0 0 0 / 0.55), transparent)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translateY(${0.82 * size}px) scaleY(-1)` }}>{mono}</div>
        </div>
      )}
      {name && (
        <div aria-hidden style={{ position: 'absolute', left: 0, top: 0.82 * size + 18 * u, width: '100%', textAlign: 'center', fontSize: Math.max(9, 13 * u), fontWeight: 300, textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: `${0.9 - 0.55 * np}em`, paddingLeft: `${0.9 - 0.55 * np}em`, opacity: np, color: 'var(--fw-white)', textShadow: '0 1px 2px rgb(0 0 0 / 0.85)' }}>
          FrissonWorks
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────── Action✓yst: the wordmark ─────────────────────────────── */

/** Reads the glyph's final form: the L it starts as, and where it ends for each of the three glyph versions. */
function lystGlyphState(glyph: Glyph, p: number): { k: number; rot: number } {
  const e = easeInOutCubic(clamp(p));
  const end = glyphEnd(glyph);
  return { k: -1 + (end.k + 1) * e, rot: TICK.uprightDeg + (end.rot - TICK.uprightDeg) * e };
}

/**
 * The letter appears with the prefix under it, the tick folds into the raised L, then "Lyst" appears beside the prefix and
 * its L turns into the tick (true tick / right-angle L leaning 12° / upright L).
 */
export function LystWordmark({ app, glyph, size = 110, t: controlled }: { app: BrandApp; glyph: Glyph; size?: number; t?: number }) {
  const calm = useCalm();
  const total = 5000;
  const clock = useClock(total, calm || controlled !== undefined);
  const time = calm ? Infinity : (controlled ?? clock);
  const row = size * 0.28;
  const prefixO = clamp((time - 700) / 600);
  const lystO = clamp((time - 3420) / 500);
  const g = lystGlyphState(glyph, (time - 3900) / 800);
  return (
    <div className="flex flex-col items-center" style={{ gap: size * 0.06 }}>
      <TickMonogram app={app} size={size} t={time} mirror="none" name="none" glyph="upright" />
      <div aria-label={`${app.prefix}Lyst`} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', fontSize: row, fontWeight: 400, letterSpacing: '0.02em', whiteSpace: 'nowrap', marginTop: -size * 0.2 }}>
        <span style={{ opacity: prefixO, transform: `translateY(${(1 - prefixO) * 8}px)`, color: 'var(--fw-white)' }}>{app.prefix}</span>
        <span style={{ opacity: lystO, display: 'inline-flex', alignItems: 'baseline', color: 'var(--fw-white)' }}>
          <TickGlyph k={g.k} rot={g.rot} colour={app.colour} colour2={app.colour2} flat="var(--ink)" height="0.84em" verticalAlign="-0.08em" style={{ marginInline: '-0.1em 0.02em' }} />
          yst
        </span>
      </div>
    </div>
  );
}

/** The "Lyst" of the reel hand-off: the L tips into the tick and back once `start` is true. */
export function LystTip({ app, start }: { app: BrandApp; start: boolean }) {
  const calm = useCalm();
  const clock = useClock(1500, calm || !start);
  const p = calm || !start ? 0 : clock / 1500;
  const q = p < 0.5 ? easeInOutCubic(p * 2) : easeInOutCubic(2 - p * 2);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', color: 'var(--fw-white)' }}>
      <TickGlyph k={-1 + 2 * q} rot={TICK.uprightDeg * (1 - q)} colour={app.colour} colour2={app.colour2} flat="var(--ink)" height="0.84em" verticalAlign="-0.08em" style={{ marginInline: '-0.08em 0.02em' }} />
      yst
    </span>
  );
}

export { REFERENCE_OPTIONS };

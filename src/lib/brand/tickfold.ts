/**
 * File: src/lib/brand/tickfold.ts
 * Description: The "Tick-fold" hero animation as a pure function of time (no React, no DOM; portable to Compose).
 * Story: a letter rises; a tick is DRAWN beside it (pen stroke: the short stroke down, then the long stroke up); the tick's SHORT
 * stroke folds through the corner to the other side so the tick becomes an L; the L then travels to its place at the top right
 * of the letter, shrinking and standing upright (the exponent); the mirror fades and the name arrives.
 * Geometry is in the tick's own 80×80 box. Times are milliseconds. `frame(t, opts)` returns every number the drawing needs.
 */

/** The tick, in its 80×80 box. The long stroke never moves. */
export const TICK = {
  corner: [30, 58] as const,
  longEnd: [62, 22] as const,
  /** Unit vector of the short stroke at rest (k = 1). The long stroke is perpendicular to it. */
  dir: [-0.747, -0.664] as const,
  shortLen: 20,
  stroke: 8,
  /** The box is drawn at this scale. */
  scale: 0.62,
  /** Degrees the L turns to stand upright. */
  uprightDeg: -41.6,
  /** A right-angle L leaning 12° from vertical (the long stroke starts 48.4° above horizontal). */
  leanDeg: -29.6,
};

export type Glyph = 'tick' | 'lean12' | 'upright';
export type Mirror = 'fade' | 'keep' | 'none';

export type Span = readonly [number, number];
export interface Schedule {
  letter: Span;
  tick: Span;
  fold: Span;
  rotate: Span;
  mirror: Span;
  name: Span;
}

/** The reference timing (about 3.8 s with the name), and the short daily one (1.8 s, steps overlapped). */
export const SCHEDULES = {
  reference: { letter: [0, 700], tick: [500, 1100], fold: [950, 1550], rotate: [1400, 2300], mirror: [1400, 2200], name: [1800, 2800] },
  daily: { letter: [0, 400], tick: [250, 650], fold: [550, 950], rotate: [850, 1400], mirror: [850, 1400], name: [1050, 1800] },
} satisfies Record<string, Schedule>;
export type ScheduleName = keyof typeof SCHEDULES;

export const scaleSchedule = (s: Schedule, speed: number): Schedule => {
  const f = (x: Span): Span => [x[0] * speed, x[1] * speed];
  return { letter: f(s.letter), tick: f(s.tick), fold: f(s.fold), rotate: f(s.rotate), mirror: f(s.mirror), name: f(s.name) };
};

export const totalOf = (s: Schedule): number => Math.max(s.letter[1], s.tick[1], s.fold[1], s.rotate[1], s.mirror[1], s.name[1]);

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
/** Smooth, no hard stops: used so draw, fold and turn run into each other as one gesture. */
export const easeOutSine = (p: number) => Math.sin((p * Math.PI) / 2);
export const easeInOutSine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;
export const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
export const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
/** Overshooting ease; c1 = 1.1 is the reference. */
export const easeOutBack = (p: number, c1 = 1.1) => 1 + (c1 + 1) * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
const prog = (t: number, s: Span) => clamp((t - s[0]) / (s[1] - s[0]));

export interface FoldOptions {
  schedule: Schedule;
  glyph: Glyph;
  mirror: Mirror;
  /** easeOutBack strength for the turn upright. */
  overshoot: number;
}

export interface FoldFrame {
  /** Letter: rises 26 px and fades in. */
  letterY: number;
  letterO: number;
  /** The tick is drawn: 0..1 along the pen path (short stroke first, then the long one). */
  draw: number;
  /** 0 while the tick is not there yet, 1 once it is being drawn. */
  tickO: number;
  /** Travel of the L from where it was drawn to the exponent place and size: 0..1 (overshoots a little). */
  travel: number;
  /** Fold factor of the short stroke: 1 = a tick, -1 = an L. */
  k: number;
  /** Raw fold progress 0..1 (for the spark). */
  foldP: number;
  /** Degrees the whole tick is turned around its corner. */
  rot: number;
  mirrorO: number;
  nameO: number;
  /** Letter-spacing of the name in em, 0.9 → 0.35. */
  nameSpacing: number;
  /** Raw name progress 0..1. */
  nameP: number;
}

export const glyphEnd = (g: Glyph): { k: number; rot: number } =>
  g === 'tick' ? { k: 1, rot: 0 } : g === 'lean12' ? { k: -1, rot: TICK.leanDeg } : { k: -1, rot: TICK.uprightDeg };

export function frame(t: number, o: FoldOptions): FoldFrame {
  const s = o.schedule;
  const end = glyphEnd(o.glyph);
  const lp = easeOutCubic(prog(t, s.letter));
  const foldP = prog(t, s.fold);
  const rotP = prog(t, s.rotate);
  const mp = prog(t, s.mirror);
  const np = prog(t, s.name);
  const k = o.glyph === 'tick' ? 1 : 1 - 2 * easeInOutSine(foldP);
  const rot = o.glyph === 'tick' ? 0 : end.rot * (rotP >= 1 ? 1 : easeOutBack(rotP, o.overshoot));
  return {
    letterY: 26 * (1 - lp),
    letterO: lp,
    draw: easeOutSine(prog(t, s.tick)),
    tickO: t >= s.tick[0] ? 1 : 0,
    travel: rotP >= 1 ? 1 : easeOutBack(rotP, o.overshoot),
    k,
    foldP,
    rot,
    mirrorO: o.mirror === 'none' ? 0 : o.mirror === 'keep' ? lp : lp * (1 - easeOutCubic(mp)),
    nameO: easeOutCubic(np),
    nameSpacing: 0.9 - 0.55 * easeOutCubic(np),
    nameP: np,
  };
}

export const REFERENCE_OPTIONS: FoldOptions = { schedule: SCHEDULES.reference, glyph: 'upright', mirror: 'fade', overshoot: 1.1 };

/** End point of the short stroke for a fold factor, in the tick's box. */
export const shortEnd = (k: number): [number, number] => [TICK.corner[0] + TICK.shortLen * k * TICK.dir[0], TICK.corner[1] + TICK.shortLen * k * TICK.dir[1]];

/** The fold factor `lag` of fold progress behind now (for the spark's trail). */
export const kAt = (foldP: number, lag: number): number => 1 - 2 * easeInOutSine(clamp(foldP - lag));

/** Where the tick is drawn, relative to the letter, before it travels to the exponent place (all in units of the letter size). */
export const STAGE = {
  /** Scale of the 80×80 box while it is being drawn (the final one is TICK.scale). */
  scale: 1.25,
  /** Centre of the drawn tick: x from the letter's right edge, y up from the baseline. */
  dx: 0.3,
  dy: 0.34,
};

/** Fractions of the pen path: the short stroke is 20 long, the long one 48.2. */
export const PEN = { short: 20 / 68.2 };

export interface Gesture {
  /** Pen progress 0..1. */
  draw: number;
  /** Fold factor: 1 = tick, -1 = L. */
  k: number;
  /** Degrees turned around the corner. */
  rot: number;
}

const smoothstep = (r: number) => r * r * (3 - 2 * r);

/**
 * Draw → fold → turn as ONE gesture. `s` is 0..1 over the whole gesture. The three steps overlap and run at near constant speed
 * (only the very start and end are softened), so there is no stop between them; only the turn ends with a small overshoot.
 */
export function gesture(s: number, overshoot = 1.1): Gesture {
  const e = 0.7 * s + 0.3 * easeInOutSine(clamp(s));
  const draw = clamp(e / 0.4);
  const f = clamp((e - 0.3) / 0.38);
  const k = 1 - 2 * (0.6 * f + 0.4 * easeInOutSine(f));
  const r = clamp((e - 0.58) / 0.42);
  const rot = TICK.uprightDeg * (r >= 1 ? 1 : easeOutBack(smoothstep(r), overshoot));
  return { draw, k, rot };
}

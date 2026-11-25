/**
 * File: src/lib/brand/reel.ts
 * Description: The maths of the app reel, pure TypeScript with no React or DOM, so the same functions can be ported to
 * Compose. A reel is a list of prefixes (ROWS of them, the last one is the app it lands on) and a progress p from 0 to 1.
 * `reelPos` turns p into a continuous row index (it may overshoot the last row and come back); each kind then draws the
 * rows from that one number. Twenty variants are parameter sets over seven kinds.
 */
import { APP_DEFS, type AppId } from './apps';

/** Two full passes over the apps, plus the one it lands on, so every name is readable while it spins. */
export const ROWS = APP_DEFS.length * 2 + 1;
export const LINE = 1.15; // line height in em

export type EaseKind = 'out' | 'inOut' | 'back' | 'spring' | 'linearOut' | 'steps';
export type ReelKind = 'strip' | 'drum' | 'fade' | 'flip' | 'scale' | 'scramble' | 'odometer';

export interface ReelVariant {
  id: number;
  name: string;
  note: string;
  kind: ReelKind;
  ease: EaseKind;
  /** Overshoot strength for back / spring (1 = the usual). */
  overshoot: number;
  /** Peak motion blur in px at full speed. */
  blur: number;
  /** Fade the rows at the top and bottom edge of the window. */
  mask: boolean;
  /** 1 = rows travel upward (the next one comes from below), -1 = downward. */
  dir: 1 | -1;
  colour: 'app' | 'ink' | 'gradient';
  /** Haptic tick for every row that passes (Android). */
  tick?: boolean;
}

const v = (
  id: number,
  name: string,
  note: string,
  kind: ReelKind,
  ease: EaseKind,
  o: Partial<ReelVariant> = {}
): ReelVariant => ({ id, name, note, kind, ease, overshoot: 1, blur: 0, mask: true, dir: 1, colour: 'app', ...o });

export const REEL_VARIANTS: ReelVariant[] = [
  v(1, 'Classic slot', 'Vertical strip, strong slow-down, one small overshoot.', 'strip', 'back'),
  v(2, 'Blur slot', 'The same strip with motion blur that follows the speed.', 'strip', 'back', { blur: 7 }),
  v(3, 'Spring slot', 'Lands like a spring: two small bounces.', 'strip', 'spring', { blur: 4 }),
  v(4, 'Clean decelerate', 'No overshoot, a long soft stop.', 'strip', 'out', { blur: 3 }),
  v(5, 'Mechanical ticks', 'Snaps row by row, slowing down. Haptic tick on Android.', 'strip', 'steps', { mask: false, tick: true }),
  v(6, 'Fast then brake', 'Constant fast spin, then a hard brake.', 'strip', 'linearOut', { blur: 8, overshoot: 0 }),
  v(7, 'Rain', 'Rows fall downward instead of rising.', 'strip', 'back', { dir: -1, blur: 4 }),
  v(8, 'Hard window', 'No edge fade: rows are cut by the window.', 'strip', 'back', { mask: false, blur: 5 }),
  v(9, 'Drum', 'A 3D cylinder turns towards you and settles with an overshoot.', 'drum', 'back'),
  v(10, 'Drum, spring', 'The cylinder with a spring stop.', 'drum', 'spring', { blur: 3 }),
  v(11, 'Drum, ticks', 'The cylinder clicking from row to row.', 'drum', 'steps', { tick: true }),
  v(12, 'Drum, reverse', 'The cylinder turns away from you.', 'drum', 'out', { dir: -1 }),
  v(13, 'Crossfade', 'Names dissolve into each other, faster and faster, then rest.', 'fade', 'out'),
  v(14, 'Crossfade, ticks', 'Names swap in steps of light.', 'fade', 'steps', { tick: true }),
  v(15, 'Flip', 'Split-flap: each name folds away and the next folds in.', 'flip', 'inOut', { overshoot: 0 }),
  v(16, 'Zoom through', 'Names come at you and past you, the last one stays.', 'scale', 'back', { blur: 5 }),
  v(17, 'Zoom away', 'Names shrink into the distance.', 'scale', 'out', { dir: -1 }),
  v(18, 'Scramble', 'The letters of the target appear out of noise, left to right.', 'scramble', 'out', { colour: 'ink' }),
  v(19, 'Odometer', 'Every letter has its own wheel; the left ones stop first.', 'odometer', 'out', { mask: true }),
  v(20, 'Gradient strip', 'The classic strip in one shifted gradient instead of the app colours.', 'strip', 'back', { colour: 'gradient', blur: 4 }),
];

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** 0 → 1 (it may go above 1 for a moment). Exactly 1 at t >= 1. */
export function easeValue(kind: EaseKind, t: number, overshoot = 1): number {
  if (t >= 1) return 1;
  if (t <= 0) return 0;
  switch (kind) {
    case 'out':
    case 'steps':
      return 1 - Math.pow(1 - t, 4);
    case 'inOut':
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case 'back': {
      const c1 = 1.2 * overshoot;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    case 'spring':
      return 1 - Math.exp(-6 * t) * Math.cos(9 * t);
    case 'linearOut': {
      if (t < 0.55) return 1.31 * t;
      const u = (t - 0.55) / 0.45;
      return 0.72 + 0.28 * (1 - (1 - u) * (1 - u));
    }
  }
}

/** Continuous row index at progress p: 0 = first row, ROWS-1 = the app. */
export function reelPos(variant: ReelVariant, p: number): number {
  const e = easeValue(variant.ease, p, variant.overshoot);
  const raw = (ROWS - 1) * e;
  if (p >= 1) return ROWS - 1;
  return variant.ease === 'steps' ? Math.round(raw) : raw;
}

/** Rows per second-ish speed 0..1 (1 = the fastest the variant gets), used for motion blur. */
export function reelSpeed(variant: ReelVariant, p: number): number {
  const d = 0.015;
  const s = Math.abs(reelPos({ ...variant, ease: variant.ease === 'steps' ? 'out' : variant.ease }, p) - reelPos({ ...variant, ease: variant.ease === 'steps' ? 'out' : variant.ease }, Math.max(0, p - d))) / d;
  return clamp(s / (ROWS - 1) / 3.2);
}

/** The prefixes, in order; the last one is the app the reel lands on. */
export function reelWords(app: AppId): string[] {
  const target = APP_DEFS.findIndex((a) => a.id === app);
  const n = APP_DEFS.length;
  return Array.from({ length: ROWS }, (_, i) => APP_DEFS[(((target - (ROWS - 1) + i) % n) + n) % n].prefix);
}


export interface ReelLayer {
  key: number;
  text: string;
  /** In line heights (1 = one row up). */
  y: number;
  /** Degrees around the horizontal axis. */
  rx: number;
  scale: number;
  opacity: number;
  blur: number;
}

/** The layers a kind draws at position pos (strip, drum, fade, flip, scale). */
export function reelLayers(variant: ReelVariant, words: string[], pos: number, p: number): ReelLayer[] {
  const out: ReelLayer[] = [];
  const dir = variant.dir;
  const blur = variant.blur * reelSpeed(variant, p);
  const settle = 1 - smooth(0.9, 1, p); // neighbours vanish as it comes to rest
  if (variant.kind === 'flip') {
    const q = Math.min(pos, ROWS - 1);
    const base = Math.floor(q);
    const f = q - base;
    const first = f < 0.5;
    const idx = first ? base : Math.min(base + 1, ROWS - 1);
    const rx = first ? -f * 180 : (1 - f) * 180;
    out.push({ key: idx, text: words[idx], y: 0, rx: rx * dir, scale: 1, opacity: 1, blur: 0 });
    return out;
  }
  words.forEach((text, i) => {
    const d = (i - pos) * dir;
    const ad = Math.abs(d);
    let layer: ReelLayer | null = null;
    switch (variant.kind) {
      case 'strip':
        if (ad < 1.25) layer = { key: i, text, y: d, rx: 0, scale: 1, opacity: variant.mask ? 1 - smooth(0.25, 1, ad) : ad < 1 ? 1 : 0, blur };
        break;
      case 'drum':
        if (ad < 2.7) layer = { key: i, text, y: 0, rx: d * 30, scale: 1, opacity: ad < 0.01 ? 1 : clamp(1 - ad * 0.45) * settle, blur };
        break;
      case 'fade':
        if (ad < 1) layer = { key: i, text, y: 0, rx: 0, scale: 1 - 0.06 * ad, opacity: 1 - ad, blur: blur * ad };
        break;
      case 'scale':
        if (ad < 1.2) layer = { key: i, text, y: 0, rx: 0, scale: Math.max(0.05, 1 + d * 1.1), opacity: clamp(1 - ad * 1.15), blur: blur * ad };
        break;
      default:
        break;
    }
    if (layer) out.push(layer);
  });
  return out;
}

const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const hash = (a: number, b: number) => {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return Math.abs(h ^ (h >>> 16));
};

/** Scramble: each letter is noise until its moment, then settles. */
export function scrambleText(word: string, p: number): { ch: string; solid: boolean }[] {
  const n = word.length;
  const frame = Math.floor(p * 36);
  return [...word].map((ch, i) => {
    const at = 0.25 + 0.65 * (i / Math.max(1, n - 1));
    if (p >= at || p >= 1) return { ch, solid: true };
    return { ch: POOL[hash(i, frame) % POOL.length], solid: false };
  });
}

export const WHEEL = 8;
/** Odometer: for letter c of the word, the strip of letters on its wheel and the position (0..WHEEL) at progress p. */
export function odometerColumn(word: string, c: number, p: number, variant: ReelVariant): { chars: string[]; pos: number } {
  const n = word.length;
  const target = word[c];
  const ti = POOL.indexOf(target);
  const chars = Array.from({ length: WHEEL + 1 }, (_, k) => POOL[(((ti - (WHEEL - k)) % POOL.length) + POOL.length) % POOL.length]);
  const end = 1 - 0.05 * (n - 1 - c);
  const t = clamp(p / end);
  return { chars, pos: WHEEL * easeValue(variant.ease, t, variant.overshoot) };
}

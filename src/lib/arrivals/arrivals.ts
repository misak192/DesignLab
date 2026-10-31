/**
 * File: src/lib/arrivals/arrivals.ts
 * Description: The arrivals, as maths. Every item of the /arrivals page (panels, words, lines) is a "piece" with a
 * resting depth; an arrival is a pure function from the piece's progress (0 to 1) to a pose (position, depth, turn,
 * scale, opacity, blur). The timing modes decide when each piece starts. Pure TypeScript, no React or DOM.
 *
 * Z is signed: a positive start Z arrives from the front (towards the viewer), a negative one from the back.
 */

export type ArrivalId =
  | 'depth'
  | 'stamp'
  | 'parallax'
  | 'cinematic'
  | 'swing'
  | 'flip'
  | 'converge'
  | 'reveal'
  | 'focus';

export type TimingId = 'together' | 'delayed' | 'chaotic';

export const ARRIVALS: { id: ArrivalId; name: string; blurb: string }[] = [
  { id: 'depth', name: 'Depth', blurb: 'Every piece falls along Z onto its layer, softening as it lands. Positive Z from the front, negative from the back.' },
  { id: 'stamp', name: 'Stamp', blurb: 'Pieces come down fast, hit with a dent, a shockwave ring and a shake of the whole stage.' },
  { id: 'parallax', name: 'Parallax slide', blurb: 'Pieces slide in from the side, the nearer the layer the longer its travel.' },
  { id: 'cinematic', name: 'Cinematic', blurb: 'Letterbox bars close, the camera dollies in, focus is pulled piece by piece, a light streak crosses.' },
  { id: 'swing', name: 'Swing', blurb: 'Pieces swing open like doors, hinged on their left edge.' },
  { id: 'flip', name: 'Flip up', blurb: 'Pieces stand up from lying flat, hinged on their bottom edge.' },
  { id: 'converge', name: 'Converge', blurb: 'Pieces fly in from random places in the room and spin into position.' },
  { id: 'reveal', name: 'Poster reveal', blurb: 'A wipe uncovers each piece from the bottom while it rises into place.' },
  { id: 'focus', name: 'Focus pull', blurb: 'Out of a heavy blur into sharp, with a slow push of depth.' },
];

export const TIMINGS: { id: TimingId; name: string; blurb: string }[] = [
  { id: 'together', name: 'Together', blurb: 'Everything at once.' },
  { id: 'delayed', name: 'Delayed', blurb: 'One by one, back to front.' },
  { id: 'chaotic', name: 'Chaotic', blurb: 'Random moments, new each play.' },
];

export type ItemKind = 'panel' | 'line' | 'word';

export interface ArrivalItem {
  id: string;
  kind: ItemKind;
  /** Resting depth at full Rest depth, px. */
  rest: number;
  /** 0 = deepest, 1 = nearest: sets how far it starts and how far it travels. */
  rank: number;
}

/** Back to front: the order of the Delayed mode. */
export const ITEMS: ArrivalItem[] = [
  { id: 'ground', kind: 'panel', rest: -160, rank: 0 },
  { id: 'topology', kind: 'panel', rest: -60, rank: 0.15 },
  { id: 'kicker', kind: 'line', rest: 40, rank: 0.45 },
  { id: 'truth', kind: 'word', rest: 60, rank: 0.6 },
  { id: 'is', kind: 'word', rest: 80, rank: 0.7 },
  { id: 'internal', kind: 'word', rest: 100, rank: 0.8 },
  { id: 'sub', kind: 'line', rest: 60, rank: 0.6 },
  { id: 'hud', kind: 'panel', rest: 160, rank: 1 },
];

export const Z_UNIT = 160;
export const PERSPECTIVE = 1500;
/** Share of the duration over which the start moments are spread (Delayed and Chaotic). */
export const SPREAD = 0.55;

/** Four numbers per item, drawn once per play: three for scatter and tilt, one for the Chaotic start. */
export type Rand = [number, number, number, number];

export const randoms = (): Rand[] => ITEMS.map(() => [Math.random(), Math.random(), Math.random(), Math.random()]);
export const calmRandoms = (): Rand[] => ITEMS.map(() => [0.5, 0.5, 0.5, 0.5]);

export interface Pose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  s: number;
  o: number;
  blur: number;
  /** Wipe, 0 hidden to 1 shown. */
  clip: number;
  origin: string;
  /** Stamp: 0..1 time since the impact, -1 before it. */
  hit: number;
}

export interface Knobs {
  /** Signed start depth in units of 160 px: + from the front, - from the back. */
  zStart: number;
  /** 0 = all pieces land flat, 1 = they keep their full layer depth. */
  restDepth: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const easeOutQuart = (p: number) => 1 - Math.pow(1 - p, 4);
const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeInOutSine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;
const easeOutBack = (p: number, c: number) => 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);

/** Where a piece rests. */
export const restZ = (item: ArrivalItem, k: Knobs) => item.rest * k.restDepth;

/** The pose of one piece at progress p (0 not started, 1 landed). */
export function poseFor(id: ArrivalId, p: number, item: ArrivalItem, rand: Rand, k: Knobs): Pose {
  const rz0 = restZ(item, k);
  const pose: Pose = { x: 0, y: 0, z: rz0, rx: 0, ry: 0, rz: 0, s: 1, o: 1, blur: 0, clip: 1, origin: '50% 50%', hit: -1 };
  if (p >= 1) return pose;
  p = clamp01(p);
  const zs = k.zStart * Z_UNIT * (0.55 + 0.45 * item.rank);

  switch (id) {
    case 'depth': {
      const e = easeOutCubic(p);
      pose.z = rz0 + zs * (1 - e);
      pose.o = clamp01(p * 5);
      pose.blur = (1 - e) * 6;
      break;
    }
    case 'stamp': {
      const HIT = 0.6;
      const fall = Math.abs(zs);
      pose.o = clamp01(p / 0.12);
      if (p < HIT) {
        const d = p / HIT;
        const e = d * d * d;
        pose.z = rz0 + fall * (1 - e);
        pose.blur = (1 - e) * 10;
        pose.rz = (rand[0] - 0.5) * 8 * (1 - e);
      } else {
        const q = (p - HIT) / (1 - HIT);
        const dent = Math.exp(-5 * q) * Math.cos(q * Math.PI * 1.5);
        pose.z = rz0 - (item.kind === 'word' ? 26 : 12) * dent;
        pose.s = 1 + 0.03 * dent;
        pose.hit = q;
      }
      break;
    }
    case 'parallax': {
      const e = easeOutQuart(p);
      pose.x = -(120 + 560 * item.rank) * (1 - e);
      pose.z = rz0 + zs * 0.2 * (1 - e);
      pose.o = clamp01(p * 4);
      pose.blur = (1 - e) * 3;
      break;
    }
    case 'cinematic': {
      const e = easeInOutSine(p);
      pose.y = 28 * (1 - e);
      pose.z = rz0 + zs * 0.45 * (1 - e);
      pose.o = clamp01(p * 2.2);
      pose.blur = (1 - easeOutCubic(p)) * 16;
      break;
    }
    case 'swing': {
      const e = easeOutBack(p, 1.1);
      pose.ry = -78 * (1 - e);
      pose.z = rz0 + zs * 0.25 * (1 - e);
      pose.o = clamp01(p * 3.5);
      pose.origin = '0% 50%';
      break;
    }
    case 'flip': {
      const e = easeOutBack(p, 1);
      pose.rx = 88 * (1 - e);
      pose.y = 30 * (1 - e);
      pose.z = rz0 + zs * 0.2 * (1 - e);
      pose.o = clamp01(p * 4);
      pose.origin = '50% 100%';
      break;
    }
    case 'converge': {
      const e = easeOutQuart(p);
      pose.x = (rand[0] - 0.5) * 1400 * (1 - e);
      pose.y = (rand[1] - 0.5) * 900 * (1 - e);
      pose.z = rz0 + zs * (0.4 + rand[2] * 0.6) * (1 - e);
      pose.rz = (rand[0] - 0.5) * 140 * (1 - e);
      pose.o = clamp01(p * 3);
      pose.blur = (1 - e) * 5;
      break;
    }
    case 'reveal': {
      const e = easeOutCubic(p);
      pose.clip = easeInOutCubic(p);
      pose.y = 70 * (1 - e);
      pose.z = rz0 + zs * 0.12 * (1 - e);
      pose.o = clamp01(p * 6);
      break;
    }
    case 'focus': {
      const e = easeOutCubic(p);
      pose.blur = (1 - e) * 28;
      pose.z = rz0 + zs * 0.3 * (1 - e);
      pose.o = clamp01(p * 2.4);
      break;
    }
  }
  return pose;
}

/** When each piece starts and how long its own arrival lasts, in seconds. */
export function windows(timing: TimingId, duration: number, rands: Rand[]): { delay: number[]; length: number } {
  const n = ITEMS.length;
  if (timing === 'together') return { delay: ITEMS.map(() => 0), length: duration };
  const span = SPREAD * duration;
  const delay = ITEMS.map((_, i) => (timing === 'delayed' ? (i / (n - 1)) * span : rands[i][3] * span));
  return { delay, length: duration - span };
}

export interface RigFx {
  /** Camera push, px (cinematic). */
  z: number;
  /** Letterbox bars, 0 open to 1 closed. */
  bars: number;
  /** Light streak, 0..1. */
  streak: number;
  shakeX: number;
  shakeY: number;
}

/** What happens to the whole stage: the cinematic camera and bars, the stamp's shake. T is overall progress 0..1. */
export function rigFx(id: ArrivalId, T: number, poses: Pose[], k: Knobs): RigFx {
  const fx: RigFx = { z: 0, bars: 0, streak: 0, shakeX: 0, shakeY: 0 };
  if (T >= 1) return fx;
  if (id === 'cinematic') {
    fx.z = -Math.abs(k.zStart) * 45 * (1 - easeInOutCubic(T));
    fx.bars = easeInOutSine(clamp01(Math.min(T / 0.14, (1 - T) / 0.14)));
    fx.streak = Math.sin(Math.PI * clamp01((T - 0.1) / 0.5));
  }
  if (id === 'stamp') {
    poses.forEach((po, i) => {
      if (po.hit < 0) return;
      const amp = Math.exp(-7 * po.hit) * (ITEMS[i].kind === 'word' ? 3.5 : 1.5);
      fx.shakeX += amp * Math.sin(po.hit * 70 + i * 2.1);
      fx.shakeY += amp * Math.cos(po.hit * 83 + i * 1.3);
    });
  }
  return fx;
}

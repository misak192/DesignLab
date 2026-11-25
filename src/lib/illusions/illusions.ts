/**
 * File: src/lib/illusions/illusions.ts
 * Description: Ten optical-illusion backgrounds, five static and five driven by the clock or by actions.
 * Every design is ONE pure function draw(ctx, frame) that paints a full canvas from a handful of numbers, so the
 * same maths can be ported to an Android Canvas. No React, no DOM, no storage: the host owns the canvas, the
 * clock and the settings. Colours are opaque hexes except the dots/overlays of the illusion itself.
 */
import { hhmm, mix, periodName, smooth, timePalette } from './colour';

export interface Ctl {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
}

export interface Frame {
  w: number;
  h: number;
  /** Milliseconds, any origin; only differences matter. */
  now: number;
  /** Time of day in minutes, 0 to 1440 (fractional). */
  minutes: number;
  /** Current setting values by key. */
  p: Record<string, number>;
  /** Mutable per-instance memory (crossfade, reaction). */
  state: Record<string, any>;
  /** True when motion is off: draw the settled picture, no fades. */
  still: boolean;
  /** True in the gallery preview: designs that need input fake it. */
  demo: boolean;
}

export interface Illusion {
  id: string;
  name: string;
  group: 'Static' | 'Time and actions';
  blurb: string;
  controls: Ctl[];
  /** Needs a frame loop (moves on its own, or follows the clock). */
  animated: boolean;
  /** Follows the time of day: the gallery sweeps a whole day in this many seconds. */
  sweep?: number;
  draw: (ctx: CanvasRenderingContext2D, f: Frame) => void;
  label?: (f: Frame) => string;
}

const ctl = (key: string, label: string, min: number, max: number, step: number, value: number): Ctl => ({ key, label, min, max, step, value });

export const defaultsOf = (ill: Illusion): Record<string, number> => Object.fromEntries(ill.controls.map((c) => [c.key, c.value]));

const TAU = Math.PI * 2;

/* ───────────────────────── 1 · bulging checkerboard ───────────────────────── */

function drawBulge(ctx: CanvasRenderingContext2D, w: number, h: number, squares: number, cx: number, cy: number, contrast: number, a = '#1d5c3b', b = '#2f8556') {
  const s = w / squares;
  const rows = Math.ceil(h / s) + 1;
  ctx.fillStyle = a;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = b;
  ctx.beginPath();
  for (let r = 0; r < rows; r++) for (let c = 0; c < squares; c++) if ((r + c) & 1) ctx.rect(c * s, r * s, s + 0.6, s + 0.6);
  ctx.fill();
  // Diamond dots on every grid corner; the colour depends on which side of the centre the corner is on.
  const rad = s * 0.17;
  const black = new Path2D();
  const white = new Path2D();
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= squares; c++) {
      const x = c * s;
      const y = r * s;
      const isWhite = x - cx * w < 0 !== y - cy * h < 0;
      const p = isWhite ? white : black;
      p.moveTo(x, y - rad);
      p.lineTo(x + rad, y);
      p.lineTo(x, y + rad);
      p.lineTo(x - rad, y);
      p.closePath();
    }
  }
  ctx.fillStyle = `rgba(0,0,0,${contrast})`;
  ctx.fill(black);
  ctx.fillStyle = `rgba(255,255,255,${contrast})`;
  ctx.fill(white);
}

const BULGE: Illusion = {
  id: 'I01',
  name: 'Bulging checkerboard',
  group: 'Static',
  blurb: 'Two close greens, small black and white diamonds on every corner, coloured by which side of the centre they sit on: the board bulges toward you.',
  controls: [ctl('squares', 'Squares across', 8, 48, 1, 24), ctl('cx', 'Bulge centre X', 0, 1, 0.01, 0.5), ctl('cy', 'Bulge centre Y', 0, 1, 0.01, 0.5), ctl('contrast', 'Dot contrast', 0, 1, 0.01, 0.85)],
  animated: false,
  draw: (ctx, f) => drawBulge(ctx, f.w, f.h, f.p.squares, f.p.cx, f.p.cy, f.p.contrast),
};

/* ───────────────────────── 2 · café wall ───────────────────────── */

function drawCafe(ctx: CanvasRenderingContext2D, w: number, h: number, tile: number, shift: number, gap: number, dark: string, light: string, line: string) {
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, w, h);
  const rows = Math.ceil(h / tile) + 1;
  ctx.fillStyle = dark;
  ctx.beginPath();
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * shift * tile;
    for (let x = -2 * tile + off; x < w + tile; x += 2 * tile) ctx.rect(x, r * tile, tile, tile);
  }
  ctx.fill();
  ctx.fillStyle = line;
  for (let r = 0; r <= rows; r++) ctx.fillRect(0, r * tile - gap / 2, w, gap);
}

const CAFE_CTL = [ctl('tile', 'Tile size', 24, 120, 1, 56), ctl('shift', 'Row shift', 0, 1, 0.01, 0.5), ctl('gap', 'Gap line thickness', 1, 10, 0.5, 3)];

const CAFE: Illusion = {
  id: 'I02',
  name: 'Café wall',
  group: 'Static',
  blurb: 'Dark and light tiles in rows, each row shifted by half a tile, thin grey lines between: the straight rows look tilted. Dark navy, soft contrast.',
  controls: CAFE_CTL,
  animated: false,
  draw: (ctx, f) => drawCafe(ctx, f.w, f.h, f.p.tile, f.p.shift, f.p.gap, '#0c1a3d', '#27427a', '#7c88a6'),
};

/* ───────────────────────── 3 · scintillating grid ───────────────────────── */

function drawScint(ctx: CanvasRenderingContext2D, w: number, h: number, sp: number, lw: number, dot: number) {
  ctx.fillStyle = '#0a1230';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#6f7a99';
  const ox = (w % sp) / 2;
  const oy = (h % sp) / 2;
  for (let x = ox; x <= w; x += sp) ctx.fillRect(x - lw / 2, 0, lw, h);
  for (let y = oy; y <= h; y += sp) ctx.fillRect(0, y - lw / 2, w, lw);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  for (let x = ox; x <= w; x += sp) for (let y = oy; y <= h; y += sp) {
    ctx.moveTo(x + dot, y);
    ctx.arc(x, y, dot, 0, TAU);
  }
  ctx.fill();
}

const SCINT: Illusion = {
  id: 'I03',
  name: 'Scintillating grid',
  group: 'Static',
  blurb: 'Deep navy, a soft grey grid and small white dots where the lines cross. Dark spots seem to flicker at the corner of the eye. Quiet enough to sit behind UI.',
  controls: [ctl('sp', 'Grid spacing', 24, 110, 1, 52), ctl('lw', 'Line width', 2, 16, 0.5, 8), ctl('dot', 'Dot size', 1, 12, 0.5, 4.5)],
  animated: false,
  draw: (ctx, f) => drawScint(ctx, f.w, f.h, f.p.sp, f.p.lw, f.p.dot),
};

/* ───────────────────────── 4 · Ouchi float ───────────────────────── */

function bricks(ctx: CanvasRenderingContext2D, w: number, h: number, bw: number, bh: number, c1: string, c2: string) {
  ctx.fillStyle = c2;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = c1;
  ctx.beginPath();
  const cols = Math.ceil(w / bw);
  const rows = Math.ceil(h / bh);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if ((r + c) & 1) ctx.rect(c * bw, r * bh, bw, bh);
  ctx.fill();
}

const OUCHI: Illusion = {
  id: 'I04',
  name: 'Ouchi float',
  group: 'Static',
  blurb: 'Thin horizontal checker bricks with an off-centre circle of the same pattern turned vertical: the circle seems to float and slide as you scroll or move your eyes. It also drifts a little by itself.',
  controls: [ctl('size', 'Circle size', 0.12, 0.48, 0.01, 0.3), ctl('ratio', 'Brick ratio', 2, 7, 0.1, 3.4), ctl('contrast', 'Contrast', 0.2, 1, 0.01, 0.8)],
  animated: true,
  draw: (ctx, f) => {
    const mid = '#2c5192';
    const c1 = mix(mid, '#7fb0f2', f.p.contrast);
    const c2 = mix(mid, '#0d2150', f.p.contrast);
    const bh = 9;
    const bw = bh * f.p.ratio;
    bricks(ctx, f.w, f.h, bw, bh, c1, c2);
    const t = f.still ? 0 : f.now / 1000;
    const cx = f.w * 0.6 + Math.sin(t * 0.5) * 14;
    const cy = f.h * 0.42 + Math.cos(t * 0.37) * 10;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(f.w, f.h) * f.p.size, 0, TAU);
    ctx.clip();
    bricks(ctx, f.w, f.h, bh, bw, c1, c2);
    ctx.restore();
  },
};

/* ───────────────────────── 5 · rotating snakes ───────────────────────── */

function drawSnakes(ctx: CanvasRenderingContext2D, w: number, h: number, R: number, intensity: number, calm: boolean) {
  const I = calm ? intensity * 0.4 : intensity;
  const grey = '#6d86b8';
  const cols = ['#000000', '#1c3f8f', '#ffffff', '#7fc1ff'].map((c) => mix(grey, c, I));
  ctx.fillStyle = '#0f1a3d';
  ctx.fillRect(0, 0, w, h);
  const rings = [
    { r0: 0.1, r1: 0.4, n: 8 },
    { r0: 0.4, r1: 0.7, n: 12 },
    { r0: 0.7, r1: 1, n: 16 },
  ];
  const stepY = R * 1.74;
  for (let j = -1; j * stepY < h + R; j++) {
    for (let i = -1; i * 2 * R < w + 2 * R; i++) {
      const cx = i * 2 * R + (j & 1 ? R : 0);
      const cy = j * stepY;
      const rev = (i + j) & 1;
      const paths = cols.map(() => new Path2D());
      for (const ring of rings) {
        for (let k = 0; k < ring.n; k++) {
          for (let s = 0; s < 4; s++) {
            const a0 = ((k + s / 4) / ring.n) * TAU;
            const a1 = ((k + (s + 1) / 4) / ring.n) * TAU;
            const p = paths[rev ? 3 - s : s];
            p.moveTo(cx + Math.cos(a0) * ring.r1 * R, cy + Math.sin(a0) * ring.r1 * R);
            p.arc(cx, cy, ring.r1 * R * 0.97, a0, a1);
            p.arc(cx, cy, ring.r0 * R, a1, a0, true);
            p.closePath();
          }
        }
      }
      cols.forEach((c, n) => {
        ctx.fillStyle = c;
        ctx.fill(paths[n]);
      });
    }
  }
  if (calm) {
    // The frosted layer: a soft navy wash that hides the drift.
    ctx.fillStyle = 'rgba(14,24,60,0.42)';
    ctx.fillRect(0, 0, w, h);
  }
}

const SNAKES: Illusion = {
  id: 'I05',
  name: 'Rotating snakes',
  group: 'Static',
  blurb: 'Rings of petals, each repeating black, dark blue, white, light blue, so the rings seem to spin when you look around. Intensity from calm to strong; Calm mode puts a frosted layer on top.',
  controls: [ctl('size', 'Disc size', 40, 130, 1, 74), ctl('intensity', 'Intensity', 0, 1, 0.01, 0.85), ctl('calm', 'Calm mode (0 off, 1 on)', 0, 1, 1, 0)],
  animated: false,
  draw: (ctx, f) => drawSnakes(ctx, f.w, f.h, f.p.size, f.p.intensity, f.p.calm >= 0.5),
};

/* ───────────────────────── op-art waves (used by 5 designs) ───────────────────────── */

function drawWaves(ctx: CanvasRenderingContext2D, w: number, h: number, pitch: number, count: number, bend: number, dark: string, light: string) {
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, w, h);
  const pts: { x: number; y: number; s: number }[] = [];
  for (let i = 0; i < count; i++) pts.push({ x: ((i * 0.618034 + 0.17) % 1) * w, y: ((i * 0.381966 + 0.31) % 1) * h, s: i % 2 ? -1 : 1 });
  const sigma = Math.min(w, h) * (0.26 - count * 0.009);
  const k = 1 / (2 * sigma * sigma);
  const amp = bend * pitch * 3.4;
  const step = 8;
  const nx = Math.ceil(w / step) + 1;
  const rows = Math.ceil(h / pitch) + 6;
  const lines: Float32Array[] = [];
  for (let i = 0; i < rows; i++) {
    const base = (i - 3) * pitch;
    const ys = new Float32Array(nx);
    for (let j = 0; j < nx; j++) {
      const x = j * step;
      let d = 0;
      for (const p of pts) d += p.s * Math.exp(-((x - p.x) ** 2 + (base - p.y) ** 2) * k);
      ys[j] = base - amp * d;
    }
    lines.push(ys);
  }
  ctx.fillStyle = dark;
  ctx.beginPath();
  for (let i = 0; i + 1 < rows; i += 2) {
    const a = lines[i];
    const b = lines[i + 1];
    ctx.moveTo(0, a[0]);
    for (let j = 1; j < nx; j++) ctx.lineTo(j * step, a[j]);
    for (let j = nx - 1; j >= 0; j--) ctx.lineTo(j * step, b[j]);
    ctx.closePath();
  }
  ctx.fill();
}

const WAVES_CTL = [ctl('pitch', 'Stripe width', 10, 50, 1, 22), ctl('count', 'Bend points', 1, 12, 1, 4), ctl('bend', 'Bend strength', 0, 1, 0.01, 0.6)];

const WAVES: Illusion = {
  id: 'I00',
  name: 'Op-art waves',
  group: 'Static',
  blurb: 'Parallel stripes that bend around invisible points.',
  controls: WAVES_CTL,
  animated: false,
  draw: (ctx, f) => drawWaves(ctx, f.w, f.h, f.p.pitch, f.p.count, f.p.bend, '#0b1a45', '#f2f5ff'),
};

/* ───────────────────────── 6 · bulge that follows the clock ───────────────────────── */

const BULGE_CLOCK: Illusion = {
  id: 'I06',
  name: 'Bulge that follows the clock',
  group: 'Time and actions',
  blurb: 'The bulging board, with its centre moved by the time: the hour sets the horizontal place, the minutes the vertical one (a smooth there-and-back, never a jump), so it drifts slowly through the day.',
  controls: [ctl('squares', 'Squares across', 8, 48, 1, 24), ctl('contrast', 'Dot contrast', 0, 1, 0.01, 0.85)],
  animated: true,
  sweep: 24,
  draw: (ctx, f) => {
    const cx = 0.1 + 0.8 * smooth(f.minutes / 1440);
    const cy = 0.1 + 0.8 * (0.5 - 0.5 * Math.cos(TAU * ((f.minutes % 60) / 60)));
    drawBulge(ctx, f.w, f.h, f.p.squares, cx, cy, f.p.contrast);
  },
  label: (f) => hhmm(f.minutes),
};

/* ───────────────────────── 7 · palette for the time of day ───────────────────────── */

const CAFE_DAY: Illusion = {
  id: 'I07',
  name: 'Palette for the time of day',
  group: 'Time and actions',
  blurb: 'The café wall in dawn peach and lilac, midday sky blue, sunset amber and rose, night navy and indigo. The colours blend smoothly between them; no sudden jumps.',
  controls: CAFE_CTL,
  animated: true,
  sweep: 30,
  draw: (ctx, f) => {
    const pal = timePalette(f.minutes);
    drawCafe(ctx, f.w, f.h, f.p.tile, f.p.shift, f.p.gap, pal.a, pal.b, pal.line);
  },
  label: (f) => `${periodName(f.minutes)} · ${hhmm(f.minutes)}`,
};

/* ───────────────────────── 8 · illusion of the hour ───────────────────────── */

const ROTATION: Illusion[] = [BULGE, CAFE, SCINT, OUCHI, WAVES];
const ROT_NAMES = ['Bulging checkerboard', 'Café wall', 'Scintillating grid', 'Ouchi float', 'Op-art waves'];
const hourIndex = (minutes: number) => Math.floor((((minutes % 1440) + 1440) % 1440) / 60) % ROTATION.length;

const HOURLY: Illusion = {
  id: 'I08',
  name: 'Illusion of the hour',
  group: 'Time and actions',
  blurb: 'A different illusion each hour: bulge, café wall, scintillating grid, Ouchi float, op-art waves, then repeat. A change is a two-second crossfade.',
  controls: [],
  animated: true,
  sweep: 120,
  draw: (ctx, f) => {
    const st = f.state;
    const idx = hourIndex(f.minutes);
    if (st.cur === undefined) st.cur = idx;
    if (idx !== st.cur) {
      st.prev = st.cur;
      st.cur = idx;
      st.t0 = f.now;
    }
    const sub = (i: number) => ROTATION[i].draw(ctx, { ...f, p: defaultsOf(ROTATION[i]) });
    const a = f.still || st.prev === undefined ? 1 : Math.min(1, (f.now - st.t0) / 2000);
    if (a < 1) {
      sub(st.prev);
      ctx.globalAlpha = smooth(a);
      sub(st.cur);
      ctx.globalAlpha = 1;
    } else sub(st.cur);
  },
  label: (f) => `${ROT_NAMES[hourIndex(f.minutes)]} · ${hhmm(f.minutes)}`,
};

/* ───────────────────────── 9 · op-art waves driven by minutes ───────────────────────── */

const WAVES_CLOCK: Illusion = {
  id: 'I09',
  name: 'Op-art waves by the minute',
  group: 'Time and actions',
  blurb: 'Stripes bending around invisible points. The hour sets how many points (1 to 12); the minutes set how hard the stripes bend, so each hour builds up and calms down. Navy and white.',
  controls: [ctl('pitch', 'Stripe width', 10, 50, 1, 22), ctl('max', 'Strongest bend', 0.2, 1, 0.01, 0.8)],
  animated: true,
  sweep: 45,
  draw: (ctx, f) => {
    const hour = Math.floor(f.minutes / 60) % 12 || 12;
    const bend = f.p.max * Math.sin(Math.PI * ((f.minutes % 60) / 60));
    drawWaves(ctx, f.w, f.h, f.p.pitch, hour, bend, '#0b1a45', '#f2f5ff');
  },
  label: (f) => `${Math.floor(f.minutes / 60) % 12 || 12} points · ${hhmm(f.minutes)}`,
};

/* ───────────────────────── 10 · background that reacts to actions ───────────────────────── */

export interface Hit {
  x: number;
  y: number;
}

const REACT: Illusion = {
  id: 'I10',
  name: 'Reacts to actions',
  group: 'Time and actions',
  blurb: 'Each action (tick, swipe, save) pulls the bulge centre toward where you tapped and pulses the dot contrast for a moment before it settles. It starts where the hour and minute put it, so every visit differs.',
  controls: [ctl('squares', 'Squares across', 8, 48, 1, 24), ctl('contrast', 'Resting contrast', 0, 1, 0.01, 0.55), ctl('pull', 'Pull toward the tap', 0.1, 1, 0.01, 0.6)],
  animated: true,
  draw: (ctx, f) => {
    const st = f.state;
    if (st.cx === undefined || (!st.touched && st.seed !== Math.floor(f.minutes))) {
      st.seed = Math.floor(f.minutes);
      st.cx = st.tx = 0.1 + 0.8 * (Math.floor(f.minutes / 60) / 24 + (f.minutes % 60) / 1440);
      st.cy = st.ty = 0.1 + 0.8 * ((f.minutes % 60) / 60);
      st.pulse = -1e9;
      st.last = f.now;
      st.demo = f.now;
    }
    const hits: Hit[] = st.hits ?? [];
    if (f.demo && f.now - st.demo > 2200) {
      st.demo = f.now;
      hits.push({ x: Math.random(), y: Math.random() });
    }
    while (hits.length) {
      const hit = hits.shift() as Hit;
      st.touched = true;
      st.tx = st.cx + (hit.x - st.cx) * f.p.pull;
      st.ty = st.cy + (hit.y - st.cy) * f.p.pull;
      st.pulse = f.now;
      if (f.still) {
        st.cx = st.tx;
        st.cy = st.ty;
      }
    }
    st.hits = hits;
    const dt = Math.min(0.1, Math.max(0, (f.now - st.last) / 1000));
    st.last = f.now;
    const k = 1 - Math.exp(-dt * 3);
    st.cx += (st.tx - st.cx) * k;
    st.cy += (st.ty - st.cy) * k;
    const pulse = f.still ? 0 : Math.exp(-(f.now - st.pulse) / 800);
    drawBulge(ctx, f.w, f.h, f.p.squares, st.cx, st.cy, Math.min(1, f.p.contrast * (1 + 1.6 * pulse)));
  },
  label: () => 'Tap the picture or use the buttons',
};

export const ILLUSIONS: Illusion[] = [BULGE, CAFE, SCINT, OUCHI, SNAKES, BULGE_CLOCK, CAFE_DAY, HOURLY, WAVES_CLOCK, REACT];

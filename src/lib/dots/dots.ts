/**
 * File: src/lib/dots/dots.ts
 * Description: The dot-grid illusion as pure maths plus one canvas draw function. A picture is sampled into a grid
 * of cells (one colour each, alternate cells a lighter and darker tone, like a painted checkerboard); small dots sit
 * on the corners where four cells meet, and the light/dark order of those dots along each row (a pattern such as
 * "wwbwbbwb") is what bends the straight rows. No React, no DOM, no storage: the host supplies the canvas context, the
 * cell colours and the settings, so the same code ports to Android. "w" = the light dot colour, "b" = the dark one.
 */

export interface Preset {
  id: string;
  name: string;
  pattern: string;
  rowShift: number;
}

/** Patterns to try. rowShift moves the pattern that many dots further along on each row down. */
export const PATTERNS: Preset[] = [
  { id: 'classic', name: 'Classic w w b w b b w b', pattern: 'wwbwbbwb', rowShift: 1 },
  { id: 'alternate', name: 'Alternate', pattern: 'wb', rowShift: 0 },
  { id: 'checker', name: 'Checker', pattern: 'wb', rowShift: 1 },
  { id: 'pairs', name: 'Pairs', pattern: 'wwbb', rowShift: 1 },
  { id: 'rows', name: 'Rows', pattern: 'wwbwbbwb', rowShift: 0 },
  { id: 'sparse', name: 'Sparse', pattern: 'wwwb', rowShift: 2 },
  { id: 'steps', name: 'Steps', pattern: 'wwwwbbbb', rowShift: 1 },
  { id: 'light', name: 'All light', pattern: 'w', rowShift: 0 },
  { id: 'dark', name: 'All dark', pattern: 'b', rowShift: 0 },
];

/** Reads "w w b" or "wwb" or "1 0 1" into 0 (light) and 1 (dark). Empty input gives a single light dot. */
export function parsePattern(text: string): number[] {
  const out: number[] = [];
  for (const ch of text.toLowerCase()) {
    if (ch === 'w' || ch === '1') out.push(0);
    else if (ch === 'b' || ch === '0') out.push(1);
  }
  return out.length ? out : [0];
}

/** Swaps light and dark: "wwb" becomes "bbw". */
export const invertPattern = (text: string): string => parsePattern(text).map((v) => (v ? 'w' : 'b')).join('');

/** A seeded random pattern of the given length, never all one colour. */
export function randomPattern(len: number, seed: number): string {
  let s = seed >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  let out = '';
  for (let i = 0; i < len; i++) out += rnd() < 0.5 ? 'w' : 'b';
  return out.includes('w') && out.includes('b') ? out : 'wb' + out.slice(2);
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** 0 = light dot, 1 = dark dot at corner (i, j). */
export const dotAt = (i: number, j: number, pat: number[], rowShift: number, offset: number): number => pat[mod(i + j * rowShift + offset, pat.length)];

export interface Lens {
  x: number;
  y: number;
  r: number;
  pattern: number[];
  rowShift: number;
}

export interface DotSpec {
  w: number;
  h: number;
  cols: number;
  rows: number;
  /** cols * rows RGBA bytes, row 0 first. */
  cells: ArrayLike<number>;
  /** How far the light and dark tones of a cell leave its colour, 0 to 0.6. */
  contrast: number;
  /** Corner rounding of each cell, 0 (square) to 0.5. */
  rounding: number;
  /** Space between cells as a share of a cell, 0 to 0.3. */
  gap: number;
  light: string;
  dark: string;
  /** Dot radius as a share of a cell. */
  dotSize: number;
  shape: 'circle' | 'diamond' | 'square';
  pattern: number[];
  rowShift: number;
  offset: number;
  lens: Lens | null;
}

const tone = (r: number, g: number, b: number, k: number): string => {
  // k > 0 lightens toward white, k < 0 darkens toward black.
  const t = Math.abs(k);
  const to = k > 0 ? 255 : 0;
  return `rgb(${Math.round(r + (to - r) * t)},${Math.round(g + (to - g) * t)},${Math.round(b + (to - b) * t)})`;
};

function addDot(p: Path2D, x: number, y: number, r: number, shape: DotSpec['shape']) {
  if (shape === 'circle') {
    p.moveTo(x + r, y);
    p.arc(x, y, r, 0, Math.PI * 2);
  } else if (shape === 'diamond') {
    p.moveTo(x, y - r * 1.25);
    p.lineTo(x + r * 1.25, y);
    p.lineTo(x, y + r * 1.25);
    p.lineTo(x - r * 1.25, y);
    p.closePath();
  } else p.rect(x - r, y - r, r * 2, r * 2);
}

export function drawDotGrid(ctx: CanvasRenderingContext2D, d: DotSpec): void {
  const s = d.w / d.cols;
  const inset = (d.gap * s) / 2;
  const rad = Math.max(0, (s - inset * 2) * d.rounding);
  const k = d.contrast;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, d.w, d.h);
  for (let j = 0; j < d.rows; j++) {
    for (let i = 0; i < d.cols; i++) {
      const o = (j * d.cols + i) * 4;
      const r = d.cells[o];
      const g = d.cells[o + 1];
      const b = d.cells[o + 2];
      const light = (i + j) & 1;
      const x = i * s;
      const y = j * s;
      // The cell's own darker tone fills the whole slot first, so the gap between rounded cells is never black.
      ctx.fillStyle = tone(r, g, b, -k * 0.8);
      ctx.fillRect(x, y, s + 0.5, s + 0.5);
      ctx.fillStyle = light ? tone(r, g, b, k) : tone(r, g, b, -k);
      if (rad > 0.5 && ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x + inset, y + inset, s - inset * 2, s - inset * 2, rad);
        ctx.fill();
      } else ctx.fillRect(x + inset, y + inset, s - inset * 2, s - inset * 2);
    }
  }
  const pl = new Path2D();
  const pd = new Path2D();
  const dr = Math.max(0.5, d.dotSize * s);
  const L = d.lens;
  const r2 = L ? L.r * L.r : 0;
  for (let j = 0; j <= d.rows; j++) {
    for (let i = 0; i <= d.cols; i++) {
      const x = i * s;
      const y = j * s;
      const inLens = L && (x - L.x) ** 2 + (y - L.y) ** 2 < r2;
      const v = inLens && L ? dotAt(i, j, L.pattern, L.rowShift, d.offset) : dotAt(i, j, d.pattern, d.rowShift, d.offset);
      addDot(v ? pd : pl, x, y, dr, d.shape);
    }
  }
  ctx.fillStyle = d.light;
  ctx.fill(pl);
  ctx.fillStyle = d.dark;
  ctx.fill(pd);
}

/**
 * File: src/components/chartstudy/charts/data.ts
 * Description: The one dataset every row of the Charts page draws, so the styles can be compared on identical values, and the
 * geometry that turns it into pixels (pure TypeScript). Three charts share a 340 x 200 canvas: a line chart of two series over
 * twelve months, a stacked bar chart of three series over six months, and a scatter of 24 points in three groups with a size.
 */
import { rand } from '../shared';

export const W = 340;
export const H = 200;
export const X0 = 14;
export const X1 = W - 14;
export const TOP = 16;
export const BASE = 182;

/* Line: two series, twelve months. */
export const LINE: number[][] = [
  [12, 18, 15, 24, 30, 26, 34, 41, 38, 47, 52, 58],
  [8, 10, 14, 13, 19, 24, 22, 28, 33, 31, 39, 44],
];
const LINE_MAX = 62;
export const lineX = (i: number) => X0 + (i * (X1 - X0)) / (LINE[0].length - 1);
export const lineY = (v: number) => BASE - (v / LINE_MAX) * (BASE - TOP);
export const linePoints = (series: number): [number, number][] => LINE[series].map((v, i) => [lineX(i), lineY(v)]);

/** A smooth path through the points (Catmull-Rom turned into cubic Beziers). */
export function smooth(pts: [number, number][]): string {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/** The area under a smooth path, closed along the baseline. */
export const areaPath = (pts: [number, number][]) => `${smooth(pts)} L${pts[pts.length - 1][0].toFixed(1)} ${BASE} L${pts[0][0].toFixed(1)} ${BASE} Z`;

/* Stacked bars: three series (0 is the bottom) over six months. */
export const STACK: number[][] = [
  [14, 10, 6],
  [18, 12, 9],
  [16, 15, 11],
  [22, 14, 13],
  [26, 19, 12],
  [30, 21, 16],
];
const STACK_MAX = 72;
export const BAR_W = 30;
const PITCH = (X1 - X0) / STACK.length;
export const barX = (col: number) => X0 + col * PITCH + (PITCH - BAR_W) / 2;
export const GAP = 2;

export interface Segment {
  col: number;
  /** Series index; 0 is the bottom of the stack. */
  k: number;
  x: number;
  y: number;
  w: number;
  h: number;
  top: boolean;
  bottom: boolean;
}

export const SEGMENTS: Segment[] = STACK.flatMap((col, c) => {
  let base = BASE;
  return col.map((v, k) => {
    const h = (v / STACK_MAX) * (BASE - TOP) - GAP;
    base -= h + GAP;
    return { col: c, k, x: barX(c), y: base + GAP, w: BAR_W, h, top: k === col.length - 1, bottom: k === 0 };
  });
});

/* Scatter: 24 points in three groups, each with a size. */
export interface Dot {
  x: number;
  y: number;
  size: number;
  group: number;
}

export const SCATTER: Dot[] = Array.from({ length: 24 }, (_, i) => {
  const group = i % 3;
  const t = rand(i, 11);
  const lift = [0.78, 0.55, 0.32][group];
  const y = Math.min(0.96, Math.max(0.06, lift * (0.35 + 0.65 * t) + (rand(i, 5) - 0.5) * 0.36));
  return {
    x: X0 + 18 + t * (X1 - X0 - 36),
    y: BASE - 14 - y * (BASE - TOP - 28),
    size: Math.round(14 + rand(i, 7) * 16),
    group,
  };
});

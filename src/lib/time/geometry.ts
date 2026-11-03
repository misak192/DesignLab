/**
 * File: src/lib/time/geometry.ts
 * Description: The small maths the /time designs share, pure TypeScript with no React: polar points and annulus sectors (angle 0 at
 * the top, clockwise), smooth curves through points (Catmull-Rom as cubic beziers), gaussian smoothing of an array, and a few
 * number helpers.
 */
export const TAU = Math.PI * 2;
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** One decimal, as a string: keeps paths short and identical on server and client. */
export const f = (n: number) => n.toFixed(1);

/** A point at radius r and angle a (radians; 0 is straight up, positive is clockwise). */
export function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}

/** The path of a ring segment between radii r0 and r1 and angles a0 to a1. A full turn is drawn as two halves. */
export function sector(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  if (a1 - a0 >= TAU - 1e-4) {
    const mid = a0 + Math.PI;
    return sector(cx, cy, r0, r1, a0, mid - 1e-3) + sector(cx, cy, r0, r1, mid, a0 + TAU - 1e-3);
  }
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r1, a0);
  const [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1);
  const [x3, y3] = polar(cx, cy, r0, a0);
  return `M${f(x0)} ${f(y0)}A${f(r1)} ${f(r1)} 0 ${large} 1 ${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}A${f(r0)} ${f(r0)} 0 ${large} 0 ${f(x3)} ${f(y3)}Z`;
}

/**
 * A smooth path through points. With `cont` the path continues an existing one (starts with L), otherwise it starts with M.
 */
export function smooth(pts: [number, number][], cont = false): string {
  if (pts.length === 0) return '';
  let d = `${cont ? 'L' : 'M'}${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/** Gaussian smoothing of an array (sigma in steps); edges are renormalised so nothing sags at the ends. */
export function gauss(a: number[], sigma: number): number[] {
  const rad = Math.ceil(sigma * 3);
  const k = Array.from({ length: rad * 2 + 1 }, (_, i) => Math.exp(-0.5 * ((i - rad) / sigma) ** 2));
  return a.map((_, i) => {
    let s = 0;
    let w = 0;
    for (let j = -rad; j <= rad; j++) {
      const v = a[i + j];
      if (v === undefined) continue;
      s += v * k[j + rad];
      w += k[j + rad];
    }
    return s / w;
  });
}

/** The index of the largest value. */
export const argmax = (a: number[]) => a.reduce((best, v, i) => (v > a[best] ? i : best), 0);

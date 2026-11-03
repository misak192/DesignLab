/**
 * File: src/components/time/kit.tsx
 * Description: What every /time design shares: the 480 x 320 drawing box, the time axis, the props a design receives, the text
 * (halo drawn as a canvas-coloured stroke behind the fill, since SVG text takes no text-shadow in every browser), and the pointer
 * maths for designs drawn as one path instead of thousands of elements.
 */
import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { Y0, Y1 } from '@/lib/time/data';
import type { ColourMode } from './colour';

export const W = 480;
export const H = 320;

export interface DesignProps {
  mode: ColourMode;
  /** False when MOTION is off: draw the resting look, no entries. */
  live: boolean;
  /** Set the line under the drawing. Elements may also carry a data-hint, which the cell reads on hover. */
  hint: (text: string | null) => void;
}

/** The time axis: a fractional year to x. The axis runs from the start of 1992 to the end of 2026. */
export const xT = (t: number, x0 = 14, x1 = 466) => x0 + ((t - Y0) / (Y1 + 1 - Y0)) * (x1 - x0);

export function Txt({
  x,
  y,
  size = 10,
  anchor = 'start',
  hi = false,
  fill,
  rotate,
  style,
  children,
}: {
  x: number;
  y: number;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
  hi?: boolean;
  fill?: string;
  rotate?: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      className="fw-tm-t"
      data-hi={hi}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      style={fill ? { fill, ...style } : style}
    >
      {children}
    </text>
  );
}

/** The pointer position in drawing units (0 to W, 0 to H), for any handler placed inside the svg. */
export function svgPoint(e: PointerEvent<SVGElement>): [number, number] {
  const svg = e.currentTarget.ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
  const r = svg.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * File: src/components/chartstudy/ElementBase.tsx
 * Description: The see-through body the squares and columns share: a gradient tint (lit at the top, clearer below), a
 * backdrop blur of 4 to 8px, and a soft glow of light around it. There is NO border, ring or edge line anywhere: shape
 * comes from the gradient alone. The element is never made see-through by lowering its opacity.
 */
import type { CSSProperties, ReactNode } from 'react';
import { bright, tint } from './shared';

export interface ElementBaseProps {
  hue: string;
  w: number;
  h: number;
  radius?: number | string;
  /** Alpha of the tint at its clearer end, 0.12 to 0.25; the lit end is twice that. */
  fill?: number;
  /** Backdrop blur in px (4 to 8). 0 draws no blur: for pieces inside a column that is blurred as a whole. */
  blur?: number;
  /** Outer glow, px of box-shadow in the palette. */
  glow?: number;
  /** Replaces the default gradient. */
  background?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** The default body: lit at the top, clearer toward the baseline. */
export const bodyGradient = (hue: string, fill: number) =>
  `linear-gradient(165deg, ${tint(bright(hue, 0.6), fill * 2)}, ${tint(hue, fill * 0.8)})`;

export default function ElementBase({ hue, w, h, radius = 3, fill = 0.18, blur = 6, glow = 0, background, className = '', style, children }: ElementBaseProps) {
  const backdrop = blur > 0 ? `blur(${blur}px)` : undefined;
  return (
    <div
      aria-hidden
      className={`fw-ce-el ${className}`}
      style={{
        width: w,
        height: h,
        borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
        background: background ?? bodyGradient(hue, fill),
        backdropFilter: backdrop,
        WebkitBackdropFilter: backdrop,
        boxShadow: glow > 0 ? `0 0 ${glow}px ${tint(hue, 0.3)}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

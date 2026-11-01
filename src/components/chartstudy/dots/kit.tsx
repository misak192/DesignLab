/**
 * File: src/components/chartstudy/dots/kit.tsx
 * Description: What every dot design is built from: the props it receives (the dot colour and its two RGB-shifted
 * cousins), a neutral for glass, and small style helpers for discs, centred layers and masks. Styles only, no filters.
 */
import type { CSSProperties, ReactNode } from 'react';

export interface DotProps {
  /** The dot colour. */
  c: string;
  /** The colour shifted one way in RGB: a lighter, bluer cousin. */
  hi: string;
  /** The colour shifted the other way: a deeper, greener cousin. */
  lo: string;
  /** The colour shifted twice as far the deep way: for hard shadows and the inner layers. */
  deep: string;
  /** Diameter of the dot's box in px. */
  s: number;
  /** Loops may run. False under reduced motion or MOTION off: the static look is drawn instead. */
  live: boolean;
}

/** The pale cool white that glass dots are made of. */
export const N = '#e8eef9';

/** A disc as one element. */
export const disc = (s: number, background: string, extra: CSSProperties = {}): CSSProperties => ({
  display: 'block',
  width: s,
  height: s,
  borderRadius: '50%',
  background,
  ...extra,
});

/** A disc centred in its relative parent. `x` and `y` move the centre, in % of the parent. */
export const at = (size: number, extra: CSSProperties = {}, x = 50, y = 50): CSSProperties => ({
  position: 'absolute',
  left: `${x}%`,
  top: `${y}%`,
  width: size,
  height: size,
  marginLeft: -size / 2,
  marginTop: -size / 2,
  borderRadius: '50%',
  ...extra,
});

/** A mask, in both spellings. Several images intersect (the mask of one cuts the other). */
export function mask(images: string | string[], extra: CSSProperties = {}): CSSProperties {
  const list = Array.isArray(images) ? images.join(', ') : images;
  const many = Array.isArray(images) && images.length > 1;
  return {
    maskImage: list,
    WebkitMaskImage: list,
    ...(many ? { maskComposite: 'intersect', WebkitMaskComposite: 'source-in' } : {}),
    ...extra,
  };
}

/** A relative box of exact size for a dot made of several layers. */
export function Wrap({ s, h, style, children }: { s: number; h?: number; style?: CSSProperties; children?: ReactNode }) {
  return (
    <span aria-hidden style={{ position: 'relative', display: 'block', width: s, height: h ?? s, ...style }}>
      {children}
    </span>
  );
}

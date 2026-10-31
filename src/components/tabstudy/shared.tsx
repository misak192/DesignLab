/**
 * File: src/components/tabstudy/shared.tsx
 * Description: Small pieces the effects share: the easing, the word wrapper, letter splitting, a copy of the word to use
 * as light, a one-shot timer and a size measure. Text colour stays opaque everywhere; light is a blurred copy of the
 * glyphs, never a box.
 */
"use client";
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Accent colours of the current skin. */
export const T1 = 'var(--t1)';
export const T2 = 'var(--t2)';
export const T3 = 'var(--t3)';

/** An opaque mix of INK over the canvas (never alpha): `ink(55)` is a calmer white. */
export const ink = (pct: number) => `color-mix(in srgb, var(--ink) ${pct}%, var(--canvas))`;
/** An opaque mix of two colours. */
export const mix = (a: string, b: string, pctOfA: number) => `color-mix(in srgb, ${a} ${pctOfA}%, ${b})`;

/** The word, in a box the effects can lay layers over. */
export function Word({
  label,
  className = '',
  style,
  innerRef,
  children,
}: {
  label: string;
  className?: string;
  style?: CSSProperties;
  innerRef?: (el: HTMLElement | null) => void;
  /** Layers that sit on or around the word. */
  children?: ReactNode;
}) {
  return (
    <span ref={innerRef} className={`relative isolate inline-block whitespace-nowrap ${className}`} style={style}>
      {label}
      {children}
    </span>
  );
}

/** A copy of the word laid exactly over it: for light, ghosts and slices. Hidden from assistive tech. */
export function Copy({ label, style, className = '' }: { label: string; style?: CSSProperties; className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute inset-0 whitespace-nowrap ${className}`} style={style}>
      {label}
    </span>
  );
}

/** Splits a word into letters; a space keeps its width. */
export const letters = (label: string) => Array.from(label).map((ch) => (ch === ' ' ? ' ' : ch));

/** True once `ms` have passed since mount. Mount an effect only while selected and this is "since it was selected". */
export function useAfter(ms: number): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setPast(true), ms);
    return () => window.clearTimeout(id);
  }, [ms]);
  return past;
}

/** The pixel size of an element, taken when it mounts (ref callback; no effect needed). */
export function useBox(): [(el: HTMLElement | null) => void, { w: number; h: number }] {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const ref = useCallback((el: HTMLElement | null) => {
    if (el) setSize({ w: el.offsetWidth, h: el.offsetHeight });
  }, []);
  return [ref, size];
}

/** A fixed series of small pseudo-random numbers (0..1) by index: deterministic, so server and client agree. */
export const seeded = (i: number, salt = 1) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

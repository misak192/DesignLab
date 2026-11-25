/**
 * File: src/components/brand/kit.tsx
 * Description: The shared pieces of the brand study. `Superscript` is the FW signature: a small letter (or number) raised at
 * the top right of a word, like a notification badge. `Cell` is one numbered option with its own Replay button; it starts
 * playing when it scrolls into view. `useCalm` is true when motion is off (the lab's OFF, or the device's reduced motion).
 */
"use client";
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { useMotion } from '@/components/display/DisplayProvider';

export const EASE = [0.22, 1, 0.36, 1] as const;

/** True when nothing should move: the lab's MOTION is OFF or the device asks for reduced motion. */
export function useCalm(): boolean {
  const m = useMotion();
  const reduced = useReducedMotion();
  return m.level === 'off' || !!reduced;
}

/** Text filled with a gradient (background-clip). No filter on it: a filter on clipped text drew ghost boxes in some browsers. */
export const gradText = (a: string, b: string, angle = 145): CSSProperties => ({
  backgroundImage: `linear-gradient(${angle}deg, ${a}, ${b})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  textShadow: 'none',
});

interface SuperscriptProps {
  children: ReactNode;
  /** CSS colour; default T1. */
  colour?: string;
  /** Size relative to the word (0.42 = 42%). */
  size?: number;
  /** How far the top of the raised letter sits above the cap height of the word, in em of the word (0 = aligned). */
  lift?: number;
  weight?: number;
  /** Left = isotope: the small letter sits at the top left. */
  side?: 'right' | 'left';
  className?: string;
  style?: CSSProperties;
  label?: string;
}

/**
 * The FW exponent. It does not change the line height (line-height 0) and sits so the top of its capitals lines up with
 * the top of the word's capitals, as a notification badge does. Port: in Compose this is a baselineShift of +0.55 with
 * fontSize 0.42em.
 */
export function Superscript({ children, colour = 'var(--fw-pink)', size = 0.42, lift = 0, weight, side = 'right', className = '', style, label }: SuperscriptProps) {
  const raise = (0.7 - 0.7 * size + lift) / size; // in the sup's own em
  return (
    <sup
      aria-label={label}
      className={className}
      style={{
        display: 'inline-block',
        fontSize: `${size}em`,
        lineHeight: 0,
        fontWeight: weight,
        color: colour,
        position: 'relative',
        top: `${-raise}em`,
        verticalAlign: 'baseline',
        [side === 'right' ? 'marginLeft' : 'marginRight']: '0.12em',
        ...style,
      }}
    >
      {children}
    </sup>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

interface CellProps {
  n: number;
  name: string;
  note?: string;
  /** The stage. Gets a counter that changes on Replay (use it as a key). */
  children: (k: number) => ReactNode;
  /** Hide the Replay button when there is nothing that moves. */
  still?: boolean;
  minH?: number;
  className?: string;
}

export function Cell({ n, name, note, children, still, minH = 190, className = '' }: CellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '120px' });
  const [k, setK] = useState(0);
  return (
    <div ref={ref} className={`flex flex-col gap-3 border-t border-ink/10 pt-4 ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="flex items-baseline gap-3">
          <span className="fw-kicker fw-tabular text-t1">{pad(n)}</span>
          <span className="fw-kicker text-ink">{name}</span>
        </p>
        {!still && (
          <button type="button" onClick={() => setK((x) => x + 1)} className="fw-kicker min-h-[48px] text-t1 transition-colors hover:text-ink" aria-label={`Replay ${n}`}>
            ↻ Replay
          </button>
        )}
      </div>
      <div className="flex items-center justify-center overflow-hidden" style={{ minHeight: minH }}>
        {seen ? children(k) : null}
      </div>
      {note && <p className="text-[0.875rem] font-light text-ink-2">{note}</p>}
    </div>
  );
}

/** A responsive grid for cells. */
export function CellGrid({ children, cols = 3 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={`grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 ${cols === 3 ? 'xl:grid-cols-3' : ''}`}>{children}</div>;
}

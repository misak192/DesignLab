/**
 * File: src/components/typography/Counted.tsx
 * Description: A word with its notification count raised at the top right, like an exponent. `variant` picks the design (see
 * src/lib/typography/counts.ts, `.fw-ct` in globals.css). The count has no box: it is type, a hairline, or light. 0 draws
 * nothing; the number remounts when it changes, so the arrival animation plays every time. `colour` is the data colour of the
 * thing the word names.
 */
"use client";
import { useState, type CSSProperties } from 'react';
import { countText, type CountVariant } from '@/lib/typography/counts';

interface CountedProps {
  label: string;
  count: number;
  variant: CountVariant;
  /** The data colour of the word's subject (a category colour). */
  colour?: string;
  className?: string;
}

export default function Counted({ label, count, variant, colour, className = '' }: CountedProps) {
  const text = countText(count);
  // Sparks fly only when the count has gone up since the last render (state adjusted during render, no effect).
  const [last, setLast] = useState(count);
  const [rising, setRising] = useState(false);
  if (count !== last) {
    setLast(count);
    setRising(count > last);
  }

  return (
    <span className={`fw-ct ${className}`} data-v={variant} data-zero={!text} style={colour ? ({ '--ct': colour } as CSSProperties) : undefined}>
      {variant === 'radical' && (
        <svg aria-hidden className="fw-ct__root" viewBox="0 0 10 30" preserveAspectRatio="none">
          <path d="M0.5 20 L2.6 18.6 L5.4 28.5 L9.6 0.8" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      <span className="fw-ct__word">{label}</span>
      {text && (
        <sup key={count} className="fw-ct__n" aria-label={`${count} new`}>
          {variant === 'roll' ? <span className="fw-ct__d">{text}</span> : text}
          {variant === 'sparks' && rising && [0, 1, 2, 3, 4].map((i) => <i key={i} className="fw-ct__sp" style={{ '--a': `${i * 72 - 40}deg` } as CSSProperties} />)}
        </sup>
      )}
    </span>
  );
}

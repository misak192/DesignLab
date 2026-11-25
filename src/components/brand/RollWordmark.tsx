/**
 * File: src/components/brand/RollWordmark.tsx
 * Description: Animation 1, "Tick → rolls out". The capital letter appears; a tick is DRAWN beside it, folds into an L and turns
 * upright, all as one smooth gesture (tickfold.ts `gesture`); then the rest of the name rolls out to the right of the capital
 * letter and, at the same time, "yst" rolls out to the right of the L. The whole word stays centred, so the capital letter is
 * pushed to the left as the word grows. The name is in the app gradient, Lyst (and the tick) in white. One clock; reduced
 * motion shows the end state. The mirror is an option.
 */
"use client";
import { useLayoutEffect, useRef, useState } from 'react';
import type { AppId, BrandApp } from '@/lib/brand/apps';
import { easeOutCubic, gesture } from '@/lib/brand/tickfold';
import { useCalm } from './kit';
import Mirrored from './Mirrored';
import { useBrandPalette } from './palette';
import { TickGlyph, useClock } from './TickMark';

export const SUP_SCALES = { small: 0.42, medium: 0.6, large: 0.8 } as const;
export type SupSize = keyof typeof SUP_SCALES;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** Timeline in ms. The gesture and the roll-out overlap, so nothing waits for anything. */
const LETTER = 280;
const GESTURE: [number, number] = [120, 1620];
const GROW: [number, number] = [1450, 2350];
export const ROLL_TOTAL = 2450;

/** Letters that roll out to the right of what is before them: the box opens, each letter turns up out of the flat. */
export function RollText({ text, p, first, n, app, flat }: { text: string; p: number; first: number; n: number; app: BrandApp; flat?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [nat, setNat] = useState(0);
  useLayoutEffect(() => {
    const measure = () => setNat(ref.current?.getBoundingClientRect().width ?? 0);
    measure();
    document.fonts?.ready.then(measure);
  }, [text]);
  const open = easeOutCubic(p);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span ref={ref} aria-hidden style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap' }}>
        {text}
      </span>
      <span style={{ display: 'inline-flex', width: nat ? nat * open : 0, overflow: 'hidden', whiteSpace: 'nowrap', paddingBlock: '0.15em', marginBlock: '-0.15em', perspective: 500 }}>
        {[...text].map((ch, i) => {
          const lp = easeOutCubic(clamp((p - i * 0.1) / 0.55));
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: lp,
                transform: `rotateX(${-90 * (1 - lp)}deg) translateY(${(1 - lp) * 0.4}em)`,
                transformOrigin: '50% 100%',
                color: flat ?? `color-mix(in srgb, ${app.colour2} ${Math.round(((first + i) / Math.max(1, n - 1)) * 100)}%, ${app.colour})`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </span>
    </span>
  );
}

export interface RollWordmarkProps {
  app: AppId | BrandApp;
  size?: number;
  sup?: SupSize;
  mirror?: boolean;
  /** Lean of the mirror, degrees. */
  mirrorAngle?: number;
  /** How far the mirror sits below the baseline, px. */
  mirrorGap?: number;
  /** Jost weight 200–500 (200 = thin). */
  weight?: number;
  /** Letter-spacing in em. */
  spacing?: number;
  /** Tick stroke width (default 8). */
  tickStroke?: number;
  /** Controlled time in ms (scrub); Infinity = end state. */
  t?: number;
}

export default function RollWordmark({ app, size = 104, sup = 'small', mirror = false, mirrorAngle = 0, mirrorGap = 0, weight = 500, spacing = 0, tickStroke = 8, t: controlled }: RollWordmarkProps) {
  const calm = useCalm();
  const { byId } = useBrandPalette();
  const a = typeof app === 'string' ? byId(app) : app;
  const clock = useClock(ROLL_TOTAL, calm || controlled !== undefined);
  const time = calm ? Infinity : (controlled ?? clock);

  const g = gesture(clamp((time - GESTURE[0]) / (GESTURE[1] - GESTURE[0])));
  const growP = clamp((time - GROW[0]) / (GROW[1] - GROW[0]));
  const letterO = clamp(time / LETTER);

  const rest = a.prefix.slice(1);
  const n = a.prefix.length + 4;
  const supSize = size * SUP_SCALES[sup];
  const raise = 0.7 * (size - supSize);
  const glyphH = 0.84 * supSize;

  return (
    <div role="img" aria-label={`${a.prefix}Lyst`}>
      <Mirrored show={mirror} size={size} angle={mirrorAngle} gap={mirrorGap} rowStyle={{ fontSize: size, fontWeight: weight, letterSpacing: spacing ? `${spacing}em` : undefined, lineHeight: 1, whiteSpace: 'nowrap', paddingTop: raise * 0.2 }}>
        <span style={{ display: 'inline-block', opacity: easeOutCubic(letterO), color: a.colour }}>{a.prefix[0]}</span>
        <RollText text={rest} p={growP} first={1} n={n} app={a} />
        <span style={{ display: 'inline-flex', alignItems: 'baseline', position: 'relative', top: -raise, fontSize: supSize, marginLeft: supSize * 0.06 }}>
          <span style={{ display: 'inline-block', marginInline: `${-0.22 * glyphH}px ${-0.04 * glyphH}px` }}>
            <TickGlyph k={g.k} rot={g.rot} colour={a.colour} colour2={a.colour2} flat="var(--ink)" stroke={tickStroke} height={`${glyphH}px`} verticalAlign="-0.08em" draw={g.draw} style={{ opacity: g.draw > 0 ? 1 : 0 }} />
          </span>
          <RollText text="yst" p={growP} first={0} n={1} app={a} flat="var(--ink)" />
        </span>
      </Mirrored>
    </div>
  );
}

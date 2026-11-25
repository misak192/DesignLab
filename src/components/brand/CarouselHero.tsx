/**
 * File: src/components/brand/CarouselHero.tsx
 * Description: Animation 2, "Carousel". "Lyst" (the white L and "yst") rolls up into its place at the top right while the app
 * names carousel through the slot on its left (two full passes over every app, so each name is readable), slowing to a stop on
 * the current app. Lyst is static while the carousel spins; that is what makes the carousel work. The slot never resizes, so nothing moves at the end:
 * the landed name sits right-aligned against Lyst. One clock; the drawing is a pure function of time (reel.ts). Reduced motion shows the end state.
 */
"use client";
import type { AppId } from '@/lib/brand/apps';
import { REEL_VARIANTS } from '@/lib/brand/reel';
import { easeOutCubic } from '@/lib/brand/tickfold';
import BrandReel from './BrandReel';
import { useCalm } from './kit';
import Mirrored from './Mirrored';
import { useBrandPalette } from './palette';
import { SUP_SCALES, type SupSize } from './RollWordmark';
import { TickGlyph, useClock } from './TickMark';
import { TICK } from '@/lib/brand/tickfold';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const REEL_END = 3300;
export const CAROUSEL_TOTAL = 3400;

export interface CarouselHeroProps {
  app: AppId;
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
  t?: number;
}

export default function CarouselHero({ app, size = 104, sup = 'small', mirror = false, mirrorAngle = 0, mirrorGap = 0, weight = 500, spacing = 0, tickStroke = 8, t: controlled }: CarouselHeroProps) {
  const calm = useCalm();
  const { byId } = useBrandPalette();
  const a = byId(app);
  const clock = useClock(CAROUSEL_TOTAL, calm || controlled !== undefined);
  const time = calm ? Infinity : (controlled ?? clock);

  const supSize = size * SUP_SCALES[sup];
  const raise = 0.7 * (size - supSize);
  const glyphH = 0.84 * supSize;
  // Lyst rolls up: each character rises out of the baseline, one after another, in the first 0.9 s.
  const rise = (i: number) => easeOutCubic(clamp((time - i * 90) / 560));

  const lyst = (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', position: 'relative', top: -raise, fontSize: supSize, marginLeft: supSize * 0.06, color: 'var(--ink)' }}>
      <span style={{ display: 'inline-block', opacity: rise(0), transform: `translateY(${(1 - rise(0)) * 0.9 * supSize}px)`, marginInline: `${-0.22 * glyphH}px ${-0.04 * glyphH}px` }}>
        <TickGlyph k={-1} rot={TICK.uprightDeg} colour={a.colour} colour2={a.colour2} flat="var(--ink)" stroke={tickStroke} height={`${glyphH}px`} verticalAlign="-0.08em" />
      </span>
      {[...'yst'].map((c, i) => (
        <span key={i} style={{ display: 'inline-block', opacity: rise(i + 1), transform: `translateY(${(1 - rise(i + 1)) * 0.9}em)` }}>
          {c}
        </span>
      ))}
    </span>
  );

  return (
    <div role="img" aria-label={`${a.prefix}Lyst`}>
      <Mirrored show={mirror} size={size} angle={mirrorAngle} gap={mirrorGap} rowStyle={{}}>
        <BrandReel app={app} variant={REEL_VARIANTS[3]} p={clamp(time / REEL_END)} size={`${size}px`} weight={weight} spacing={spacing} lyst={lyst} />
      </Mirrored>
    </div>
  );
}

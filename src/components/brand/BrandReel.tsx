/**
 * File: src/components/brand/BrandReel.tsx
 * Description: The app reel: the prefixes (Action, Observa, Lore, Chrono) spin right-aligned against a fixed "Lyst", slow
 * down with an overshoot and land on the current app. 2 to 2.5 s; tap (or Enter) to skip straight to the end. One progress
 * number p (0 to 1) drives everything; the drawing is a pure function of p (src/lib/brand/reel.ts), which is what gets
 * ported to Compose. With reduced motion or MOTION off it shows the landed app at once.
 */
"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { animate, type AnimationPlaybackControls } from 'framer-motion';
import { APP_DEFS, type AppId, type BrandApp } from '@/lib/brand/apps';
import { LINE, REEL_VARIANTS, odometerColumn, reelLayers, reelPos, reelWords, scrambleText, type ReelVariant } from '@/lib/brand/reel';
import { useCalm } from './kit';
import { useBrandPalette } from './palette';

export interface BrandReelProps {
  app: AppId;
  variant?: ReelVariant;
  /** Seconds, 2 to 2.5. */
  duration?: number;
  /** CSS font size of the whole line. */
  size?: string;
  /** Change it to play again. */
  playKey?: number;
  onDone?: () => void;
  /** Vibrate a little on every row (Android web view). */
  haptics?: boolean;
  /** Replaces the fixed "Lyst" (the reel hand-off puts the tipping L there). */
  lyst?: ReactNode;
  /** Controlled progress 0..1 (the hero drives the reel from its own clock). Omit to play on its own. */
  p?: number;
  /** Jost weight (200–500) and letter-spacing in em. */
  weight?: number;
  spacing?: number;
  /** Shrink the window to the landed name at the very end, so the name and what follows it sit together. */
  settle?: boolean;
}

export default function BrandReel(props: BrandReelProps) {
  const v = props.variant ?? REEL_VARIANTS[0];
  return <ReelInner key={`${props.playKey ?? 0}-${props.app}-${v.id}-${props.duration ?? 2.2}`} {...props} variant={v} />;
}

function ReelInner({ app, variant, duration = 2.2, size = '56px', onDone, haptics, lyst, p: controlled, settle, weight = 500, spacing = 0 }: BrandReelProps & { variant: ReelVariant }) {
  const calm = useCalm();
  const [p, setP] = useState(0);
  const ctl = useRef<AnimationPlaybackControls | null>(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    if (calm || controlled !== undefined) {
      doneRef.current?.();
      return;
    }
    const c = animate(0, 1, { duration, ease: 'linear', onUpdate: setP, onComplete: () => doneRef.current?.() });
    ctl.current = c;
    return () => c.stop();
  }, [calm, duration, controlled]);

  const pr = calm ? 1 : (controlled ?? p);
  const words = reelWords(app);
  const pos = reelPos(variant, pr);
  const { apps, byId } = useBrandPalette();
  const target = byId(app);
  const appOf = (word: string): BrandApp => apps.find((a) => a.prefix === word) ?? target;

  // Haptic tick when a new row passes the window.
  const row = Math.round(pos);
  const lastRow = useRef(row);
  useEffect(() => {
    if (lastRow.current !== row && pr < 1 && (haptics || variant.tick) && typeof navigator !== 'undefined') navigator.vibrate?.(6);
    lastRow.current = row;
  }, [row, pr, haptics, variant.tick]);

  const skip = () => ctl.current?.complete();
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      skip();
    }
  };

  /** The word as real text, one solid colour per letter along the app gradient (no clipped background, no filter). */
  const paint = (word: string): ReactNode => {
    if (variant.colour === 'ink') return word;
    const w = variant.colour === 'gradient' ? target : appOf(word);
    const n = Math.max(1, word.length - 1);
    return [...word].map((c, i) => (
      <span key={i} style={{ color: `color-mix(in srgb, ${w.colour2} ${Math.round((i / n) * 100)}%, ${w.colour})` }}>
        {c}
      </span>
    ));
  };

  // Settle: measure the widest name and the landed one, then shrink the window from one to the other at the end.
  const gridRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);
  const [w, setW] = useState({ max: 0, tgt: 0 });
  useLayoutEffect(() => {
    if (!settle) return;
    const measure = () => {
      const g = gridRef.current;
      const t = targetRef.current;
      if (!g || !t) return;
      let max = 0;
      g.querySelectorAll<HTMLElement>('[data-sizer]').forEach((e) => (max = Math.max(max, e.getBoundingClientRect().width)));
      setW({ max, tgt: t.getBoundingClientRect().width });
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [settle, app, size]);
  const settleP = 1 - Math.pow(1 - Math.max(0, Math.min(1, (pr - 0.88) / 0.12)), 3);
  const gridWidth = settle && w.max > 0 ? w.max + (w.tgt - w.max) * settleP : undefined;

  const clip = variant.kind === 'strip' || variant.kind === 'odometer';
  const maskCss = clip && variant.mask ? 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)' : undefined;
  const drum = variant.kind === 'drum';
  const R = (LINE / 2) / Math.tan(Math.PI / 12); // radius for 30 degree rows, in em

  const cell: CSSProperties = { gridArea: '1 / 1', justifySelf: 'end', whiteSpace: 'nowrap', lineHeight: `${LINE}em` };

  let layers: ReactNode;
  if (variant.kind === 'scramble') {
    const word = target.prefix;
    layers = (
      <span style={cell}>
        {scrambleText(word, pr).map((c, i) => (
          <span key={i} style={{ color: c.solid ? appOf(word).colour : 'var(--ink-3)', opacity: c.solid ? 1 : 0.8 }}>
            {c.ch}
          </span>
        ))}
      </span>
    );
  } else if (variant.kind === 'odometer') {
    const word = target.prefix;
    layers = (
      <span style={{ ...cell, display: 'inline-flex', height: `${LINE}em`, overflow: 'hidden' }}>
        {[...word].map((_, c) => {
          const col = odometerColumn(word, c, pr, variant);
          return (
            <span key={c} style={{ display: 'block', height: `${LINE}em`, overflow: 'hidden' }}>
              <span style={{ display: 'block', transform: `translateY(${-col.pos * LINE}em)` }}>
                {col.chars.map((ch, k) => (
                  <span key={k} style={{ display: 'block', height: `${LINE}em`, lineHeight: `${LINE}em`, color: appOf(word).colour }}>
                    {ch}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    );
  } else {
    layers = reelLayers(variant, words, pos, pr).map((l) => (
      <span
        key={l.key}
        aria-hidden
        style={{
          ...cell,
          color: variant.colour === 'ink' ? 'var(--ink)' : undefined,
          opacity: l.opacity,
          filter: l.blur > 0.2 ? `blur(${l.blur.toFixed(1)}px)` : undefined,
          transform: drum
            ? `translateZ(${-R}em) rotateX(${l.rx}deg) translateZ(${R}em)`
            : variant.kind === 'flip'
              ? `rotateX(${l.rx}deg)`
              : `translateY(${l.y * LINE}em) scale(${l.scale}) rotateX(${l.rx}deg)`,
          backfaceVisibility: drum ? 'hidden' : undefined,
        }}
      >
        {paint(l.text)}
      </span>
    ));
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`${target.prefix}Lyst. Tap to skip the animation.`}
      onClick={skip}
      onKeyDown={onKey}
      className="inline-flex cursor-pointer items-baseline whitespace-nowrap outline-none"
      style={{ fontSize: size, fontWeight: weight, letterSpacing: spacing ? `${spacing}em` : undefined, lineHeight: `${LINE}em`, gap: '0.02em' }}
    >
      <span
        ref={gridRef}
        style={{
          width: gridWidth,
          gridTemplateColumns: gridWidth !== undefined ? 'minmax(0, 1fr)' : undefined,
          display: 'inline-grid',
          overflow: clip ? 'hidden' : 'visible',
          WebkitMaskImage: maskCss,
          maskImage: maskCss,
          perspective: drum || variant.kind === 'flip' ? '14em' : undefined,
          transformStyle: drum ? 'preserve-3d' : undefined,
        }}
      >
        {APP_DEFS.map((a) => (
          <span key={a.id} data-sizer ref={a.id === app ? targetRef : undefined} aria-hidden style={{ ...cell, visibility: 'hidden' }}>
            {a.prefix}
          </span>
        ))}
        {layers}
      </span>
      {lyst ?? <span style={{ color: 'var(--ink)' }}>Lyst</span>}
    </span>
  );
}

/**
 * File: src/components/master/kit.tsx
 * Description: What the Lab Master samples are built from. A sliced word (cut in strips that slide apart and join), a mirrored word (its
 * reflection underneath), a Swap (a changing number or word that enters and leaves in the way of the style), an arriving word, and a
 * thin lens-shaped line (the designs Michal liked on the Lines page). Everything follows MOTION: OFF draws the end state, no movement.
 */
"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion';
import { palette } from '@/components/chartstudy/dots/DotStudy';
import { useDisplay, useMotion } from '@/components/display/DisplayProvider';
import { LINE_DESIGNS } from '@/components/lines';
import type { MotionStyle } from '@/lib/display/settings';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Seconds scaled by the MOTION amount (0 when off). */
export function useDur(seconds: number) {
  return seconds * useMotion().scale;
}

/** The skin's accent (T1) as a hex string, resolved from CSS (it can be a colour mix). Re-read when the skin or the light changes. */
export function useAccent(): string {
  const { settings } = useDisplay();
  const [hex, setHex] = useState('#00f2fe');
  useEffect(() => {
    const probe = document.createElement('canvas');
    probe.width = probe.height = 1;
    const c = probe.getContext('2d', { willReadFrequently: true });
    if (!c) return;
    const raf = requestAnimationFrame(() => {
      const css = getComputedStyle(document.body).getPropertyValue('--t1').trim() || '#00f2fe';
      c.clearRect(0, 0, 1, 1);
      c.fillStyle = '#000';
      c.fillStyle = css;
      c.fillRect(0, 0, 1, 1);
      const d = c.getImageData(0, 0, 1, 1).data;
      setHex(`#${[d[0], d[1], d[2]].map((n) => n.toString(16).padStart(2, '0')).join('')}`);
    });
    return () => cancelAnimationFrame(raf);
  }, [settings.skin, settings.light]);
  return hex;
}

/** True for `ms` after `fire()`: the length of a button's answer to a press. */
export function usePress(ms = 1100): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const fire = useCallback(() => {
    setOn(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOn(false), ms);
  }, [ms]);
  return [on, fire];
}

/* ---- sliced: the thing is drawn three times, each copy showing one strip, and the strips slide against each other ---- */

const OFFSETS = [-1, 1, -0.55];

export function Sliced({ children, sliced, amp = 4, strips = 3, className = '', style }: { children: ReactNode; sliced: boolean; amp?: number; strips?: number; className?: string; style?: CSSProperties }) {
  const dur = useDur(0.55);
  return (
    <span className={`relative inline-block ${className}`} style={style}>
      <span aria-hidden style={{ visibility: 'hidden' }}>
        {children}
      </span>
      {Array.from({ length: strips }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath: `inset(${(i * 100) / strips}% 0 ${100 - ((i + 1) * 100) / strips}% 0)`,
            transform: `translateX(${sliced ? OFFSETS[i % 3] * amp : 0}px)`,
            transition: `transform ${dur}s var(--ease)`,
          }}
        >
          {children}
        </span>
      ))}
    </span>
  );
}

/* ---- mirrored: the word, and its reflection fading away underneath. Nothing between them. ---- */

export function Mirrored({ children, on, className = '' }: { children: ReactNode; on: boolean; className?: string }) {
  const dur = useDur(0.6);
  const fade = 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 78%)';
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-full select-none whitespace-nowrap"
        style={{ marginTop: '-0.12em', transform: 'scaleY(-1)', opacity: on ? 1 : 0, transition: `opacity ${dur}s var(--ease)`, WebkitMaskImage: fade, maskImage: fade }}
      >
        {children}
      </span>
    </span>
  );
}

/* ---- Swap: a value that changes. The old one leaves and the new one arrives, in the way of the style ---- */

const SWAP: Record<Exclude<MotionStyle, 'slice'>, { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }> = {
  plain: { initial: { opacity: 0, y: 9 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -9 } },
  kinetic: { initial: { y: '105%', opacity: 0 }, animate: { y: '0%', opacity: 1 }, exit: { y: '-105%', opacity: 0 } },
  stars: { initial: { opacity: 0, scale: 0.6, filter: 'blur(7px)' }, animate: { opacity: 1, scale: 1, filter: 'blur(0px)' }, exit: { opacity: 0, scale: 1.45, filter: 'blur(9px)' } },
  zoom: { initial: { opacity: 0, scale: 2.8, filter: 'blur(8px)' }, animate: { opacity: 1, scale: 1, filter: 'blur(0px)' }, exit: { opacity: 0, scale: 0.35, filter: 'blur(4px)' } },
};

const SLICE_X = [-26, 26, -16];

export function Swap({ value, mode, className = '' }: { value: string | number; mode: MotionStyle; className?: string }) {
  const d = useDur(0.42);
  const text = String(value);
  const t = { duration: d, ease: EASE };

  if (mode === 'slice') {
    return (
      <span className={`relative inline-flex whitespace-nowrap ${className}`}>
        <AnimatePresence mode="popLayout" initial>
          <motion.span key={text} className="relative inline-block">
            <span aria-hidden style={{ visibility: 'hidden' }}>
              {text}
            </span>
            {SLICE_X.map((x, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute inset-0"
                style={{ clipPath: `inset(${(i * 100) / 3}% 0 ${100 - ((i + 1) * 100) / 3}% 0)` }}
                initial={{ x, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -x, opacity: 0 }}
                transition={t}
              >
                {text}
              </motion.span>
            ))}
            <span className="sr-only">{text}</span>
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }

  const v = SWAP[mode];
  return (
    <span className={`relative inline-flex whitespace-nowrap ${mode === 'kinetic' ? 'overflow-hidden' : ''} ${className}`}>
      <AnimatePresence mode="popLayout" initial>
        <motion.span key={text} className="inline-block" initial={v.initial} animate={v.animate} exit={v.exit} transition={t}>
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** A word that arrives: kinetic letters rise in turn, every other style by its Swap. Remount (a new key) to play it again. */
export function ArriveWord({ text, mode }: { text: string; mode: MotionStyle }) {
  const d = useDur(0.55);
  if (mode !== 'kinetic') return <Swap value={text} mode={mode} />;
  return (
    <span className="inline-flex whitespace-nowrap">
      {Array.from(text).map((ch, i) => (
        <motion.span key={i} className="inline-block" initial={{ y: '0.7em', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: d, delay: i * 0.045 * (d ? 1 : 0), ease: EASE }}>
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </span>
  );
}

/* ---- the line of the style: thin, and lens-shaped at both ends ---- */

/** The Lines page designs Michal liked, one per style: Mist, Ember fade, Hologram, Star dust with Drift, Smoke. */
const LINE: Record<MotionStyle, string[]> = { plain: ['S02'], kinetic: ['S04'], slice: ['N06'], stars: ['T01', 'T03'], zoom: ['D03'] };
export const LINE_NAME: Record<MotionStyle, string> = { plain: 'Mist', kinetic: 'Ember fade', slice: 'Hologram', stars: 'Star dust and Drift', zoom: 'Smoke' };

/** A lens: as thick as `h` px in the middle and nothing at the ends. */
const lens = (h: number) => {
  const pts = Array.from({ length: 21 }, (_, i) => (i - 10) / 10);
  const top = pts.map((u) => `${((u + 1) * 50).toFixed(1)}% calc(50% - ${(h * (1 - u * u)).toFixed(2)}px)`);
  const bottom = [...pts].reverse().map((u) => `${((u + 1) * 50).toFixed(1)}% calc(50% + ${(h * (1 - u * u)).toFixed(2)}px)`);
  return `polygon(${[...top, ...bottom].join(', ')})`;
};
const ENDS = 'linear-gradient(90deg, transparent 0%, #000 24%, #000 76%, transparent 100%)';

export function LabLine({ mode, len = 300, box = 18 }: { mode: MotionStyle; len?: number; box?: number }) {
  const accent = useAccent();
  const m = useMotion();
  const base = { ...palette(accent, 48), live: m.scale > 0, t: 2, box, seed: 5 };
  const soft: CSSProperties = mode === 'plain' ? { WebkitMaskImage: ENDS, maskImage: ENDS } : {};
  return (
    <span aria-hidden className="relative block max-w-full" style={{ width: len, height: box, clipPath: lens(box * 0.3), ...soft }}>
      {LINE[mode].map((id) => {
        const Design = LINE_DESIGNS[id];
        return (
          <span key={id} className="absolute inset-0 block">
            <Design {...base} o="h" len={len} />
          </span>
        );
      })}
    </span>
  );
}

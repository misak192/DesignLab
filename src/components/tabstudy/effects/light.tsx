/**
 * File: src/components/tabstudy/effects/light.tsx
 * Description: Options 13 to 18: the selected tab is shown by light. Glow is a blurred copy of the glyphs laid behind the
 * word, a halo is a radial gradient that fades to nothing; neither has an edge. Transform and opacity only.
 */
"use client";
import { motion } from 'framer-motion';
import type { EffectProps } from '../types';
import { EASE, T1, Word } from '../shared';

const glowClass = 'pointer-events-none absolute inset-0 -z-10 whitespace-nowrap';

/* 13 · a 12px glow of the accent, breathing */
export function SoftGlow({ label, selected }: EffectProps) {
  return (
    <Word label={label}>
      {/* ── EFFECT: glow (removable) ── */}
      <motion.span
        aria-hidden
        className={glowClass}
        style={{ color: T1, filter: 'blur(6px)' }}
        initial={{ opacity: 0 }}
        animate={selected ? { opacity: [0.4, 0.95, 0.4] } : { opacity: 0 }}
        transition={selected ? { duration: 3.2, ease: 'easeInOut', repeat: Infinity } : { duration: 0.3 }}
      >
        {label}
      </motion.span>
    </Word>
  );
}

/* 14 · the glow stutters on like a neon tube, then holds steady */
const FLICKER = [0, 1, 0.15, 0.9, 0, 1, 0.35, 1, 0.75, 1];
const FLICKER_TIMES = [0, 0.08, 0.16, 0.26, 0.34, 0.5, 0.58, 0.72, 0.82, 1];
export function NeonFlicker({ label, selected }: EffectProps) {
  return (
    <motion.span
      key={selected ? 'on' : 'off'}
      className="inline-block"
      initial={selected ? { opacity: 0.3 } : false}
      animate={selected ? { opacity: FLICKER.map((o) => 0.3 + o * 0.7) } : { opacity: 1 }}
      transition={{ duration: 1.1, times: FLICKER_TIMES, ease: 'linear' }}
    >
      <Word label={label}>
        {/* ── EFFECT: neon tube (removable) ── */}
        {selected && (
          <motion.span
            aria-hidden
            className={glowClass}
            style={{ color: T1, filter: 'blur(5px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: FLICKER }}
            transition={{ duration: 1.1, times: FLICKER_TIMES, ease: 'linear' }}
          >
            {label}
          </motion.span>
        )}
      </Word>
    </motion.span>
  );
}

/* 15 · a faint elliptical light sits behind the word */
export function Halo({ label, selected }: EffectProps) {
  return (
    <Word label={label}>
      {/* ── EFFECT: halo (removable) ── */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -inset-y-3 -z-10 block"
        style={{ background: `radial-gradient(closest-side, ${T1}, transparent)`, filter: 'blur(3px)' }}
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={{ opacity: selected ? 0.4 : 0, scaleX: selected ? 1 : 0.6 }}
        transition={{ duration: 0.6, ease: EASE }}
      />
    </Word>
  );
}

/* 16 · a bright band passes across the word once */
export function LightSweep({ label, selected }: EffectProps) {
  return (
    <Word label={label}>
      {/* ── EFFECT: sweep (removable) ── */}
      {selected && (
        <motion.span
          aria-hidden
          key="sweep"
          className="pointer-events-none absolute inset-0 whitespace-nowrap"
          style={{ color: T1, textShadow: `0 0 8px ${T1}` }}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: ['inset(0 100% 0 0)', 'inset(0 42% 0 42%)', 'inset(0 0% 0 100%)'] }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          {label}
        </motion.span>
      )}
    </Word>
  );
}

/* 17 · a small star-shaped flare at the left edge of the word */
export function LensFlare({ label, selected }: EffectProps) {
  return (
    <Word label={label}>
      {/* ── EFFECT: flare (removable) ── */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -left-3 top-1/2 block size-0"
        initial={{ scale: 0, rotate: 0, opacity: 0 }}
        animate={selected ? { scale: [0, 1.25, 1], rotate: 90, opacity: 1 } : { scale: 0, rotate: 0, opacity: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <span className="absolute -left-3 -top-px block h-px w-6" style={{ background: 'linear-gradient(90deg, transparent, var(--ink), transparent)' }} />
        <span className="absolute -top-3 -left-px block h-6 w-px" style={{ background: 'linear-gradient(180deg, transparent, var(--ink), transparent)' }} />
        <span className="absolute -left-[2px] -top-[2px] block size-[4px] rounded-full" style={{ background: T1, boxShadow: `0 0 7px ${T1}` }} />
      </motion.span>
    </Word>
  );
}

/* 18 · the selected tab stays lit, the others drop to 20% (set by `rest` in the option; no extra layer here) */
export function DimNeighbours({ label }: EffectProps) {
  return <Word label={label} />;
}

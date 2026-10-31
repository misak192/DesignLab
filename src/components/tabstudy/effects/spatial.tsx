/**
 * File: src/components/tabstudy/effects/spatial.tsx
 * Description: Options 35 and 36: the selected tab leaves the plane. A lift toward the viewer with a soft shadow beneath,
 * and fine dust that drifts off the letters. Eight dots at most; no canvas.
 */
"use client";
import { motion } from 'framer-motion';
import type { EffectProps } from '../types';
import { EASE, T1, Word, seeded } from '../shared';

/* 35 · the word moves toward you: larger, with a soft shadow falling below it */
export function DepthLift({ label, selected }: EffectProps) {
  return (
    <motion.span
      className="inline-block"
      animate={{ scale: selected ? 1.12 : 1, y: selected ? -2 : 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <Word label={label}>
        {/* ── EFFECT: soft shadow (removable) ── */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 whitespace-nowrap"
          style={{ color: '#000', filter: 'blur(4px)' }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: selected ? 0.6 : 0, y: selected ? 9 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {label}
        </motion.span>
      </Word>
    </motion.span>
  );
}

/* 36 · eight fine particles drift off the word and fade, again and again while it is selected */
const DUST = Array.from({ length: 8 }, (_, i) => ({
  // Rounded, so the server's markup and the client's agree to the last digit.
  left: `${(6 + i * 12 + seeded(i, 2) * 6).toFixed(1)}%`,
  top: `${(20 + seeded(i, 5) * 60).toFixed(1)}%`,
  dx: Math.round(8 + seeded(i, 7) * 18),
  dy: -Math.round(10 + seeded(i, 11) * 16),
  dur: Math.round((1.6 + seeded(i, 13) * 0.9) * 10) / 10,
  delay: Math.round(seeded(i, 17) * 11) / 10,
}));
export function DustDissolve({ label, selected }: EffectProps) {
  return (
    <Word label={label}>
      {/* ── EFFECT: dust (removable) ── */}
      {selected &&
        DUST.map((d, i) => (
          <motion.span
            aria-hidden
            key={i}
            className="pointer-events-none absolute block size-[2px] rounded-full"
            style={{ left: d.left, top: d.top, background: T1 }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
            animate={{ x: d.dx, y: d.dy, opacity: [0, 0.95, 0], scale: 0.4 }}
            transition={{ duration: d.dur, delay: d.delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.7 }}
          />
        ))}
    </Word>
  );
}

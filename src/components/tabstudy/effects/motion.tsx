/**
 * File: src/components/tabstudy/effects/motion.tsx
 * Description: Options 01 to 06: the selected tab is shown by movement. A hairline that draws or glides, a tab that
 * floats, slides, orbits or drops. Transform and opacity only.
 */
"use client";
import { motion } from 'framer-motion';
import type { EffectProps } from '../types';
import { EASE, T1, Word, useBox } from '../shared';

/* 01 · a thin line draws left to right under the selected tab */
export function UnderlineDraw({ label, selected }: EffectProps) {
  return (
    <Word label={label}>
      {/* ── EFFECT: underline (removable) ── */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-1 block h-px"
        style={{ background: T1, originX: selected ? 0 : 1 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: selected ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      />
    </Word>
  );
}

/* 02 · one shared line glides between the tabs on a spring */
export function UnderlineSlide({ label, selected, scope }: EffectProps) {
  return (
    <Word label={label}>
      {/* ── EFFECT: gliding line (removable) ── */}
      {selected && (
        <motion.span
          aria-hidden
          layoutId={`${scope}-line`}
          className="pointer-events-none absolute inset-x-0 -bottom-1 block h-px"
          style={{ background: T1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
    </Word>
  );
}

/* 03 · the selected tab rises 6px and drifts on a slow sine path */
export function Float({ label, selected }: EffectProps) {
  return (
    <motion.span
      className="inline-block whitespace-nowrap"
      animate={selected ? { y: [null, -6, -9, -6, -3, -6] } : { y: 0 }}
      transition={selected ? { duration: 5, ease: 'easeInOut', repeat: Infinity, times: [0, 0.1, 0.35, 0.6, 0.85, 1] } : { duration: 0.4, ease: EASE }}
    >
      {label}
    </motion.span>
  );
}

/* 04 · the label enters from the left with a 12px travel */
export function SlideIn({ label, selected }: EffectProps) {
  return (
    <motion.span
      key={selected ? 'on' : 'off'}
      className="inline-block whitespace-nowrap"
      initial={selected ? { x: -12, opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {label}
    </motion.span>
  );
}

/* 05 · a small dot circles the label once, then rests below it */
const STEPS = 24;
export function OrbitDot({ label, selected }: EffectProps) {
  const [ref, { w, h }] = useBox();
  const rx = w / 2 + 9;
  const ry = h / 2 + 7;
  // Start at the bottom, go once round, end at the bottom: that is where it rests.
  const pts = Array.from({ length: STEPS + 1 }, (_, i) => {
    const a = Math.PI / 2 + (i / STEPS) * Math.PI * 2;
    return { x: w / 2 + rx * Math.cos(a) - 2, y: h / 2 + ry * Math.sin(a) - 2 };
  });
  return (
    <Word label={label} innerRef={ref}>
      {/* ── EFFECT: orbit dot (removable) ── */}
      {selected && w > 0 && (
        <motion.span
          aria-hidden
          key="dot"
          className="pointer-events-none absolute left-0 top-0 block size-1 rounded-full"
          style={{ background: T1, boxShadow: `0 0 6px ${T1}` }}
          initial={{ x: pts[0].x, y: pts[0].y, opacity: 0 }}
          animate={{ x: pts.map((p) => p.x), y: pts.map((p) => p.y), opacity: 1 }}
          transition={{
            x: { duration: 1.1, ease: 'linear' },
            y: { duration: 1.1, ease: 'linear' },
            opacity: { duration: 0.2 },
          }}
        />
      )}
    </Word>
  );
}

/* 06 · the label drops 10px and settles with an elastic bounce */
export function DropBounce({ label, selected }: EffectProps) {
  return (
    <motion.span
      key={selected ? 'on' : 'off'}
      className="inline-block whitespace-nowrap"
      initial={selected ? { y: -10, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ y: { type: 'spring', stiffness: 520, damping: 9, mass: 0.8 }, opacity: { duration: 0.15 } }}
    >
      {label}
    </motion.span>
  );
}

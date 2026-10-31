/**
 * File: src/components/tabstudy/effects/idle.tsx
 * Description: Options 31 to 34: the selected tab keeps living after it is chosen. Scale, brightness, drift and a
 * heartbeat, all on slow loops. Brightness is a CSS keyframe between two opaque mixes of INK (no alpha on text).
 */
"use client";
import { motion } from 'framer-motion';
import type { EffectProps } from '../types';
import { EASE, Word } from '../shared';

const base = 'inline-block whitespace-nowrap';
const back = { duration: 0.4, ease: EASE };

/* 31 · the word scales between 1.00 and 1.03 on a 4s cycle */
export function BreathingScale({ label, selected }: EffectProps) {
  return (
    <motion.span
      className={base}
      animate={selected ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={selected ? { duration: 4, ease: 'easeInOut', repeat: Infinity } : back}
    >
      {label}
    </motion.span>
  );
}

/* 32 · the word pulses between 70% and 100% brightness (keyframes `fw-ts-breathe` in globals.css) */
export function BreathingBrightness({ label, selected }: EffectProps) {
  return <Word label={label} className={selected ? 'fw-ts-breathe' : ''} />;
}

/* 33 · a slow, constant sideways drift of 2px */
export function IdleDrift({ label, selected }: EffectProps) {
  return (
    <motion.span
      className={base}
      animate={selected ? { x: [0, 2, 0, -2, 0] } : { x: 0 }}
      transition={selected ? { duration: 6, ease: 'easeInOut', repeat: Infinity } : back}
    >
      {label}
    </motion.span>
  );
}

/* 34 · a double pulse, then a pause */
export function Heartbeat({ label, selected }: EffectProps) {
  return (
    <motion.span
      className={base}
      animate={selected ? { scale: [1, 1.09, 1, 1.06, 1, 1] } : { scale: 1 }}
      transition={selected ? { duration: 1.7, times: [0, 0.08, 0.18, 0.28, 0.38, 1], ease: 'easeOut', repeat: Infinity } : back}
    >
      {label}
    </motion.span>
  );
}

/**
 * File: src/components/tabstudy/effects/kinetic.tsx
 * Description: Options 25 to 30: the word is taken apart into letters and each letter moves, ripples or takes a colour.
 * The button carries the accessible name, so the letter spans are plain presentation.
 */
"use client";
import { motion } from 'framer-motion';
import type { EffectProps } from '../types';
import { EASE, T1, T2, T3, Word, letters, mix } from '../shared';

const row = 'inline-flex whitespace-nowrap';

/* 25 · each letter rises in turn across the word */
export function LetterWave({ label, selected }: EffectProps) {
  return (
    <span key={selected ? 'on' : 'off'} aria-hidden className={row}>
      {letters(label).map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          animate={selected ? { y: [0, -7, 0] } : { y: 0 }}
          transition={{ duration: 0.55, delay: i * 0.05, ease: EASE }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/* 26 · letters fade in one by one from the baseline */
export function LetterStaggerIn({ label, selected }: EffectProps) {
  return (
    <span key={selected ? 'on' : 'off'} aria-hidden className={row}>
      {letters(label).map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={selected ? { opacity: 0, y: 7 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.045, ease: EASE }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/* 27 · the tracking opens from 0.2em to 0.5em (it changes the word's width, so the row breathes) */
export function LetterSpread({ label, selected }: EffectProps) {
  return (
    <motion.span
      className="inline-block whitespace-nowrap"
      initial={false}
      animate={{ letterSpacing: selected ? '0.5em' : '0.2em' }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      {label}
    </motion.span>
  );
}

/* 28 · the weight ripples from 300 up to 500 across the letters and settles at 400 (FW stays at 500 or below) */
export function LetterWeightWave({ label, selected }: EffectProps) {
  return (
    <span aria-hidden className={row}>
      {letters(label).map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={false}
          animate={{ fontWeight: selected ? [300, 500, 400] : 300 }}
          transition={{ duration: 0.7, delay: selected ? i * 0.06 : 0, ease: 'easeInOut' }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/* 29 · each letter takes a colour by its position (T1, through T2, to T3), like the bars of a chart */
const byPosition = (i: number, n: number) => {
  const p = n <= 1 ? 0 : i / (n - 1);
  return p < 0.5 ? mix(T2, T1, Math.round(p * 200)) : mix(T3, T2, Math.round((p - 0.5) * 200));
};
export function LetterCodedBar({ label, selected }: EffectProps) {
  const chars = letters(label);
  return (
    <span aria-hidden className={row}>
      {chars.map((ch, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            color: selected ? byPosition(i, chars.length) : undefined,
            transition: `color 0.4s var(--ease) ${selected ? i * 0.05 : 0}s`,
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

/* 30 · the first letter lifts and takes the accent; the rest stay put */
export function LetterLift({ label, selected }: EffectProps) {
  const [first, ...rest] = Array.from(label);
  return (
    <Word label="">
      <motion.span
        aria-hidden
        className="inline-block"
        initial={false}
        animate={{ y: selected ? -7 : 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18 }}
        style={{ color: selected ? T1 : undefined, transition: 'color 0.35s var(--ease)' }}
      >
        {first}
      </motion.span>
      <span aria-hidden>{rest.join('')}</span>
    </Word>
  );
}

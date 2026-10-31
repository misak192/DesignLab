/**
 * File: src/components/tabstudy/effects/colour.tsx
 * Description: Options 07 to 12: the selected tab is shown by colour. All colours are the skin's T1/T2/T3 and opaque mixes
 * of them, so the options follow SKIN and LIGHT. Colours that move are CSS keyframes (framer cannot animate var()).
 */
"use client";
import { motion } from 'framer-motion';
import type { EffectProps } from '../types';
import { EASE, T1, T2, Word, ink, mix, useAfter } from '../shared';

/* 07 · white flashes to the accent, then settles into a calmer tint */
function PopOn({ label }: { label: string }) {
  const hot = useAfter(30);
  const settled = useAfter(900);
  const color = !hot ? 'var(--ink)' : !settled ? T1 : mix(T1, 'var(--ink)', 55);
  return <Word label={label} style={{ color, transition: 'color 0.45s var(--ease)' }} />;
}
export function ColourPop({ label, selected }: EffectProps) {
  return selected ? <PopOn label={label} /> : <Word label={label} />;
}

/* 08 · the colour drifts slowly through the skin palette (keyframes `fw-ts-hue` in globals.css) */
export function HueCycle({ label, selected }: EffectProps) {
  return <Word label={label} className={selected ? 'fw-ts-hue' : ''} />;
}

/* 09 · the label fills with a gradient from T1 to T2 (halo travels as a drop-shadow via .fw-gradient-text) */
export function GradientText({ label, selected }: EffectProps) {
  if (!selected) return <Word label={label} />;
  return (
    <motion.span
      key="on"
      className="fw-gradient-text whitespace-nowrap"
      style={{ backgroundImage: `linear-gradient(90deg, ${T1}, ${T2})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {label}
    </motion.span>
  );
}

/* 10 · colour radiates outward from the letters, then fades (a blurred copy of the glyphs, never a box) */
export function ColourBleed({ label, selected }: EffectProps) {
  return (
    <Word label={label}>
      {/* ── EFFECT: bleed (removable) ── */}
      {selected && (
        <motion.span
          aria-hidden
          key="bleed"
          className="pointer-events-none absolute inset-0 -z-10 whitespace-nowrap"
          style={{ color: T1, filter: 'blur(7px)' }}
          initial={{ scale: 1, opacity: 0.95 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          {label}
        </motion.span>
      )}
    </Word>
  );
}

/* 11 · the left half of the word is bright, the right half dim */
export function TwoToneSplit({ label, selected }: EffectProps) {
  if (!selected) return <Word label={label} />;
  return (
    <Word label={label} style={{ color: ink(45) }}>
      {/* ── EFFECT: bright half (removable) ── */}
      <motion.span
        aria-hidden
        key="half"
        className="pointer-events-none absolute inset-0 whitespace-nowrap"
        style={{ color: 'var(--ink)' }}
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 50% 0 0)' }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {label}
      </motion.span>
    </Word>
  );
}

/* 12 · the halo turns from black into a coloured glow (both are two-layer lists, so the shadow itself transitions) */
export function ShadowColour({ label, selected }: EffectProps) {
  return (
    <Word
      label={label}
      style={{
        textShadow: selected ? `0 0 14px ${T1}, 0 0 4px ${T1}` : 'var(--halo-sm), 0 0 0 transparent',
        transition: 'text-shadow 0.5s var(--ease)',
      }}
    />
  );
}

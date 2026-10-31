/**
 * File: src/components/tabstudy/effects/glitch.tsx
 * Description: Options 19 to 24: the selected tab arrives broken and resolves. Colour-split ghosts, shifted slices, a scan
 * line, random glyphs, a stepped reveal and a block wipe. Every glitch is short and ends on the clean word.
 */
"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { EffectProps } from '../types';
import { T1, T2, Word, letters, seeded, useBox } from '../shared';

const layer = 'pointer-events-none absolute inset-0 whitespace-nowrap';

/* 19 · two offset colour copies flash for a beat, then vanish */
export function RgbSplit({ label, selected }: EffectProps) {
  return (
    <Word label={label}>
      {/* ── EFFECT: colour ghosts (removable) ── */}
      {selected && (
        <>
          <motion.span
            aria-hidden
            key="a"
            className={layer}
            style={{ color: T1, mixBlendMode: 'screen' }}
            initial={{ x: -4, opacity: 0.9 }}
            animate={{ x: [-4, -2, 0], opacity: [0.9, 0.9, 0] }}
            transition={{ duration: 0.18, ease: 'linear' }}
          >
            {label}
          </motion.span>
          <motion.span
            aria-hidden
            key="b"
            className={layer}
            style={{ color: T2, mixBlendMode: 'screen' }}
            initial={{ x: 4, opacity: 0.9 }}
            animate={{ x: [4, 2, 0], opacity: [0.9, 0.9, 0] }}
            transition={{ duration: 0.18, ease: 'linear' }}
          >
            {label}
          </motion.span>
        </>
      )}
    </Word>
  );
}

/* 20 · the word breaks into three horizontal slices that shift briefly */
const SLICES = [
  { clip: 'inset(0 0 66% 0)', x: [0, -5, 3, -2, 0] },
  { clip: 'inset(34% 0 34% 0)', x: [0, 4, -4, 3, 0] },
  { clip: 'inset(66% 0 0 0)', x: [0, -3, 5, -2, 0] },
];
export function SliceJitter({ label, selected }: EffectProps) {
  return (
    <Word label={label}>
      {/* ── EFFECT: slices (removable) ── */}
      {selected &&
        SLICES.map((s, i) => (
          <motion.span
            aria-hidden
            key={i}
            className={layer}
            style={{ clipPath: s.clip, color: i === 1 ? T1 : 'var(--ink)' }}
            initial={{ x: 0 }}
            animate={{ x: s.x }}
            transition={{ duration: 0.38, ease: 'linear' }}
          >
            {label}
          </motion.span>
        ))}
    </Word>
  );
}

/* 21 · a thin line scans down through the word */
export function ScanLine({ label, selected }: EffectProps) {
  const [ref, { h }] = useBox();
  return (
    <Word label={label} innerRef={ref}>
      {/* ── EFFECT: scan line (removable) ── */}
      {selected && h > 0 && (
        <motion.span
          aria-hidden
          key="scan"
          className="pointer-events-none absolute -inset-x-1 top-0 block h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${T1}, transparent)`, boxShadow: `0 0 6px ${T1}` }}
          initial={{ y: -3, opacity: 0 }}
          animate={{ y: [-3, h + 3], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.75, ease: 'linear' }}
        />
      )}
    </Word>
  );
}

/* 22 · letters swap for random glyphs for 200ms, then resolve left to right */
const GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789#%&*';
function Scramble({ label }: { label: string }) {
  const [ref, { w }] = useBox();
  const [text, setText] = useState(label);
  useEffect(() => {
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      if (tick >= 6) {
        setText(label);
        window.clearInterval(id);
        return;
      }
      const keep = Math.floor((tick / 6) * label.length);
      setText(Array.from(label).map((ch, i) => (ch === ' ' || i < keep ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(''));
    }, 40);
    return () => window.clearInterval(id);
  }, [label]);
  // The width is frozen at the real word's, so the neighbours don't shake with the glyphs.
  return (
    <span ref={ref} className="inline-block whitespace-nowrap" style={{ minWidth: w || undefined }}>
      {text}
    </span>
  );
}
export function NoiseFlicker({ label, selected }: EffectProps) {
  return selected ? <Scramble label={label} /> : <Word label={label} />;
}

/* 23 · the word appears in a two-frame stepped reveal */
const A = 'inset(0 100% 0 0)';
const B = 'inset(0 50% 0 0)';
const C = 'inset(0 0% 0 0)';
export function Stutter({ label, selected }: EffectProps) {
  return (
    <motion.span
      key={selected ? 'on' : 'off'}
      className="inline-block whitespace-nowrap"
      initial={selected ? { clipPath: A } : false}
      animate={{ clipPath: selected ? [A, A, B, B, C, C] : C }}
      transition={{ duration: 0.45, times: [0, 0.3, 0.31, 0.6, 0.61, 1], ease: 'linear' }}
    >
      {label}
    </motion.span>
  );
}

/* 24 · blocks of the word switch on across a coarse grid (each letter is two blocks, top and bottom) */
function Wipe({ label }: { label: string }) {
  return (
    <span aria-hidden className="inline-flex whitespace-nowrap">
      {letters(label).map((ch, i) => (
        <span key={i} className="relative inline-block">
          <span className="invisible">{ch}</span>
          {[0, 1].map((half) => (
            <motion.span
              key={half}
              className="absolute inset-0"
              style={{ clipPath: half ? 'inset(50% 0 0 0)' : 'inset(0 0 50% 0)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.001, delay: 0.04 + seeded(i, half + 3) * 0.45 }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}
export function DigitalWipe({ label, selected }: EffectProps) {
  return selected ? <Wipe key="on" label={label} /> : <Word label={label} />;
}

/**
 * File: src/components/brand/FWMark.tsx
 * Description: Twenty versions of the FrissonWorks master mark: F with the W raised like an exponent, and what can be done
 * around that. Every mark is plain type (Jost) with the FW halo; only the pill and the badge have a fill, because they are
 * icons. Each arrives once on mount; Replay remounts it. `FWMark` is the reusable piece: <FWMark id={1} size={120} />.
 */
"use client";
import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { EASE, Superscript, gradText, useCalm } from './kit';

type Render = (s: number) => ReactNode;

const base = (s: number, extra: CSSProperties = {}): CSSProperties => ({ fontSize: s, lineHeight: 1, fontWeight: 500, whiteSpace: 'nowrap', ...extra });

export interface MarkDef {
  id: number;
  name: string;
  note: string;
  render: Render;
}

export const MARKS: MarkDef[] = [
  {
    id: 1,
    name: 'F with raised W',
    note: 'The signature: the W is an exponent of the F.',
    render: (s) => (
      <span style={base(s)}>
        F<Superscript>W</Superscript>
      </span>
    ),
  },
  {
    id: 2,
    name: 'Isotope',
    note: 'The W at the top left, like an isotope: ᵂF.',
    render: (s) => (
      <span style={base(s)}>
        <Superscript side="left">W</Superscript>F
      </span>
    ),
  },
  {
    id: 3,
    name: 'Pill',
    note: 'A shifted-gradient pill with the mark in it (the app-icon pill idea).',
    render: (s) => (
      <span
        style={{
          ...base(s * 0.62),
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: s * 1.5,
          height: s * 0.9,
          borderRadius: 999,
          backgroundImage: 'linear-gradient(145deg, var(--fw-pink), var(--fw-cyan))',
          color: 'var(--fw-white)',
          textShadow: '0 1px 2px rgb(0 0 0 / 0.55)',
        }}
      >
        <span>
          F<Superscript colour="var(--fw-white)">W</Superscript>
        </span>
      </span>
    ),
  },
  {
    id: 4,
    name: 'Stacked',
    note: 'F above, the W small underneath at the right.',
    render: (s) => (
      <span style={{ ...base(s), display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 0.82 }}>
        <span>F</span>
        <span style={{ fontSize: '0.42em', color: 'var(--fw-pink)', alignSelf: 'flex-end', marginTop: '0.1em' }}>W</span>
      </span>
    ),
  },
  {
    id: 5,
    name: 'Vogue thin',
    note: 'Weight 200, capitals, wide: the Vogue title voice.',
    render: (s) => (
      <span style={base(s, { fontWeight: 200, letterSpacing: '0.35em', textTransform: 'uppercase' })}>
        F<Superscript weight={200}>W</Superscript>
      </span>
    ),
  },
  {
    id: 6,
    name: 'Heavy',
    note: 'Weight 500 (the ceiling), tight.',
    render: (s) => (
      <span style={base(s * 1.1, { letterSpacing: '-0.04em' })}>
        F<Superscript weight={500} size={0.46}>W</Superscript>
      </span>
    ),
  },
  {
    id: 7,
    name: 'Gradient',
    note: 'F and W in the skin’s T1 → T2 → T3.',
    render: (s) => (
      <span style={base(s)}>
        <span style={gradText('var(--fw-pink)', 'var(--fw-cyan)')}>F</span>
        <Superscript colour="transparent" style={gradText('var(--fw-cyan)', 'var(--fw-aqua)')}>W</Superscript>
      </span>
    ),
  },
  {
    id: 8,
    name: 'Outline',
    note: 'Only a thin outline of the letters; the W is filled.',
    render: (s) => (
      <span style={base(s, { fontWeight: 300 })}>
        <span style={{ color: 'transparent', WebkitTextStroke: '1.5px var(--ink)', textShadow: 'none' }}>F</span>
        <Superscript>W</Superscript>
      </span>
    ),
  },
  {
    id: 9,
    name: 'Starlit W',
    note: 'A soft star of light sits behind the raised W.',
    render: (s) => (
      <span style={base(s)}>
        F
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <i
            aria-hidden
            style={{ position: 'absolute', left: '-0.2em', top: '-0.1em', width: s * 0.7, height: s * 0.7, background: 'radial-gradient(circle, color-mix(in srgb, var(--fw-pink) 70%, transparent) 0%, transparent 65%)' }}
          />
          <Superscript style={{ position: 'relative', marginLeft: '0.12em' }}>W</Superscript>
        </span>
      </span>
    ),
  },
  {
    id: 10,
    name: 'Hairline',
    note: 'A gradient hairline under the mark, the FW line.',
    render: (s) => (
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch', gap: s * 0.12 }}>
        <span style={base(s)}>
          F<Superscript>W</Superscript>
        </span>
        <i aria-hidden style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--fw-pink), var(--fw-cyan), transparent)' }} />
      </span>
    ),
  },
  {
    id: 11,
    name: 'Mirror',
    note: 'The favourite hero treatment: the mark and its reflection, nothing between.',
    render: (s) => (
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={base(s)}>
          F<Superscript>W</Superscript>
        </span>
        <span
          aria-hidden
          style={{
            ...base(s),
            transform: 'scaleY(-1)',
            marginTop: -s * 0.12,
            WebkitMaskImage: 'linear-gradient(to top, rgb(0 0 0 / 0.4), transparent 70%)',
            maskImage: 'linear-gradient(to top, rgb(0 0 0 / 0.4), transparent 70%)',
          }}
        >
          F<Superscript>W</Superscript>
        </span>
      </span>
    ),
  },
  {
    id: 12,
    name: 'Slice',
    note: 'Cut through the middle and shifted a hair: the Slice style.',
    render: (s) => {
      const half = (clip: string, x: number) => (
        <span aria-hidden={x !== 0} style={{ ...base(s), position: x === 0 ? 'relative' : 'absolute', left: 0, top: 0, clipPath: clip, transform: `translateX(${x}px)` }}>
          F<Superscript>W</Superscript>
        </span>
      );
      return (
        <span style={{ position: 'relative', display: 'inline-block' }}>
          {half('inset(0 0 50% 0)', -s * 0.03)}
          {half('inset(50% 0 0 0)', s * 0.03)}
        </span>
      );
    },
  },
  {
    id: 13,
    name: 'Lower case',
    note: 'A friendlier fw: lower-case f, lower-case raised w.',
    render: (s) => (
      <span style={base(s)}>
        f<Superscript size={0.46} lift={-0.06}>w</Superscript>
      </span>
    ),
  },
  {
    id: 14,
    name: 'Big exponent',
    note: 'The W at 62 % in the thinnest weight: the exponent is half the mark.',
    render: (s) => (
      <span style={base(s)}>
        F<Superscript size={0.62} weight={200}>W</Superscript>
      </span>
    ),
  },
  {
    id: 15,
    name: 'Two tones',
    note: 'F in T1, W in T2.',
    render: (s) => (
      <span style={base(s)}>
        <span style={{ color: 'var(--fw-pink)' }}>F</span>
        <Superscript colour="var(--fw-cyan)">W</Superscript>
      </span>
    ),
  },
  {
    id: 16,
    name: 'Caret',
    note: 'Literally F ^ W, a tiny caret in T3 between them.',
    render: (s) => (
      <span style={base(s)}>
        F
        <Superscript colour="var(--fw-aqua)" size={0.3} weight={300} style={{ marginLeft: '0.08em', marginRight: '0.04em' }}>
          ^
        </Superscript>
        <Superscript style={{ marginLeft: 0 }}>W</Superscript>
      </span>
    ),
  },
  {
    id: 17,
    name: 'Orbit',
    note: 'A hairline ring around the raised W; the ring turns slowly.',
    render: (s) => (
      <span style={base(s)}>
        F
        <Superscript style={{ position: 'relative', top: '-1.15em' }}>
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.9em', height: '1.9em' }}>
            <i aria-hidden className="fw-brand-spin" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: '1px solid var(--fw-pink)', borderTopColor: 'transparent' }} />W
          </span>
        </Superscript>
      </span>
    ),
  },
  {
    id: 18,
    name: 'Wide',
    note: 'Wide-set: air between F and the raised W.',
    render: (s) => (
      <span style={base(s, { fontWeight: 200, letterSpacing: '0.55em' })}>
        F<Superscript weight={300} style={{ marginLeft: '0.5em' }}>W</Superscript>
      </span>
    ),
  },
  {
    id: 19,
    name: 'Mist',
    note: 'A blurred copy of the F glows in T1 behind a sharp F.',
    render: (s) => (
      <span style={{ ...base(s), position: 'relative', display: 'inline-block' }}>
        <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, color: 'var(--fw-pink)', filter: `blur(${s * 0.12}px)`, textShadow: 'none' }}>
          F
        </span>
        <span style={{ position: 'relative' }}>
          F<Superscript>W</Superscript>
        </span>
      </span>
    ),
  },
  {
    id: 20,
    name: 'Badge',
    note: 'The W as a notification badge on the F, as it will look on an app icon.',
    render: (s) => (
      <span style={base(s)}>
        F
        <Superscript colour="var(--fw-night)" size={0.34} lift={0.05} style={{ position: 'relative', top: '-1.4em' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.9em', height: '1.9em', borderRadius: 999, backgroundImage: 'linear-gradient(145deg, var(--fw-pink), var(--fw-cyan))', textShadow: 'none' }}>W</span>
        </Superscript>
      </span>
    ),
  },
];

export interface FWMarkProps {
  id?: number;
  size?: number;
  /** Animate the arrival (default true). */
  animate?: boolean;
}

/** The reusable master mark. */
export default function FWMark({ id = 1, size = 120, animate = true }: FWMarkProps) {
  const calm = useCalm();
  const def = MARKS.find((m) => m.id === id) ?? MARKS[0];
  const on = animate && !calm;
  return (
    <motion.span
      className="inline-flex"
      initial={on ? { opacity: 0, y: size * 0.1, filter: 'blur(8px)' } : false}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {def.render(size)}
    </motion.span>
  );
}

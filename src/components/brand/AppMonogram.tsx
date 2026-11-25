/**
 * File: src/components/brand/AppMonogram.tsx
 * Description: The app abbreviation: the first letter of the prefix with a raised L (AL, OL, LL, CL), in twenty designs.
 * `AppMonogram` is the reusable glyph; `IconPlate` puts it on an Android-style plate (circle, squircle, or the pill the
 * icons are today) in colour or as a one-colour themed icon. LoreLyst reads L with a raised L, which works because the
 * raised one is always the shared Lyst.
 */
"use client";
import type { CSSProperties, ReactNode } from 'react';
import { bigLetter, type BrandApp } from '@/lib/brand/apps';
import { Superscript, gradText } from './kit';
import TickMonogram from './TickMark';

interface Ctx {
  app: BrandApp;
  /** Font size in px. */
  s: number;
  /** One flat colour (themed icon): everything uses `ink`. */
  mono: boolean;
  ink: string;
}

export interface MonogramDef {
  id: number;
  name: string;
  note: string;
  /** The glyph is itself a pill (RAG): it needs no plate. */
  pill?: boolean;
  render: (c: Ctx) => ReactNode;
}

const txt = (s: number, extra: CSSProperties = {}): CSSProperties => ({ fontSize: s, lineHeight: 1, fontWeight: 500, whiteSpace: 'nowrap', display: 'inline-block', ...extra });
const col = (c: Ctx) => (c.mono ? c.ink : c.app.colour);
const soft = (c: Ctx) => (c.mono ? c.ink : c.app.colour2);

const Bars = ({ kind, colour, size }: { kind: 'list' | 'two' | 'check'; colour: string; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={colour} strokeWidth="2.2" strokeLinecap="round" aria-hidden style={{ overflow: 'visible' }}>
    {kind === 'list' && (
      <>
        <path d="M7 4h12M7 10h9M7 16h12" />
        <path d="M1.2 4h.1M1.2 10h.1M1.2 16h.1" strokeWidth="3" />
      </>
    )}
    {kind === 'two' && <path d="M3 1v17h16" strokeWidth="3.2" />}
    {kind === 'check' && (
      <>
        <rect x="1.5" y="1.5" width="17" height="17" rx="4" strokeWidth="1.4" />
        <path d="M5.5 5v9.5H15" strokeWidth="2.8" />
      </>
    )}
  </svg>
);

/** A raised drawing instead of a raised letter, aligned like Superscript. */
const RaisedSvg = ({ s, children }: { s: number; children: ReactNode }) => (
  <span style={{ display: 'inline-block', marginLeft: s * 0.06, position: 'relative', top: -s * 0.4, lineHeight: 0, width: s * 0.42, height: s * 0.42 }}>{children}</span>
);

export const MONOGRAMS: MonogramDef[] = [
  { id: 1, name: 'Raised L', note: 'The base idea: big letter, small raised L.', render: (c) => <span style={txt(c.s, { color: col(c) })}>{bigLetter(c.app)}<Superscript colour={col(c)}>L</Superscript></span> },
  { id: 2, name: 'Two colours', note: 'The letter in the app colour, the shared L in plain ink.', render: (c) => <span style={txt(c.s, { color: col(c) })}>{bigLetter(c.app)}<Superscript colour={c.mono ? c.ink : 'var(--ink)'}>L</Superscript></span> },
  { id: 3, name: 'Isotope', note: 'A small app letter at the top left of a big L.', render: (c) => <span style={txt(c.s, { color: col(c) })}><Superscript side="left" colour={soft(c)}>{bigLetter(c.app)}</Superscript>L</span> },
  { id: 4, name: 'L as list bars', note: 'The raised L is a tiny list: three lines and bullets.', render: (c) => <span style={txt(c.s, { color: col(c) })}>{bigLetter(c.app)}<RaisedSvg s={c.s}><Bars kind="list" colour={soft(c)} size={c.s * 0.42} /></RaisedSvg></span> },
  { id: 5, name: 'L as two bars', note: 'The raised L drawn as exactly two bars.', render: (c) => <span style={txt(c.s, { color: col(c) })}>{bigLetter(c.app)}<RaisedSvg s={c.s}><Bars kind="two" colour={soft(c)} size={c.s * 0.4} /></RaisedSvg></span> },
  { id: 6, name: 'Checkbox corner', note: 'The L is the corner of a checkbox: Lyst = a list you tick.', render: (c) => <span style={txt(c.s, { color: col(c) })}>{bigLetter(c.app)}<RaisedSvg s={c.s}><Bars kind="check" colour={soft(c)} size={c.s * 0.44} /></RaisedSvg></span> },
  { id: 7, name: 'lYst', note: 'A Y instead of an L: the round middle of "Lyst".', render: (c) => <span style={txt(c.s, { color: col(c) })}>{bigLetter(c.app)}<Superscript colour={soft(c)}>Y</Superscript></span> },
  {
    id: 8,
    name: 'Brand pill',
    note: 'The Android pill icon today: a pill in the app’s brand gradient, letter and raised L in white.',
    pill: true,
    render: (c) => (
      <span style={{ ...txt(c.s * 0.62), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: c.s * 1.5, height: c.s * 0.9, borderRadius: 999, background: c.mono ? c.ink : c.app.gradient, color: c.mono ? 'var(--canvas)' : 'var(--fw-white)', textShadow: c.mono ? 'none' : '0 1px 2px rgb(0 0 0 / 0.5)' }}>
        <span>{bigLetter(c.app)}<Superscript colour={c.mono ? 'var(--canvas)' : 'var(--fw-white)'}>L</Superscript></span>
      </span>
    ),
  },
  {
    id: 9,
    name: 'Brand pill outline',
    note: 'The same pill as a hairline ring in the app colour.',
    pill: true,
    render: (c) => (
      <span style={{ ...txt(c.s * 0.62), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: c.s * 1.5, height: c.s * 0.9, borderRadius: 999, border: `1.5px solid ${col(c)}`, color: col(c) }}>
        <span>{bigLetter(c.app)}<Superscript colour={col(c)}>L</Superscript></span>
      </span>
    ),
  },
  {
    id: 10,
    name: 'Tall pill',
    note: 'A portrait pill, the letter near the top and the raised L like a notification.',
    pill: true,
    render: (c) => (
      <span style={{ ...txt(c.s * 0.7), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: c.s * 0.95, height: c.s * 1.5, borderRadius: 999, background: c.mono ? c.ink : `linear-gradient(170deg, ${c.app.colour}, ${c.app.colour2})`, color: c.mono ? 'var(--canvas)' : 'var(--fw-white)', textShadow: c.mono ? 'none' : '0 1px 2px rgb(0 0 0 / 0.5)' }}>
        <span>{bigLetter(c.app)}<Superscript colour={c.mono ? 'var(--canvas)' : 'var(--fw-white)'}>L</Superscript></span>
      </span>
    ),
  },
  {
    id: 11,
    name: 'Brand dot',
    note: 'The raised L is only a dot in the app colour: the pill shrunk to a badge.',
    render: (c) => (
      <span style={txt(c.s, { color: col(c) })}>
        {bigLetter(c.app)}
        <RaisedSvg s={c.s}>
          <i aria-hidden style={{ display: 'block', width: '100%', height: '100%', borderRadius: 999, background: soft(c) }} />
        </RaisedSvg>
      </span>
    ),
  },
  { id: 12, name: 'Side by side', note: 'AL with both letters the same size (for comparison).', render: (c) => <span style={txt(c.s * 0.8, { color: col(c), letterSpacing: '0.02em' })}>{bigLetter(c.app)}<span style={{ color: soft(c) }}>L</span></span> },
  { id: 13, name: 'Vogue thin', note: 'Weight 200, wide: for the big wordmark use.', render: (c) => <span style={txt(c.s, { color: col(c), fontWeight: 200, letterSpacing: '0.2em' })}>{bigLetter(c.app)}<Superscript weight={200} colour={col(c)}>L</Superscript></span> },
  { id: 14, name: 'Heavy', note: 'Weight 500 and tight: reads best at 16 px.', render: (c) => <span style={txt(c.s * 1.08, { color: col(c), letterSpacing: '-0.04em' })}>{bigLetter(c.app)}<Superscript colour={col(c)} size={0.48}>L</Superscript></span> },
  { id: 15, name: 'Shifted gradient', note: 'The letter in the app’s shifted gradient, the L in white.', render: (c) => <span style={txt(c.s)}><span style={c.mono ? { color: c.ink } : gradText(c.app.colour2, c.app.colour)}>{bigLetter(c.app)}</span><Superscript colour={c.mono ? c.ink : 'var(--ink)'}>L</Superscript></span> },
  {
    id: 16,
    name: 'Badge L',
    note: 'The raised L inside a small filled circle, like Android’s notification badge.',
    render: (c) => (
      <span style={txt(c.s, { color: col(c) })}>
        {bigLetter(c.app)}
        <Superscript colour={c.mono ? 'var(--canvas)' : 'var(--fw-night)'} size={0.3} style={{ position: 'relative', top: '-1.9em' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.8em', height: '1.8em', borderRadius: 999, background: soft(c), textShadow: 'none', fontWeight: 500 }}>L</span>
        </Superscript>
      </span>
    ),
  },
  {
    id: 17,
    name: 'Underlined',
    note: 'A hairline under the pair ties the raised L to the letter.',
    render: (c) => (
      <span style={{ display: 'inline-flex', flexDirection: 'column', gap: c.s * 0.1 }}>
        <span style={txt(c.s, { color: col(c) })}>{bigLetter(c.app)}<Superscript colour={soft(c)}>L</Superscript></span>
        <i aria-hidden style={{ height: Math.max(1, c.s / 40), background: `linear-gradient(90deg, ${col(c)}, transparent)` }} />
      </span>
    ),
  },
  {
    id: 18,
    name: 'Stacked',
    note: 'The L small underneath the letter, centred.',
    render: (c) => (
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.8 }}>
        <span style={txt(c.s, { color: col(c), lineHeight: 0.85 })}>{bigLetter(c.app)}</span>
        <span style={txt(c.s * 0.3, { color: soft(c), letterSpacing: '0.1em', marginTop: c.s * 0.06 })}>L</span>
      </span>
    ),
  },
  { id: 19, name: 'Outline letter', note: 'The big letter only as an outline; the raised L solid.', render: (c) => <span style={txt(c.s, { fontWeight: 300 })}><span style={{ color: 'transparent', WebkitTextStroke: `${Math.max(1, c.s / 28)}px ${col(c)}`, textShadow: 'none' }}>{bigLetter(c.app)}</span><Superscript colour={soft(c)}>L</Superscript></span> },
  {
    id: 20,
    name: 'Ringed L',
    note: 'A ring around the raised L: survives being one flat colour (Android themed icons).',
    render: (c) => (
      <span style={txt(c.s, { color: col(c) })}>
        {bigLetter(c.app)}
        <Superscript colour={col(c)} size={0.3} style={{ position: 'relative', top: '-1.9em' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.9em', height: '1.9em', borderRadius: 999, border: `${Math.max(1, c.s / 36)}px solid ${col(c)}` }}>L</span>
        </Superscript>
      </span>
    ),
  },
  {
    id: 21,
    name: 'Tick-L (final)',
    note: 'The hero’s end state: the letter and the tick-L standing upright as the superscript, in the app gradient. Static icons always use this.',
    render: (c) => <TickMonogram app={c.app} size={c.s} t={Infinity} compact theme={c.mono ? 'mono' : 'dark'} ink={c.ink} />,
  },
];

export interface AppMonogramProps {
  app: BrandApp;
  /** 1–20. */
  variant?: number;
  /** Font size of the big letter, px. */
  size?: number;
  /** Everything in one flat colour. */
  mono?: boolean;
  ink?: string;
}

/** The reusable abbreviation: <AppMonogram app={app} variant={1} size={64} />. */
export default function AppMonogram({ app, variant = 1, size = 64, mono = false, ink = 'var(--ink)' }: AppMonogramProps) {
  const def = MONOGRAMS.find((m) => m.id === variant) ?? MONOGRAMS[0];
  return <>{def.render({ app, s: size, mono, ink })}</>;
}

export type PlateShape = 'circle' | 'squircle';

export interface IconPlateProps {
  app: BrandApp;
  variant: number;
  /** Plate size in px (48 = 48dp). */
  size: number;
  shape?: PlateShape;
  /** The Android themed (monochrome) icon: a pale plate, one dark glyph. */
  mono?: boolean;
}

/** An app icon: the monogram centred on a plate. Pill variants are the icon themselves. */
export function IconPlate({ app, variant, size, shape = 'circle', mono = false }: IconPlateProps) {
  const def = MONOGRAMS.find((m) => m.id === variant) ?? MONOGRAMS[0];
  const glyph = size * (def.pill ? 0.56 : 0.5);
  const radius = shape === 'circle' ? '50%' : '28%';
  const plate: CSSProperties = def.pill
    ? { width: size, height: size }
    : {
        width: size,
        height: size,
        borderRadius: radius,
        background: mono ? 'color-mix(in srgb, var(--fw-lavender) 22%, var(--fw-white))' : 'linear-gradient(150deg, color-mix(in srgb, var(--fw-white) 9%, var(--fw-night)), var(--fw-night))',
        boxShadow: mono ? 'none' : `inset 0 0 0 ${Math.max(1, size / 48)}px color-mix(in srgb, ${app.colour} 28%, transparent)`,
      };
  return (
    <span style={{ ...plate, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', paddingRight: size * 0.02 }}>
      {def.render({ app, s: glyph, mono, ink: 'color-mix(in srgb, var(--fw-lavender) 25%, black)' })}
    </span>
  );
}

/**
 * File: src/components/chartstudy/charts/styles.tsx
 * Description: The five styles of the Charts page. A style says how one design draws each of the three charts: a line (SVG
 * strokes), a stacked-bar segment (an absolutely placed element) and a mark (a dot design from the dot study and the Blends page,
 * used for line markers and scatter points). Shadows and glows are stacked strokes and soft gradients, never filters, so every
 * chart stays cheap. The arrival (pop-in) is not a style: it is drawn by ChartsStudy around any of them.
 * Decided 1 Nov 2026: Airbrush gradient leads (Ember and Aurora looked almost the same and cost more, so they were folded into it).
 */
import type { CSSProperties, FC, ReactNode, SVGProps } from 'react';
import { tint, bright } from '../shared';
import { mask } from '../dots/kit';
import type { DotProps } from '../dots/kit';
import { B02, B03, B10, B12, SHEEN, SHEEN_SOFT, glassN, grad } from '../dots/blends';
import { D22 } from '../dots/glass3d';
import { W, X0, X1, BASE } from './data';
import type { Segment } from './data';

export interface Tone {
  c: string;
  hi: string;
  lo: string;
  deep: string;
}

export interface LineCtx {
  d: string;
  tone: Tone;
  /** An id prefix that is unique to this line, for its gradients and masks. */
  uid: string;
}

export interface BarCtx {
  seg: Segment;
  tone: Tone;
}

export interface ChartStyle {
  id: string;
  name: string;
  /** Which dot design it is, by the number it carries on the page that has it. */
  source: string;
  note: string;
  Mark: FC<DotProps>;
  /** Scatter points are drawn this many times their size (a halftone needs room for its grid of dots). */
  scatterScale?: number;
  /** Draw a marker on every n-th point of the line (0 = none). */
  markEvery: number;
  markSize: number;
  line: (c: LineCtx) => ReactNode;
  bar: (c: BarCtx) => ReactNode;
}

/* ── pieces ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

const P = (props: SVGProps<SVGPathElement>) => <path fill="none" strokeLinecap="round" strokeLinejoin="round" {...props} />;

/** A gradient along the whole width of the chart. */
const HGrad = ({ id, a, b }: { id: string; a: string; b: string }) => (
  <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={X0} y1={0} x2={X1} y2={0}>
    <stop offset="0" stopColor={a} />
    <stop offset="1" stopColor={b} />
  </linearGradient>
);

/** The airbrush line: strokes from wide and faint to narrow and strong, so it has no edge, and a thin bright core. */
const AIR: [number, number][] = [
  [22, 0.05],
  [15, 0.09],
  [9, 0.17],
  [5, 0.4],
];
const AirLine = ({ d, stroke, core }: { d: string; stroke: string; core: string }) => (
  <>
    {AIR.map(([w, o]) => (
      <P key={w} d={d} stroke={stroke} strokeWidth={w} strokeOpacity={o} />
    ))}
    <P d={d} stroke={core} strokeWidth={1.6} />
  </>
);

/** A bar segment, placed in the chart. */
const place = (s: Segment, extra: CSSProperties): CSSProperties => ({ position: 'absolute', left: s.x, top: s.y, width: s.w, height: s.h, ...extra });

/** An airbrushed segment: the rectangle with soft edges (a fade across and a fade along), so a stack still reads as a stack. */
const soft = (s: Segment, tone: Tone, extra: CSSProperties = {}): CSSProperties => ({
  position: 'absolute',
  left: s.x - s.w * 0.14,
  top: s.y - s.h * 0.18,
  width: s.w * 1.28,
  height: s.h * 1.36,
  background: grad(tone.hi, tone.lo),
  ...mask(['linear-gradient(to right, transparent, #000 30%, #000 70%, transparent)', 'linear-gradient(to bottom, transparent, #000 26%, #000 74%, transparent)']),
  ...extra,
});

const DOTS5 = 'radial-gradient(circle, #000 0 42%, transparent 48%)';

/* ── the styles ───────────────────────────────────────────────────────────────────────────────────────────────────── */

export const CHART_STYLES: ChartStyle[] = [
  {
    id: 'airbrush',
    name: 'Airbrush gradient',
    source: 'Blends 03 · leading',
    note: 'No edge anywhere: a line of soft spray, segments with soft edges, dots that thin out at the rim. One element per dot and per segment, no filters: as cheap as any style here, and the one to build on.',
    Mark: B03,
    markEvery: 2,
    markSize: 14,
    line: ({ d, tone, uid }) => (
      <g>
        <defs>
          <HGrad id={uid} a={tone.hi} b={tone.lo} />
        </defs>
        <AirLine d={d} stroke={`url(#${uid})`} core={tint(bright(tone.hi, 0.7), 0.95)} />
      </g>
    ),
    bar: ({ seg, tone }) => <span aria-hidden style={soft(seg, tone)} />,
  },
  {
    id: 'gsg',
    name: 'Gradient, shadow and glow',
    source: 'Blends 02',
    note: 'The shifted gradient with a soft shadow in its off-shade under it and a glow of the lighter cousin around it.',
    Mark: B02,
    markEvery: 2,
    markSize: 12,
    line: ({ d, tone, uid }) => (
      <g>
        <defs>
          <HGrad id={uid} a={tone.hi} b={tone.lo} />
        </defs>
        <P d={d} transform="translate(0 7)" stroke={tint(tone.lo, 0.32)} strokeWidth={7} />
        <P d={d} stroke={tint(tone.hi, 0.2)} strokeWidth={13} />
        <P d={d} stroke={`url(#${uid})`} strokeWidth={3} />
      </g>
    ),
    bar: ({ seg, tone }) => (
      <span
        aria-hidden
        style={place(seg, {
          borderRadius: 3,
          background: `linear-gradient(to bottom, ${tone.hi}, ${tone.lo})`,
          boxShadow: seg.bottom ? `0 10px 18px ${tint(tone.lo, 0.5)}, 0 0 10px ${tint(tone.hi, 0.3)}` : `0 0 8px ${tint(tone.hi, 0.28)}`,
        })}
      />
    ),
  },
  {
    id: 'halftone',
    name: 'Halftone, faded edge',
    source: 'Blends 10',
    note: 'A grid of dots that dissolves toward the edges: a dotted line that fades at both ends, bars cut with dots, bubbles.',
    Mark: B10,
    scatterScale: 1.5,
    markEvery: 0,
    markSize: 0,
    line: ({ d, tone, uid }) => (
      <g>
        <defs>
          <HGrad id={uid} a={tone.hi} b={tone.lo} />
          <linearGradient id={`${uid}f`} gradientUnits="userSpaceOnUse" x1={X0} y1={0} x2={X1} y2={0}>
            <stop offset="0" stopColor="#000" />
            <stop offset="0.16" stopColor="#fff" />
            <stop offset="0.84" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id={`${uid}m`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={BASE + 40}>
            <rect x={0} y={0} width={W} height={BASE + 40} fill={`url(#${uid}f)`} />
          </mask>
        </defs>
        <g mask={`url(#${uid}m)`}>
          <P d={d} stroke={`url(#${uid})`} strokeWidth={5.5} strokeDasharray="0.1 6.6" />
          <P d={d} stroke={`url(#${uid})`} strokeWidth={3} strokeOpacity={0.6} strokeDasharray="0.1 6.6" strokeDashoffset={3.3} />
        </g>
      </g>
    ),
    bar: ({ seg, tone }) => (
      <span
        aria-hidden
        style={place(seg, {
          background: grad(tone.hi, tone.lo),
          ...mask([DOTS5, 'linear-gradient(to right, transparent, #000 22%, #000 78%, transparent)', 'linear-gradient(to bottom, transparent, #000 24%, #000 76%, transparent)'], {
            maskSize: '5px 5px, 100% 100%, 100% 100%',
            WebkitMaskSize: '5px 5px, 100% 100%, 100% 100%',
            maskRepeat: 'repeat, no-repeat, no-repeat',
            WebkitMaskRepeat: 'repeat, no-repeat, no-repeat',
          }),
        })}
      />
    ),
  },
  {
    id: 'tint',
    name: 'Tint bleed',
    source: 'Blends 12',
    note: 'Clear glass with the colour bleeding in from one side. The glass end is almost transparent and dissolves into the page; only the coloured end is solid. Try it with LIGHT on.',
    Mark: B12,
    markEvery: 2,
    markSize: 14,
    line: ({ d, tone, uid }) => (
      <g>
        <defs>
          <HGrad id={uid} a={tint(tone.c, 0.04)} b={tone.c} />
        </defs>
        <P d={d} transform="translate(0 6)" stroke={tint(tone.lo, 0.18)} strokeWidth={9} />
        <P d={d} stroke={glassN(0.14)} strokeWidth={10} />
        <P d={d} stroke={`url(#${uid})`} strokeWidth={3.2} />
        <P d={d} transform="translate(0 -2.6)" stroke={glassN(0.3)} strokeWidth={1.4} />
      </g>
    ),
    bar: ({ seg, tone }) => (
      <span
        aria-hidden
        style={place(seg, {
          borderRadius: 3,
          background: `${SHEEN_SOFT}, linear-gradient(100deg, ${glassN(0.16)}, ${glassN(0.06)} 42%, ${tint(tone.c, 0.85)})`,
          ...mask('linear-gradient(to right, rgba(0,0,0,0.25), #000 55%)'),
        })}
      />
    ),
  },
  {
    id: 'glassover',
    name: 'Glass over colour',
    source: 'Dots 22',
    note: 'A neutral glass shape laid over the coloured one, so the overlap shows tinted: a soft glass band over the airbrushed line, a glass pane over each bar, a glass dot close to its core.',
    Mark: D22,
    markEvery: 3,
    markSize: 16,
    line: ({ d, tone, uid }) => (
      <g>
        <defs>
          <HGrad id={uid} a={tone.hi} b={tone.lo} />
        </defs>
        <AirLine d={d} stroke={`url(#${uid})`} core={tint(bright(tone.hi, 0.7), 0.95)} />
        <g transform="translate(3 4)">
          {(
            [
              [18, 0.07],
              [12, 0.12],
              [7, 0.18],
            ] as const
          ).map(([w, o]) => (
            <P key={w} d={d} stroke={glassN(1)} strokeWidth={w} strokeOpacity={o} />
          ))}
        </g>
      </g>
    ),
    bar: ({ seg, tone }) => (
      <>
        <span aria-hidden style={place(seg, { borderRadius: 3, background: grad(tone.hi, tone.lo), boxShadow: `0 0 8px ${tint(tone.hi, 0.25)}` })} />
        <span aria-hidden style={{ ...place(seg, { borderRadius: 3, background: `${SHEEN}, ${glassN(0.3)}` }), left: seg.x + 4, top: seg.y + 4 }} />
      </>
    ),
  },
];

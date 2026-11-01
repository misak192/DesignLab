/**
 * File: src/components/chartstudy/charts/ChartsStudy.tsx
 * Description: The /experiments/chart-elements/charts page: five rows, one style each (CHART_STYLES), and in every row the same
 * three charts on the same values (data.ts): a line chart of two series, a stacked bar chart of three, and a scatter of 24 sized
 * points. Hue follows the series (cyan, violet, magenta), each as a shifted gradient; Shift sets how far. The pop-in is an
 * ARRIVAL, not a style: whatever the style, the line draws itself left to right, the bar segments rise from the baseline one after
 * another and the dots pop out from nothing, then everything rests as the style's own design. Rows are pickable ("fw-chart-style").
 * No row has a background or border.
 */
"use client";
import { Fragment, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useMotion } from '@/components/display/DisplayProvider';
import { useMounted, useSeen } from '../hooks';
import { createPickStore } from '../pick';
import { PALETTE, anim } from '../shared';
import { Options, SHIFTS, palette } from '../dots/DotStudy';
import { BASE, H, LINE, SCATTER, SEGMENTS, TOP, W, X0, X1, linePoints, smooth } from './data';
import { CHART_STYLES } from './styles';
import type { ChartStyle, Tone } from './styles';

const { subscribe, getSnapshot, getServerSnapshot, setPick } = createPickStore('fw-chart-style');

const SERIES = [PALETTE.cyan, PALETTE.violet, PALETTE.magenta];
const ARRIVALS = [
  { id: 'pop', label: 'Pop-in' },
  { id: 'none', label: 'None' },
] as const;
const clean = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '');

/** Scales the fixed 340 x 200 canvas down to the width it is given, so a phone shows the same chart smaller. */
function Fit({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(Math.min(1, e.contentRect.width / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="w-full max-w-[340px]" style={{ height: H * k }}>
      <div style={{ position: 'relative', width: W, height: H, transform: `scale(${k})`, transformOrigin: '0 0' }}>{children}</div>
    </div>
  );
}

/** Four hairlines, the same behind every chart. */
function Grid() {
  return (
    <svg aria-hidden width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      {[0, 1, 2, 3].map((i) => {
        const y = TOP + ((BASE - TOP) * i) / 3;
        return <line key={i} x1={X0} x2={X1} y1={y} y2={y} stroke="var(--rail)" strokeWidth={1} />;
      })}
    </svg>
  );
}

/** One dot design at a point. In the arrival it pops out from nothing, after `delay` ms. */
function Mark({ style, x, y, size, tone, live, arrive, delay }: { style: ChartStyle; x: number; y: number; size: number; tone: Tone; live: boolean; arrive: boolean; delay: number }) {
  const Dot = style.Mark;
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, ...anim(arrive, 'fw-cd-popin', 560, { delay, ease: 'ease-out' }) }}>
      <Dot {...tone} s={size} live={live} />
    </div>
  );
}

function LineChart({ style, tones, live, arrive }: { style: ChartStyle; tones: Tone[]; live: boolean; arrive: boolean }) {
  const uid = clean(useId());
  return (
    <Fit>
      <Grid />
      {/* The line draws itself: the whole drawing is uncovered from the left. */}
      <svg aria-hidden width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', ...anim(arrive, 'fw-ch-reveal', 1400, { ease: 'ease-in-out' }) }}>
        {LINE.map((_, s) => (
          <Fragment key={s}>{style.line({ d: smooth(linePoints(s)), tone: tones[s], uid: `${uid}s${s}` })}</Fragment>
        ))}
      </svg>
      {style.markEvery > 0 &&
        LINE.map((_, s) =>
          linePoints(s)
            .map(([x, y], i) => ({ x, y, i }))
            .filter((p) => p.i % style.markEvery === 0)
            .map((p) => <Mark key={`${s}-${p.i}`} style={style} x={p.x} y={p.y} size={style.markSize} tone={tones[s]} live={live} arrive={arrive} delay={500 + p.i * 90} />)
        )}
    </Fit>
  );
}

function BarChart({ style, tones, arrive }: { style: ChartStyle; tones: Tone[]; arrive: boolean }) {
  return (
    <Fit>
      <Grid />
      {SEGMENTS.map((seg) => (
        // Each segment grows from the baseline: the layer is scaled about the baseline, so a segment rises as it thickens.
        <div
          key={`${seg.col}-${seg.k}`}
          style={{ position: 'absolute', inset: 0, transformOrigin: `0 ${BASE}px`, ...anim(arrive, 'fw-ch-rise', 700, { delay: seg.col * 90 + seg.k * 120, ease: 'ease-out' }) }}
        >
          {style.bar({ seg, tone: tones[seg.k] })}
        </div>
      ))}
    </Fit>
  );
}

function ScatterChart({ style, tones, live, arrive }: { style: ChartStyle; tones: Tone[]; live: boolean; arrive: boolean }) {
  return (
    <Fit>
      <Grid />
      {SCATTER.map((p, i) => (
        <Mark key={i} style={style} x={p.x} y={p.y} size={Math.round(p.size * (style.scatterScale ?? 1))} tone={tones[p.group]} live={live} arrive={arrive} delay={i * 45} />
      ))}
    </Fit>
  );
}

function Row({ style, index, tones, live, arrive, run, picked }: { style: ChartStyle; index: number; tones: Tone[]; live: boolean; arrive: boolean; run: number; picked: boolean }) {
  const [ref, seen] = useSeen();
  const mounted = useMounted();
  const charts = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<number | null>(null);

  // How many elements the three charts are made of, counted from the page.
  useEffect(() => {
    if (mounted && charts.current) setNodes(charts.current.querySelectorAll('*').length);
  }, [mounted, style.id]);

  const blocks = [
    { label: 'Line', node: <LineChart style={style} tones={tones} live={live} arrive={arrive} /> },
    { label: 'Stacked bar', node: <BarChart style={style} tones={tones} arrive={arrive} /> },
    { label: 'Scatter', node: <ScatterChart style={style} tones={tones} live={live} arrive={arrive} /> },
  ];

  return (
    <li ref={ref} data-seen={seen} className="fw-ce flex min-w-0 flex-col gap-5 border-t border-[var(--rail)] pt-6">
      <div className="flex flex-col gap-2">
        <p className="fw-kicker">
          <span className="fw-tabular text-t1">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-ink-2"> · {style.source}</span>
        </p>
        <h2 className="fw-big text-[24px] font-light leading-[1.2] text-ink">{style.name}</h2>
        <p className="max-w-[70ch] text-[0.9375rem] font-light leading-[1.5] text-ink-2">{style.note}</p>
        <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-5">
          <button type="button" className="fw-pick" aria-pressed={picked} onClick={() => setPick(style.id)}>
            Pick
          </button>
          {picked && <span className="fw-kicker text-t1">Picked</span>}
          {nodes !== null && <span className="fw-tabular text-[0.8125rem] font-light text-ink-3">{nodes} elements in the three charts</span>}
        </div>
      </div>
      <div ref={charts} key={run} className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
        {blocks.map((b) => (
          <div key={b.label} className="flex min-w-0 flex-col gap-3">
            <p className="fw-kicker text-ink-2">{b.label}</p>
            {mounted && b.node}
            {!mounted && <div style={{ height: H }} />}
          </div>
        ))}
      </div>
    </li>
  );
}

export default function ChartsStudy() {
  const live = useMotion().scale > 0;
  const [shift, setShift] = useState<(typeof SHIFTS)[number]['id']>('medium');
  const [arrival, setArrival] = useState<(typeof ARRIVALS)[number]['id']>('pop');
  const [run, setRun] = useState(0);
  const picked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pickedStyle = CHART_STYLES.find((s) => s.id === picked);
  const amt = SHIFTS.find((x) => x.id === shift)?.amt ?? 48;
  const tones = SERIES.map((c) => palette(c, amt));
  const arrive = live && arrival === 'pop';

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker text-t1">Chart Elements · Charts</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Charts</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">One dataset, five styles.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Each row is one style, drawn three ways on the same values: a line chart of two series, a stacked bar chart of three, and a
          scatter of 24 points with a size. Series are cyan, violet and magenta, each as its own shifted gradient. The line markers and
          scatter points are the dot designs themselves. The pop-in is now an arrival that any style can have: the line draws itself,
          the bars rise segment by segment, the dots pop out from nothing, and everything rests as the style’s own design. Shadows and
          glows are stacked strokes and soft gradients, no blur filter and no backdrop-filter, so a real chart stays cheap.
        </p>
        <div className="flex flex-col">
          <Options label="Shift" items={SHIFTS} current={shift} onPick={setShift} />
          <div className="flex flex-wrap items-baseline gap-x-6">
            <div className="flex flex-wrap items-baseline gap-x-6">
              <span className="fw-kicker w-[5.5rem] text-ink-2">Arrival</span>
              <div role="radiogroup" aria-label="Arrival" className="flex flex-wrap">
                {ARRIVALS.map((o) => (
                  <button key={o.id} type="button" role="radio" aria-checked={o.id === arrival} className="fw-opt" onClick={() => setArrival(o.id)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            {arrival === 'pop' && (
              <button type="button" className="fw-pick" onClick={() => setRun((n) => n + 1)}>
                Replay
              </button>
            )}
          </div>
        </div>
        <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-6">
          <span className="fw-kicker text-ink-2">Favourite</span>
          {pickedStyle ? (
            <>
              <span className="fw-big text-[20px] font-light text-t1">{pickedStyle.name}</span>
              <button type="button" className="fw-pick" onClick={() => setPick(null)}>
                Clear
              </button>
            </>
          ) : (
            <span className="text-[0.9375rem] font-light text-ink-3">None yet</span>
          )}
        </div>
        {!live && (
          <p className="max-w-[62ch] text-[0.9375rem] font-light text-ink-2">
            MOTION is off, or your device asks for reduced motion: the arrival is not played and the charts are drawn at rest. Turn MOTION on
            in the header to see it.
          </p>
        )}
      </header>

      <ul className="flex flex-col gap-14">
        {CHART_STYLES.map((style, i) => (
          <Row key={style.id} style={style} index={i} tones={tones} live={live} arrive={arrive} run={run} picked={picked === style.id} />
        ))}
      </ul>
    </main>
  );
}

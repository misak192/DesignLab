/**
 * File: src/components/chartstudy/ChartStudy.tsx
 * Description: The /experiments/chart-elements page: 30 chart elements in three family rows of ten. Each cell has a large
 * sample with its idle animation, a series preview of 12 elements (values 2 to 20) at real size, and a Pick button.
 * One state object holds every cell's preview values and replay counter; the favourite is saved in localStorage
 * ("fw-chart-element", see ./pick.ts). No cell has a background or border: the page background shows through.
 */
"use client";
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useMotion } from '@/components/display/DisplayProvider';
import { ELEMENTS } from './families';
import { useMounted, useSeen } from './hooks';
import { CHART_OPTIONS, FAMILIES } from './options';
import type { ChartOption } from './options';
import { getServerSnapshot, getSnapshot, setPick, subscribe } from './pick';
import { rand } from './shared';
import type { ElementProps } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

/* Series geometry, at the size a real FW chart would draw it. */
const COUNT = 12;
const PITCH = 23;
const PX = 5; // px per unit of value
const BASE = 14; // space under the baseline
const TOP = 24; // room above value 20 for sparkles and particles
const SERIES_W = COUNT * PITCH;
const SERIES_H = BASE + 20 * PX + TOP;

interface StudyState {
  /** Each cell's own 12 preview values. */
  values: Record<string, number[]>;
  /** Bumped by "Replay" to restart a cell's entries. */
  runs: Record<string, number>;
}

/** Twelve values from 2 to 20, rising with a wobble that is different for every cell. */
function makeValues(seed: number): number[] {
  const v = Array.from({ length: COUNT }, (_, i) => {
    const t = i / (COUNT - 1);
    const x = 0.12 + 0.76 * t + (rand(i, seed + 1) - 0.5) * 0.45;
    return Math.min(20, Math.max(2, Math.round(2 + 18 * x)));
  });
  v[0] = 2;
  v[COUNT - 1] = 20;
  return v;
}

const initialState = (): StudyState => ({
  values: Object.fromEntries(CHART_OPTIONS.map((o, i) => [o.id, makeValues(i + 1)])),
  runs: Object.fromEntries(CHART_OPTIONS.map((o) => [o.id, 0])),
});

/** The large sample: the same element at about 48px. */
const SAMPLE: Record<ChartOption['family'], Pick<ElementProps, 'value' | 'w' | 'h' | 'px'>> = {
  dot: { value: 8, w: 48, h: 48, px: PX },
  square: { value: 11, w: 48, h: 48, px: PX },
  stacked: { value: 6, w: 30, h: 0, px: 8 },
};

function Cell({
  option,
  values,
  run,
  live,
  picked,
  onReplay,
}: {
  option: ChartOption;
  values: number[];
  run: number;
  live: boolean;
  picked: boolean;
  onReplay: () => void;
}) {
  const [ref, seen] = useSeen();
  const [tick, setTick] = useState(0);
  const mounted = useMounted();
  const Element = ELEMENTS[option.id];

  // The sample replays its entry every few seconds so a once-only effect can be judged without pressing Replay.
  useEffect(() => {
    if (!live || !seen) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 7000);
    return () => window.clearInterval(t);
  }, [live, seen]);

  const s = SAMPLE[option.family];
  const sample: ElementProps = { value: s.value, index: 0, count: 1, w: s.w, h: s.h, px: s.px, pitch: 60, live, sample: true };

  return (
    <li ref={ref} data-seen={seen} className="fw-ce flex w-[300px] shrink-0 snap-start flex-col gap-3">
      <p className="fw-kicker min-h-[2.7em] leading-[1.3]">
        <span className="fw-tabular text-t1">{option.number}</span>
        <span className="text-ink-2">
          {' '}
          · {option.id} · {option.tag}
        </span>
      </p>
      <h3 className="fw-big text-[20px] font-light leading-[1.2] text-ink">{option.name}</h3>

      {/* The large sample, with its idle animation. */}
      <div className="flex h-[120px] items-center pl-8" key={`s${run}-${tick}`}>
        {mounted && <Element {...sample} />}
      </div>

      <p className="min-h-[4.4em] text-[0.875rem] font-normal leading-[1.45] text-ink-2">{option.description}</p>

      {/* The series, at real size: dots sit on a hairline baseline by vertical position; bars and stacks rise from it. */}
      <div role="img" aria-label={`${option.name}: twelve values from 2 to 20`} className="relative" style={{ width: SERIES_W, height: SERIES_H }} key={`r${run}`}>
        <span aria-hidden className="absolute left-0 h-px bg-[var(--rail)]" style={{ bottom: BASE, width: SERIES_W }} />
        {mounted && values.map((value, i) => {
          const dot = option.family === 'dot';
          const w = 14;
          const h = option.family === 'square' ? value * PX : 0;
          const props: ElementProps = { value, index: i, count: COUNT, w, h, px: PX, pitch: PITCH, prev: i > 0 ? values[i - 1] : undefined, live, sample: false };
          const place: CSSProperties = {
            position: 'absolute',
            left: i * PITCH + (PITCH - w) / 2,
            bottom: dot ? BASE + value * PX - w / 2 : BASE,
          };
          return (
            <div key={i} style={place}>
              <Element {...props} />
            </div>
          );
        })}
      </div>

      <div className="flex min-h-[48px] items-baseline gap-5">
        <button type="button" className="fw-pick" aria-pressed={picked} onClick={() => setPick(option.id)}>
          Pick
        </button>
        <button type="button" className="fw-pick" onClick={onReplay}>
          Replay
        </button>
        {picked && <span className="fw-kicker text-t1">Picked</span>}
      </div>
    </li>
  );
}

export default function ChartStudy({ number }: { number: number }) {
  const live = useMotion().scale > 0;
  const [state, setState] = useState<StudyState>(initialState);
  const picked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pickedOption = CHART_OPTIONS.find((o) => o.id === picked);

  const replay = (ids: string[]) => setState((s) => ({ ...s, runs: { ...s.runs, ...Object.fromEntries(ids.map((id) => [id, s.runs[id] + 1])) } }));

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker fw-tabular text-t1">{number > 0 ? pad(number) : '··'} Experiments</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Chart Elements</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">Thirty small things a chart is made of.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Three families of ten: the dot, the square and the stacked segment. Each is see-through by a gradient tint and a soft blur, with no border anywhere, so the background shows through. Each cell has one large sample and the same
          element as a series of twelve, values 2 to 20, at the size a chart would draw it. Hue follows the value from cyan through
          violet and magenta to amber. Pick the one every FW chart should use.
        </p>
        <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-6">
          <span className="fw-kicker text-ink-2">Favourite</span>
          {pickedOption ? (
            <>
              <span className="fw-big text-[20px] font-light text-t1">
                {pickedOption.id} · {pickedOption.name}
              </span>
              <button type="button" className="fw-pick" onClick={() => setPick(null)}>
                Clear
              </button>
            </>
          ) : (
            <span className="text-[0.9375rem] font-light text-ink-3">None yet</span>
          )}
          <button type="button" className="fw-pick" onClick={() => replay(CHART_OPTIONS.map((o) => o.id))}>
            Replay all
          </button>
        </div>
        {!live && (
          <p className="max-w-[62ch] text-[0.9375rem] font-light text-ink-2">
            MOTION is off, or your device asks for reduced motion: every element keeps its static look and the loops and entries are
            dropped. Turn MOTION on in the header to see them.
          </p>
        )}
      </header>

      <div className="flex flex-col gap-10">
        {FAMILIES.map((family) => (
          <section key={family.id} aria-labelledby={`fam-${family.id}`} className="border-t border-[var(--rail)] pt-6">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 pb-2">
              <h2 id={`fam-${family.id}`} className="fw-kicker">
                <span className="text-t1">{family.letter}</span>
                <span className="text-ink"> · {family.label}</span>
              </h2>
              <p className="text-[0.9375rem] font-light text-ink-2">{family.note}</p>
            </div>
            <ul className="fw-ce-strip flex snap-x gap-10 overflow-x-auto px-2 pb-6 pt-6">
              {CHART_OPTIONS.filter((o) => o.family === family.id).map((option) => (
                <Cell
                  key={option.id}
                  option={option}
                  values={state.values[option.id]}
                  run={state.runs[option.id]}
                  live={live}
                  picked={picked === option.id}
                  onReplay={() => replay([option.id])}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

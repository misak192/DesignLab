/**
 * File: src/components/chartstudy/dots/BlendStudy.tsx
 * Description: The /experiments/chart-elements/blends page: 29 dots that combine what Michalku liked in the dot study
 * (shifted gradient, soft tinted shadow, glow, airbrush), fix what he asked to have fixed, add the pop-in arrival, show the
 * coin stack as stacked bars, and end with recommendations. Same Colour and Shift settings as the dot study. The favourite
 * is saved in localStorage ("fw-chart-blend"). No cell has a background or border.
 */
"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useMotion } from '@/components/display/DisplayProvider';
import { useMounted, useSeen } from '../hooks';
import { createPickStore } from '../pick';
import { BLEND_DOTS } from './blends';
import { BLEND_OPTIONS, BLEND_ROWS } from './blendOptions';
import type { BlendOption } from './blendOptions';
import { COLOURS, CYCLE, Options, SHIFTS, SIZE, palette } from './DotStudy';
import type { DotSettings } from './DotStudy';
import { POPIN_DOTS } from './popin';
import { STACK_DOTS } from './stacks';
import type { FC } from 'react';
import type { DotProps } from './kit';

const { subscribe, getSnapshot, getServerSnapshot, setPick } = createPickStore('fw-chart-blend');

const DESIGNS: Record<string, FC<DotProps>> = { ...BLEND_DOTS, ...POPIN_DOTS, ...STACK_DOTS };

function Cell({ option, index, settings, live, picked, bars }: { option: BlendOption; index: number; settings: DotSettings; live: boolean; picked: boolean; bars: boolean }) {
  const [ref, seen] = useSeen();
  const mounted = useMounted();
  const area = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const Dot = DESIGNS[option.id];

  const fixed = COLOURS.find((x) => x.id === settings.colour)?.hex ?? null;
  const amt = SHIFTS.find((x) => x.id === settings.shift)?.amt ?? 48;
  const colours = palette(fixed ?? CYCLE[index % CYCLE.length], amt);

  // An arrival replays itself so it can be judged without pressing Replay.
  useEffect(() => {
    if (!option.replay || !live || !seen) return;
    const t = window.setInterval(() => setRun((n) => n + 1), 7000);
    return () => window.clearInterval(t);
  }, [option.replay, live, seen]);

  // How many elements the dot is made of, counted from the page, not written down.
  useEffect(() => {
    if (mounted && area.current) setNodes(area.current.querySelectorAll('*').length);
  }, [mounted, option.id]);

  return (
    <li ref={ref} data-seen={seen} className="fw-ce flex min-w-0 flex-col gap-3">
      <p className="fw-kicker">
        <span className="fw-tabular text-t1">{option.id}</span>
      </p>
      <h3 className="fw-big text-[20px] font-light leading-[1.2] text-ink">{option.name}</h3>
      <div ref={area} key={run} className={`flex items-center justify-center ${bars ? 'h-[120px]' : 'h-[140px]'}`}>
        {mounted && <Dot {...colours} s={SIZE} live={live} />}
      </div>
      <p className="min-h-[4.4em] text-[0.875rem] font-normal leading-[1.45] text-ink-2">{option.description}</p>
      <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-5">
        <button type="button" className="fw-pick" aria-pressed={picked} onClick={() => setPick(option.id)}>
          Pick
        </button>
        {option.replay && (
          <button type="button" className="fw-pick" onClick={() => setRun((n) => n + 1)}>
            Replay
          </button>
        )}
        {picked && <span className="fw-kicker text-t1">Picked</span>}
        {nodes !== null && <span className="fw-tabular text-[0.8125rem] font-light text-ink-3">{nodes === 1 ? '1 element' : `${nodes} elements`}</span>}
      </div>
    </li>
  );
}

export default function BlendStudy() {
  const live = useMotion().scale > 0;
  const [settings, setSettings] = useState<DotSettings>({ colour: 'mix', shift: 'medium' });
  const picked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pickedOption = BLEND_OPTIONS.find((o) => o.id === picked);

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker text-t1">Chart Elements · Blends</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Blends</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">The favourites, mixed.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          The shifted gradient, the soft tinted shadow, the glow and the airbrush, combined; the fade, the halftone and tint bleed
          fixed; the layered dot arriving by popping out from its core; and the coin stack drawn as stacked bars. Same Colour and Shift as
          the dot study. Still cheap: gradients, masks and shadows, no blur filter, no backdrop-filter; the count under each dot is its
          real number of elements.
        </p>
        <div className="flex flex-col">
          <Options label="Colour" items={COLOURS} current={settings.colour} onPick={(colour) => setSettings((s) => ({ ...s, colour }))} />
          <Options label="Shift" items={SHIFTS} current={settings.shift} onPick={(shift) => setSettings((s) => ({ ...s, shift }))} />
        </div>
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
        </div>
        {!live && (
          <p className="max-w-[62ch] text-[0.9375rem] font-light text-ink-2">
            MOTION is off, or your device asks for reduced motion: the pop-in dots are drawn at rest and Aurora does not turn. Turn MOTION on in
            the header to see them move.
          </p>
        )}
      </header>

      <div className="flex flex-col gap-12">
        {BLEND_ROWS.map((row, r) => (
          <section key={row.title} aria-labelledby={`blend-${r}`} className="border-t border-[var(--rail)] pt-6">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 pb-6">
              <h2 id={`blend-${r}`} className="fw-kicker">
                <span className="text-t1">{r + 1}</span>
                <span className="text-ink"> · {row.title}</span>
              </h2>
              <p className="text-[0.9375rem] font-light text-ink-2">{row.note}</p>
            </div>
            <ul className={row.bars ? 'grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 xl:grid-cols-4' : 'grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-10 xl:grid-cols-6'}>
              {BLEND_OPTIONS.filter((o) => o.row === r).map((option) => (
                <Cell key={option.id} option={option} index={BLEND_OPTIONS.indexOf(option)} settings={settings} live={live} picked={picked === option.id} bars={row.bars} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

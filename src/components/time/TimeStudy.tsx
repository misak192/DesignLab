/**
 * File: src/components/time/TimeStudy.tsx
 * Description: The /time page: sixteen designs for showing records and periods over time, in four groups, all drawn from the same
 * sample life (src/lib/time/data.ts). One Colour setting (Labels, Ramp or a single hue) applies to all; Replay restarts the
 * entries; every design is hoverable (the line under it says what is under the pointer) and has a Pick, saved to localStorage
 * ("fw-time-design"). Artwork is drawn after mount and once the cell has been on screen. MOTION off draws the resting look.
 */
"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { PointerEvent, RefObject } from 'react';
import Link from 'next/link';
import { useMotion } from '@/components/display/DisplayProvider';
import { createPickStore } from '@/components/chartstudy/pick';
import { useMounted } from '@/components/chartstudy/hooks';
import { Options } from '@/components/chartstudy/dots/DotStudy';
import { TOTAL, NY, Y0 } from '@/lib/time/data';
import { COLOUR_MODES, type ColourMode } from './colour';
import { DESIGNS, GROUPS, type Design } from './designs';
import { H, pad2, W } from './kit';

const pick = createPickStore('fw-time-design');

/** True once the element has come near the screen (and stays true): the artwork is drawn then, so its entry is seen. */
function useOnceSeen(): [RefObject<HTMLLIElement | null>, boolean] {
  const ref = useRef<HTMLLIElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      const t = window.setTimeout(() => setShown(true), 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '120px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

function Cell({ design, mode, live, run, picked }: { design: Design; mode: ColourMode; live: boolean; run: number; picked: boolean }) {
  const [ref, shown] = useOnceSeen();
  const mounted = useMounted();
  const [hint, setHint] = useState<string | null>(null);
  const [nodes, setNodes] = useState<number | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const { Component } = design;

  useEffect(() => {
    if (mounted && shown && area.current) setNodes(area.current.querySelectorAll('*').length);
  }, [mounted, shown, run, design.id]);

  const onOver = (e: PointerEvent<SVGSVGElement>) => {
    const el = (e.target as Element).closest('[data-hint]');
    if (el) setHint(el.getAttribute('data-hint'));
  };

  return (
    <li ref={ref} className="flex min-w-0 flex-col gap-3">
      <p className="fw-kicker">
        <span className="fw-tabular text-t1">{design.id}</span>
        <span className="text-ink-2"> · {design.from === 'list' ? 'From the list' : 'Added'}</span>
      </p>
      <h3 className="fw-big text-[20px] font-light leading-[1.2] text-ink">{design.name}</h3>
      {/* Below 480px the drawing keeps its size and scrolls sideways, so the 10px labels stay readable. */}
      <div className="fw-ce-strip w-full max-w-[640px] overflow-x-auto overflow-y-hidden">
        <div ref={area} className="min-w-[480px]" style={{ aspectRatio: `${W} / ${H}` }}>
          <svg
            key={run}
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`${design.name}: ${design.description}`}
            className="block h-full w-full overflow-visible"
            onPointerOver={onOver}
            onPointerLeave={() => setHint(null)}
          >
            {mounted && shown && <Component mode={mode} live={live} hint={setHint} />}
          </svg>
        </div>
      </div>
      <p className="fw-tabular min-h-[1.5rem] text-[0.875rem] font-light text-ink">{hint ?? <span className="text-ink-3">Hover or tap a part.</span>}</p>
      <p className="max-w-[62ch] text-[0.875rem] font-normal leading-[1.45] text-ink-2">{design.description}</p>
      <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-5">
        <button type="button" className="fw-pick" aria-pressed={picked} onClick={() => pick.setPick(picked ? null : design.id)}>
          {picked ? 'Unpick' : 'Pick'}
        </button>
        {picked && <span className="fw-kicker text-t1">Picked</span>}
        {nodes !== null && <span className="fw-tabular text-[0.8125rem] font-light text-ink-3">{nodes === 1 ? '1 element' : `${nodes} elements`}</span>}
      </div>
    </li>
  );
}

export default function TimeStudy({ number }: { number: number }) {
  const live = useMotion().scale > 0;
  const [mode, setMode] = useState<ColourMode>('labels');
  const [run, setRun] = useState(0);
  const picked = useSyncExternalStore(pick.subscribe, pick.getSnapshot, pick.getServerSnapshot);
  const pickedDesign = DESIGNS.find((d) => d.id === picked);

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/category/data" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Data
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker fw-tabular text-t1">{number > 0 ? pad2(number) : '··'} Experiments</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Time</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">Records and periods over time, sixteen ways.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          One life, drawn sixteen times: {TOTAL} dated records from {Y0} to now ({NY} years), a few labels, the people who came and went, and the places,
          work and chapters of it. Every design reads the same data, so the shape of each is what differs. Ten come from the list of ideas, six were added
          (marked Added). Nothing here has a box or an outline; the colour is the data. Change the colour setting to compare, hover or tap a part to read
          it, and pick the ones that belong in FrissonWorks.
        </p>
        <div className="flex flex-col">
          <Options label="Colour" items={COLOUR_MODES} current={mode} onPick={setMode} />
          <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-6">
            <span className="fw-kicker w-[5.5rem] text-ink-2">Entries</span>
            <button type="button" className="fw-pick" onClick={() => setRun((n) => n + 1)}>
              Replay
            </button>
          </div>
        </div>
        <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-6">
          <span className="fw-kicker text-ink-2">Favourite</span>
          {pickedDesign ? (
            <>
              <span className="fw-big text-[20px] font-light text-t1">
                {pickedDesign.id} · {pickedDesign.name}
              </span>
              <button type="button" className="fw-pick" onClick={() => pick.setPick(null)}>
                Clear
              </button>
            </>
          ) : (
            <span className="text-[0.9375rem] font-light text-ink-3">None yet</span>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-20">
        {GROUPS.map((g) => (
          <section key={g.id} aria-labelledby={`tm-${g.id}`} className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 id={`tm-${g.id}`} className="fw-kicker text-t1">
                {g.name}
              </h2>
              <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">{g.blurb}</p>
            </div>
            <ul className="grid grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-2">
              {DESIGNS.filter((d) => d.group === g.id).map((d) => (
                <Cell key={d.id} design={d} mode={mode} live={live} run={run} picked={picked === d.id} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

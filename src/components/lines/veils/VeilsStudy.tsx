/**
 * File: src/components/lines/veils/VeilsStudy.tsx
 * Description: The /lines/veils page: 56 veils, big soft areas of colour instead of lines, in eight groups. Each is drawn behind the words
 * "ES Employment" so it can be judged as a highlight: does the colour sit behind the words, and can they still be read? Colour and Shift are
 * shared by all (Shift moves how far the colour's cousins are from it). One veil can be pressed. Each cell shows its real element count.
 * The favourite is saved in localStorage ("fw-veil"). No cell has a background or border.
 */
"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useMotion } from '@/components/display/DisplayProvider';
import { useMounted, useSeen } from '@/components/chartstudy/hooks';
import { createPickStore } from '@/components/chartstudy/pick';
import { COLOURS, CYCLE, Options, SHIFTS, palette } from '@/components/chartstudy/dots/DotStudy';
import type { DotSettings } from '@/components/chartstudy/dots/DotStudy';
import { VEIL_DESIGNS } from './index';
import { VEIL_GROUPS, VEIL_OPTIONS } from './options';
import type { VeilOption } from './options';

const { subscribe, getSnapshot, getServerSnapshot, setPick } = createPickStore('fw-veil');

const H = 108;

function Cell({ option, index, settings, live, picked }: { option: VeilOption; index: number; settings: DotSettings; live: boolean; picked: boolean }) {
  const [ref, seen] = useSeen();
  const mounted = useMounted();
  const demo = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(340);
  const [nodes, setNodes] = useState<number | null>(null);
  const Design = VEIL_DESIGNS[option.id];

  // The veil is drawn as wide as its cell (up to 440px), so it is judged at the size it would be used.
  useEffect(() => {
    const el = demo.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(Math.max(240, Math.min(440, e.contentRect.width)))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fixed = COLOURS.find((x) => x.id === settings.colour)?.hex ?? null;
  const amt = SHIFTS.find((x) => x.id === settings.shift)?.amt ?? 48;
  const base = { ...palette(fixed ?? CYCLE[index % CYCLE.length], amt), live, w, h: H, seed: index + 3 };

  useEffect(() => {
    if (mounted && demo.current) setNodes(demo.current.querySelectorAll('*').length);
  }, [mounted, option.id]);

  return (
    <li ref={ref} data-seen={seen} className="fw-ce flex min-w-0 flex-col gap-3">
      <p className="fw-kicker">
        <span className="fw-tabular text-t1">{option.id}</span>
      </p>
      <h3 className="fw-big text-[20px] font-light leading-[1.2] text-ink">{option.name}</h3>
      <div ref={demo} className="relative w-full max-w-[440px]" style={{ height: H }}>
        {mounted && (
          <>
            <Design {...base} />
            <span className="pointer-events-none absolute left-5 top-1/2 flex -translate-y-1/2 flex-col whitespace-nowrap">
              <span className="fw-kicker text-[0.6875rem] tracking-[2px] text-ink-2">2021 — 2026</span>
              <span className="fw-big text-[1.25rem] font-light leading-[1.2] text-ink">ES Employment</span>
            </span>
          </>
        )}
      </div>
      <p className="min-h-[4.4em] text-[0.875rem] font-normal leading-[1.45] text-ink-2">{option.description}</p>
      <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-5">
        <button type="button" className="fw-pick" aria-pressed={picked} onClick={() => setPick(option.id)}>
          Pick
        </button>
        {option.interactive && <span className="fw-kicker text-t1">Press it</span>}
        {picked && <span className="fw-kicker text-t1">Picked</span>}
        {nodes !== null && <span className="fw-tabular text-[0.8125rem] font-light text-ink-3">{nodes === 1 ? '1 element' : `${nodes} elements`}</span>}
      </div>
    </li>
  );
}

export default function VeilsStudy() {
  const live = useMotion().scale > 0;
  const [settings, setSettings] = useState<DotSettings>({ colour: 'mix', shift: 'medium' });
  const picked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pickedOption = VEIL_OPTIONS.find((o) => o.id === picked);

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/category/light" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Light
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker text-t1">Light · Veils</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Veils</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">Fifty-six ways to highlight an area, not a line.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          A veil is a big soft area of colour with no edge, the kind that sits behind words: airbrush, halftone with a faded edge, aurora, glass, a
          highlighter, light that dissipates, and veils made of stars. Each is drawn behind the words “ES Employment”, so you can judge it as a
          highlight and check the words stay readable. Gradients and masks only, no blur filter and no backdrop-filter; the count under each is how
          many elements it really is.
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
            MOTION is off, or your device asks for reduced motion: the veils that breathe, sway and drift are drawn still. Turn MOTION on in the header to see them move.
          </p>
        )}
      </header>

      <div className="flex flex-col gap-14">
        {VEIL_GROUPS.map((group, g) => (
          <section key={group.letter} aria-labelledby={`veils-${group.letter}`} className="border-t border-[var(--rail)] pt-6">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 pb-6">
              <h2 id={`veils-${group.letter}`} className="fw-kicker">
                <span className="text-t1">{group.letter}</span>
                <span className="text-ink"> · {group.title}</span>
              </h2>
              <p className="text-[0.9375rem] font-light text-ink-2">{group.note}</p>
            </div>
            <ul className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
              {VEIL_OPTIONS.filter((o) => o.group === g).map((option) => (
                <Cell key={option.id} option={option} index={VEIL_OPTIONS.indexOf(option)} settings={settings} live={live} picked={picked === option.id} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

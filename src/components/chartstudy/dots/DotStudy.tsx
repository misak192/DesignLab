/**
 * File: src/components/chartstudy/dots/DotStudy.tsx
 * Description: The /experiments/chart-elements/dots page: 36 dots, no chart, in six rows of six (DOT_ROWS). Each cell is a
 * numbered dot with its name, a sentence and the number of elements it is made of (counted from the page itself, so it is
 * the true cost). Two settings are shared by every dot: the colour (Mix gives each dot one of the four palette colours)
 * and how far the colour is shifted in RGB for the gradient and the shadows. The favourite is saved in localStorage
 * ("fw-chart-dot"). No cell has a background or border.
 */
"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useMotion } from '@/components/display/DisplayProvider';
import { useMounted, useSeen } from '../hooks';
import { createPickStore } from '../pick';
import { PALETTE, mixHex, shiftRgb } from '../shared';
import { DOT_DESIGNS } from './index';
import { DOT_OPTIONS, DOT_ROWS } from './options';
import type { DotOption } from './options';

const { subscribe, getSnapshot, getServerSnapshot, setPick } = createPickStore('fw-chart-dot');

export const SIZE = 64;
export const CYCLE = [PALETTE.cyan, PALETTE.violet, PALETTE.magenta, PALETTE.amber];

export const COLOURS = [
  { id: 'mix', label: 'Mix', hex: null },
  { id: 'cyan', label: 'Cyan', hex: PALETTE.cyan },
  { id: 'violet', label: 'Violet', hex: PALETTE.violet },
  { id: 'magenta', label: 'Magenta', hex: PALETTE.magenta },
  { id: 'amber', label: 'Amber', hex: PALETTE.amber },
] as const;
export const SHIFTS = [
  { id: 'subtle', label: 'Subtle', amt: 24 },
  { id: 'medium', label: 'Medium', amt: 48 },
  { id: 'strong', label: 'Strong', amt: 80 },
] as const;

export interface DotSettings {
  colour: (typeof COLOURS)[number]['id'];
  shift: (typeof SHIFTS)[number]['id'];
}

/** The dot colour and its three RGB cousins: lighter, deeper, and darker still (for hard shadows and inner layers). */
export function palette(c: string, amt: number) {
  return { c, hi: shiftRgb(c, amt), lo: shiftRgb(c, -amt), deep: mixHex(shiftRgb(c, -amt * 1.4), '#000000', 0.35) };
}

function Cell({ option, index, settings, live, picked }: { option: DotOption; index: number; settings: DotSettings; live: boolean; picked: boolean }) {
  const [ref, seen] = useSeen();
  const mounted = useMounted();
  const area = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<number | null>(null);
  const Dot = DOT_DESIGNS[option.id];

  const fixed = COLOURS.find((x) => x.id === settings.colour)?.hex ?? null;
  const amt = SHIFTS.find((x) => x.id === settings.shift)?.amt ?? 48;
  const colours = palette(fixed ?? CYCLE[index % CYCLE.length], amt);

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
      <div ref={area} className="flex h-[140px] items-center justify-center">
        {mounted && <Dot {...colours} s={SIZE} live={live} />}
      </div>
      <p className="min-h-[4.4em] text-[0.875rem] font-normal leading-[1.45] text-ink-2">{option.description}</p>
      <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-5">
        <button type="button" className="fw-pick" aria-pressed={picked} onClick={() => setPick(option.id)}>
          Pick
        </button>
        {picked && <span className="fw-kicker text-t1">Picked</span>}
        {nodes !== null && <span className="fw-tabular text-[0.8125rem] font-light text-ink-3">{nodes === 1 ? '1 element' : `${nodes} elements`}</span>}
      </div>
    </li>
  );
}

export function Options<T extends string>({ label, items, current, onPick }: { label: string; items: readonly { id: T; label: string }[]; current: T; onPick: (id: T) => void }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-6">
      <span className="fw-kicker w-[5.5rem] text-ink-2">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap">
        {items.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={o.id === current} className="fw-opt" onClick={() => onPick(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DotStudy() {
  const live = useMotion().scale > 0;
  const [settings, setSettings] = useState<DotSettings>({ colour: 'mix', shift: 'medium' });
  const picked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pickedOption = DOT_OPTIONS.find((o) => o.id === picked);

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker text-t1">Chart Elements · Dots</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Dots</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">Thirty-six dots. No chart, just the dot.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Every dot is a different design, not one design with an effect added. The gradient is the dot colour moved a little in RGB,
          one way and the other; the shadows are that same off-colour instead of black, hard in some and soft in others. Cutouts,
          fades, glass, tilt and layers follow. Each is made of CSS gradients, masks and shadows on a few elements, with no blur filter
          and no backdrop-filter, and the only motion is transform and opacity, so a chart of hundreds stays cheap. The count under
          each dot is how many elements it really is.
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
            MOTION is off, or your device asks for reduced motion: the pulsing, turning and rippling dots are drawn still. Turn MOTION on in
            the header to see them move.
          </p>
        )}
      </header>

      <div className="flex flex-col gap-12">
        {DOT_ROWS.map((row, r) => (
          <section key={row.title} aria-labelledby={`dots-${r}`} className="border-t border-[var(--rail)] pt-6">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 pb-6">
              <h2 id={`dots-${r}`} className="fw-kicker">
                <span className="text-t1">{r + 1}</span>
                <span className="text-ink"> · {row.title}</span>
              </h2>
              <p className="text-[0.9375rem] font-light text-ink-2">{row.note}</p>
            </div>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-10 xl:grid-cols-6">
              {DOT_OPTIONS.filter((o) => o.row === r).map((option) => (
                <Cell key={option.id} option={option} index={DOT_OPTIONS.indexOf(option)} settings={settings} live={live} picked={picked === option.id} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

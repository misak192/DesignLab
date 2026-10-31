/**
 * File: src/components/tabstudy/TabStudy.tsx
 * Description: The /tab-selection page: 36 ways to show a selected tab, each in its own cell with a live row of
 * January to April. Every option is borderless and backgroundless. The selection of each row is separate state; the
 * favourite option is saved in localStorage ("fw-tab-pick", see src/lib/tabstudy/pick.ts).
 */
"use client";
import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useMotion } from '@/components/display/DisplayProvider';
import { TAB_OPTIONS } from '@/lib/tabstudy/options';
import { getServerSnapshot, getSnapshot, setPick, subscribe } from '@/lib/tabstudy/pick';
import TabRow from './TabRow';

const pad = (n: number) => String(n).padStart(2, '0');

export default function TabStudy({ number }: { number: number }) {
  const off = useMotion().scale === 0;
  // One object holds every row's selected tab, so choosing in one option never moves another.
  const [selected, setSelected] = useState<Record<string, number>>({});
  const picked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pickedOption = TAB_OPTIONS.find((o) => o.id === picked);

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker fw-tabular text-t1">{number > 0 ? pad(number) : '··'} Experiments</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Tab Selection</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">Thirty-six ways to say: this one.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          No border, no fill, no card edge: the selected tab is shown by type, colour, light, motion, a hairline or a few
          particles, and the page background stays visible behind it. Tap any tab to move the selection and try the
          effect; each row is independent. Pick the one you want as the FrissonWorks default.
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
        </div>
        {off && (
          <p className="max-w-[62ch] text-[0.9375rem] font-light text-ink-2">
            MOTION is off, or your device asks for reduced motion: every option shows only a colour change. Turn MOTION
            on in the header to see the effects.
          </p>
        )}
      </header>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 md:gap-x-10 xl:grid-cols-6">
        {TAB_OPTIONS.map((option) => {
          const isPicked = picked === option.id;
          return (
            <li key={option.id} className="flex min-w-0 flex-col gap-3 border-t border-[var(--rail)] pt-5">
              <p className="fw-kicker">
                <span className="fw-tabular text-t1">{option.id}</span>
                <span className="text-ink-2"> · {option.category}</span>
              </p>
              <h2 className="fw-big text-[20px] font-light leading-[1.2] text-ink">{option.name}</h2>

              <TabRow option={option} selected={selected[option.id] ?? 0} onSelect={(i) => setSelected((s) => ({ ...s, [option.id]: i }))} />

              <p className="flex-1 text-[0.875rem] font-normal leading-[1.45] text-ink-2">{option.description}</p>

              <div className="flex min-h-[48px] items-baseline gap-4">
                <button type="button" className="fw-pick" aria-pressed={isPicked} onClick={() => setPick(isPicked ? null : option.id)}>
                  {isPicked ? 'Unpick' : 'Pick'}
                </button>
                {isPicked && <span className="fw-kicker text-t1">Picked</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

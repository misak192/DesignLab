/**
 * File: src/components/master/LabMaster.tsx
 * Description: The /master page. Top: the decision matrix (styles across, rows down), the place where a lab design is fixed for each
 * style. Then the Settings pointer (the settings now live on /settings), the style switcher (it sets the real Style setting, but
 * nothing reads it until the designs are attached), and one section per component, all placeholders. Features are attached to the
 * placeholders one by one as the matrix cells are chosen.
 */
"use client";
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useDisplay } from '@/components/display/DisplayProvider';
import { MOTION_STYLES } from '@/lib/display/settings';
import { MASTER_MOTIONS, MASTER_SECTIONS } from '@/lib/master/skeleton';
import MatrixTable from './MatrixTable';
import {
  ButtonsSample,
  KnobsSample,
  SlidersSample,
  SteppersSample,
  TabsSample,
  TimersSample,
  TitlesSample,
  VotingSample,
} from './Samples';

const SAMPLES: Record<string, ReactNode> = {
  titles: <TitlesSample />,
  buttons: <ButtonsSample />,
  sliders: <SlidersSample />,
  knobs: <KnobsSample />,
  timers: <TimersSample />,
  steppers: <SteppersSample />,
  voting: <VotingSample />,
  tabs: <TabsSample />,
};

const GROUP_LINKS = [
  { tab: 'look', name: 'Look', what: 'Light, colour, background, titles' },
  { tab: 'text', name: 'Text', what: 'Size, type, shadow' },
  { tab: 'motion', name: 'Motion', what: 'Style and amount' },
];

const pad = (n: number) => String(n).padStart(2, '0');

export default function LabMaster() {
  const { settings, set } = useDisplay();
  const active = MASTER_MOTIONS.find((m) => m.id === settings.style) ?? MASTER_MOTIONS[0];

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Lab Master</h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          The finished designs for the whole FrissonWorks empire, in one place.
        </p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          The matrix below is the document: for each style, which lab design every row uses. The placeholders further down get their
          designs attached as the cells are chosen.
        </p>
      </header>

      {/* The decision matrix: styles across, rows down. Filled in as designs are chosen. */}
      <MatrixTable />

      {/* Settings now live on their own page, in three groups. */}
      <section aria-labelledby="m-settings" className="flex flex-col gap-4 border-t border-[var(--rail)] py-10">
        <h2 id="m-settings" className="fw-kicker text-ink">
          Settings
        </h2>
        <p className="max-w-[62ch] text-[0.9375rem] font-light text-ink-2">
          Every setting has its own page now, in three groups, with a live preview. The header keeps only the quick ones.
        </p>
        <ul className="flex flex-col">
          {GROUP_LINKS.map((g) => (
            <li key={g.tab} className="grid items-center gap-x-6 sm:grid-cols-[120px_1fr]">
              <Link href={g.tab === 'look' ? '/settings' : `/settings?tab=${g.tab}`} className="fw-sk-btn w-fit" data-kind="primary">
                {g.name} →
              </Link>
              <span className="text-[0.9375rem] font-light text-ink-2">{g.what}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* The style switcher: sets the real Style setting. Nothing reads it yet, so nothing else changes. */}
      <section aria-labelledby="m-motion" className="flex flex-col gap-4 border-t border-[var(--rail)] py-10">
        <h2 id="m-motion" className="fw-kicker text-ink">
          Style
        </h2>
        <div role="tablist" aria-label="Motion style" className="flex flex-wrap gap-x-6">
          {MASTER_MOTIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={m.id === settings.style}
              className="fw-ts-tab"
              onClick={() => set({ style: m.id as (typeof MOTION_STYLES)[number] })}
            >
              <span className="relative whitespace-nowrap">
                {m.name}
                {m.id === settings.style && <span aria-hidden className="absolute inset-x-0 -bottom-1 block h-px bg-t1" />}
              </span>
            </button>
          ))}
        </div>
        <p className="max-w-[56ch] text-[0.9375rem] font-light text-ink-2">
          {active.blurb} <span className="text-ink-3">Saved as the Style setting. Only the AUTO hero title follows it so far; the other designs are attached as the matrix is chosen.</span>
        </p>
      </section>

      {/* The components */}
      {MASTER_SECTIONS.map((s, i) => (
        <section key={s.id} aria-labelledby={`m-${s.id}`} className="grid gap-x-10 gap-y-6 border-t border-[var(--rail)] py-10 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col gap-2">
            <p className="fw-kicker fw-tabular text-t1">{pad(i + 1)}</p>
            <h2 id={`m-${s.id}`} className="fw-big text-[22px] font-light leading-[1.2] text-ink">
              {s.name}
            </h2>
            <p className="max-w-[28ch] text-[0.875rem] font-normal text-ink-3">{s.note}</p>
          </div>
          <div className="min-w-0">{SAMPLES[s.id]}</div>
        </section>
      ))}
    </main>
  );
}

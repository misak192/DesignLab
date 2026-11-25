/**
 * File: src/components/master/LabMaster.tsx
 * Description: The /master page. A sticky switcher for the motion style (Plain, Kinetic, Slice, Stars, Zoom: it sets the real `style`
 * setting, so the AUTO hero title follows it everywhere), and below it every component drawn live in that style: titles, buttons, tabs,
 * lines, sliders, knobs, timers, up and down, voting and the comment box. Then the decision matrix (which lab design each row uses under
 * each style, and what Michal has chosen) and a pointer to /settings. The samples are in ElementsA.tsx and ElementsB.tsx, the pieces they
 * are built from in kit.tsx.
 */
"use client";
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useDisplay } from '@/components/display/DisplayProvider';
import { MOTION_STYLES, type MotionStyle } from '@/lib/display/settings';
import { MASTER_MOTIONS, MASTER_SECTIONS } from '@/lib/master/skeleton';
import { StyleButtons, StyleLines, StyleTabs, StyleTitle } from './ElementsA';
import { StyleComposer, StyleKnobs, StyleSliders, StyleSteppers, StyleTimers, StyleVotes } from './ElementsB';
import MatrixTable from './MatrixTable';

const SAMPLE: Record<string, (mode: MotionStyle) => ReactNode> = {
  titles: (m) => <StyleTitle mode={m} />,
  buttons: (m) => <StyleButtons mode={m} />,
  tabs: (m) => <StyleTabs mode={m} />,
  lines: (m) => <StyleLines mode={m} />,
  sliders: (m) => <StyleSliders mode={m} />,
  knobs: (m) => <StyleKnobs mode={m} />,
  timers: (m) => <StyleTimers mode={m} />,
  steppers: (m) => <StyleSteppers mode={m} />,
  voting: (m) => <StyleVotes mode={m} />,
  composer: () => <StyleComposer />,
};

/** What a sample does in each style, for the four rows Michal described. */
const NOTE: Record<MotionStyle, Partial<Record<string, string>>> = {
  plain: {
    buttons: 'Press: the word gets its reflection underneath, then it fades.',
    tabs: 'The selected tab stands on its reflection.',
    sliders: 'The ball has a reflection. The track is the Mist line.',
    steppers: 'The old number fades up and away, the new one rises in.',
  },
  kinetic: {
    buttons: 'Press: the letters rise in turn, a wave.',
    tabs: 'The first letter of the selected tab grows bigger and takes the accent.',
    sliders: 'The ball springs bigger while you hold it.',
    steppers: 'The number rolls like a counter.',
  },
  slice: {
    buttons: 'The word rests cut in strips. Press: the strips join, then cut again.',
    tabs: 'The selected tab is the cut one.',
    sliders: 'The ball is cut in strips; hold it and they join.',
    steppers: 'The number is cut: the old strips slide away and the new ones slide in.',
  },
  stars: {
    buttons: 'LoreLyst’s stars behind the word. Press: they blow apart, fade, and form again.',
    tabs: 'Glowing dust drifts off the selected tab.',
    sliders: 'The ball is a star.',
    steppers: 'The old number dissolves, the new one clears out of a blur.',
  },
  zoom: {
    buttons: 'Press: the word zooms away and comes back from nothing.',
    tabs: 'The selected tab moves toward you, with a soft shadow.',
    sliders: 'The ball comes toward you while you hold it.',
    steppers: 'The new number flies in from far and the old one shrinks away.',
  },
};

export default function LabMaster() {
  const { settings, set } = useDisplay();
  const mode = settings.style;
  const active = MASTER_MOTIONS.find((m) => m.id === mode) ?? MASTER_MOTIONS[0];

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-8">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Lab Master</h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">Pick a style. Everything below is drawn in it.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          The finished designs for the whole FrissonWorks empire, one style at a time. Every sample is live: press, drag and count. The matrix of
          what is chosen is <a href="#matrix" className="text-t1 underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current">further down</a>.
        </p>
      </header>

      {/* The style switcher. It stays at the top while you scroll, so any sample can be seen in any style. */}
      <div
        className="sticky top-0 z-20 -mx-7 flex flex-col gap-1 px-7 pb-3 pt-2"
        style={{ background: 'color-mix(in srgb, var(--canvas) 78%, transparent)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      >
        <div role="tablist" aria-label="Motion style" className="flex flex-wrap gap-x-7">
          {MASTER_MOTIONS.map((m) => (
            <button key={m.id} type="button" role="tab" aria-selected={m.id === mode} className="fw-ts-tab" onClick={() => set({ style: m.id as (typeof MOTION_STYLES)[number] })}>
              <span className="relative whitespace-nowrap">
                {m.name}
                {m.id === mode && <span aria-hidden className="absolute inset-x-0 -bottom-1 block h-px bg-t1" />}
              </span>
            </button>
          ))}
        </div>
        <p className="max-w-[70ch] text-[0.875rem] font-light text-ink-2">{active.blurb}</p>
      </div>

      {/* The components, live, in the chosen style */}
      {MASTER_SECTIONS.map((s) => (
        <section key={s.id} aria-labelledby={`m-${s.id}`} className="grid gap-x-10 gap-y-6 border-t border-[var(--rail)] py-10 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col gap-2">
            <h2 id={`m-${s.id}`} className="fw-big text-[22px] font-light leading-[1.2] text-ink">
              {s.name}
            </h2>
            <p className="max-w-[30ch] text-[0.875rem] font-normal text-ink-3">{NOTE[mode][s.id] ?? s.note}</p>
          </div>
          <div className="min-w-0">{SAMPLE[s.id](mode)}</div>
        </section>
      ))}

      {/* The decision matrix: which lab design each row uses under each style, and what is chosen */}
      <div id="matrix" className="scroll-mt-24" />
      <MatrixTable />

      <section aria-labelledby="m-settings" className="flex flex-col gap-4 border-t border-[var(--rail)] py-10">
        <h2 id="m-settings" className="fw-kicker text-ink">
          Settings
        </h2>
        <p className="max-w-[62ch] text-[0.9375rem] font-light text-ink-2">
          Every setting has its own page, in three groups, with a live preview. The header keeps only the quick ones.
        </p>
        <Link href="/settings" className="fw-sk-btn w-fit" data-kind="primary">
          All settings →
        </Link>
      </section>
    </main>
  );
}

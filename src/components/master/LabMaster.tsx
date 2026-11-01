/**
 * File: src/components/master/LabMaster.tsx
 * Description: The /master page, a skeleton. Top: every Sovereign setting as a row of buttons (none wired). Then the motion
 * tab switcher, which only remembers which tab is lit and changes nothing else yet. Then one section per component, all
 * placeholders. The aim is to see the whole structure first; features are attached to it one by one afterwards.
 */
"use client";
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { BG_ENGINES, BG_INTENSITIES, BG_LABEL } from '@/lib/display/background/engines';
import { DEFAULT_SETTINGS, SKINS, TEXT_SCALES, TYPE_STYLES } from '@/lib/display/settings';
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

interface Group {
  label: string;
  options: string[];
  /** Lit by default, as in the app's defaults. Display only. */
  current: string;
}

const D = DEFAULT_SETTINGS;
const GROUPS: Group[] = [
  { label: 'Light', options: ['Dark', 'Light'], current: 'Dark' },
  { label: 'Colour', options: SKINS.map((s) => s.toUpperCase()), current: D.skin.toUpperCase() },
  { label: 'Text', options: TEXT_SCALES.map((s) => s.toUpperCase()), current: D.text.toUpperCase() },
  { label: 'Type', options: TYPE_STYLES.map((s) => s.toUpperCase()), current: D.type.toUpperCase() },
  { label: 'Background', options: BG_ENGINES.map((e) => BG_LABEL[e]), current: BG_LABEL[D.bgEngine] },
  { label: 'Intensity', options: BG_INTENSITIES.map((i) => i.toUpperCase()), current: D.bgIntensity.toUpperCase() },
  { label: 'Shadow', options: ['On', 'Off'], current: 'On' },
];

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

const pad = (n: number) => String(n).padStart(2, '0');

export default function LabMaster() {
  const [motion, setMotion] = useState(MASTER_MOTIONS[1].id);
  const active = MASTER_MOTIONS.find((m) => m.id === motion) ?? MASTER_MOTIONS[0];

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
          Skeleton. The buttons below do nothing yet: each setting, motion and component is a place to attach a design from
          the lab once it is decided.
        </p>
      </header>

      {/* The decision matrix: motions across, components down. Filled in as designs are chosen. */}
      <MatrixTable />

      {/* Settings: every Sovereign setting, as options (display only) */}
      <section aria-labelledby="m-settings" className="flex flex-col gap-4 border-t border-[var(--rail)] py-10">
        <h2 id="m-settings" className="fw-kicker text-ink">
          Settings
        </h2>
        <div className="flex flex-col">
          {GROUPS.map((g) => (
            <div key={g.label} className="grid items-start gap-x-6 sm:grid-cols-[120px_1fr]">
              <span className="fw-kicker flex min-h-[48px] items-center text-ink-2">{g.label}</span>
              <div role="radiogroup" aria-label={g.label} className="flex flex-wrap gap-x-1">
                {g.options.map((o) => (
                  <button key={o} type="button" role="radio" aria-checked={o === g.current} className="fw-opt">
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Motion: the tab switcher. It lights a tab and nothing else yet. */}
      <section aria-labelledby="m-motion" className="flex flex-col gap-4 border-t border-[var(--rail)] py-10">
        <h2 id="m-motion" className="fw-kicker text-ink">
          Motion
        </h2>
        <div role="tablist" aria-label="Motion" className="flex flex-wrap gap-x-6">
          {MASTER_MOTIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={m.id === motion}
              className="fw-ts-tab"
              onClick={() => setMotion(m.id)}
            >
              <span className="relative whitespace-nowrap">
                {m.name}
                {m.id === motion && <span aria-hidden className="absolute inset-x-0 -bottom-1 block h-px bg-t1" />}
              </span>
            </button>
          ))}
        </div>
        <p className="max-w-[56ch] text-[0.9375rem] font-light text-ink-2">
          {active.blurb} <span className="text-ink-3">Not wired: everything below looks the same whichever tab is lit.</span>
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

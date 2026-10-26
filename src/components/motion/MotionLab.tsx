/**
 * File: src/components/motion/MotionLab.tsx
 * Description: The /motion page: where MOTION is designed. The four levels (OFF, NORMAL, COLOUR, OTT) are numbers in
 * src/lib/motion/presets.ts; every demo here reads them, so choosing a level changes all of it the same way, and
 * the same numbers drive the comments and the cards. Kinetic type and parallax first, as they matter most.
 */
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useDisplay, useMotion } from '@/components/display/DisplayProvider';
import { MOTION_LEVELS } from '@/lib/display/settings';
import { MOTION_BLURB, MOTION_PRESETS } from '@/lib/motion/presets';
import {
  ColourDrift,
  KineticWords,
  PointerParallax,
  PressText,
  ProximityText,
  Replay,
  RollingCount,
  ScrollParallax,
  Section,
  SpreadTitle,
  StaggerList,
  VelocityMarquee,
} from './parts';

const FEEL_ROWS: [string, (p: (typeof MOTION_PRESETS)['normal']) => string][] = [
  ['Travel on arrival', (p) => `${p.rise}px`],
  ['Blur on arrival', (p) => `${p.blur}px`],
  ['Stagger', (p) => `${p.stagger}s`],
  ['Parallax', (p) => `×${p.parallax}`],
  ['Tilt', (p) => `${p.tilt}°`],
  ['Spring', (p) => (p.spring ? 'overshoots' : p.scale ? 'long ease' : 'none')],
  ['Colour', (p) => (p.colour ? 'glows and drifts' : '—')],
  ['Type fringe', (p) => (p.glitch ? 'on' : '—')],
];

export default function MotionLab() {
  const { settings, set } = useDisplay();
  const m = useMotion();
  const [words, setWords] = useState(0);
  const [list, setList] = useState(0);

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-8">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Motion</h1>
        <p className="fw-big max-w-[28ch] text-[29px] font-light leading-[1.25] text-ink">
          One switch, four feelings, the same numbers everywhere.
        </p>
      </header>

      {/* 01 · the level */}
      <Section n="01" title="Level" statement="Pick how much the whole lab moves.">
        <div role="radiogroup" aria-label="Motion level" className="grid gap-x-12 gap-y-2 sm:grid-cols-2">
          {MOTION_LEVELS.map((level) => {
            const selected = settings.motion === level;
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set({ motion: level })}
                className="flex min-h-[48px] flex-col gap-1 py-3 text-left"
              >
                <span
                  className="fw-big w-fit border-b text-[22px] font-light uppercase tracking-[0.08em] transition-colors"
                  style={{ color: selected ? 'var(--t1)' : 'var(--ink)', borderColor: selected ? 'var(--t1)' : 'transparent' }}
                >
                  {level}
                </span>
                <span className="max-w-[40ch] text-[0.875rem] font-normal text-ink-2">{MOTION_BLURB[level]}</span>
              </button>
            );
          })}
        </div>

        <dl className="grid max-w-[640px] grid-cols-[1fr_auto] gap-x-8 gap-y-1 text-[0.875rem]">
          {FEEL_ROWS.map(([label, read]) => (
            <div key={label} className="contents">
              <dt className="fw-kicker text-ink-2">{label}</dt>
              <dd className="fw-tabular text-right text-t1">{read(m)}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* 02 · kinetic type */}
      <Section n="02" title="Kinetic type" statement="Words that arrive, titles that breathe, letters that feel you coming.">
        <div className="flex flex-col gap-3">
          <p className="fw-big text-[clamp(34px,6.4vw,76px)] font-extralight leading-[1.1] text-ink">
            <KineticWords text="I want to know what I don't know." replay={words} />
          </p>
          <Replay onClick={() => setWords((n) => n + 1)} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="fw-kicker text-ink-2">Hover the title</span>
          <SpreadTitle text="Frissonworks" />
        </div>

        <div className="flex flex-col gap-1">
          <span className="fw-kicker text-ink-2">Move the pointer over the letters</span>
          <ProximityText text="Everything leans." />
        </div>

        <div className="flex flex-col gap-1">
          <span className="fw-kicker text-ink-2">Scroll fast</span>
          <VelocityMarquee text="Kinetic" />
        </div>

        <div className="flex flex-col gap-1">
          <span className="fw-kicker text-ink-2">Colour (COLOUR and OTT)</span>
          <ColourDrift text="Colour moves." />
        </div>
      </Section>

      {/* 03 · parallax */}
      <Section n="03" title="Parallax" statement="Depth from scroll and from the pointer.">
        <div className="flex flex-col gap-2">
          <span className="fw-kicker text-ink-2">Scroll through it</span>
          <ScrollParallax />
        </div>
        <div className="flex flex-col gap-2">
          <span className="fw-kicker text-ink-2">Move the pointer across it</span>
          <PointerParallax />
        </div>
      </Section>

      {/* 04 · feedback */}
      <Section n="04" title="Feedback" statement="Small things that answer you.">
        <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
          <PressText>Press me</PressText>
          <RollingCount />
        </div>
        <div className="flex flex-col gap-2">
          <StaggerList replay={list} />
          <Replay onClick={() => setList((n) => n + 1)} />
        </div>
      </Section>
    </main>
  );
}

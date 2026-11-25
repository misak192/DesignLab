/**
 * File: src/components/master/ElementsA.tsx
 * Description: Lab Master samples, part one: titles, buttons, tabs and lines, each drawn in the way of the chosen motion style.
 *   Plain   the word with its reflection underneath (Mirror); the Vogue title with the hero behind it, offset down so it bleeds under the
 *           subtitle.
 *   Kinetic the letters are alive: a wave on press, the first letter of the selected tab grows.
 *   Slice   the word is already cut in strips; a press joins them (a button), the selected tab is the cut one.
 *   Stars   LoreLyst's constellation behind the button, which dissipates on press and re-forms; dust drifts off the selected tab.
 *   Zoom    a press zooms the word away and back; the selected tab comes toward you.
 * All of it is local to Lab Master: the lab pages it borrows from are untouched.
 */
"use client";
import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import ConstellationField from '@/components/backgrounds/ConstellationField';
import { useMotion } from '@/components/display/DisplayProvider';
import SizedHero from '@/components/hero/SizedHero';
import { EFFECTS } from '@/components/tabstudy/effects';
import type { Effect, EffectProps } from '@/components/tabstudy/types';
import type { MotionStyle } from '@/lib/display/settings';
import { ArriveWord, LabLine, LINE_NAME, Mirrored, Sliced, usePress } from './kit';

/* ---- titles ---- */

/** The Vogue title arrives in the way of the style; the hero starts below it and runs under the subtitle. */
export function StyleTitle({ mode }: { mode: MotionStyle }) {
  const [replay, setReplay] = useState(0);
  return (
    <div className="flex flex-col">
      <p className="fw-kicker text-t1">Kicker</p>
      <h3 className="fw-vogue mt-3 text-[clamp(28px,6vw,56px)] leading-[1.1] text-ink">
        <ArriveWord key={`${mode}-${replay}`} text="Vogue title" mode={mode} />
      </h3>
      <SizedHero word="Frissonworks" base={130} overlap={0.5} className="-mt-5 pb-14">
        <div className="flex flex-col gap-3 pt-3">
          <p className="fw-big max-w-[28ch] text-[29px] font-light leading-[1.25] text-ink">The statement sits over the hero.</p>
          <p className="max-w-[54ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
            The big word starts lower than the title and bleeds down under the text, so there are two titles at once: the clear one, and the
            one that is only light.
          </p>
        </div>
      </SizedHero>
      <button type="button" className="fw-pick w-fit" onClick={() => setReplay((n) => n + 1)}>
        Replay the arrival
      </button>
    </div>
  );
}

/* ---- buttons ---- */

function ZoomWord({ on, children }: { on: boolean; children: ReactNode }) {
  const m = useMotion();
  return (
    <motion.span
      className="inline-block"
      animate={on && m.scale ? { scale: [1, 3.4, 0.35, 1], opacity: [1, 0, 0, 1], filter: ['blur(0px)', 'blur(9px)', 'blur(4px)', 'blur(0px)'] } : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
      transition={on ? { duration: 0.95 * m.scale, times: [0, 0.4, 0.55, 1], ease: 'easeInOut' } : { duration: 0 }}
    >
      {children}
    </motion.span>
  );
}

function PressButton({ mode, label, kind, disabled }: { mode: MotionStyle; label: string; kind?: 'primary'; disabled?: boolean }) {
  const [on, fire] = usePress(mode === 'plain' ? 1700 : 1000);
  const [burst, setBurst] = useState(0);
  const off = useMotion().scale === 0;
  const Wave = EFFECTS['25'];
  const press = () => {
    fire();
    setBurst((b) => b + 1);
  };

  let inner: ReactNode = label;
  if (!disabled && !off) {
    if (mode === 'plain') inner = <Mirrored on={on}>{label}</Mirrored>;
    else if (mode === 'kinetic') inner = <Wave label={label} selected={on} scope="lm-btn" />;
    else if (mode === 'slice') inner = <Sliced sliced={!on}>{label}</Sliced>;
    else if (mode === 'zoom') inner = <ZoomWord on={on}>{label}</ZoomWord>;
  }
  const button = (
    <button type="button" className="fw-sk-btn" data-kind={kind} disabled={disabled} aria-label={label} onClick={disabled ? undefined : press}>
      {inner}
    </button>
  );
  // LoreLyst's constellation: stars behind the word, always lit, blown apart by a press, then re-forming.
  if (mode === 'stars' && !disabled) {
    return (
      <span className="relative isolate inline-block px-10 py-3">
        <ConstellationField lit burst={burst} />
        {button}
      </span>
    );
  }
  return <span className="inline-block px-2 pb-8">{button}</span>;
}

export function StyleButtons({ mode }: { mode: MotionStyle }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <PressButton mode={mode} label="Primary" kind="primary" />
      <PressButton mode={mode} label="Quiet" />
      <PressButton mode={mode} label="Disabled" disabled />
    </div>
  );
}

/* ---- tabs ---- */

const MirrorTab = ({ label, selected }: EffectProps) => <Mirrored on={selected}>{label}</Mirrored>;
const SliceTab = ({ label, selected }: EffectProps) => (
  <Sliced sliced={selected} amp={3.5}>
    {label}
  </Sliced>
);

/** The selected tab, by style: mirrored, first letter grown, sliced, dust drifting off it, moved toward you. */
const TAB: Record<MotionStyle, Effect> = { plain: MirrorTab, kinetic: EFFECTS['30'], slice: SliceTab, stars: EFFECTS['36'], zoom: EFFECTS['35'] };

export function StyleTabs({ mode }: { mode: MotionStyle }) {
  const [sel, setSel] = useState(0);
  const off = useMotion().scale === 0;
  const Selected = TAB[mode];
  return (
    <div role="tablist" aria-label="Sample tabs" className="flex flex-wrap gap-x-6 pb-8">
      {['January', 'February', 'March', 'April'].map((label, i) => (
        <button key={label} type="button" role="tab" aria-selected={i === sel} aria-label={label} data-plain={off} className="fw-ts-tab" onClick={() => setSel(i)}>
          {off ? <span className="whitespace-nowrap">{label}</span> : <Selected label={label} selected={i === sel} scope={`lm-${mode}`} />}
        </button>
      ))}
    </div>
  );
}

/* ---- lines ---- */

export function StyleLines({ mode }: { mode: MotionStyle }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-[300px] max-w-full pt-7">
        <span className="pointer-events-none absolute left-0 top-0 whitespace-nowrap text-[0.9375rem] font-normal text-ink">ES Employment</span>
        <LabLine mode={mode} len={300} />
      </div>
      <p className="max-w-[48ch] text-[0.875rem] font-normal text-ink-3">
        {LINE_NAME[mode]}, thin and lens-shaped at both ends. The same line is the track of the sliders and the progress under the timers.
      </p>
    </div>
  );
}

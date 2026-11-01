/**
 * File: src/components/landing/LandingCategories.tsx
 * Description: The categories of the lab, drawn in whichever layout was chosen on /landing: INDEX (each name is a hero title in the
 * saved hero design, led by the category's own colour), CARDS (the card design chosen on /cards), POSTER (huge thin Vogue names, one
 * per row) and COMPACT (one line each, for finding things fast). All follow the poster rules: no box, fill or border behind text,
 * only hairlines. They read MOTION: OFF is still. `preview` draws them on /landing without navigating.
 */
"use client";
import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useDisplay, useMotion } from '@/components/display/DisplayProvider';
import { CARD_COMPONENTS } from '@/components/cards/variants';
import HeroTitle from '@/components/hero/HeroTitle';
import { projectTint } from '@/lib/hero/heroes';
import type { LandingStyle } from '@/lib/display/settings';
import { asExperiment, countLabel } from '@/lib/landing/search';
import type { CategoryResult } from '@/lib/landing/search';
import { transitionFor } from '@/lib/motion/presets';

const pad = (i: number) => String(i + 1).padStart(2, '0');

function Entry({ r, preview, className, children }: { r: CategoryResult; preview?: boolean; className?: string; children: ReactNode }) {
  if (preview) {
    return (
      <div tabIndex={0} className={className}>
        {children}
      </div>
    );
  }
  return (
    <Link href={`/category/${r.category.id}`} className={className}>
      {children}
    </Link>
  );
}

/** The arrival of a row: rises out of a blur, one after another, at the speed MOTION allows. */
function Rise({ order, children }: { order: number; children: ReactNode }) {
  const m = useMotion();
  return (
    <motion.li
      initial={m.scale ? { opacity: 0, y: m.rise, filter: `blur(${m.blur}px)` } : false}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={transitionFor(m, 0.7, 0.05 + order * m.stagger)}
    >
      {children}
    </motion.li>
  );
}

/** Which experiments matched the search, if the search is what brought this category here. */
function Hits({ r }: { r: CategoryResult }) {
  if (r.hits.length === 0) return null;
  return <p className="text-[0.9375rem] font-normal leading-[1.45] text-t3">Matches: {r.hits.map((h) => h.title).join(' · ')}</p>;
}

/** A hairline that fills with colour on hover or focus, and an arrow. */
function Rail() {
  return (
    <span className="mt-1 flex items-center gap-4" aria-hidden>
      <span className="relative block h-px flex-1 bg-rail">
        <span className="absolute inset-y-0 left-0 block w-[14%] bg-t1 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full group-focus-visible:w-full" />
      </span>
      <span className="fw-big text-[22px] font-light text-t1 transition-transform duration-500 group-hover:translate-x-1.5">→</span>
    </span>
  );
}

/* 1 · INDEX: the name is a hero title behind its own sentence, like the Nexus list. The hero title is decoration, so the name is
   also written in the kicker line: it stays readable and named for screen readers whatever hero design is chosen. */
function IndexRow({ r, preview, order }: { r: CategoryResult; preview?: boolean; order: number }) {
  const { settings } = useDisplay();
  return (
    <Rise order={order}>
      <Entry r={r} preview={preview} className="group block min-h-[48px] outline-offset-8">
        <HeroTitle word={r.category.name} variant={settings.hero} tint={projectTint(r.category.colour, settings.light)} size={88} crop={false} overlap={0.38} className="pb-10">
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-baseline gap-3">
              <span className="fw-kicker fw-tabular text-t1">{pad(r.index)}</span>
              <span className="fw-kicker text-ink">{r.category.name}</span>
              <span className="fw-kicker text-ink-2">{countLabel(r.experiments.length)}</span>
            </div>
            <p className="max-w-[52ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">{r.category.blurb}</p>
            <Hits r={r} />
            <Rail />
          </div>
        </HeroTitle>
      </Entry>
    </Rise>
  );
}

/* 2 · POSTER: the name as a huge thin Vogue title, one to a row. */
function PosterRow({ r, preview, order }: { r: CategoryResult; preview?: boolean; order: number }) {
  return (
    <Rise order={order}>
      <Entry r={r} preview={preview} className="group flex min-h-[48px] flex-col gap-4 border-t border-[var(--rail)] py-10 outline-offset-8">
        <div className="flex items-baseline gap-4">
          <span className="fw-kicker fw-tabular text-t1">{pad(r.index)}</span>
          <span className="fw-kicker text-ink-2">{countLabel(r.experiments.length)}</span>
        </div>
        <h2 className="fw-vogue text-[clamp(32px,9vw,100px)] leading-[1.05] text-ink transition-colors duration-500 group-hover:text-t1 group-focus-visible:text-t1">{r.category.name}</h2>
        <p className="max-w-[52ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">{r.category.blurb}</p>
        <Hits r={r} />
      </Entry>
    </Rise>
  );
}

/* 3 · COMPACT: one line each. */
function CompactRow({ r, preview, order }: { r: CategoryResult; preview?: boolean; order: number }) {
  return (
    <Rise order={order}>
      <Entry r={r} preview={preview} className="group grid min-h-[56px] grid-cols-[2.5rem_1fr] items-baseline gap-x-5 gap-y-1 border-t border-[var(--rail)] py-4 outline-offset-8 sm:grid-cols-[2.5rem_11rem_10.5rem_1fr]">
        <span className="fw-kicker fw-tabular text-t1">{pad(r.index)}</span>
        <span className="fw-big text-[22px] font-light leading-[1.2] text-ink transition-colors duration-300 group-hover:text-t1 group-focus-visible:text-t1">{r.category.name}</span>
        <span className="fw-kicker col-start-2 whitespace-nowrap text-ink-2 sm:col-start-auto">{countLabel(r.experiments.length)}</span>
        <span className="col-start-2 flex flex-col gap-1 text-[0.9375rem] font-light leading-[1.45] text-ink-2 sm:col-start-auto">
          {r.category.blurb}
          <Hits r={r} />
        </span>
      </Entry>
    </Rise>
  );
}

export default function LandingCategories({ layout, results, preview, empty }: { layout: LandingStyle; results: CategoryResult[]; preview?: boolean; empty?: ReactNode }) {
  const { settings } = useDisplay();
  if (results.length === 0) return <>{empty}</>;

  // Keyed by layout and by the card design, so switching either replays the arrival.
  if (layout === 'cards') {
    const Card = CARD_COMPONENTS[settings.card];
    return (
      <ul key={`cards-${settings.card}`} className="grid gap-x-16 gap-y-16 sm:grid-cols-2">
        {results.map((r) => (
          <Card key={r.category.id} experiment={asExperiment(r)} index={r.index} preview={preview} />
        ))}
      </ul>
    );
  }

  const Row = layout === 'index' ? IndexRow : layout === 'poster' ? PosterRow : CompactRow;
  return (
    <ul key={`${layout}-${settings.hero}`} className={layout === 'index' ? 'flex flex-col gap-4' : 'flex flex-col border-b border-[var(--rail)]'}>
      {results.map((r, n) => (
        <Row key={r.category.id} r={r} preview={preview} order={n} />
      ))}
    </ul>
  );
}

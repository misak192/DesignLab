/**
 * File: src/components/landing/LandingCategories.tsx
 * Description: The categories of the lab, drawn in whichever layout was chosen on /landing. Eight layouts: INDEX (each name a hero
 * title in the saved design, led by the category's own colour), CARDS (the card design chosen on /cards), POSTER (huge thin Vogue
 * names, one per row), COMPACT (one line each), DIRECTORY (every category with its experiments listed, in columns: any page in one
 * tap), SPLIT (the names on the left, the one you point at open on the right), ACCORDION (a row opens to show its experiments) and
 * WALL (the names as one typographic wall, sized by how much is inside). All follow the poster rules: no box, fill or border behind
 * text, only hairlines. No row numbers: they added noise. They read MOTION: OFF is still. `preview` draws them on /landing without
 * navigating.
 */
"use client";
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useDisplay, useMotion } from '@/components/display/DisplayProvider';
import { CARD_COMPONENTS } from '@/components/cards/variants';
import SizedHero from '@/components/hero/SizedHero';
import { projectTint } from '@/lib/hero/heroes';
import { resolveHero, type LandingStyle } from '@/lib/display/settings';
import type { Experiment } from '@/lib/experiments';
import { asExperiment, countLabel } from '@/lib/landing/search';
import type { CategoryResult } from '@/lib/landing/search';
import { transitionFor } from '@/lib/motion/presets';

/** A link, or on /landing a focusable stand-in that goes nowhere. */
function Go({ href, preview, className, children, onFocus, onMouseEnter }: { href: string; preview?: boolean; className?: string; children: ReactNode; onFocus?: () => void; onMouseEnter?: () => void }) {
  if (preview) {
    return (
      <div tabIndex={0} className={className} onFocus={onFocus} onMouseEnter={onMouseEnter}>
        {children}
      </div>
    );
  }
  return (
    <Link href={href} className={className} onFocus={onFocus} onMouseEnter={onMouseEnter}>
      {children}
    </Link>
  );
}

function Entry({ r, preview, className, children }: { r: CategoryResult; preview?: boolean; className?: string; children: ReactNode }) {
  return (
    <Go href={`/category/${r.category.id}`} preview={preview} className={className}>
      {children}
    </Go>
  );
}

/** A category's own colour as text: as it is on a dark page, darkened toward black on a light one so it still reads. */
const catColour = (c: string, light: boolean) => (light ? `color-mix(in srgb, ${c} 55%, #000)` : c);

/** The arrival of a row: rises out of a blur, one after another, at the speed MOTION allows. */
function Rise({ order, className, children }: { order: number; className?: string; children: ReactNode }) {
  const m = useMotion();
  return (
    <motion.li
      className={className}
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
        <SizedHero word={r.category.name} tint={projectTint(r.category.colour, settings.light)} base={88} overlap={0.38} className="pb-10">
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-baseline gap-3">
              <span className="fw-kicker text-ink">{r.category.name}</span>
              <span className="fw-kicker text-ink-2">{countLabel(r.experiments.length)}</span>
            </div>
            <p className="max-w-[52ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">{r.category.blurb}</p>
            <Hits r={r} />
            <Rail />
          </div>
        </SizedHero>
      </Entry>
    </Rise>
  );
}

/* 2 · POSTER: the name as a huge thin Vogue title, one to a row. */
function PosterRow({ r, preview, order }: { r: CategoryResult; preview?: boolean; order: number }) {
  return (
    <Rise order={order}>
      <Entry r={r} preview={preview} className="group flex min-h-[48px] flex-col gap-4 border-t border-[var(--rail)] py-10 outline-offset-8">
        <span className="fw-kicker text-ink-2">{countLabel(r.experiments.length)}</span>
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
      <Entry r={r} preview={preview} className="group grid min-h-[56px] grid-cols-1 items-baseline gap-x-5 gap-y-1 border-t border-[var(--rail)] py-4 outline-offset-8 sm:grid-cols-[11rem_10.5rem_1fr]">
        <span className="fw-big text-[22px] font-light leading-[1.2] text-ink transition-colors duration-300 group-hover:text-t1 group-focus-visible:text-t1">{r.category.name}</span>
        <span className="fw-kicker whitespace-nowrap text-ink-2">{countLabel(r.experiments.length)}</span>
        <span className="flex flex-col gap-1 text-[0.9375rem] font-light leading-[1.45] text-ink-2">
          {r.category.blurb}
          <Hits r={r} />
        </span>
      </Entry>
    </Rise>
  );
}

/** One experiment as a plain line that opens it; the ones the search matched are lit. */
function ExpLine({ e, hit, preview }: { e: Experiment; hit?: boolean; preview?: boolean }) {
  return (
    <Go href={e.href} preview={preview} className={`flex min-h-[48px] items-center text-[1.0625rem] font-light leading-[1.3] transition-colors duration-300 hover:text-t1 focus-visible:text-t1 ${hit ? 'text-t1' : 'text-ink-2'}`}>
      {e.title}
    </Go>
  );
}

/* 4 · DIRECTORY: every category with its experiments listed under it, in columns. Any page is one tap away. */
function Directory({ results, preview }: { results: CategoryResult[]; preview?: boolean }) {
  const { settings } = useDisplay();
  return (
    <ul className="grid gap-x-14 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((r, n) => (
        <Rise key={r.category.id} order={n}>
          <div className="flex flex-col gap-1 border-t border-[var(--rail)] pt-5">
            <Entry r={r} preview={preview} className="group flex min-h-[48px] flex-col gap-1 outline-offset-8">
              <span className="fw-big text-[29px] font-light leading-[1.15] transition-opacity duration-300 group-hover:opacity-80" style={{ color: catColour(r.category.colour, settings.light) }}>
                {r.category.name}
              </span>
              <span className="fw-kicker text-ink-2">{countLabel(r.experiments.length)}</span>
            </Entry>
            <ul className="mt-2 flex flex-col">
              {r.experiments.map((e) => (
                <li key={e.href}>
                  <ExpLine e={e} hit={r.hits.includes(e)} preview={preview} />
                </li>
              ))}
            </ul>
          </div>
        </Rise>
      ))}
    </ul>
  );
}

/** What opens for a category: its sentence, its experiments and the way into its own page. */
function Panel({ r, preview }: { r: CategoryResult; preview?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-[48ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">{r.category.blurb}</p>
      <ul className="flex flex-col">
        {r.experiments.map((e) => (
          <li key={e.href}>
            <ExpLine e={e} hit={r.hits.includes(e)} preview={preview} />
          </li>
        ))}
      </ul>
      <Entry r={r} preview={preview} className="fw-kicker inline-flex min-h-[48px] w-fit items-center text-t1 transition-colors hover:text-ink">
        Open {r.category.name} →
      </Entry>
    </div>
  );
}

/* 5 · SPLIT: the names on the left; the one you point at (or tap) opens on the right. On a phone it opens under its name. */
function Split({ results, preview }: { results: CategoryResult[]; preview?: boolean }) {
  const { settings } = useDisplay();
  const [active, setActive] = useState(0);
  const at = Math.min(active, results.length - 1);
  return (
    <div className="grid gap-x-16 gap-y-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <ul className="flex flex-col">
        {results.map((r, n) => {
          const on = n === at;
          return (
            <Rise key={r.category.id} order={n} className="border-t border-[var(--rail)]">
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setActive(n)}
                onMouseEnter={() => setActive(n)}
                onFocus={() => setActive(n)}
                className="flex min-h-[56px] w-full items-baseline py-3 text-left"
                style={{ color: on ? catColour(r.category.colour, settings.light) : 'var(--ink)' }}
              >
                <span className="fw-vogue text-[clamp(24px,4.4vw,48px)] leading-[1.05] transition-colors duration-300">{r.category.name}</span>
              </button>
              <div className="pb-6 lg:hidden" hidden={!on}>
                <Panel r={r} preview={preview} />
              </div>
            </Rise>
          );
        })}
      </ul>
      <div className="hidden border-t border-[var(--rail)] pt-6 lg:block" aria-live="polite">
        {results[at] && <Panel key={results[at].category.id} r={results[at]} preview={preview} />}
      </div>
    </div>
  );
}

/* 6 · ACCORDION: a row opens in place to show what is inside; one open at a time. */
function Accordion({ results, preview }: { results: CategoryResult[]; preview?: boolean }) {
  const { settings } = useDisplay();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="flex flex-col border-b border-[var(--rail)]">
      {results.map((r, n) => {
        const on = open === r.category.id;
        return (
          <Rise key={r.category.id} order={n} className="border-t border-[var(--rail)]">
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : r.category.id)}
              className="flex min-h-[64px] w-full items-baseline justify-between gap-6 py-4 text-left"
            >
              <span className="fw-big text-[clamp(26px,4.5vw,44px)] font-light leading-[1.1] transition-colors duration-300" style={{ color: on ? catColour(r.category.colour, settings.light) : 'var(--ink)' }}>
                {r.category.name}
              </span>
              <span className="flex items-baseline gap-5">
                <span className="fw-kicker text-ink-2">{countLabel(r.experiments.length)}</span>
                <span aria-hidden className="fw-big inline-block text-[26px] font-light text-t1 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: on ? 'rotate(45deg)' : 'none' }}>
                  +
                </span>
              </span>
            </button>
            <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
              <div className="min-h-0 overflow-hidden">
                <div className="pb-8" inert={!on}>
                  <Panel r={r} preview={preview} />
                </div>
              </div>
            </div>
          </Rise>
        );
      })}
    </ul>
  );
}

/* 7 · WALL: the names as one typographic wall, each as big as what is inside it, in its own colour. A line below says what it is. */
function Wall({ results, preview }: { results: CategoryResult[]; preview?: boolean }) {
  const { settings } = useDisplay();
  const [hot, setHot] = useState<CategoryResult | null>(null);
  const most = Math.max(1, ...results.map((r) => r.experiments.length));
  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
        {results.map((r, n) => {
          const size = 40 + Math.round((r.experiments.length / most) * 64);
          return (
            <Rise key={r.category.id} order={n}>
              <Entry r={r} preview={preview} className="group inline-flex min-h-[48px] items-baseline gap-2 outline-offset-8">
                <span
                  className="fw-big font-extralight uppercase leading-[1.05] tracking-[0.06em] transition-opacity duration-300 group-hover:opacity-80"
                  style={{ fontSize: `${size}px`, color: catColour(r.category.colour, settings.light) }}
                  onMouseEnter={() => setHot(r)}
                  onFocus={() => setHot(r)}
                >
                  {r.category.name}
                </span>
                <sup className="fw-kicker fw-tabular self-start pt-[0.4em] text-ink-2">{r.experiments.length}</sup>
              </Entry>
            </Rise>
          );
        })}
      </ul>
      <p className="min-h-[3em] max-w-[60ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2" aria-live="polite">
        {hot ? hot.category.blurb : 'Point at a name. The small number is how many experiments are inside.'}
      </p>
    </div>
  );
}

export default function LandingCategories({ layout, results, preview, empty }: { layout: LandingStyle; results: CategoryResult[]; preview?: boolean; empty?: ReactNode }) {
  const { settings } = useDisplay();
  if (results.length === 0) return <>{empty}</>;

  // Keyed by layout and by what the layout draws with, so switching any of them replays the arrival.
  if (layout === 'cards') {
    const Card = CARD_COMPONENTS[settings.card];
    return (
      <ul key={`cards-${settings.card}`} className="grid gap-x-16 gap-y-16 sm:grid-cols-2">
        {results.map((r) => (
          <Card key={r.category.id} experiment={asExperiment(r)} index={r.index} preview={preview} numbered={false} />
        ))}
      </ul>
    );
  }
  if (layout === 'directory') return <Directory key="directory" results={results} preview={preview} />;
  if (layout === 'split') return <Split key="split" results={results} preview={preview} />;
  if (layout === 'accordion') return <Accordion key="accordion" results={results} preview={preview} />;
  if (layout === 'wall') return <Wall key="wall" results={results} preview={preview} />;

  const Row = layout === 'index' ? IndexRow : layout === 'poster' ? PosterRow : CompactRow;
  return (
    <ul key={`${layout}-${resolveHero(settings)}-${settings.heroSize}`} className={layout === 'index' ? 'flex flex-col gap-4' : 'flex flex-col border-b border-[var(--rail)]'}>
      {results.map((r, n) => (
        <Row key={r.category.id} r={r} preview={preview} order={n} />
      ))}
    </ul>
  );
}

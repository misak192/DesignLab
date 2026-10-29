/**
 * File: src/components/experiments/page-transitions/PageTransitionsLab.tsx
 * Description: Page transitions: light-leak or curtain wipe between pages with a film-grain overlay for texture.
 * Respects reduced-motion settings, animating only transform and opacity.
 */
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion';
import { useMotion } from '@/components/display/DisplayProvider';

type TransitionStyle = 'light-leak' | 'curtain-wipe' | 'ethereal-veil';

interface MockPage {
  id: string;
  name: string;
  title: string;
  kicker: string;
  blurb: string;
  accent: string;
}

const MOCK_PAGES: MockPage[] = [
  {
    id: 'alpha',
    name: '01 · Nexus',
    title: 'THE CONSTELLATION PROTOCOL',
    kicker: 'DISCOURSE MATRIX',
    blurb: 'Every participant occupies a unique coordinate in celestial space, weighted by resonance rather than performative reputation.',
    accent: 'var(--t1)',
  },
  {
    id: 'beta',
    name: '02 · Chrono',
    title: 'RELATIVISTIC TIME BLOCKS',
    kicker: 'CHRONOLYST ENGINE',
    blurb: 'Time measured through character density: longer sentences occupy wider spatial corridors in the collective memory.',
    accent: 'var(--t2)',
  },
  {
    id: 'gamma',
    name: '03 · Sovereign',
    title: 'LOCAL CLIENT ENCLAVE',
    kicker: 'TRUST INFRASTRUCTURE',
    blurb: 'Cryptographic identity remains local to the device client, eliminating centralized tracking and public scorecards.',
    accent: 'var(--node-4)',
  },
];

export default function PageTransitionsLab() {
  const m = useMotion();
  const [currentPage, setCurrentPage] = useState<MockPage>(MOCK_PAGES[0]);
  const [transitionStyle, setTransitionStyle] = useState<TransitionStyle>('light-leak');
  const [showGrain, setShowGrain] = useState<boolean>(true);
  const [transitionDuration, setTransitionDuration] = useState<number>(0.65);

  const getTransitionVariants = (): { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition } => {
    const dur = m.scale === 0 ? 0 : transitionDuration;
    const ease = [0.22, 1, 0.36, 1] as const;

    if (transitionStyle === 'curtain-wipe') {
      return {
        initial: { x: '100%', opacity: 1 },
        animate: { x: '0%', opacity: 1, transition: { duration: dur, ease } },
        exit: { x: '-100%', opacity: 1, transition: { duration: dur, ease } },
      };
    }

    if (transitionStyle === 'ethereal-veil') {
      return {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1, transition: { duration: dur, ease } },
        exit: { opacity: 0, scale: 1.04, transition: { duration: dur * 0.8, ease } },
      };
    }

    // light-leak (default)
    return {
      initial: { opacity: 0, x: 24 },
      animate: { opacity: 1, x: 0, transition: { duration: dur, ease } },
      exit: { opacity: 0, x: -24, transition: { duration: dur * 0.7, ease } },
    };
  };

  const variants = getTransitionVariants();

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink transition-colors">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">
          Page Transitions
        </h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          Light-leak and curtain wipes between pages with film-grain overlay texture.
        </p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Cinematic pacing between navigation boundaries. Respects reduced-motion settings and animates
          strictly transform and opacity to keep phones fluid at 120Hz.
        </p>
      </header>

      {/* Simulator Chamber */}
      <section className="flex flex-col gap-8 pt-4">
        {/* Navigation Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rail)] pb-3">
          <div className="flex gap-6">
            {MOCK_PAGES.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => setCurrentPage(page)}
                className="fw-kicker text-[13px] transition-colors py-1 min-h-[36px]"
                style={{
                  color: currentPage.id === page.id ? 'var(--t1)' : 'var(--ink-3)',
                  borderBottom: currentPage.id === page.id ? '2px solid var(--t1)' : 'none',
                }}
              >
                {page.name}
              </button>
            ))}
          </div>

          <span className="fw-tabular text-[12px] text-ink-3">
            TAP TABS TO TRIGGER TRANSITIONS
          </span>
        </div>

        {/* Viewport Frame */}
        <div className="relative h-[440px] w-full overflow-hidden border border-[var(--rail)] bg-[var(--canvas)] flex items-center justify-center p-8 select-none">
          {/* Film Grain Texture Overlay */}
          {showGrain && (
            <div
              className="pointer-events-none absolute inset-0 z-40 opacity-25 mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />
          )}

          {/* Light-leak sweep streak during transition */}
          {transitionStyle === 'light-leak' && (
            <motion.div
              key={currentPage.id + '-leak'}
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '140%', opacity: [0, 0.75, 0] }}
              transition={{ duration: transitionDuration * 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute inset-y-0 w-44 z-30 bg-gradient-to-r from-transparent via-[var(--t1)]/40 to-transparent blur-[28px] skew-x-[-18deg]"
            />
          )}

          {/* Page Content Animation Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage.id}
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              className="relative z-10 flex flex-col items-center justify-center text-center max-w-[620px] gap-4"
            >
              <span className="fw-kicker text-[11px] tracking-[0.4em]" style={{ color: currentPage.accent }}>
                {currentPage.kicker}
              </span>
              <h2 className="fw-vogue text-[clamp(28px,5vw,52px)] text-ink leading-[1.1]">
                {currentPage.title}
              </h2>
              <p className="fw-big text-[18px] font-light text-ink-2 leading-[1.4]">
                {currentPage.blurb}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Transition Controls */}
        <div className="grid gap-8 sm:grid-cols-3 border-t border-[var(--rail)]/50 pt-6">
          <div className="flex flex-col gap-2">
            <span className="fw-kicker text-[11px] text-ink-2">Transition Style</span>
            <div className="flex flex-col gap-1">
              {[
                { id: 'light-leak', label: '01 · Light-Leak Wipe' },
                { id: 'curtain-wipe', label: '02 · Curtain Sweep' },
                { id: 'ethereal-veil', label: '03 · Ethereal Veil' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setTransitionStyle(style.id as TransitionStyle)}
                  className="text-left text-[13px] py-1 transition-colors"
                  style={{
                    color: transitionStyle === style.id ? 'var(--t1)' : 'var(--ink-3)',
                    fontWeight: transitionStyle === style.id ? 500 : 300,
                  }}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <span className="fw-kicker text-[11px] text-ink-2">Transition Duration</span>
              <span className="fw-tabular text-[12px] text-t1">{transitionDuration.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.05"
              value={transitionDuration}
              onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
              className="w-full accent-[var(--t1)] cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 justify-center">
            <span className="fw-kicker text-[11px] text-ink-2">Film Grain Texture</span>
            <button
              type="button"
              onClick={() => setShowGrain((v) => !v)}
              className="fw-big text-[15px] font-light text-left text-ink hover:text-t1 transition-colors min-h-[36px]"
            >
              {showGrain ? '● FILM GRAIN ON' : '○ SMOOTH FLAT'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

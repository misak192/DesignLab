/**
 * File: src/components/landing/Welcome.tsx
 * Description: The welcome at the top of the home page, in the style chosen on /landing: FULL (a screen of its own: the hero
 * title, a sentence, what is inside, and "Enter the lab"), COMPACT (the title and the sentence only) or OFF (a plain title). The
 * hero title behind it is drawn in the design chosen on /hero-titles.
 */
"use client";
import Link from 'next/link';
import HomeHero from '@/components/hero/HomeHero';
import type { WelcomeStyle } from '@/lib/display/settings';
import { CATEGORIES, EXPERIMENTS } from '@/lib/experiments';

export default function Welcome({ style }: { style: WelcomeStyle }) {
  const title = (
    <div className="flex flex-wrap items-baseline gap-x-10 gap-y-2">
      <h1 className="fw-vogue text-[clamp(28px,6.4vw,72px)] leading-[1.1] text-ink">Design Lab</h1>
      <Link href="/master" className="fw-kicker inline-flex min-h-[48px] items-center text-t1 transition-colors hover:text-ink">
        Lab Master →
      </Link>
    </div>
  );

  if (style === 'off') {
    return (
      <header className="flex flex-col gap-6 pb-14">
        <p className="fw-vogue text-[0.875rem] tracking-[0.5em] text-ink-2">FrissonWorks</p>
        {title}
      </header>
    );
  }

  const full = style === 'full';
  return (
    <div className={full ? 'flex min-h-[68vh] flex-col justify-center' : undefined}>
      <HomeHero>
        <header className="flex flex-col gap-10">
          <p className="fw-vogue text-[0.875rem] tracking-[0.5em] text-ink-2">FrissonWorks</p>
          <div className="flex flex-col gap-8">
            {title}
            <p className="fw-big max-w-[26ch] text-[29px] font-light leading-[1.25] text-ink">Try the shared components before any app has to live with them.</p>
          </div>
          {full && (
            <div className="flex flex-wrap items-baseline gap-x-10 gap-y-2">
              <span className="fw-kicker fw-tabular text-t1">{CATEGORIES.length} categories</span>
              <span className="fw-kicker fw-tabular text-t1">{EXPERIMENTS.length} experiments</span>
              <a href="#categories" className="fw-kicker inline-flex min-h-[48px] items-center text-ink transition-colors hover:text-t1">
                Enter the lab ↓
              </a>
            </div>
          )}
        </header>
      </HomeHero>
    </div>
  );
}

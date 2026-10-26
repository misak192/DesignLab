/**
 * File: src/components/cards/CardsLab.tsx
 * Description: The /cards page: five designs for the home page's experiment cards, each drawn live with the real
 * experiments, and a switch to use one on the home page. Everything moves according to the MOTION level.
 */
"use client";
import Link from 'next/link';
import { useDisplay } from '@/components/display/DisplayProvider';
import { EXPERIMENTS } from '@/lib/experiments';
import { CARD_STYLES } from '@/lib/display/settings';
import { CARD_COMPONENTS, CARD_INFO } from './variants';

export default function CardsLab() {
  const { settings, set } = useDisplay();

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-16">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Cards</h1>
        <p className="fw-big max-w-[28ch] text-[29px] font-light leading-[1.25] text-ink">
          The page selector, five ways. Pick one for the home page.
        </p>
        <p className="max-w-[56ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Hover, focus and tap them. Change MOTION in the header to feel how each one behaves at OFF, NORMAL, COLOUR and OTT.
        </p>
      </header>

      <div className="flex flex-col gap-24">
        {CARD_STYLES.map((style, i) => {
          const Card = CARD_COMPONENTS[style];
          const chosen = settings.card === style;
          return (
            <section key={style} aria-labelledby={`card-${style}`} className="flex flex-col gap-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-3">
                    <span className="fw-kicker fw-tabular text-t1">{String(i + 1).padStart(2, '0')}</span>
                    <h2 id={`card-${style}`} className="fw-kicker text-ink">
                      {CARD_INFO[style].name}
                    </h2>
                  </div>
                  <p className="max-w-[52ch] text-[0.875rem] font-normal text-t3">{CARD_INFO[style].note}</p>
                </div>

                <button
                  type="button"
                  onClick={() => set({ card: style })}
                  aria-pressed={chosen}
                  className="fw-big min-h-[48px] border-b text-[22px] font-light uppercase tracking-[0.08em] transition-colors"
                  style={{ color: chosen ? 'var(--t1)' : 'var(--ink)', borderColor: chosen ? 'var(--t1)' : 'transparent' }}
                >
                  {chosen ? 'On home ✓' : 'Use on home'}
                </button>
              </div>

              <ul className="grid gap-x-16 gap-y-14 sm:grid-cols-2">
                {EXPERIMENTS.slice(0, 2).map((experiment, n) => (
                  <Card key={experiment.href} experiment={experiment} index={n} preview />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}

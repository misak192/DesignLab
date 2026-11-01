/**
 * File: src/components/landing/LandingLab.tsx
 * Description: The /landing page: where the design of the home page is decided. Four layouts for the categories (index, cards,
 * poster, compact), each drawn live from the real categories, with "Use on home" to choose one; and the three things that change
 * how any of them looks: the hero title design (the same list as /hero-titles), the card design (the same list as /cards) and the
 * welcome (full, compact, off). Everything chosen is saved with the other display settings and applies to the home page at once.
 */
"use client";
import Link from 'next/link';
import { useDisplay } from '@/components/display/DisplayProvider';
import { CARD_INFO } from '@/components/cards/variants';
import { CARD_STYLES, HERO_STYLES, LANDING_STYLES, WELCOME_STYLES } from '@/lib/display/settings';
import type { LandingStyle } from '@/lib/display/settings';
import { HERO_INFO } from '@/lib/hero/heroes';
import { searchCategories } from '@/lib/landing/search';
import LandingCategories from './LandingCategories';

const LAYOUT_INFO: Record<LandingStyle, { name: string; note: string }> = {
  index: { name: 'Index', note: 'Each category is a hero title in the saved design, led by its own colour, with its sentence on top. The one that shows the hero titles off.' },
  cards: { name: 'Cards', note: 'The card design chosen below, two to a row. The same cards the experiments use, so the whole lab reads as one.' },
  poster: { name: 'Poster', note: 'Huge, thin Vogue names, one to a row, with a hairline between. Quiet, and very FrissonWorks.' },
  compact: { name: 'Compact', note: 'One line each: number, name, count and sentence. The fastest to scan, and the best with the search.' },
};

const WELCOME_INFO = { full: 'Full', compact: 'Compact', off: 'Off' } as const;

function Choice<T extends string>({ label, hint, items, current, onPick }: { label: string; hint?: string; items: readonly { id: T; label: string }[]; current: T; onPick: (id: T) => void }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="flex flex-wrap items-baseline gap-x-6">
        <span className="fw-kicker w-[7rem] shrink-0 text-ink-2">{label}</span>
        <div role="radiogroup" aria-label={label} className="flex flex-wrap">
          {items.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={o.id === current} className="fw-opt" onClick={() => onPick(o.id)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      {hint && <p className="max-w-[62ch] pl-0 text-[0.875rem] font-normal text-t3 sm:pl-[calc(7rem+1.5rem)]">{hint}</p>}
    </div>
  );
}

export default function LandingLab() {
  const { settings, set } = useDisplay();
  // Four categories are enough to judge a layout; the home page shows all of them.
  const preview = searchCategories('').slice(0, 4);

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-14">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker text-t1">Decisions · Landing</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Landing</h1>
        </div>
        <p className="fw-big max-w-[30ch] text-[29px] font-light leading-[1.25] text-ink">How the lab opens. Pick the layout, the titles and the welcome.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          The home page is the top folder: one entry per category, and each opens a page with its experiments. Choose here how those entries
          are drawn. The choices are saved in this browser and the home page changes at once.
        </p>

        <div className="flex flex-col">
          <Choice label="Title design" hint="The hero title design of the category names. Same list as the Hero titles page." items={HERO_STYLES.map((s) => ({ id: s, label: HERO_INFO[s].name }))} current={settings.hero} onPick={(hero) => set({ hero })} />
          <Choice label="Card design" hint="Used by the Cards layout, and by every category page. Same list as the Cards page." items={CARD_STYLES.map((s) => ({ id: s, label: CARD_INFO[s].name }))} current={settings.card} onPick={(card) => set({ card })} />
          <Choice label="Welcome" hint="Full: a screen of its own. Compact: the title and one sentence. Off: just the name." items={WELCOME_STYLES.map((s) => ({ id: s, label: WELCOME_INFO[s] }))} current={settings.welcome} onPick={(welcome) => set({ welcome })} />
        </div>
        <Link href="/" className="fw-pick inline-flex w-fit items-center">
          Open the home page →
        </Link>
      </header>

      <div className="flex flex-col gap-24">
        {LANDING_STYLES.map((style, i) => {
          const chosen = settings.landing === style;
          return (
            <section key={style} aria-labelledby={`landing-${style}`} className="flex flex-col gap-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-3">
                    <span className="fw-kicker fw-tabular text-t1">{String(i + 1).padStart(2, '0')}</span>
                    <h2 id={`landing-${style}`} className="fw-kicker text-ink">
                      {LAYOUT_INFO[style].name}
                    </h2>
                  </div>
                  <p className="max-w-[56ch] text-[0.875rem] font-normal text-t3">{LAYOUT_INFO[style].note}</p>
                </div>
                <button
                  type="button"
                  onClick={() => set({ landing: style })}
                  aria-pressed={chosen}
                  className="fw-big min-h-[48px] border-b text-[22px] font-light uppercase tracking-[0.08em] transition-colors"
                  style={{ color: chosen ? 'var(--t1)' : 'var(--ink)', borderColor: chosen ? 'var(--t1)' : 'transparent' }}
                >
                  {chosen ? 'On home ✓' : 'Use on home'}
                </button>
              </div>
              <LandingCategories layout={style} results={preview} preview />
            </section>
          );
        })}
      </div>
    </main>
  );
}

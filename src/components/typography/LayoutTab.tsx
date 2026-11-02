/**
 * File: src/components/typography/LayoutTab.tsx
 * Description: The Layout tab of /typography: one page set in the FrissonWorks type roles, top to bottom: the hero title (drawn in
 * the design chosen on /hero-titles), Title 1 (the Vogue title), Title 2 (the statement), the subtitle, a section header
 * (numbered kicker, statement, content with the spacing), a stat, and normal reading text. Each role names its numbers from
 * FrissonWorks Design (px at TEXT normal; reading text follows the TEXT setting, heroes and Vogue titles stay fixed).
 */
"use client";
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useDisplay } from '@/components/display/DisplayProvider';
import HeroTitle from '@/components/hero/HeroTitle';
import { HERO_WORDS } from '@/lib/hero/heroes';
import { Options } from '@/components/chartstudy/dots/DotStudy';

const WORDS = HERO_WORDS.map((w) => ({ id: w.word, label: w.word }));

function Role({ name, spec, children }: { name: string; spec: string; children: ReactNode }) {
  return (
    <div className="grid gap-5 border-t border-[var(--rail)] py-9 md:grid-cols-[15rem_1fr] md:gap-12">
      <div className="flex flex-col gap-1.5">
        <p className="fw-kicker text-ink">{name}</p>
        <p className="fw-tabular text-[0.8125rem] font-light leading-[1.45] text-ink-3">{spec}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default function LayoutTab() {
  const { settings } = useDisplay();
  const [word, setWord] = useState<string>(WORDS[0].id);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col pb-4">
        <Options label="Word" items={WORDS} current={word} onPick={setWord} />
      </div>

      {/* Hero: the saved hero design, as big as a page title gets. */}
      <div className="pb-6 pt-4">
        <HeroTitle word={word} variant={settings.hero} size={150} crop={false} overlap={0.1} />
        <p className="fw-tabular pt-3 text-[0.8125rem] font-light text-ink-3">
          Hero title · up to 160 (ceiling 190) · 300 · tracking −1.5 · drawn in the design saved on{' '}
          <Link href="/hero-titles" className="underline decoration-[var(--rail)] underline-offset-4 hover:text-ink">
            Hero titles
          </Link>
        </p>
      </div>

      <Role name="Title 1 · Vogue title" spec="24–56 (wordmark up to 72) · 200–300 · tracking 0.35em · UPPER · INK with a halo">
        <h2 className="fw-vogue text-[clamp(24px,5vw,56px)] leading-[1.15] text-ink">Explore the Lore</h2>
      </Role>

      <Role name="Title 2 · Statement" spec="29 · 300 · tracking 0 · a sentence, two lines at most · INK">
        <p className="fw-big max-w-[26ch] text-[29px] font-light leading-[1.25] text-ink">I want to know what I don&rsquo;t know.</p>
      </Role>

      <Role name="Subtitle · Item" spec="22 · 300 · tracking 0 · a sentence · INK or the item’s own colour (DATA)">
        <p className="fw-big max-w-[34ch] text-[22px] font-light leading-[1.3] text-ink">One topic at a time, from what you already know.</p>
      </Role>

      <Role name="Structure · Section header" spec="Kicker 14 · 500 · tracking 3 · UPPER · number in T1 · 12 to the statement · 32 to the content · 80 between sections">
        <div className="flex flex-col">
          <p className="fw-kicker flex gap-3">
            <span className="fw-tabular text-t1">01</span>
            <span className="text-ink">Topics</span>
          </p>
          <p className="fw-big mt-3 max-w-[30ch] text-[29px] font-light leading-[1.25] text-ink">Six pillars, each one a way to look at the world.</p>
          <ul className="mt-8 flex flex-col gap-[14px]">
            {[
              ['Welcome Page', 'Scroll story', '12'],
              ['Wisdom Game', 'Concept summary and action plan', '8'],
              ['Features', 'Feature list', '5'],
            ].map(([t, d, n]) => (
              <li key={t} className="flex items-baseline justify-between gap-6">
                <span className="fw-big text-[22px] font-light text-ink">
                  {t}
                  <span className="pl-4 text-[0.875rem] font-normal text-ink-3">{d}</span>
                </span>
                <span className="fw-tabular text-[0.875rem] font-normal text-t3">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </Role>

      <Role name="Stat" spec="Value 40 (ceiling 52) · 300 · T2 (or INK when it is not the section’s one highlight) · label 14 · 400 · small caps">
        <div className="flex flex-wrap items-end gap-x-14 gap-y-6">
          {[
            ['128', 'Day streak', true],
            ['34', 'Echoes waiting', false],
            ['12', 'Topics explained', false],
          ].map(([v, l, hi]) => (
            <div key={l as string} className="flex flex-col">
              <span className={`fw-big fw-tabular text-[40px] font-light leading-none ${hi ? 'text-t2' : 'text-ink'}`}>{v}</span>
              <span className="mt-2 text-[0.875rem] font-normal uppercase tracking-[0.12em] text-ink">{l}</span>
            </div>
          ))}
        </div>
      </Role>

      <Role name="Normal text" spec="Reading text 17 · 300 (Light) or 400 · line 1.5 · INK · follows the TEXT setting">
        <div className="flex max-w-[62ch] flex-col gap-4">
          <p className="text-[1.0625rem] font-light leading-[1.5] text-ink">
            Every topic starts with a question you can answer in a sentence. Write it down in your own words first, then open the explanation and
            see how far apart the two are. That gap is what the game keeps count of.
          </p>
          <p className="text-[1.0625rem] font-light leading-[1.5] text-ink-2">
            A second paragraph in the calmer ink, for the part that supports the first. Weight below 24 is Regular or Light, never bold.
          </p>
        </div>
      </Role>

      <Role name="Caption · Meta · Tag" spec="14 · 400 · tabular numbers; meta takes the item’s colour; a tag is T3 with tracking 0.2">
        <div className="flex flex-wrap items-baseline gap-x-10 gap-y-3">
          <span className="text-[0.875rem] font-normal uppercase tracking-[0.12em] text-ink">Caption in small caps</span>
          <span className="fw-tabular text-[0.875rem] font-normal text-ink-2">4d 11h · 2,481 echoes</span>
          <span className="text-[0.875rem] font-normal tracking-[0.2px] text-t3">Public · Explained</span>
        </div>
      </Role>
    </div>
  );
}

/**
 * File: src/components/brand/BrandLab.tsx
 * Description: The /brand page (Brand System / Design Studio): nine tabs kept in the URL (?tab=hero): Brand colours (tokens,
 * app colour map, exports), Tick-fold (the reference hero), Variations (20 heroes on their own stages), Master mark, Intro,
 * App abbreviations, Icons in context, App reel and Superscript everywhere. Options are numbered so a choice can be said as
 * "variation 7, monogram 14". The app colour map (Brand colours tab) is shared by every tab.
 */
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useUrlTab } from '@/lib/useUrlTab';
import type { AppId } from '@/lib/brand/apps';
import { INTROS } from '@/lib/brand/intros';
import { REEL_VARIANTS } from '@/lib/brand/reel';
import { Cell, CellGrid } from './kit';
import FWMark, { MARKS } from './FWMark';
import AppMonogram, { MONOGRAMS } from './AppMonogram';
import BrandIntro from './BrandIntro';
import BrandReel from './BrandReel';
import BrandColours from './BrandColours';
import Context from './Contexts';
import { BrandPaletteProvider, useBrandPalette } from './palette';
import { IDEAS } from './SuperscriptIdeas';
import { Stage, TickFoldHero, VARIATIONS } from './Variations';

const TABS = [
  { id: 'hero', label: 'Tick-fold', line: 'Animation 2: a tick is drawn in the corner, folds into an L, and the whole title rolls out. Prefix in the app colour, Lyst in white.' },
  { id: 'colours', label: 'Brand colours', line: 'The eight core colours, the app colour map and the exports. Everything below uses them.' },
  { id: 'variations', label: 'Variations', line: '20 heroes, each on its own stage: wordmarks, icons, parent mark, spark, parallax, glass, daily and light.' },
  { id: 'mark', label: 'Master mark', line: 'F with the W raised like an exponent, and twenty ways to draw it.' },
  { id: 'intro', label: 'Intro', line: 'Animation 1: “FW” unfolds into FrissonWorks, “presents”, then the app carousel stops on the app (the prefix spins against a fixed white Lyst).' },
  { id: 'apps', label: 'App abbreviations', line: 'A capital with a raised L: AL, OL, LL, CL, RL, EL. Number 21 is the tick-L.' },
  { id: 'icons', label: 'Icons in context', line: 'Favicon, browser tab, Android home screen, themed icon.' },
  { id: 'reel', label: 'App reel', line: 'A slot machine of prefixes against a fixed “Lyst”. Tap to skip.' },
  { id: 'super', label: 'Superscript everywhere', line: 'The raised letter as a general FrissonWorks device.' },
] as const;
type TabId = (typeof TABS)[number]['id'];
const IDS = TABS.map((t) => t.id) as readonly TabId[];
const pad = (n: number) => String(n).padStart(2, '0');

export default function BrandLab({ number }: { number: number }) {
  return (
    <BrandPaletteProvider>
      <Lab number={number} />
    </BrandPaletteProvider>
  );
}

function Lab({ number }: { number: number }) {
  const [tab, select] = useUrlTab(IDS);
  const [app, setApp] = useState<AppId>('lore');
  const [dur, setDur] = useState(2.2);
  const { apps, byId } = useBrandPalette();
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const a = byId(app);
  const showApp = !['colours', 'mark', 'super', 'hero'].includes(tab);

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-8">
        <Link href="/category/type" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Type
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker fw-tabular text-t1">{number > 0 ? pad(number) : '··'} Experiments</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Brand</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">One mark, one raised letter, every app.</p>
        <div role="tablist" aria-label="Brand" className="flex flex-wrap gap-x-8">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={t.id === tab} data-plain="true" className="fw-ts-tab" onClick={() => select(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-[0.9375rem] font-light text-ink-2">{current.line}</p>

        {showApp && (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <label className="flex items-center gap-3">
              <span className="fw-kicker text-ink-3">App</span>
              <select value={app} onChange={(e) => setApp(e.target.value as AppId)} className="min-h-[48px] bg-transparent text-[1rem] font-light text-ink outline-none" style={{ colorScheme: 'dark light' }}>
                {apps.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.prefix}Lyst ({x.abbr})
                  </option>
                ))}
              </select>
            </label>
            {(tab === 'reel' || tab === 'intro') && (
              <label className="flex items-center gap-3">
                <span className="fw-kicker text-ink-3">Reel length</span>
                <select value={dur} onChange={(e) => setDur(Number(e.target.value))} className="min-h-[48px] bg-transparent text-[1rem] font-light text-ink outline-none" style={{ colorScheme: 'dark light' }}>
                  {[2, 2.25, 2.5].map((d) => (
                    <option key={d} value={d}>
                      {d} s
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </header>

      <div role="tabpanel" aria-label={current.label}>
        {tab === 'colours' && <BrandColours />}

        {tab === 'hero' && <TickFoldHero app={app} onApp={setApp} />}

        {tab === 'variations' && (
          <CellGrid cols={2}>
            {VARIATIONS.map((v) => (
              <Cell key={v.id} n={v.id} name={v.name} note={v.note} minH={v.minH}>
                {(k) => (v.stage === 'none' ? <div key={k} className="w-full">{v.render(app, k)}</div> : <Stage theme={v.stage} minH={v.minH}>{v.render(app, k)}</Stage>)}
              </Cell>
            ))}
          </CellGrid>
        )}

        {tab === 'mark' && (
          <CellGrid>
            {MARKS.map((m) => (
              <Cell key={m.id} n={m.id} name={m.name} note={m.note} minH={200}>
                {(k) => <FWMark key={k} id={m.id} size={96} />}
              </Cell>
            ))}
          </CellGrid>
        )}

        {tab === 'intro' && (
          <CellGrid>
            {INTROS.map((v) => (
              <Cell key={v.id} n={v.id} name={v.name} note={`${v.note} Lands with reel ${pad(v.reel)}.`} minH={230}>
                {(k) => <BrandIntro app={app} variant={v} playKey={k} size="clamp(30px, 4.2vw, 46px)" />}
              </Cell>
            ))}
          </CellGrid>
        )}

        {tab === 'apps' && (
          <CellGrid>
            {MONOGRAMS.map((m) => (
              <Cell key={m.id} n={m.id} name={m.name} note={m.note} still minH={160}>
                {() => (
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                    {apps.map((x) => (
                      <div key={x.id} className="flex flex-col items-center gap-2">
                        <AppMonogram app={x} variant={m.id} size={52} />
                        <span className="fw-kicker text-[0.6875rem]" style={{ color: x.id === app ? a.colour : 'var(--ink-3)' }}>
                          {x.abbr}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Cell>
            ))}
          </CellGrid>
        )}

        {tab === 'icons' && (
          <CellGrid cols={2}>
            {MONOGRAMS.map((m) => (
              <Cell key={m.id} n={m.id} name={m.name} still minH={300}>
                {() => <Context id={m.id} app={app} />}
              </Cell>
            ))}
          </CellGrid>
        )}

        {tab === 'reel' && (
          <CellGrid>
            {REEL_VARIANTS.map((v) => (
              <Cell key={v.id} n={v.id} name={v.name} note={v.note} minH={150}>
                {(k) => <BrandReel app={app} variant={v} duration={dur} playKey={k} size="clamp(34px, 4.4vw, 52px)" />}
              </Cell>
            ))}
          </CellGrid>
        )}

        {tab === 'super' && (
          <CellGrid>
            {IDEAS.map((d) => (
              <Cell key={d.id} n={d.id} name={d.name} note={d.note} minH={150}>
                {(k) => <div key={k}>{d.render()}</div>}
              </Cell>
            ))}
          </CellGrid>
        )}
      </div>
    </main>
  );
}

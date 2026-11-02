/**
 * File: src/components/typography/MenuTab.tsx
 * Description: The Menu tab of /typography: four ways to set a menu or a list in type alone. A navigation of Vogue words, an index
 * list (numbered kicker, item, meta, a hairline that is the progress), an option list (the selected one in T1) and the category
 * menu with notification counts drawn in the count design picked on the Counts tab. Every row is a word; the selected one is
 * brighter or coloured. No box, no fill.
 */
"use client";
import { useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { CATEGORIES } from '@/lib/experiments';
import { COUNT_OPTIONS } from '@/lib/typography/counts';
import Counted from './Counted';
import { countPick } from './countPick';

function Block({ title, spec, children }: { title: string; spec: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-[var(--rail)] py-9 md:grid-cols-[15rem_1fr] md:gap-12">
      <div className="flex flex-col gap-1.5">
        <h2 className="fw-kicker text-ink">{title}</h2>
        <p className="text-[0.8125rem] font-light leading-[1.45] text-ink-3">{spec}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

const NAV = ['Journey', 'Explore', 'My Lore'];
const INDEX = [
  { t: 'Welcome Page', d: 'Scroll story', n: '12', p: 100 },
  { t: 'Wisdom Game', d: 'Concept summary and action plan', n: '8', p: 62 },
  { t: 'LoreLyst Features', d: 'Feature list', n: '5', p: 30 },
  { t: 'Echoes', d: 'What you often forget', n: '34', p: 8 },
];
const SKINS = ['Aurora', 'Minimal', 'Gold', 'Neon'];
const CAT_COUNTS = [3, 12, 0, 7, 128, 1, 24];

export default function MenuTab() {
  const [nav, setNav] = useState(1);
  const [row, setRow] = useState(0);
  const [skin, setSkin] = useState(0);
  const [cat, setCat] = useState(0);
  const picked = useSyncExternalStore(countPick.subscribe, countPick.getSnapshot, countPick.getServerSnapshot);
  const variant = COUNT_OPTIONS.find((o) => o.id === picked)?.variant ?? 'exponent';

  return (
    <div className="flex flex-col">
      <Block title="Navigation" spec="Vogue words: 15 · 300 · tracking 0.35em · UPPER · the page you are on in T1, the rest at rest, INK on point">
        <nav aria-label="Sample navigation" className="flex flex-wrap gap-x-10">
          {NAV.map((w, i) => (
            <button key={w} type="button" className="fw-tx-nav" aria-current={i === nav ? 'page' : undefined} onClick={() => setNav(i)}>
              {w}
            </button>
          ))}
        </nav>
      </Block>

      <Block title="Index list" spec="Number 14 · 500 · T1; item 22 · 300; meta 14 · tabular · T3; the hairline under a row is its progress; row gap 14">
        <ul className="flex flex-col gap-[14px]">
          {INDEX.map((it, i) => (
            <li key={it.t}>
              <button type="button" className="fw-tx-row" data-on={i === row} style={{ '--p': `${it.p}%` } as CSSProperties} onClick={() => setRow(i)}>
                <span className="fw-kicker fw-tabular text-t1">{String(i + 1).padStart(2, '0')}</span>
                <span className="fw-tx-row__t">
                  {it.t}
                  <span className="fw-tx-row__d">{it.d}</span>
                </span>
                <span className="fw-tabular fw-tx-row__n">{it.n}</span>
                <span aria-hidden className="fw-tx-row__line" />
              </button>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Option list" spec="Option 22 · 300 · INK, T1 when selected; one under the other, 48 tall">
        <div role="radiogroup" aria-label="Skin" className="flex flex-col items-start">
          {SKINS.map((s, i) => (
            <button key={s} type="button" role="radio" aria-checked={i === skin} className="fw-tx-opt" onClick={() => setSkin(i)}>
              {s}
            </button>
          ))}
        </div>
      </Block>

      <Block title="Category menu" spec={`Item 22 · 300 with its count raised at the top right (design: ${COUNT_OPTIONS.find((o) => o.variant === variant)?.name ?? 'Exponent'}, from the Counts tab); the chosen one takes its own colour`}>
        <div className="flex flex-col items-start">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className="fw-tx-cat"
              aria-current={i === cat ? 'true' : undefined}
              style={{ '--ct': c.colour } as CSSProperties}
              onClick={() => setCat(i)}
            >
              <Counted label={c.name} count={CAT_COUNTS[i] ?? 0} variant={variant} colour={c.colour} />
            </button>
          ))}
        </div>
      </Block>
    </div>
  );
}

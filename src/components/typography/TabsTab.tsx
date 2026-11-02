/**
 * File: src/components/typography/TabsTab.tsx
 * Description: The "Tabs and filters" tab of /typography. A tab is only text: the selected one is brighter or coloured and nothing
 * else changes, no line, no light, no fill (the 36 stylised options stay on /tab-selection). Four plain tab styles, then the filter
 * designs: a single choice with counts, words that switch on and off in their own colour, and the same with a Clear.
 */
"use client";
import type { ReactNode } from 'react';
import { CATEGORIES } from '@/lib/experiments';
import { PlainFilters, PlainTabs } from './PlainTabs';

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

const MONTHS = ['January', 'February', 'March', 'April'];
const SECTIONS = ['Overview', 'Topics', 'Echoes', 'Journal'];
const ROOM = [
  { label: 'Top', count: 0 },
  { label: 'New', count: 5 },
  { label: 'Mine', count: 2 },
  { label: 'Reply', count: 14 },
];

export default function TabsTab() {
  return (
    <div className="flex flex-col">
      <p className="max-w-[62ch] pb-8 text-[1.0625rem] font-light leading-[1.5] text-ink-2">
        The FrissonWorks tab is a word. The word you are on is brighter (or in T1), the others rest, and that is the whole design: the colour fades in
        0.3 s and nothing else moves. Arrow keys move along a row. Anything fancier lives on the Tab Selection study.
      </p>

      <Block title="Tab · Option" spec="22 · 300 · rest is INK mixed into the canvas, the selected tab is T1">
        <PlainTabs items={SECTIONS} tabStyle="option" label="Option tabs" />
      </Block>
      <Block title="Tab · Vogue" spec="15 · 300 · tracking 0.35em · UPPER · the selected tab is full INK">
        <PlainTabs items={SECTIONS} tabStyle="vogue" label="Vogue tabs" />
      </Block>
      <Block title="Tab · Kicker" spec="14 · 500 · tracking 3 · UPPER · number in T1, the selected tab is full INK">
        <PlainTabs items={SECTIONS} tabStyle="kicker" label="Kicker tabs" />
      </Block>
      <Block title="Tab · Compact" spec="13 · 400 · tracking 0.14em · UPPER · what the lab’s own tab rows use today">
        <PlainTabs items={MONTHS} tabStyle="lab" label="Compact tabs" />
      </Block>

      <Block title="Filter · Choose one" spec="Words with counts raised at the top right; one stays on (like Top, New, Mine, Reply in the Comments Room)">
        <PlainFilters single items={ROOM} counts="exponent" label="Comment filter" />
      </Block>
      <Block title="Filter · Switch on and off" spec="A word is on or off; on it takes its own colour (data), off it rests. Any number can be on">
        <PlainFilters items={CATEGORIES.map((c) => ({ label: c.name, colour: c.colour }))} label="Category filter" />
      </Block>
      <Block title="Filter · With counts and Clear" spec="The same with counts, and a quiet Clear that says how many are on">
        <PlainFilters
          clear
          counts="colour"
          items={CATEGORIES.slice(0, 5).map((c, i) => ({ label: c.name, colour: c.colour, count: [3, 12, 0, 7, 128][i] }))}
          label="Category filter with counts"
        />
      </Block>
    </div>
  );
}

/**
 * File: src/components/typography/TypographyLab.tsx
 * Description: The /typography page: the FrissonWorks type roles in four tabs kept in the URL (?tab=menu): Layout (hero title, titles,
 * subtitle, section header, stat, text), Menu (navigation and lists), Counts (notification numbers raised like an exponent) and Tabs
 * (plain text tabs and filters). The tab row is itself plain text: the selected tab changes colour and nothing else.
 */
"use client";
import Link from 'next/link';
import { useUrlTab } from '@/lib/useUrlTab';
import LayoutTab from './LayoutTab';
import MenuTab from './MenuTab';
import CountsTab from './CountsTab';
import TabsTab from './TabsTab';

const TABS = [
  { id: 'layout', label: 'Layout', line: 'From the hero title down to the normal text.' },
  { id: 'menu', label: 'Menu', line: 'Navigation, index lists, options and the category menu.' },
  { id: 'counts', label: 'Counts', line: 'Notification numbers, raised at the top right like an exponent.' },
  { id: 'tabs', label: 'Tabs and filters', line: 'A tab is a word; a filter is a word that switches on.' },
] as const;
type TabId = (typeof TABS)[number]['id'];
const IDS = TABS.map((t) => t.id) as readonly TabId[];

const pad = (n: number) => String(n).padStart(2, '0');

export default function TypographyLab({ number }: { number: number }) {
  const [tab, select] = useUrlTab(IDS);
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-8">
        <Link href="/category/type" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Type
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker fw-tabular text-t1">{number > 0 ? pad(number) : '··'} Experiments</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Typography</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">The words, in their roles.</p>
        <div role="tablist" aria-label="Typography" className="flex flex-wrap gap-x-8">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={t.id === tab} data-plain="true" className="fw-ts-tab" onClick={() => select(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-[0.9375rem] font-light text-ink-2">{current.line}</p>
      </header>

      <div role="tabpanel" aria-label={current.label}>
        {tab === 'layout' && <LayoutTab />}
        {tab === 'menu' && <MenuTab />}
        {tab === 'counts' && <CountsTab />}
        {tab === 'tabs' && <TabsTab />}
      </div>
    </main>
  );
}

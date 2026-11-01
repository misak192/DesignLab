/**
 * File: src/components/chartstudy/ChartTabs.tsx
 * Description: The tab row shared by every chart page (Elements, Dots, Blends, Charts), mounted by the layout at
 * src/app/experiments/chart-elements/layout.tsx so that switching pages is one click. The tabs are links; the current page is
 * the selected tab. Borderless, like every other tab in the lab.
 */
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BASE = '/experiments/chart-elements';
const TABS = [
  { href: BASE, label: 'Elements' },
  { href: `${BASE}/dots`, label: 'Dots' },
  { href: `${BASE}/blends`, label: 'Blends' },
  { href: `${BASE}/charts`, label: 'Charts' },
] as const;

export default function ChartTabs() {
  const path = (usePathname() ?? '').replace(/\/$/, '');
  return (
    <nav aria-label="Chart pages" className="mx-auto w-full max-w-[1700px] px-7 pt-6">
      <div role="tablist" className="flex flex-wrap gap-x-8">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} role="tab" aria-selected={path === t.href} data-plain="true" className="fw-ts-tab">
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

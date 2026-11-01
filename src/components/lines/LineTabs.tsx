/**
 * File: src/components/lines/LineTabs.tsx
 * Description: The tab row shared by the Lines pages (Lines, Veils), mounted by src/app/lines/layout.tsx so that switching is one click.
 * The tabs are links; the current page is the selected tab. Borderless, like every tab in the lab.
 */
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/lines', label: 'Lines' },
  { href: '/lines/veils', label: 'Veils' },
] as const;

export default function LineTabs() {
  const path = (usePathname() ?? '').replace(/\/$/, '');
  return (
    <nav aria-label="Lines pages" className="mx-auto w-full max-w-[1700px] px-7 pt-6">
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

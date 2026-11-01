/**
 * File: src/components/landing/CategoryTabs.tsx
 * Description: The tab row at the top of every category page: All (the home page) and the seven categories, so moving from one
 * folder to the next is one click. The tabs are links; the current category is the selected tab. Borderless, like every tab here.
 */
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/lib/experiments';

export default function CategoryTabs() {
  const path = (usePathname() ?? '').replace(/\/$/, '');
  return (
    <nav aria-label="Categories" className="mx-auto w-full max-w-[1100px] px-7 pt-6">
      <div role="tablist" className="flex flex-wrap gap-x-7">
        <Link href="/" role="tab" aria-selected={false} data-plain="true" className="fw-ts-tab">
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} href={`/category/${c.id}`} role="tab" aria-selected={path === `/category/${c.id}`} data-plain="true" className="fw-ts-tab">
            {c.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

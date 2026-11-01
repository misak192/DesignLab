/**
 * File: src/components/landing/HomeLanding.tsx
 * Description: The home page: the welcome, then the categories of the lab in the layout chosen on /landing, with a search that
 * filters the categories on the screen. Each category opens a page listing its experiments (/category/<id>). Layout and welcome
 * are display settings saved in this browser; nothing else is stored.
 */
"use client";
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useDisplay } from '@/components/display/DisplayProvider';
import { CATEGORIES } from '@/lib/experiments';
import { searchCategories } from '@/lib/landing/search';
import LandingCategories from './LandingCategories';
import SearchBar from './SearchBar';
import Welcome from './Welcome';

export default function HomeLanding() {
  const { settings } = useDisplay();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCategories(query), [query]);

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-32 pt-10 sm:pt-14">
      <Welcome style={settings.welcome} />

      <section id="categories" aria-labelledby="categories-title" className="flex scroll-mt-8 flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
          <div className="flex items-baseline gap-3">
            <span className="fw-kicker fw-tabular text-t1">01</span>
            <h2 id="categories-title" className="fw-kicker text-ink">
              Categories
            </h2>
          </div>
          <SearchBar value={query} onChange={setQuery} found={results.length} total={CATEGORIES.length} />
        </div>

        <LandingCategories
          layout={settings.landing}
          results={results}
          empty={
            <div className="flex flex-col items-start gap-3 py-10">
              <p className="fw-big text-[22px] font-light text-ink">Nothing matches “{query}”.</p>
              <button type="button" className="fw-pick" onClick={() => setQuery('')}>
                Clear the search
              </button>
            </div>
          }
        />

        <Link href="/landing" className="fw-pick inline-flex w-fit items-center">
          Change this page →
        </Link>
      </section>
    </main>
  );
}

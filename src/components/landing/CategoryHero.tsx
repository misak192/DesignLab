/**
 * File: src/components/landing/CategoryHero.tsx
 * Description: The header of a category page: its name as a hero title in the saved hero design, led by the category's own
 * colour, with the way back, the number, the name and its sentence on top of it.
 */
"use client";
import Link from 'next/link';
import { useDisplay } from '@/components/display/DisplayProvider';
import SizedHero from '@/components/hero/SizedHero';
import { projectTint } from '@/lib/hero/heroes';
import type { Category } from '@/lib/experiments';
import { countLabel } from '@/lib/landing/search';

export default function CategoryHero({ category, count }: { category: Category; count: number }) {
  const { settings } = useDisplay();
  return (
    <SizedHero word={category.name} tint={projectTint(category.colour, settings.light)} base={150} overlap={0.1} className="pb-16 sm:pb-20">
      <header className="flex flex-col gap-8">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker text-t1">{countLabel(count)}</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">{category.name}</h1>
        </div>
        <p className="fw-big max-w-[30ch] text-[29px] font-light leading-[1.25] text-ink">{category.blurb}</p>
      </header>
    </SizedHero>
  );
}

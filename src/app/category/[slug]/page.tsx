import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ExperimentGrid from '@/components/cards/ExperimentGrid';
import CategoryHero from '@/components/landing/CategoryHero';
import CategoryTabs from '@/components/landing/CategoryTabs';
import { CATEGORIES, experimentsIn } from '@/lib/experiments';

type Props = { params: Promise<{ slug: string }> };

/** Every category is built ahead of time: /category/comments, /category/type, and so on. */
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.id === slug);
  return category ? { title: `${category.name} | FrissonWorks Design Lab`, description: category.blurb } : {};
}

/** The params are read inside Suspense, as Cache Components asks, so the page can stay instant. */
async function CategoryContent({ params }: Props) {
  const { slug } = await params;
  const index = CATEGORIES.findIndex((c) => c.id === slug);
  if (index < 0) notFound();
  const category = CATEGORIES[index];
  const experiments = experimentsIn(category.id);

  return (
    <>
      <CategoryTabs />
      <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-32 pt-10 sm:pt-14">
        <CategoryHero category={category} index={index} count={experiments.length} />
        <section aria-label={`${category.name} experiments`}>
          <ExperimentGrid experiments={experiments} />
        </section>
      </main>
    </>
  );
}

export default function CategoryPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

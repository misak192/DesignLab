/**
 * File: src/lib/landing/search.ts
 * Description: The home page's search (pure TypeScript). It filters the categories that are on the screen: a category stays when
 * every word of the query is found in its own name or sentence, or in one of its experiments' title, tag or sentence. The
 * experiments that matched are returned too, so the home page can say which ones.
 */
import { CATEGORIES, EXPERIMENTS } from '@/lib/experiments';
import type { Category, Experiment } from '@/lib/experiments';

export interface CategoryResult {
  category: Category;
  /** Its position among all the categories (the number on the card), not among the results. */
  index: number;
  experiments: Experiment[];
  /** The experiments that matched the query; empty when nothing was typed or only the category itself matched. */
  hits: Experiment[];
}

const words = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);
const every = (tokens: string[], hay: string) => tokens.every((t) => hay.includes(t));

export function searchCategories(query: string): CategoryResult[] {
  const tokens = words(query);
  return CATEGORIES.flatMap((category, index) => {
    const experiments = EXPERIMENTS.filter((e) => e.category === category.id);
    if (tokens.length === 0) return [{ category, index, experiments, hits: [] }];
    const own = every(tokens, `${category.name} ${category.blurb}`.toLowerCase());
    const hits = experiments.filter((e) => every(tokens, `${e.title} ${e.tag} ${e.blurb}`.toLowerCase()));
    return own || hits.length > 0 ? [{ category, index, experiments, hits }] : [];
  });
}

/** The one-line count a category carries: "5 experiments". */
export const countLabel = (n: number) => (n === 1 ? '1 experiment' : `${n} experiments`);

/** A category as an Experiment, so the card designs chosen on /cards can draw it unchanged. */
export function asExperiment(r: CategoryResult): Experiment {
  return {
    href: `/category/${r.category.id}`,
    title: r.category.name,
    blurb: r.hits.length > 0 ? `Matches: ${r.hits.map((h) => h.title).join(', ')}.` : r.category.blurb,
    tag: countLabel(r.experiments.length),
    category: r.category.id,
  };
}

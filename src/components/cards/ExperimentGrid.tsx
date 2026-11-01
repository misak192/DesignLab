/**
 * File: src/components/cards/ExperimentGrid.tsx
 * Description: A list of experiments (the home page's, or one category's), drawn in whichever card design was chosen on /cards.
 */
"use client";
import { useDisplay } from '@/components/display/DisplayProvider';
import { EXPERIMENTS } from '@/lib/experiments';
import type { Experiment } from '@/lib/experiments';
import { CARD_COMPONENTS } from './variants';

/** The experiments (all of them, or one category's) as cards, in whichever card design was chosen on /cards. */
export default function ExperimentGrid({ experiments = EXPERIMENTS }: { experiments?: Experiment[] }) {
  const { settings } = useDisplay();
  const Card = CARD_COMPONENTS[settings.card];

  return (
    // Keyed by style, so switching designs replays the arrival.
    <ul key={settings.card} className="grid gap-x-16 gap-y-16 sm:grid-cols-2">
      {experiments.map((experiment, index) => (
        <Card key={experiment.href} experiment={experiment} index={index} />
      ))}
    </ul>
  );
}

/**
 * File: src/components/cards/ExperimentGrid.tsx
 * Description: The home page's list of experiments, drawn in whichever card design was chosen on /cards.
 */
"use client";
import { useDisplay } from '@/components/display/DisplayProvider';
import { EXPERIMENTS } from '@/lib/experiments';
import { CARD_COMPONENTS } from './variants';

export default function ExperimentGrid() {
  const { settings } = useDisplay();
  const Card = CARD_COMPONENTS[settings.card];

  return (
    // Keyed by style, so switching designs replays the arrival.
    <ul key={settings.card} className="grid gap-x-16 gap-y-16 sm:grid-cols-2">
      {EXPERIMENTS.map((experiment, index) => (
        <Card key={experiment.href} experiment={experiment} index={index} />
      ))}
    </ul>
  );
}

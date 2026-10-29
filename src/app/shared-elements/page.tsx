import type { Metadata } from 'next';
import SharedElementsLab from '@/components/experiments/shared-elements/SharedElementsLab';

export const metadata: Metadata = {
  title: 'Shared-Element Transitions | FrissonWorks Design Lab',
  description: 'A card morphs into its full detail view using View Transitions API and Jetpack Compose SharedTransitionLayout.',
};

export default function SharedElementsPage() {
  return <SharedElementsLab />;
}


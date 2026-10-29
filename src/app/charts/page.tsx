import type { Metadata } from 'next';
import ChartsLab from '@/components/experiments/charts/ChartsLab';

export const metadata: Metadata = {
  title: 'Letter-Coded Charts | FrissonWorks Design Lab',
  description: 'Letter-colour encoding applied to XP bars, leaderboards, vote tallies, and the ChronoLyst timeline.',
};

export default function ChartsPage() {
  return <ChartsLab />;
}


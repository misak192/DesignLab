import type { Metadata } from 'next';
import ChartStudy from '@/components/chartstudy/ChartStudy';
import { EXPERIMENTS } from '@/lib/experiments';

export const metadata: Metadata = {
  title: 'Chart Elements | FrissonWorks Design Lab',
  description: 'Thirty see-through chart elements in three families (dot, square, stacked segment): compare them and pick one for every FW chart.',
};

export default function ChartElementsPage() {
  // The home page numbers its cards by position, so this page's kicker is the same number.
  const number = EXPERIMENTS.findIndex((e) => e.href === '/experiments/chart-elements') + 1;
  return <ChartStudy number={number} />;
}

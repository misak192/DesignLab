import type { Metadata } from 'next';
import IllusionStudy from '@/components/illusions/IllusionStudy';
import { EXPERIMENTS } from '@/lib/experiments';

export const metadata: Metadata = {
  title: 'Illusion backgrounds | FrissonWorks Design Lab',
  description: 'Ten optical-illusion backgrounds: bulging checkerboard, café wall, scintillating grid, Ouchi float, rotating snakes, and clock-driven or action-driven variants.',
};

export default function IllusionsPage() {
  const number = EXPERIMENTS.findIndex((e) => e.href === '/illusions') + 1;
  return <IllusionStudy number={number} />;
}

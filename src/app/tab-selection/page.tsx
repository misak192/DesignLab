import type { Metadata } from 'next';
import TabStudy from '@/components/tabstudy/TabStudy';
import { EXPERIMENTS } from '@/lib/experiments';

export const metadata: Metadata = {
  title: 'Tab Selection | FrissonWorks Design Lab',
  description: 'Thirty-six borderless, backgroundless ways to show a selected tab: motion, colour, light, glitch, kinetic letters, idle and particles.',
};

export default function TabSelectionPage() {
  // The home page numbers its cards by position, so this page's kicker is the same number.
  const number = EXPERIMENTS.findIndex((e) => e.href === '/tab-selection') + 1;
  return <TabStudy number={number} />;
}

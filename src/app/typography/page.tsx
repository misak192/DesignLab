import type { Metadata } from 'next';
import TypographyLab from '@/components/typography/TypographyLab';
import { EXPERIMENTS } from '@/lib/experiments';

export const metadata: Metadata = {
  title: 'Typography | FrissonWorks Design Lab',
  description: 'The FrissonWorks type roles on one page: hero title, titles, menus, notification counts as raised numbers, plain text tabs and filters.',
};

export default function TypographyPage() {
  // The home page numbers its cards by position, so this page's kicker is the same number.
  const number = EXPERIMENTS.findIndex((e) => e.href === '/typography') + 1;
  return <TypographyLab number={number} />;
}

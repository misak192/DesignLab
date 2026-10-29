import type { Metadata } from 'next';
import PageTransitionsLab from '@/components/experiments/page-transitions/PageTransitionsLab';

export const metadata: Metadata = {
  title: 'Page Transitions | FrissonWorks Design Lab',
  description: 'Light-leak and curtain wipes between pages with film-grain overlay texture.',
};

export default function PageTransitionsPage() {
  return <PageTransitionsLab />;
}


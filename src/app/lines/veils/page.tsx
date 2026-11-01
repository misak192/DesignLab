import type { Metadata } from 'next';
import VeilsStudy from '@/components/lines/veils/VeilsStudy';

export const metadata: Metadata = {
  title: 'Veils | FrissonWorks Design Lab',
  description: 'Big soft areas of colour instead of lines: airbrush, halftone, aurora and glass veils, highlighters, dissipating and starlit veils.',
};

export default function VeilsPage() {
  return <VeilsStudy />;
}

import type { Metadata } from 'next';
import ArrivalsLab from '@/components/arrivals/ArrivalsLab';

export const metadata: Metadata = {
  title: 'Arrivals | FrissonWorks Design Lab',
  description: 'Nine ways for a page to arrive in real 3D depth: together, delayed or chaotic, from the front or the back.',
};

export default function ArrivalsPage() {
  return <ArrivalsLab />;
}

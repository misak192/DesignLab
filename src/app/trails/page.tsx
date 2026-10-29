import type { Metadata } from 'next';
import TrailsLab from '@/components/experiments/trails/TrailsLab';

export const metadata: Metadata = {
  title: 'Cursor & Touch Trails | FrissonWorks Design Lab',
  description: 'Soft glowing cursor trails on desktop and light ripples with haptic clicks on phone.',
};

export default function TrailsPage() {
  return <TrailsLab />;
}


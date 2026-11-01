import type { Metadata } from 'next';
import LinesStudy from '@/components/lines/LinesStudy';

export const metadata: Metadata = {
  title: 'Lines | FrissonWorks Design Lab',
  description: 'Sixty-six ways to draw a line of light: airbrush, neon, cyberpunk, lasers and sabers, dissipating light, rays of stars, hairlines.',
};

export default function LinesPage() {
  return <LinesStudy />;
}

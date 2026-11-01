import type { Metadata } from 'next';
import BlendStudy from '@/components/chartstudy/dots/BlendStudy';

export const metadata: Metadata = {
  title: 'Blends | FrissonWorks Design Lab',
  description: 'The favourite dots mixed: shifted gradient, soft tinted shadow, glow and airbrush, a pop-in arrival, and the coin stack as stacked bars.',
};

export default function BlendsPage() {
  return <BlendStudy />;
}

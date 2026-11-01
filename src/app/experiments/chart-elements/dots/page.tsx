import type { Metadata } from 'next';
import DotStudy from '@/components/chartstudy/dots/DotStudy';

export const metadata: Metadata = {
  title: 'Dots | FrissonWorks Design Lab',
  description: 'Thirty-six single dots, no chart: gradients from RGB-shifted colour, tinted shadows, fades, cutouts, glass, 3D and layers. Cheap to draw.',
};

export default function DotsPage() {
  return <DotStudy />;
}

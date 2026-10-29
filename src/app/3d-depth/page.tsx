import type { Metadata } from 'next';
import DepthLab from '@/components/experiments/3d-depth/DepthLab';

export const metadata: Metadata = {
  title: 'Scroll-Driven 3D Depth | FrissonWorks Design Lab',
  description: 'Layers that tilt and separate as you scroll, with letter-coded type floating between them.',
};

export default function DepthPage() {
  return <DepthLab />;
}


import type { Metadata } from 'next';
import GlassLab from '@/components/experiments/glass/GlassLab';

export const metadata: Metadata = {
  title: 'Glass & Refraction | FrissonWorks Design Lab',
  description: 'Frosted panels that bend the background beneath them using backdrop blur and SVG displacement.',
};

export default function GlassPage() {
  return <GlassLab />;
}


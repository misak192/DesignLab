import type { Metadata } from 'next';
import FluidSmokeLab from '@/components/experiments/fluid-smoke/FluidSmokeLab';

export const metadata: Metadata = {
  title: 'Fluid & Smoke Shaders | FrissonWorks Design Lab',
  description: 'Live fluid and ink-smoke shader fields reacting to scroll, cursor, and time of day (WebGL & Android Compose AGSL).',
};

export default function FluidSmokePage() {
  return <FluidSmokeLab />;
}


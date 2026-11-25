import type { Metadata } from 'next';
import DotGridStudy from '@/components/dots/DotGridStudy';
import { EXPERIMENTS } from '@/lib/experiments';

export const metadata: Metadata = {
  title: 'Dot grid illusion | FrissonWorks Design Lab',
  description: 'A pixelated picture drawn as a painted checkerboard with light and dark dots on the corners; the dot pattern bends the straight rows. Custom colours, patterns, movement and a cursor lens.',
};

export default function DotGridPage() {
  const number = EXPERIMENTS.findIndex((e) => e.href === '/dot-grid') + 1;
  return <DotGridStudy number={number} />;
}

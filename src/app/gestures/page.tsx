import type { Metadata } from 'next';
import GesturesLab from '@/components/experiments/gestures/GesturesLab';

export const metadata: Metadata = {
  title: 'Spring-Physics Gestures | FrissonWorks Design Lab',
  description: 'Drag-to-rank cards with spring momentum, rubber-band edges, and haptic feedback.',
};

export default function GesturesPage() {
  return <GesturesLab />;
}


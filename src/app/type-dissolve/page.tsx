import type { Metadata } from 'next';
import TypeDissolveLab from '@/components/experiments/type-dissolve/TypeDissolveLab';

export const metadata: Metadata = {
  title: 'Type That Dissolves | FrissonWorks Design Lab',
  description: 'When a comment posts, the letters break into particles and drift away into light.',
};

export default function TypeDissolvePage() {
  return <TypeDissolveLab />;
}


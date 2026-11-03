import type { Metadata } from 'next';
import TimeStudy from '@/components/time/TimeStudy';
import { EXPERIMENTS } from '@/lib/experiments';

export const metadata: Metadata = {
  title: 'Time | FrissonWorks Design Lab',
  description: 'Sixteen ways to show records and periods over time: tree rings, spiral, warming stripes, streamgraph, ridgeline, rose, sunburst, arcs, small multiples, sankey, lanes and more.',
};

export default function TimePage() {
  // The home page numbers its cards by position, so this page's kicker is the same number.
  const number = EXPERIMENTS.findIndex((e) => e.href === '/time') + 1;
  return <TimeStudy number={number} />;
}

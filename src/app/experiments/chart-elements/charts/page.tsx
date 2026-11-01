import type { Metadata } from 'next';
import ChartsStudy from '@/components/chartstudy/charts/ChartsStudy';

export const metadata: Metadata = {
  title: 'Charts | FrissonWorks Design Lab',
  description: 'One dataset, eight styles: a line chart, a stacked bar chart and a scatter in each, built from the favourite dot designs.',
};

export default function ChartsPage() {
  return <ChartsStudy />;
}

import type { Metadata } from 'next';
import BackgroundsLab from '@/components/backgrounds/BackgroundsLab';

export const metadata: Metadata = {
  title: 'Backgrounds | FrissonWorks Design Lab',
};

export default function BackgroundsPage() {
  return <BackgroundsLab />;
}

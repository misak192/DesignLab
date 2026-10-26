import type { Metadata } from 'next';
import HeroLab from '@/components/hero/HeroLab';

export const metadata: Metadata = {
  title: 'Hero titles | FrissonWorks Design Lab',
};

export default function HeroTitlesPage() {
  return <HeroLab />;
}

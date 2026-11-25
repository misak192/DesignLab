import type { Metadata } from 'next';
import BrandLab from '@/components/brand/BrandLab';
import { EXPERIMENTS } from '@/lib/experiments';

export const metadata: Metadata = {
  title: 'Brand | FrissonWorks Design Lab',
  description: 'One brand system: the FW master mark, app abbreviations with a raised L, favicons and Android icons, the intro and the app reel, and the superscript as a UI device.',
};

export default function BrandPage() {
  const number = EXPERIMENTS.findIndex((e) => e.href === '/brand') + 1;
  return <BrandLab number={number} />;
}

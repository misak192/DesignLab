import type { Metadata } from 'next';
import CardsLab from '@/components/cards/CardsLab';

export const metadata: Metadata = {
  title: 'Cards | FrissonWorks Design Lab',
};

export default function CardsPage() {
  return <CardsLab />;
}

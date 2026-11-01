import type { Metadata } from 'next';
import LandingLab from '@/components/landing/LandingLab';

export const metadata: Metadata = {
  title: 'Landing | FrissonWorks Design Lab',
  description: 'Decide how the lab opens: the layout of the categories, their hero titles, the card design and the welcome.',
};

export default function LandingPage() {
  return <LandingLab />;
}

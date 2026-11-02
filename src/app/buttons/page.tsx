import type { Metadata } from 'next';
import ButtonsStudy from '@/components/buttons/ButtonsStudy';

export const metadata: Metadata = {
  title: 'Buttons | FrissonWorks Design Lab',
  description: 'Fifty borderless, backgroundless kinetic buttons: pulse, jump, scatter, slice, zoom to nothing, stars, light and orbs.',
};

export default function ButtonsPage() {
  return <ButtonsStudy />;
}

import type { Metadata } from 'next';
import MotionLab from '@/components/motion/MotionLab';

export const metadata: Metadata = {
  title: 'Motion | FrissonWorks Design Lab',
};

export default function MotionPage() {
  return <MotionLab />;
}

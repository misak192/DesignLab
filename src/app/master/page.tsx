import type { Metadata } from 'next';
import LabMaster from '@/components/master/LabMaster';

export const metadata: Metadata = {
  title: 'Lab Master | FrissonWorks Design Lab',
  description: 'The finished designs for the whole FrissonWorks empire in one place: settings, motion and every component. Skeleton.',
};

export default function MasterPage() {
  return <LabMaster />;
}

import type { Metadata } from 'next';
import SettingsPage from '@/components/settings/SettingsPage';

export const metadata: Metadata = {
  title: 'Settings | FrissonWorks Design Lab',
  description: 'Every display setting in three groups: Look, Text and Motion, each with a live preview.',
};

export default function Settings() {
  return <SettingsPage />;
}

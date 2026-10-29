import type { Metadata } from 'next';
import NotificationLab from '@/components/notifications/NotificationLab';

export const metadata: Metadata = {
  title: 'Notifications | FrissonWorks Design Lab',
  description: 'Borderless spatial typography: big hero text that flies through the screen, dissipates into light, or expands past the camera.',
};

export default function NotificationsPage() {
  return <NotificationLab />;
}


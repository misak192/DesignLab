import ChartTabs from '@/components/chartstudy/ChartTabs';

/** Every chart page (Elements, Dots, Blends, Charts) sits under one tab row, so one click switches between them. */
export default function ChartElementsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ChartTabs />
      {children}
    </>
  );
}

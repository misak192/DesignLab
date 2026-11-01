import LineTabs from '@/components/lines/LineTabs';

/** The Lines pages (Lines, Veils) sit under one tab row, so one click switches between them. */
export default function LinesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LineTabs />
      {children}
    </>
  );
}

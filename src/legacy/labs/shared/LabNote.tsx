/**
 * File: src/legacy/labs/shared/LabNote.tsx
 * Description: The note above each lab experiment: label, title, and how it works / why it's good / watch out.
 */

interface LabNoteProps {
  label: string;
  title: string;
  howItWorks: string;
  whyItWorks: string;
  watchOut: string;
}

export default function LabNote({ label, title, howItWorks, whyItWorks, watchOut }: LabNoteProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--theme-primary-glow)]">{label}</span>
      <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h3>
      <dl className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--foreground)]/65">
        <NoteRow term="How it works" text={howItWorks} />
        <NoteRow term="Why it's good" text={whyItWorks} />
        <NoteRow term="Watch out" text={watchOut} />
      </dl>
    </div>
  );
}

function NoteRow({ term, text }: { term: string; text: string }) {
  return (
    <div>
      <dt className="inline font-semibold text-[var(--foreground)]/90">{term}: </dt>
      <dd className="inline">{text}</dd>
    </div>
  );
}

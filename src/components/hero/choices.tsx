/**
 * File: src/components/hero/choices.tsx
 * Description: The two small controls the hero pages share: a text choice and a labelled row of them.
 */
"use client";

/** A text choice: the colour sits on the inner span because the global button reset would override it on the button. */
export function Choice({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="min-h-[48px] px-1 text-left">
      <span className="fw-big text-[19px]" style={{ color: on ? 'var(--t1)' : 'var(--ink)', fontWeight: on ? 500 : 300 }}>
        {label}
      </span>
    </button>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-0">
      <span className="fw-kicker w-[5.5rem] text-ink-2">{label}</span>
      <div className="flex flex-wrap gap-x-5">{children}</div>
    </div>
  );
}

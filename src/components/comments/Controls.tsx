/**
 * File: src/components/comments/Controls.tsx
 * Description: The lab's switches, drawn as plain settings rows: a quiet label on the left, the choices on the
 * right in large light type, the chosen one underlined. No tiles, no panel. `LabSettings` are the display options of
 * the letter-coded comments; `WhoAmI` is the Room's impersonation switch.
 */
"use client";
import type { ReactNode } from 'react';
import type { PaletteName, Person } from '@/lib/fw-comments';

export function Row({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
      <div className="flex min-w-[10ch] flex-col">
        <span className="fw-kicker text-ink-2">{label}</span>
        <span className="text-[0.875rem] font-normal text-t3">{hint}</span>
      </div>
      <div role="radiogroup" aria-label={label} className="flex max-w-[640px] flex-wrap items-center justify-end gap-x-6">
        {children}
      </div>
    </div>
  );
}

export function Option({
  selected,
  onSelect,
  colour,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  colour?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="fw-big min-h-[48px] border-b px-0 text-[22px] font-light transition-colors"
      style={{
        color: colour ?? (selected ? 'var(--t1)' : 'var(--ink)'),
        borderColor: selected ? (colour ?? 'var(--t1)') : 'transparent',
        fontWeight: selected ? 400 : 300,
      }}
    >
      {children}
    </button>
  );
}

export interface BoardSettings {
  showParticipation: boolean;
  palette: PaletteName;
  threadLines: boolean;
  openLevels: number;
}

interface LabSettingsProps {
  settings: BoardSettings;
  onChange: (patch: Partial<BoardSettings>) => void;
}

/** The display options of the letter-coded comments. They apply to the Lab and to the Room alike. */
export function LabSettings({ settings, onChange }: LabSettingsProps) {
  return (
    <div className="flex flex-col gap-2">
      <Row label="Letter count" hint="First word counts this person's posts in the thread">
        <Option selected={!settings.showParticipation} onSelect={() => onChange({ showParticipation: false })}>
          Off
        </Option>
        <Option selected={settings.showParticipation} onSelect={() => onChange({ showParticipation: true })}>
          On
        </Option>
      </Row>

      <Row label="Palette" hint="Vote colours in the last word">
        <Option selected={settings.palette === 'standard'} onSelect={() => onChange({ palette: 'standard' })}>
          Green · red
        </Option>
        <Option selected={settings.palette === 'colourBlind'} onSelect={() => onChange({ palette: 'colourBlind' })}>
          Blue · orange
        </Option>
      </Row>

      <Row label="Levels per tap" hint="How many levels of replies one tap on a sentence opens">
        {[1, 2, 3, 4].map((n) => (
          <Option key={n} selected={settings.openLevels === n} onSelect={() => onChange({ openLevels: n })}>
            {n}
          </Option>
        ))}
      </Row>

      <Row label="Thread lines" hint="Vertical hairline beside replies">
        <Option selected={!settings.threadLines} onSelect={() => onChange({ threadLines: false })}>
          Off
        </Option>
        <Option selected={settings.threadLines} onSelect={() => onChange({ threadLines: true })}>
          On
        </Option>
      </Row>
    </div>
  );
}

interface WhoAmIProps {
  people: Person[];
  meId: string;
  onMe: (id: string) => void;
  accentOf: (person: Person) => string;
}

/** Impersonation: everything you post, vote and reply to from here is done as that person. */
export function WhoAmI({ people, meId, onMe, accentOf }: WhoAmIProps) {
  return (
    <Row label="Who am I" hint="Posting and voting as">
      {people.map((person) => (
        <Option key={person.id} selected={person.id === meId} onSelect={() => onMe(person.id)} colour={accentOf(person)}>
          {person.name}
        </Option>
      ))}
    </Row>
  );
}

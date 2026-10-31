/**
 * File: src/components/tabstudy/TabRow.tsx
 * Description: The live row of four tabs for one option: January to April. Arrow keys, Home and End move the selection,
 * like a real tablist. The option's `rest` sets how dim the unselected tabs are.
 */
"use client";
import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { useMotion } from '@/components/display/DisplayProvider';
import { TAB_LABELS, type TabOption } from '@/lib/tabstudy/options';
import { EFFECTS } from './effects';
import TabItem from './TabItem';

export default function TabRow({ option, selected, onSelect }: { option: TabOption; selected: number; onSelect: (i: number) => void }) {
  const plain = useMotion().scale === 0;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const Effect = EFFECTS[option.id];

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = TAB_LABELS.length;
    const next =
      e.key === 'ArrowRight' ? (selected + 1) % n : e.key === 'ArrowLeft' ? (selected + n - 1) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null;
    if (next === null) return;
    e.preventDefault();
    onSelect(next);
    buttons.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={`${option.name}, live`}
      className="flex flex-wrap gap-x-5"
      style={{ '--ts-rest': `${option.rest ?? 40}%` } as CSSProperties}
    >
      {TAB_LABELS.map((label, i) => (
        <TabItem
          key={label}
          label={label}
          selected={i === selected}
          plain={plain}
          Effect={Effect}
          scope={option.id}
          onSelect={() => onSelect(i)}
          onKeyDown={onKeyDown}
          buttonRef={(el) => {
            buttons.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}

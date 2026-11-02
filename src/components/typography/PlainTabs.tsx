/**
 * File: src/components/typography/PlainTabs.tsx
 * Description: The plain text tabs and filters of the Typography page. A tab is only a word: the selected one changes colour (and
 * nothing else), no line, no light, no motion beyond the colour fade. `PlainTabs` is a single choice with arrow keys;
 * `PlainFilters` toggles words on and off, with optional counts. Styles live in `.fw-tx-*` in globals.css (classes, because of
 * the button reset).
 */
"use client";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import Counted from './Counted';
import type { CountVariant } from '@/lib/typography/counts';

export type TabStyle = 'option' | 'vogue' | 'kicker' | 'lab';

const pad = (n: number) => String(n + 1).padStart(2, '0');

export function PlainTabs({ items, tabStyle, label }: { items: readonly string[]; tabStyle: TabStyle; label: string }) {
  const [on, setOn] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = items.length;
    const next = e.key === 'ArrowRight' ? (on + 1) % n : e.key === 'ArrowLeft' ? (on + n - 1) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null;
    if (next === null) return;
    e.preventDefault();
    setOn(next);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-x-8">
      {items.map((it, i) => (
        <button
          key={it}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="tab"
          aria-selected={i === on}
          tabIndex={i === on ? 0 : -1}
          className="fw-tx-tab"
          data-style={tabStyle}
          onClick={() => setOn(i)}
          onKeyDown={onKey}
        >
          {tabStyle === 'kicker' && <span className="fw-tx-tab__n fw-tabular">{pad(i)}</span>}
          {it}
        </button>
      ))}
    </div>
  );
}

export interface FilterItem {
  label: string;
  count?: number;
  colour?: string;
}

/** Words that switch on and off. `single` lets only one stay on (a choice, like Top / New / Mine / Reply). */
export function PlainFilters({
  items,
  single = false,
  counts,
  label,
  clear = false,
}: {
  items: readonly FilterItem[];
  single?: boolean;
  counts?: CountVariant;
  label: string;
  /** Show a quiet Clear while anything is on. */
  clear?: boolean;
}) {
  const [on, setOn] = useState<number[]>(single ? [0] : []);
  const toggle = (i: number) =>
    setOn((cur) => (single ? [i] : cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  return (
    <div role={single ? 'radiogroup' : 'group'} aria-label={label} className="flex flex-wrap items-center gap-x-7">
      {items.map((it, i) => {
        const active = on.includes(i);
        return (
          <button
            key={it.label}
            type="button"
            role={single ? 'radio' : undefined}
            aria-checked={single ? active : undefined}
            aria-pressed={single ? undefined : active}
            className="fw-tx-flt"
            data-on={active}
            style={it.colour ? ({ '--ct': it.colour } as CSSProperties) : undefined}
            onClick={() => toggle(i)}
          >
            {counts && it.count !== undefined ? <Counted label={it.label} count={it.count} variant={counts} colour={it.colour} /> : it.label}
          </button>
        );
      })}
      {clear && !single && (
        <button type="button" className="fw-pick" style={{ visibility: on.length ? 'visible' : 'hidden' }} onClick={() => setOn([])}>
          Clear · {on.length} on
        </button>
      )}
    </div>
  );
}

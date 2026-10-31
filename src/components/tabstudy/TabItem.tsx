/**
 * File: src/components/tabstudy/TabItem.tsx
 * Description: The shared wrapper every option sits in: one tab button, 48px tall, no border and no fill. It owns the
 * resting look (an opaque mix of INK, set by `.fw-ts-tab` in globals.css) and hands the inside to the option's effect.
 * When motion is off, every option collapses to the same plain colour change (`plain`).
 */
"use client";
import type { KeyboardEvent } from 'react';
import type { Effect } from './types';

interface TabItemProps {
  label: string;
  selected: boolean;
  /** Motion is off or reduced: draw the bare word, the CSS changes its colour. */
  plain: boolean;
  Effect: Effect;
  scope: string;
  onSelect: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

export default function TabItem({ label, selected, plain, Effect, scope, onSelect, onKeyDown, buttonRef }: TabItemProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-label={label}
      tabIndex={selected ? 0 : -1}
      data-plain={plain}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className="fw-ts-tab"
    >
      {plain ? <span className="whitespace-nowrap">{label}</span> : <Effect label={label} selected={selected} scope={scope} />}
    </button>
  );
}

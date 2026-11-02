/**
 * File: src/components/typography/CountsTab.tsx
 * Description: The Counts tab of /typography: ten designs for a notification count shown as a small raised number at the top right
 * of a word (an exponent, "root square" in Michal's words), on the lab's categories. Tap a word to add one and see the arrival.
 * Rules shared by all: 0 shows nothing, 100+ reads 99+, tabular, 13px at least. The favourite is saved in localStorage
 * ("fw-count-pick") and the Menu tab draws its category counts with it.
 */
"use client";
import { useState, useSyncExternalStore } from 'react';
import { COUNT_OPTIONS, COUNT_SAMPLES, type CountOption } from '@/lib/typography/counts';
import { Options } from '@/components/chartstudy/dots/DotStudy';
import Counted from './Counted';
import { countPick } from './countPick';

const SIZES = [
  { id: 'item', label: 'Item 22' },
  { id: 'kicker', label: 'Kicker 14' },
] as const;
type Size = (typeof SIZES)[number]['id'];

function Cell({ option, size, picked }: { option: CountOption; size: Size; picked: boolean }) {
  const [counts, setCounts] = useState<number[]>(COUNT_SAMPLES.map((s) => s.count));
  const add = (i: number) => setCounts((c) => c.map((n, k) => (k === i ? n + 1 : n)));
  return (
    <li className="flex min-w-0 flex-col gap-3 border-t border-[var(--rail)] pt-5">
      <p className="fw-kicker">
        <span className="fw-tabular text-t1">{option.id}</span>
      </p>
      <h3 className="fw-big text-[20px] font-light leading-[1.2] text-ink">{option.name}</h3>
      <div className="flex min-h-[96px] flex-wrap items-end gap-x-9 gap-y-1 pt-3">
        {COUNT_SAMPLES.map((s, i) => (
          <button key={s.label} type="button" className="fw-tx-addcount" aria-label={`${s.label}, ${counts[i]} new. Add one`} onClick={() => add(i)}>
            <Counted
              label={s.label}
              count={counts[i]}
              variant={option.variant}
              colour={s.colour}
              className={size === 'item' ? 'fw-big text-[22px] font-light' : 'fw-kicker'}
            />
          </button>
        ))}
      </div>
      <p className="min-h-[4.4em] text-[0.875rem] font-normal leading-[1.45] text-ink-2">{option.description}</p>
      <div className="flex min-h-[48px] items-baseline gap-4">
        <button type="button" className="fw-pick" aria-pressed={picked} onClick={() => countPick.setPick(picked ? null : option.id)}>
          {picked ? 'Unpick' : 'Pick'}
        </button>
        {picked && <span className="fw-kicker text-t1">Picked</span>}
      </div>
    </li>
  );
}

export default function CountsTab() {
  const [size, setSize] = useState<Size>('item');
  const picked = useSyncExternalStore(countPick.subscribe, countPick.getSnapshot, countPick.getServerSnapshot);
  const pickedOption = COUNT_OPTIONS.find((o) => o.id === picked);

  return (
    <div className="flex flex-col gap-9">
      <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
        A count is a small number raised at the top right of the word it belongs to, the way an exponent sits beside a number: it adds to the word and
        takes no room of its own. Tap any word to add one and watch the number arrive. Motion is the number only; the word never moves. Comments has 3,
        Type 12, Motion none (nothing is drawn for 0), Light 7 and Data 128 (which reads 99+).
      </p>
      <div className="flex flex-col">
        <Options label="Word size" items={SIZES} current={size} onPick={setSize} />
      </div>
      <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-6">
        <span className="fw-kicker text-ink-2">Favourite</span>
        {pickedOption ? (
          <>
            <span className="fw-big text-[20px] font-light text-t1">
              {pickedOption.id} · {pickedOption.name}
            </span>
            <button type="button" className="fw-pick" onClick={() => countPick.setPick(null)}>
              Clear
            </button>
          </>
        ) : (
          <span className="text-[0.9375rem] font-light text-ink-3">None yet (the Menu tab uses Exponent)</span>
        )}
      </div>
      <ul className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-2 2xl:grid-cols-3">
        {COUNT_OPTIONS.map((o) => (
          <Cell key={o.id} option={o} size={size} picked={picked === o.id} />
        ))}
      </ul>
    </div>
  );
}

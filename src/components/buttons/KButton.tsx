/**
 * File: src/components/buttons/KButton.tsx
 * Description: One kinetic button: a bare word (no border, no fill) resting in a LOOK of light (CSS, `.fw-kb[data-look]`) and
 * answering a press with its MOVES (src/components/buttons/moves.ts). Press is `pointerdown` (or Enter / Space), so it answers
 * at once and from the point you touched. With MOTION off the press only brightens the word. The word is split into letters for
 * the moves; assistive tech reads the button's aria-label, not the letters.
 */
"use client";
import { useCallback, useEffect, useMemo, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import type { ButtonOption } from '@/lib/buttons/options';
import { useMounted } from '@/components/chartstudy/hooks';
import { seeded } from '@/components/tabstudy/shared';
import { press } from './moves';

export interface Tones {
  c: string;
  hi: string;
  lo: string;
}

interface KButtonProps {
  option: ButtonOption;
  label: string;
  upper: boolean;
  tones: Tones;
  /** MOTION is on: idle light moves and a press plays its moves. */
  live: boolean;
  amp: number;
  speed: number;
  /** Bump to press the button by itself (the Press all button). */
  auto: number;
  /** Delay of the automatic press, ms. */
  autoDelay: number;
}

/** Eleven stars at fixed places round the word (percent of the button), for the star looks. Drawn after mount only. */
const STARS = Array.from({ length: 11 }, (_, i) => {
  const left = i % 2 === 0;
  return {
    sx: Math.round((left ? 4 + seeded(i, 3) * 26 : 70 + seeded(i, 3) * 26) * 10) / 10,
    sy: Math.round((8 + seeded(i, 5) * 84) * 10) / 10,
    ss: Math.round((7 + seeded(i, 7) * 11) * 10) / 10,
    sd: Math.round((2.2 + seeded(i, 9) * 2.4) * 10) / 10,
    sl: Math.round(seeded(i, 11) * -4 * 10) / 10,
  };
});

export default function KButton({ option, label, upper, tones, live, amp, speed, auto, autoDelay }: KButtonProps) {
  const mounted = useMounted();
  const btn = useRef<HTMLButtonElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const fx = useRef<HTMLSpanElement>(null);
  const chars = useMemo(() => Array.from(label), [label]);

  const run = useCallback(
    (px: number, py: number) => {
      const b = btn.current;
      const w = word.current;
      const f = fx.current;
      if (!b || !w || !f || !live) return;
      press(
        {
          btn: b, word: w, fx: f, letters: Array.from(w.children) as HTMLElement[],
          px, py, w: b.offsetWidth, h: b.offsetHeight, amp, speed, ...tones,
        },
        option.moves
      );
    },
    [live, amp, speed, tones, option.moves]
  );

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    run(e.clientX - r.left, e.clientY - r.top);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) run(e.currentTarget.offsetWidth / 2, e.currentTarget.offsetHeight / 2);
  };
  // The spotlight look follows the pointer.
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (option.look !== 'spot') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left + 40}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top + 60}px`);
  };

  // "Press all": press by itself, a little after the others.
  const first = useRef(auto);
  useEffect(() => {
    if (auto === first.current) return;
    const id = window.setTimeout(() => {
      const b = btn.current;
      if (b) run(b.offsetWidth / 2, b.offsetHeight / 2);
    }, autoDelay);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  const style = { '--c': tones.c, '--hi': tones.hi, '--lo': tones.lo } as CSSProperties;
  const starLook = option.look === 'stars';

  return (
    <button
      ref={btn}
      type="button"
      className="fw-kb"
      data-look={option.look}
      data-live={live}
      data-case={upper ? 'upper' : 'sentence'}
      aria-label={label}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onKeyDown={onKeyDown}
    >
      <span aria-hidden className="fw-kb__under">
        <span className="fw-kb__a" />
        <span className="fw-kb__b" />
        <span className="fw-kb__c" />
        <span className="fw-kb__d" />
        {starLook &&
          mounted &&
          STARS.map((s, i) => (
            <span
              key={i}
              className="fw-kb__star"
              style={{ '--sx': `${s.sx}%`, '--sy': `${s.sy}%`, '--ss': `${s.ss}px`, '--sd': `${s.sd}s`, '--sl': `${s.sl}s` } as CSSProperties}
            />
          ))}
      </span>
      <span ref={word} aria-hidden className="fw-kb__word">
        {chars.map((ch, i) => (
          <span key={i} className="fw-kb__l">
            {ch}
          </span>
        ))}
      </span>
      <span ref={fx} aria-hidden className="fw-kb__fx" />
    </button>
  );
}

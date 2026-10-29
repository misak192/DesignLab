/**
 * File: src/components/experiments/gestures/GesturesLab.tsx
 * Description: Spring-physics gestures: drag-to-rank cards with momentum and rubber-band edges,
 * building on ActionLyst's swipe-to-rank architecture with micro-haptic sound feedback.
 */
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Reorder } from 'framer-motion';

interface RankItem {
  id: string;
  rank: number;
  title: string;
  author: string;
  score: string;
  tag: string;
}

const INITIAL_ITEMS: RankItem[] = [
  { id: '1', rank: 1, title: 'Consensus Architecture: Letter Overlap', author: 'Maya', score: '98%', tag: 'Core' },
  { id: '2', rank: 2, title: 'Spatial Depth Anchoring on Viewport Z-Axis', author: 'Kenji', score: '92%', tag: 'Motion' },
  { id: '3', rank: 3, title: 'Internal Trust Verification via Zero-Knowledge', author: 'Lisa', score: '87%', tag: 'Security' },
  { id: '4', rank: 4, title: 'Curled Noise Advection for Liquid Glass', author: 'Anthony', score: '81%', tag: 'Shader' },
  { id: '5', rank: 5, title: 'Golden Angle Hue Separation Across 12 Personas', author: 'Seema', score: '76%', tag: 'Design' },
];

function playTickSound() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // silence
  }
}

export default function GesturesLab() {
  const [items, setItems] = useState<RankItem[]>(INITIAL_ITEMS);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleReorder = (newOrder: RankItem[]) => {
    playTickSound();
    setItems(newOrder);
  };

  const handleSwipeAction = (id: string, direction: 'up' | 'down') => {
    playTickSound();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const nextIdx = direction === 'up' ? Math.max(0, idx - 1) : Math.min(items.length - 1, idx + 1);
    if (idx === nextIdx) return;

    const copy = [...items];
    const [moved] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, moved);
    setItems(copy);
  };

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink transition-colors">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">
          Spring Gestures
        </h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          Drag-to-rank cards with real spring momentum and rubber-band boundary resistance.
        </p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Building on ActionLyst’s swipe-to-rank gesture physics. Grab any row to drag it into rank position,
          or use quick swipe nudges. Dragging past the top or bottom of the list meets exponential rubber-band resistance.
        </p>
      </header>

      {/* Interactive Drag & Rank Arena */}
      <section className="flex flex-col gap-6 pt-4 max-w-[760px]">
        <div className="flex items-baseline justify-between border-b border-[var(--rail)] pb-3">
          <div className="flex items-baseline gap-3">
            <span className="fw-kicker fw-tabular text-t1">01</span>
            <span className="fw-kicker text-ink">Priority Stack</span>
          </div>
          <span className="fw-tabular text-[12px] text-ink-3">
            DRAG VERTICALLY TO REORDER &bull; RUBBER-BAND AT EDGES
          </span>
        </div>

        <Reorder.Group
          axis="y"
          values={items}
          onReorder={handleReorder}
          className="flex flex-col gap-3 select-none"
        >
          {items.map((item, index) => {
            const isDragging = draggedId === item.id;
            return (
              <Reorder.Item
                key={item.id}
                value={item}
                onDragStart={() => setDraggedId(item.id)}
                onDragEnd={() => setDraggedId(null)}
                className={`relative flex items-center justify-between p-4 border transition-colors cursor-grab active:cursor-grabbing ${
                  isDragging
                    ? 'border-t1 shadow-[0_12px_32px_rgba(0,0,0,0.5)] z-50 bg-[var(--canvas)]'
                    : 'border-[var(--rail)] hover:border-ink-3'
                }`}
                style={{
                  touchAction: 'none',
                }}
              >
                <div className="flex items-center gap-5">
                  <span className="fw-tabular text-[16px] text-t1 font-light w-6 text-center">
                    0{index + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="fw-big text-[18px] font-light text-ink tracking-wide">
                      {item.title}
                    </span>
                    <span className="text-[12px] text-ink-3">
                      By {item.author} &bull; Resonance {item.score}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="fw-kicker text-[10px] text-ink-3 border border-[var(--rail)] px-2 py-0.5">
                    {item.tag}
                  </span>
                  {/* Quick Nudge Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSwipeAction(item.id, 'up')}
                      title="Promote Up"
                      className="fw-tabular text-ink-3 hover:text-t1 p-1 min-h-[32px] text-[14px]"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwipeAction(item.id, 'down')}
                      title="Demote Down"
                      className="fw-tabular text-ink-3 hover:text-t1 p-1 min-h-[32px] text-[14px]"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        <div className="pt-4 flex justify-between items-center text-[12px] text-ink-3">
          <span>Items snap with cubic-bezier spring physics and tick audio haptics.</span>
          <button
            type="button"
            onClick={() => setItems(INITIAL_ITEMS)}
            className="fw-kicker text-t1 hover:text-ink min-h-[36px]"
          >
            Reset Order
          </button>
        </div>
      </section>
    </main>
  );
}

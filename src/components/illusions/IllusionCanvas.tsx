/**
 * File: src/components/illusions/IllusionCanvas.tsx
 * Description: Hosts one illusion on a canvas. Sizes it to its box, draws once for still designs, runs a frame loop
 * for animated ones while visible, and follows MOTION (off = settled picture). `minutes` null = the real clock;
 * `sweep` makes the gallery preview run through a whole day by itself.
 */
"use client";
import { useEffect, useRef, type MutableRefObject } from 'react';
import { useMotion } from '@/components/display/DisplayProvider';
import { type Frame, type Hit, type Illusion } from '@/lib/illusions/illusions';

const clockMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
};

interface Props {
  illusion: Illusion;
  params: Record<string, number>;
  /** Fixed time of day in minutes; null follows the real clock. */
  minutes: number | null;
  /** Gallery mode: sweep a day and fake input. */
  demo?: boolean;
  /** Receives the label text every ~200ms (for the glass chip). */
  onLabel?: (text: string) => void;
  /** Lets the host push taps into the illusion (design 10). */
  stateRef?: MutableRefObject<Record<string, any>>;
  className?: string;
}

export default function IllusionCanvas({ illusion, params, minutes, demo = false, onLabel, stateRef, className }: Props) {
  const still = useMotion().scale === 0;
  const canvas = useRef<HTMLCanvasElement>(null);
  const own = useRef<Record<string, any>>({});
  const state = stateRef ?? own;
  const live = useRef({ params, minutes, onLabel });
  live.current = { params, minutes, onLabel };
  const redraw = useRef<() => void>(() => {});

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    let visible = true;
    let raf = 0;
    let lastLabel = 0;
    const origin = performance.now();

    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 2 || h < 2) return;
      if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
        el.width = Math.round(w * dpr);
        el.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const now = performance.now();
      const { params: p, minutes: m, onLabel: cb } = live.current;
      let mins = m ?? clockMinutes();
      if (demo && illusion.sweep) mins = ((((now - origin) / 1000) / illusion.sweep) % 1) * 1440;
      const f: Frame = { w, h, now, minutes: mins, p, state: state.current, still, demo };
      illusion.draw(ctx, f);
      if (cb && illusion.label && now - lastLabel > 200) {
        lastLabel = now;
        cb(illusion.label(f));
      }
    };
    redraw.current = draw;

    const loop = () => {
      draw();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!raf && illusion.animated && !still) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(el);
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    draw();
    start();
    return () => {
      io.disconnect();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [illusion, still, demo, state]);

  // Still designs redraw when a setting or the time changes.
  useEffect(() => {
    redraw.current();
  }, [params, minutes]);

  const tap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (illusion.id !== 'I10' || demo) return;
    const r = e.currentTarget.getBoundingClientRect();
    const hit: Hit = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    (state.current.hits ??= []).push(hit);
    if (still) redraw.current();
  };

  return <canvas ref={canvas} className={className} onPointerDown={tap} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />;
}

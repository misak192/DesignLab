/**
 * File: src/components/backgrounds/ConstellationField.tsx
 * Description: A soft cloud of small stars behind a box, adapted from LoreLyst's constellation button (DESIGN.md,
 * "The button": app/lorelyst/poster/ConstellationButton.tsx). Same look and the same physics: stars are densest
 * inside the box and thin out to nothing 30px past its edge (no outline), they float a couple of pixels around their
 * homes and twinkle, brighten when the box is lit, and when `burst` goes up they are blown outward from the origin,
 * fade over about a second, and re-form where they were. Colours are the skin's (--ink, --t1, --t2); light mode uses
 * dark ink. It follows MOTION: OFF paints the stars once and never moves them (no burst); OTT has more stars, a wider
 * float and a bigger burst. One canvas, one rAF loop, paused while off-screen.
 */
"use client";
import { useEffect, useRef, type RefObject } from 'react';
import { useMotion } from '@/components/display/DisplayProvider';

const MARGIN = 40; // how far the canvas reaches past the box, px
const FADE = 30; // how far the cloud thins out past the box edge, px
const TAU = Math.PI * 2;

type RGB = [number, number, number];
const mixRgb = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgba = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

interface Star {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  base: number;
  fall: number;
  col: number;
  sp: number;
  ph: number;
}

interface FieldProps {
  /** The box is focused / lit: the stars brighten and drift wider. */
  lit: boolean;
  /** Raise this to blow the stars apart; they re-form on their own. */
  burst: number;
  /** Where the burst starts (e.g. the Post button). Defaults to the middle of the box. */
  originRef?: RefObject<HTMLElement | null>;
}

export default function ConstellationField({ lit, burst, originRef }: FieldProps) {
  const m = useMotion();
  const ott = m.level === 'ott';
  const still = m.scale === 0;
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ lit, still, ott });
  const state = useRef({ h: 0, burstAt: -99, pending: false, ox: 0, oy: 0, t: 0 });

  useEffect(() => {
    live.current = { lit, still, ott };
  }, [lit, still, ott]);

  // A burst: remember where from; the loop picks it up on the next frame.
  const lastBurst = useRef(burst);
  useEffect(() => {
    if (burst === lastBurst.current) return;
    lastBurst.current = burst;
    const el = canvas.current;
    if (!el || live.current.still) return;
    const box = el.getBoundingClientRect();
    const from = originRef?.current?.getBoundingClientRect();
    state.current.ox = from ? from.left + from.width / 2 - box.left : box.width / 2;
    state.current.oy = from ? from.top + from.height / 2 - box.top : box.height / 2;
    state.current.pending = true;
  }, [burst, originRef]);

  useEffect(() => {
    const el = canvas.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    const c = el.getContext('2d');
    if (!c) return;
    const probe = document.createElement('canvas');
    probe.width = probe.height = 1;
    const pc = probe.getContext('2d', { willReadFrequently: true });
    if (!pc) return;

    const s = state.current;
    let W = 0;
    let H = 0; // canvas size, px
    let stars: Star[] = [];
    let dpr = 1;
    let visible = true;
    let raf = 0;
    let last = 0;
    let drawn = false;
    let pal: { col: RGB[]; glow: RGB; ring: RGB; light: boolean } | null = null;

    const toRgb = (css: string): RGB => {
      pc.clearRect(0, 0, 1, 1);
      pc.fillStyle = '#000';
      pc.fillStyle = css;
      pc.fillRect(0, 0, 1, 1);
      const d = pc.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    const readPal = () => {
      const cs = getComputedStyle(host);
      const ink = toRgb(cs.getPropertyValue('--ink').trim() || '#fff');
      const t1 = toRgb(cs.getPropertyValue('--t1').trim() || '#0ff');
      const t2 = toRgb(cs.getPropertyValue('--t2').trim() || '#38f');
      pal = { light: document.body.classList.contains('light-mode'), col: [ink, mixRgb(ink, t1, 0.3), mixRgb(ink, t2, 0.5)], glow: t1, ring: mixRgb(t2, ink, 0.4) };
    };

    /** Signed distance to the box (a rounded rectangle) in canvas coordinates: negative inside. */
    const sdf = (x: number, y: number) => {
      const bw = W - MARGIN * 2;
      const bh = H - MARGIN * 2;
      const r = Math.min(14, bh / 2);
      const qx = Math.abs(x - W / 2) - (bw / 2 - r);
      const qy = Math.abs(y - H / 2) - (bh / 2 - r);
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    };

    const makeStars = () => {
      const area = (W - MARGIN * 2) * (H - MARGIN * 2);
      const n = Math.max(60, Math.min(live.current.ott ? 420 : 300, Math.round(area / 190)));
      const out: Star[] = [];
      for (let i = 0; i < n; i++) {
        let hx = W / 2;
        let hy = H / 2;
        for (let tries = 0; tries < 60; tries++) {
          const x = Math.random() * W;
          const y = Math.random() * H;
          hx = x;
          hy = y;
          if (Math.random() < Math.max(0, 1 - Math.max(0, sdf(x, y)) / FADE)) break;
        }
        out.push({
          hx, hy, x: hx, y: hy, vx: 0, vy: 0,
          r: 0.5 + Math.random() * 1.2,
          base: 0.35 + Math.random() * 0.65,
          fall: Math.max(0, 1 - Math.max(0, sdf(hx, hy)) / FADE),
          col: (Math.random() * 3) | 0,
          sp: 0.3 + Math.random() * 0.7,
          ph: Math.random() * TAU,
        });
      }
      stars = out;
    };

    const resize = () => {
      const r = host.getBoundingClientRect();
      const w = Math.round(r.width + MARGIN * 2);
      const h = Math.round(r.height + MARGIN * 2);
      if (w === W && h === H) return;
      W = w;
      H = h;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      el.width = W * dpr;
      el.height = H * dpr;
      el.style.width = `${W}px`;
      el.style.height = `${H}px`;
      makeStars();
      drawn = false;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver((e) => {
      visible = e[0]?.isIntersecting ?? true;
    });
    io.observe(host);
    const mo = new MutationObserver(() => {
      pal = null;
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const frame = (ts: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) {
        last = ts;
        return;
      }
      if (!pal) {
        readPal();
        drawn = false;
      }
      const { lit: isLit, still: S0, ott: O } = live.current;
      const flyingNow = s.burstAt > -90 && s.t - s.burstAt < 2.4;
      if (S0 && drawn) return;
      // Nothing to draw: not lit, settled, nothing flying. Stay cheap.
      if (!isLit && s.h < 0.004 && !flyingNow && drawn) return;

      const P = pal!;
      const dt = Math.min(0.05, (ts - (last || ts)) / 1000);
      last = ts;
      s.t += dt;
      const t = s.t;
      s.h += ((isLit && !S0 ? 1 : isLit ? 1 : 0) - s.h) * Math.min(1, dt * 5);
      const h = s.h;
      const drift = S0 ? 0 : 1;

      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);

      if (s.pending) {
        s.pending = false;
        s.burstAt = t;
        for (const q of stars) {
          const a = Math.atan2(q.y - s.oy, q.x - s.ox) + (Math.random() - 0.5) * 2.4;
          const v = (50 + Math.random() * 190) * (O ? 1.35 : 1);
          q.vx = Math.cos(a) * v;
          q.vy = Math.sin(a) * v - 6;
        }
      }
      // After a burst: 0-1.2s flying and fading, then they re-form at home over 0.9s.
      const pa = t - s.burstAt;
      const flying = pa >= 0 && pa < 1.2;
      const vis = pa < 0 || pa > 60 ? 1 : pa < 1.2 ? Math.max(0, 1 - pa / 1.1) : smooth((pa - 1.2) / 0.9);
      if (pa >= 1.2 && pa - dt < 1.2) {
        for (const q of stars) {
          q.x = q.hx;
          q.y = q.hy;
          q.vx = q.vy = 0;
        }
      }

      // The cloud at rest is a whisper; lit, it is the whole thing.
      const level = 0.1 + 0.9 * h;

      const glowA = (P.light ? 0.06 : 0.09) * vis * h;
      if (glowA > 0.003) {
        c.save();
        c.translate(W / 2, H / 2);
        c.scale((W - MARGIN * 2) / 140, (H - MARGIN * 2) / 140);
        const g = c.createRadialGradient(0, 0, 0, 0, 0, 80);
        g.addColorStop(0, rgba(P.glow, glowA));
        g.addColorStop(1, rgba(P.glow, 0));
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, 80, 0, TAU);
        c.fill();
        c.restore();
      }

      if (vis > 0.01) {
        for (const q of stars) {
          let x: number;
          let y: number;
          if (flying) {
            const damp = Math.pow(0.97, dt * 60);
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            q.vx *= damp;
            q.vy *= damp;
            x = q.x;
            y = q.y;
          } else {
            const amp = 2.5 * (1 + h * 0.6) * (O ? 1.5 : 1) * drift;
            x = q.hx + Math.sin(t * q.sp + q.ph) * amp;
            y = q.hy + Math.cos(t * q.sp * 0.9 + q.ph * 1.3) * amp * 0.7;
          }
          const tw = flying || S0 ? 1 : 0.1 + 0.9 * (0.5 + 0.5 * Math.sin(t * q.sp * 2.2 + q.ph));
          const a = Math.min(1, q.base * (q.fall * 0.4 + 0.6) * tw * level * vis * (P.light ? 0.85 : 1));
          const col = rgba(P.col[q.col], a);
          c.fillStyle = col;
          if (q.r > 1.2 && h > 0.3) {
            c.shadowBlur = q.r * 4;
            c.shadowColor = col;
          }
          c.beginPath();
          c.arc(x, y, q.r, 0, TAU);
          c.fill();
          if (q.r > 1.2) c.shadowBlur = 0;
        }
      }
      if (pa >= 0 && pa < 0.5) {
        c.strokeStyle = rgba(P.ring, 0.6 * (1 - pa / 0.5));
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(s.ox, s.oy, pa * (O ? 340 : 260), 0, TAU);
        c.stroke();
      }
      drawn = true;
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none absolute max-w-none"
      style={{ left: -MARGIN, top: -MARGIN }}
    />
  );
}

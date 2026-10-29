/**
 * File: src/components/experiments/type-dissolve/TypeDissolveLab.tsx
 * Description: Type that dissolves: when a comment posts, the letters break into glowing particles
 * and drift away into the void. Extends the Notifications "dissipates into light" concept.
 */
"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useMotion } from '@/components/display/DisplayProvider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  decay: number;
}

export default function TypeDissolveLab() {
  const m = useMotion();
  const [comment, setComment] = useState('The letters themselves are the light moving through quiet space.');
  const [isDissolving, setIsDissolving] = useState(false);
  const [particleDensity, setParticleDensity] = useState(2); // 1 = sparse, 2 = medium, 3 = dense
  const [windDirection, setWindDirection] = useState<'up' | 'scatter' | 'right'>('up');

  const textElementRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const triggerDissolve = () => {
    if (isDissolving || !textElementRef.current || !canvasRef.current) return;
    setIsDissolving(true);

    const el = textElementRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = el.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Offscreen render of the text to sample pixel alpha
    const offCanvas = document.createElement('canvas');
    offCanvas.width = rect.width;
    offCanvas.height = rect.height;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    const style = window.getComputedStyle(el);
    offCtx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    offCtx.fillStyle = '#f5f5fa';
    offCtx.textBaseline = 'top';

    // Measure and wrap lines manually on offscreen canvas
    const words = comment.split(' ');
    let line = '';
    let y = 0;
    const lineHeight = parseFloat(style.lineHeight) || 32;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = offCtx.measureText(testLine);
      if (metrics.width > rect.width && i > 0) {
        offCtx.fillText(line, 0, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    offCtx.fillText(line, 0, y);

    const imgData = offCtx.getImageData(0, 0, rect.width, rect.height);
    const data = imgData.data;
    const particles: Particle[] = [];
    const step = 4 - particleDensity; // density sampling interval

    for (let py = 0; py < rect.height; py += step) {
      for (let px = 0; px < rect.width; px += step) {
        const idx = (py * rect.width + px) * 4;
        const alpha = data[idx + 3];
        if (alpha > 60) {
          let vx = (Math.random() - 0.5) * 1.5;
          let vy = -Math.random() * 2.2 - 0.5;

          if (windDirection === 'right') {
            vx += Math.random() * 3.5 + 1.2;
            vy *= 0.5;
          } else if (windDirection === 'scatter') {
            vx = (Math.random() - 0.5) * 4.5;
            vy = (Math.random() - 0.5) * 4.5;
          }

          particles.push({
            x: px,
            y: py,
            vx,
            vy,
            alpha: alpha / 255,
            size: Math.random() * 1.6 + 0.8,
            color: Math.random() > 0.4 ? 'var(--t1)' : 'var(--ink)',
            decay: Math.random() * 0.018 + 0.008,
          });
        }
      }
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;
        aliveCount++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.02; // upward thermal draft
        p.vx *= 0.98; // air resistance
        p.alpha -= p.decay;

        ctx.fillStyle = p.color === 'var(--t1)' ? '#00f2fe' : '#ffffff';
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      if (aliveCount > 0 && m.scale !== 0) {
        requestAnimationFrame(animateParticles);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsDissolving(false);
      }
    };

    if (m.scale === 0) {
      setIsDissolving(false);
    } else {
      animateParticles();
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink transition-colors">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">
          Type That Dissolves
        </h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          When a comment posts, the letters break into particles and drift away into light.
        </p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          An extension of the spatial notification dissipation idea. The typography itself acts as an ethereal particle
          emitter: upon submission, the glyph matrix fractures into thousands of micro-particles with fluid thermal buoyancy
          and air drag.
        </p>
      </header>

      {/* Interactive Demonstration */}
      <section className="flex flex-col gap-8 pt-4">
        {/* Composer Box */}
        <div className="relative flex flex-col gap-4 border-y border-[var(--rail)] py-8">
          <span className="fw-kicker text-[11px] text-ink-3">Live Composer & Particle Stage</span>

          {/* Text Area / Render Area */}
          <div className="relative min-h-[140px] flex items-center">
            {/* The actual DOM text (hidden during dissolve) */}
            <div
              ref={textElementRef}
              className={`fw-big text-[clamp(22px,3.5vw,34px)] font-light leading-[1.3] text-ink transition-opacity ${
                isDissolving ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {comment}
            </div>

            {/* Particle Canvas Overlay */}
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 size-full"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--rail)]/40">
            <span className="text-[13px] text-ink-3">
              {isDissolving ? 'Particles in flight...' : 'Click below to vaporize this sentence into stardust'}
            </span>

            <button
              type="button"
              disabled={isDissolving}
              onClick={triggerDissolve}
              className="fw-big min-h-[48px] border-b text-[20px] font-light uppercase tracking-[0.08em] transition-colors"
              style={{
                color: isDissolving ? 'var(--ink-3)' : 'var(--t1)',
                borderColor: isDissolving ? 'transparent' : 'var(--t1)',
              }}
            >
              {isDissolving ? 'Dissolving...' : 'Post & Dissolve →'}
            </button>
          </div>
        </div>

        {/* Knobs & Custom Input */}
        <div className="grid gap-8 sm:grid-cols-3 pt-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="custom-comment" className="fw-kicker text-[11px] text-ink-3">
              Custom Sentence to Dissolve
            </label>
            <input
              id="custom-comment"
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-transparent border-b border-[var(--rail)] py-2 text-[15px] font-light text-ink focus:border-t1 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="fw-kicker text-[11px] text-ink-3">Particle Density</span>
            <div className="flex gap-4">
              {[
                { val: 1, label: 'Sparse' },
                { val: 2, label: 'Medium' },
                { val: 3, label: 'Dense' },
              ].map((d) => (
                <button
                  key={d.val}
                  type="button"
                  onClick={() => setParticleDensity(d.val)}
                  className="p-1 text-[13px] border-b transition-colors"
                  style={{
                    color: particleDensity === d.val ? 'var(--t1)' : 'var(--ink-3)',
                    borderColor: particleDensity === d.val ? 'var(--t1)' : 'transparent',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="fw-kicker text-[11px] text-ink-3">Dissipation Draft Vector</span>
            <div className="flex gap-4">
              {[
                { val: 'up', label: 'Upward Draft' },
                { val: 'scatter', label: 'Radial Scatter' },
                { val: 'right', label: 'Wind Drift' },
              ].map((w) => (
                <button
                  key={w.val}
                  type="button"
                  onClick={() => setWindDirection(w.val as 'up' | 'scatter' | 'right')}
                  className="p-1 text-[13px] border-b transition-colors"
                  style={{
                    color: windDirection === w.val ? 'var(--t1)' : 'var(--ink-3)',
                    borderColor: windDirection === w.val ? 'var(--t1)' : 'transparent',
                  }}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

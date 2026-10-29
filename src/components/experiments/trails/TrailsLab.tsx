/**
 * File: src/components/experiments/trails/TrailsLab.tsx
 * Description: Cursor and touch trails: soft glowing trail on desktop, expanding light ripple
 * on tap on phone, and Android HapticFeedbackConstants integration.
 */
"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface TrailPoint {
  x: number;
  y: number;
  time: number;
  size: number;
  color: string;
}

interface TapRipple {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export default function TrailsLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [trailLength, setTrailLength] = useState(24);
  const [glowSize, setGlowSize] = useState(14);
  const [trailColor, setTrailColor] = useState<'t1' | 't2' | 'aurora'>('t1');
  const [activeTab, setActiveTab] = useState<'interactive' | 'compose'>('interactive');

  const trailRef = useRef<TrailPoint[]>([]);
  const ripplesRef = useRef<TapRipple[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Render Cursor Trail
      const now = performance.now();
      const points = trailRef.current;

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const age = now - pt.time;
        const progress = Math.max(0, 1 - age / 360);
        if (progress <= 0) continue;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * progress, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = progress * 0.75;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 16;
        ctx.fill();
      }

      // Filter out expired points
      trailRef.current = points.filter((p) => now - p.time < 360);

      // Render Tap Ripples
      const ripples = ripplesRef.current;
      for (let j = 0; j < ripples.length; j++) {
        const r = ripples[j];
        r.radius += (r.maxRadius - r.radius) * 0.08 + 0.5;
        r.alpha -= 0.024;

        if (r.alpha > 0) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 2.0;
          ctx.globalAlpha = Math.max(0, r.alpha);
          ctx.shadowColor = r.color;
          ctx.shadowBlur = 12;
          ctx.stroke();
        }
      }

      ripplesRef.current = ripples.filter((r) => r.alpha > 0);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const colorHex = trailColor === 't1' ? '#00f2fe' : trailColor === 't2' ? '#3b82f6' : '#ff2fa6';
    trailRef.current.push({
      x,
      y,
      time: performance.now(),
      size: glowSize,
      color: colorHex,
    });

    if (trailRef.current.length > trailLength) {
      trailRef.current.shift();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const colorHex = trailColor === 't1' ? '#00f2fe' : trailColor === 't2' ? '#3b82f6' : '#ff2fa6';

    ripplesRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      radius: 4,
      maxRadius: 85,
      alpha: 1.0,
      color: colorHex,
    });
  };

  const ANDROID_HAPTICS_SNIPPET = `// Android Jetpack Compose Haptics & Touch Feedback
import android.view.HapticFeedbackConstants
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.material.ripple.rememberRipple
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalView

@Composable
fun HapticTouchArea(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val view = LocalView.current
    val interactionSource = remember { MutableInteractionSource() }

    Box(
        modifier = modifier
            .clickable(
                interactionSource = interactionSource,
                indication = rememberRipple(
                    bounded = false,
                    radius = 32.dp,
                    color = Color(0xFF00F2FE)
                )
            ) {
                // Tactile hardware click on touch
                view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                onClick()
            }
    )
}`;

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink transition-colors">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">
          Cursor & Touch Trails
        </h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          A soft glowing ribbon on desktop, and an expanding light ripple with haptic clicks on touch.
        </p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Tactile feedback for every gesture. Move your pointer across the canvas to draw luminous light trails,
          or tap anywhere to release concentric light ripples.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-[var(--rail)] pb-3">
        {(['interactive', 'compose'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="fw-kicker text-[12px] transition-colors min-h-[36px]"
            style={{
              color: activeTab === tab ? 'var(--t1)' : 'var(--ink-3)',
              borderBottom: activeTab === tab ? '2px solid var(--t1)' : 'none',
            }}
          >
            {tab === 'interactive' ? '01 · Interactive Touch & Trail Canvas' : '02 · Compose Haptics Code'}
          </button>
        ))}
      </div>

      {activeTab === 'interactive' && (
        <section className="flex flex-col gap-8 pt-4">
          <div
            className="relative h-[480px] w-full overflow-hidden border border-[var(--rail)] cursor-none select-none"
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
          >
            <canvas ref={canvasRef} className="size-full block" />

            <div className="pointer-events-none absolute top-4 left-5 flex items-baseline gap-3 text-[11px] text-ink-3">
              <span className="fw-kicker text-t1 tracking-[2px]">LIGHT TRAIL FIELD</span>
              <span className="fw-tabular">MOVE POINTER &bull; TAP TO RIPPLE</span>
            </div>
          </div>

          {/* Controls */}
          <div className="grid gap-8 sm:grid-cols-3 border-t border-[var(--rail)]/50 pt-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="fw-kicker text-[11px] text-ink-2">Trail Persistence</span>
                <span className="fw-tabular text-[12px] text-t1">{trailLength} pts</span>
              </div>
              <input
                type="range"
                min="6"
                max="60"
                step="2"
                value={trailLength}
                onChange={(e) => setTrailLength(parseInt(e.target.value))}
                className="w-full accent-[var(--t1)] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="fw-kicker text-[11px] text-ink-2">Glow Core Size</span>
                <span className="fw-tabular text-[12px] text-t1">{glowSize}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="28"
                step="1"
                value={glowSize}
                onChange={(e) => setGlowSize(parseInt(e.target.value))}
                className="w-full accent-[var(--t1)] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="fw-kicker text-[11px] text-ink-2">Light Tone</span>
              <div className="flex gap-4">
                {(['t1', 't2', 'aurora'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTrailColor(c)}
                    className="p-1 text-[13px] border-b transition-colors uppercase"
                    style={{
                      color: trailColor === c ? 'var(--t1)' : 'var(--ink-3)',
                      borderColor: trailColor === c ? 'var(--t1)' : 'transparent',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'compose' && (
        <section className="flex flex-col gap-4 pt-8">
          <div className="flex items-baseline justify-between">
            <span className="fw-kicker text-t1">Jetpack Compose Android Haptics</span>
            <span className="fw-tabular text-[12px] text-ink-3">HapticFeedbackConstants &bull; rememberRipple</span>
          </div>
          <pre className="overflow-x-auto p-5 text-[13px] font-mono leading-[1.6] text-ink-2 border border-[var(--rail)] bg-[var(--canvas)] select-all">
            {ANDROID_HAPTICS_SNIPPET}
          </pre>
        </section>
      )}
    </main>
  );
}


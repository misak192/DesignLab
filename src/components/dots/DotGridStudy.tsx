/**
 * File: src/components/dots/DotGridStudy.tsx
 * Description: The /dot-grid page: a pixelated picture (one of the lab's WebGL backgrounds, a flat colour or an
 * uploaded image) drawn as a painted checkerboard with light and dark dots on the corners. The order of the dots
 * ("wwbwbbwb") creates the illusion; colours, patterns, movement and a lens that follows the cursor are all settings.
 * Drawing maths is in src/lib/dots/dots.ts, sampling in src/lib/dots/source.ts. Everything is in memory.
 */
"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMotion } from '@/components/display/DisplayProvider';
import { PATTERNS, drawDotGrid, invertPattern, parsePattern, randomPattern, type DotSpec } from '@/lib/dots/dots';
import { SOURCE_PALETTES, createSampler, sampleImage, type Sampler, type SourcePalette } from '@/lib/dots/source';

const pad = (n: number) => String(n).padStart(2, '0');

interface S {
  source: string;
  palette: string;
  strength: number;
  moveSource: boolean;
  cols: number;
  contrast: number;
  rounding: number;
  gap: number;
  light: string;
  dark: string;
  dotSize: number;
  shape: 'circle' | 'diamond' | 'square';
  pattern: string;
  rowShift: number;
  speed: number;
  lens: boolean;
  lensR: number;
  lensPattern: string;
  lensShift: number;
}

const DEFAULTS: S = {
  source: 'marble',
  palette: 'green',
  strength: 0.85,
  moveSource: false,
  cols: 28,
  contrast: 0.18,
  rounding: 0.3,
  gap: 0.08,
  light: '#ffffff',
  dark: '#000000',
  dotSize: 0.12,
  shape: 'circle',
  pattern: 'wwbwbbwb',
  rowShift: 1,
  speed: 0,
  lens: true,
  lensR: 0.14,
  lensPattern: 'bbwbwwbw',
  lensShift: 1,
};

const ENGINES = ['marble', 'radiance', 'aurora', 'glass', 'galaxy', 'orbs', 'ink', 'rhythm', 'bokeh'];
const DOT_THEMES = [
  { id: 'bw', name: 'Black and white', light: '#ffffff', dark: '#000000' },
  { id: 'cream', name: 'Cream and navy', light: '#fff4d6', dark: '#0b1430' },
  { id: 'pink', name: 'Pink and teal', light: '#ff9ad5', dark: '#0e4d4a' },
  { id: 'gold', name: 'Gold and plum', light: '#f4d27a', dark: '#3a1646' },
  { id: 'mint', name: 'Mint and forest', light: '#d8ffe8', dark: '#0c3b22' },
  { id: 'skin', name: 'This skin (T1 and T3)', light: '', dark: '' },
];

/** Any CSS colour as #rrggbb, by painting one pixel (handles var(), color-mix(), color(srgb ...)). */
function cssHex(css: string): string {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#000';
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return '#' + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function skinPalette(): SourcePalette {
  const scope = document.body;
  const span = document.createElement('span');
  span.style.cssText = 'position:absolute;visibility:hidden';
  scope.appendChild(span);
  const get = (v: string) => {
    span.style.color = `var(${v})`;
    return cssHex(getComputedStyle(span).color);
  };
  const colours = [1, 2, 3, 4, 5, 6].map((n) => get(`--node-${n}`));
  scope.removeChild(span);
  return { id: 'skin', name: 'This skin', colours, dark: document.body.classList.contains('light-mode') ? 0 : 1 };
}

function skinDots(): { light: string; dark: string } {
  const span = document.createElement('span');
  span.style.cssText = 'position:absolute;visibility:hidden';
  document.body.appendChild(span);
  const get = (v: string) => {
    span.style.color = `var(${v})`;
    return cssHex(getComputedStyle(span).color);
  };
  const out = { light: get('--t1'), dark: get('--t3') };
  document.body.removeChild(span);
  return out;
}

export default function DotGridStudy({ number }: { number: number }) {
  const [s, setS] = useState<S>(DEFAULTS);
  const [imageVersion, setImageVersion] = useState(0);
  const motionOn = useMotion().scale !== 0;
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ s, motionOn, imageVersion });
  const dirty = useRef(true);
  const image = useRef<ImageBitmap | null>(null);
  const pointer = useRef({ x: 0, y: 0, on: false, sx: 0, sy: 0 });
  live.current = { s, motionOn, imageVersion };
  const set = <K extends keyof S>(k: K, v: S[K]) => setS((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    dirty.current = true;
  }, [s, motionOn, imageVersion]);

  useEffect(() => {
    const el = canvas.current;
    const box = stage.current;
    if (!el || !box) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    let sampler: Sampler | null = null;
    try {
      sampler = createSampler();
    } catch {
      sampler = null;
    }
    let cells: Uint8Array | Uint8ClampedArray = new Uint8Array(0);
    let key = '';
    let lastSample = 0;
    let lastOffset = NaN;
    let raf = 0;
    let visible = true;
    let skin: SourcePalette | null = null;

    const frame = (now: number) => {
      raf = visible ? requestAnimationFrame(frame) : 0;
      const { s: S, motionOn: mo } = live.current;
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (w < 2 || h < 2) return;
      const size = w / S.cols;
      const rows = Math.ceil(h / size);
      const k = [S.source, S.palette, S.strength, S.cols, rows, live.current.imageVersion, w].join('|');
      const moving = S.moveSource && mo && S.source !== 'image' && S.source !== 'flat';
      if (k !== key || (moving && now - lastSample > 80)) {
        key = k;
        lastSample = now;
        let pal = SOURCE_PALETTES.find((p) => p.id === S.palette);
        if (S.palette === 'skin') pal = skin = skinPalette();
        pal = pal ?? SOURCE_PALETTES[0];
        let next: Uint8Array | Uint8ClampedArray | null = null;
        if (S.source === 'image' && image.current) next = sampleImage(image.current, S.cols, rows);
        else if (S.source !== 'flat' && S.source !== 'image' && sampler) next = sampler.sample(S.source, S.cols, rows, pal, moving ? now / 1000 * 0.5 : 3, S.strength);
        if (!next) {
          next = new Uint8Array(S.cols * rows * 4);
          const hex = pal.colours[2];
          for (let i = 0; i < S.cols * rows; i++) next.set([parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255], i * 4);
        }
        cells = next;
        dirty.current = true;
      }
      const offset = mo ? Math.floor((now / 1000) * S.speed) : 0;
      if (offset !== lastOffset) {
        lastOffset = offset;
        dirty.current = true;
      }
      const p = pointer.current;
      const nx = p.sx + (p.x - p.sx) * 0.3;
      const ny = p.sy + (p.y - p.sy) * 0.3;
      if (S.lens && p.on && (Math.abs(nx - p.sx) > 0.2 || Math.abs(ny - p.sy) > 0.2)) dirty.current = true;
      p.sx = nx;
      p.sy = ny;
      if (!dirty.current) return;
      dirty.current = false;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
        el.width = Math.round(w * dpr);
        el.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const spec: DotSpec = {
        w,
        h,
        cols: S.cols,
        rows,
        cells,
        contrast: S.contrast,
        rounding: S.rounding,
        gap: S.gap,
        light: S.light,
        dark: S.dark,
        dotSize: S.dotSize,
        shape: S.shape,
        pattern: parsePattern(S.pattern),
        rowShift: S.rowShift,
        offset,
        lens: S.lens && p.on ? { x: nx, y: ny, r: S.lensR * w, pattern: parsePattern(S.lensPattern), rowShift: S.lensShift } : null,
      };
      drawDotGrid(ctx, spec);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(box);
    const ro = new ResizeObserver(() => (dirty.current = true));
    ro.observe(box);
    raf = requestAnimationFrame(frame);
    // The skin can change in the header: redraw with its colours when the body class changes.
    const mo = new MutationObserver(() => {
      key = '';
      dirty.current = true;
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    void skin;
    return () => {
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
      sampler?.dispose();
    };
  }, []);

  const move = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    const p = pointer.current;
    p.x = e.clientX - r.left;
    p.y = e.clientY - r.top;
    if (!p.on) {
      p.sx = p.x;
      p.sy = p.y;
    }
    p.on = true;
    dirty.current = true;
  };
  const leave = () => {
    pointer.current.on = false;
    dirty.current = true;
  };

  const pickTheme = (id: string) => {
    const t = DOT_THEMES.find((x) => x.id === id);
    if (!t) return;
    const c = id === 'skin' ? skinDots() : t;
    setS((p) => ({ ...p, light: c.light, dark: c.dark }));
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      image.current?.close();
      image.current = await createImageBitmap(f);
      setImageVersion((v) => v + 1);
      set('source', 'image');
    } catch {
      /* not an image */
    }
  };

  const applyPreset = (id: string) => {
    const p = PATTERNS.find((x) => x.id === id);
    if (p) setS((v) => ({ ...v, pattern: p.pattern, rowShift: p.rowShift, lensPattern: invertPattern(p.pattern), lensShift: p.rowShift }));
  };

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker fw-tabular text-t1">{number > 0 ? pad(number) : '··'} Experiments</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Dot grid illusion</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">The dots make the squares lean.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          A picture shrunk to coloured squares, light and dark in turn, with small dots where four squares meet. The
          order of the dots along a row (w = light, b = dark) bends the straight lines. Change the colours, the pattern,
          let it move, and move the cursor over it: a circle there uses a different pattern.
        </p>
      </header>

      <div ref={stage} className="relative aspect-[16/10] w-full cursor-crosshair overflow-hidden" style={{ touchAction: 'pan-y' }} onPointerMove={move} onPointerDown={move} onPointerLeave={leave}>
        <canvas ref={canvas} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div className="flex gap-6 pt-3">
        <button type="button" className="fw-pick" onClick={() => stage.current?.requestFullscreen?.()}>
          Full screen
        </button>
        <button type="button" className="fw-pick" onClick={() => setS(DEFAULTS)}>
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-x-12 gap-y-12 pt-12 lg:grid-cols-3">
        <Group title="Picture">
          <Chips label="Source">
            {ENGINES.map((id) => (
              <Chip key={id} on={s.source === id} onClick={() => set('source', id)}>
                {id}
              </Chip>
            ))}
            <Chip on={s.source === 'flat'} onClick={() => set('source', 'flat')}>
              flat
            </Chip>
            <label className="fw-pick cursor-pointer" aria-pressed={s.source === 'image'}>
              {s.source === 'image' ? 'image ✓' : 'upload image…'}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          </Chips>
          {s.source !== 'image' && (
            <Chips label="Colours">
              {[...SOURCE_PALETTES, { id: 'skin', name: 'This skin' }].map((p) => (
                <Chip key={p.id} on={s.palette === p.id} onClick={() => set('palette', p.id)}>
                  {p.name}
                </Chip>
              ))}
            </Chips>
          )}
          <Slider label="Squares across" min={10} max={90} step={1} value={s.cols} onChange={(v) => set('cols', v)} />
          <Slider label="Picture strength" min={0.3} max={1} step={0.01} value={s.strength} onChange={(v) => set('strength', v)} />
          <Slider label="Light/dark squares" min={0} max={0.5} step={0.01} value={s.contrast} onChange={(v) => set('contrast', v)} />
          <Slider label="Corner rounding" min={0} max={0.5} step={0.01} value={s.rounding} onChange={(v) => set('rounding', v)} />
          <Slider label="Gap" min={0} max={0.3} step={0.01} value={s.gap} onChange={(v) => set('gap', v)} />
          <Toggle label="Picture moves" on={s.moveSource} onClick={() => set('moveSource', !s.moveSource)} />
        </Group>

        <Group title="Dots">
          <Chips label="Colours">
            {DOT_THEMES.map((t) => (
              <Chip key={t.id} on={false} onClick={() => pickTheme(t.id)}>
                {t.name}
              </Chip>
            ))}
          </Chips>
          <div className="flex items-center gap-6 text-[0.875rem] font-light text-ink-2">
            <label className="flex items-center gap-3">
              Light dot (w)
              <input type="color" value={s.light} onChange={(e) => set('light', e.target.value)} className="h-8 w-10 bg-transparent" />
            </label>
            <label className="flex items-center gap-3">
              Dark dot (b)
              <input type="color" value={s.dark} onChange={(e) => set('dark', e.target.value)} className="h-8 w-10 bg-transparent" />
            </label>
          </div>
          <Chips label="Shape">
            {(['circle', 'diamond', 'square'] as const).map((sh) => (
              <Chip key={sh} on={s.shape === sh} onClick={() => set('shape', sh)}>
                {sh}
              </Chip>
            ))}
          </Chips>
          <Slider label="Dot size" min={0.04} max={0.3} step={0.005} value={s.dotSize} onChange={(v) => set('dotSize', v)} />
          <Chips label="Pattern">
            {PATTERNS.map((p) => (
              <Chip key={p.id} on={s.pattern === p.pattern && s.rowShift === p.rowShift} onClick={() => applyPreset(p.id)}>
                {p.name}
              </Chip>
            ))}
          </Chips>
          <PatternField value={s.pattern} onChange={(v) => set('pattern', v)} />
          <div className="flex gap-6">
            <button type="button" className="fw-pick" onClick={() => set('pattern', randomPattern(8, Date.now()))}>
              Shuffle
            </button>
            <button type="button" className="fw-pick" onClick={() => set('pattern', invertPattern(s.pattern))}>
              Invert
            </button>
          </div>
          <Slider label="Row shift" min={-4} max={4} step={1} value={s.rowShift} onChange={(v) => set('rowShift', v)} />
          <Slider label="Dots move (steps/s)" min={-8} max={8} step={0.5} value={s.speed} onChange={(v) => set('speed', v)} />
        </Group>

        <Group title="Cursor lens">
          <Toggle label="Lens around the cursor" on={s.lens} onClick={() => set('lens', !s.lens)} />
          <Slider label="Lens size" min={0.04} max={0.35} step={0.005} value={s.lensR} onChange={(v) => set('lensR', v)} />
          <p className="fw-kicker text-ink-2">Pattern inside the lens</p>
          <PatternField value={s.lensPattern} onChange={(v) => set('lensPattern', v)} />
          <div className="flex gap-6">
            <button type="button" className="fw-pick" onClick={() => set('lensPattern', invertPattern(s.pattern))}>
              Opposite of main
            </button>
            <button type="button" className="fw-pick" onClick={() => set('lensPattern', randomPattern(8, Date.now() + 7))}>
              Shuffle
            </button>
          </div>
          <Slider label="Lens row shift" min={-4} max={4} step={1} value={s.lensShift} onChange={(v) => set('lensShift', v)} />
          {!motionOn && <p className="text-[0.875rem] font-light text-ink-2">MOTION is off: the dots and the picture stay still; the lens still follows you.</p>}
        </Group>
      </div>
    </main>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-5 border-t border-[var(--rail)] pt-5">
      <h2 className="fw-big text-[20px] font-light text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Chips({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="fw-kicker text-ink-2">{label}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-1">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="fw-pick" aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <div className="flex items-baseline gap-5">
      <span className="text-[0.875rem] font-light text-ink-2">{label}</span>
      <Chip on={on} onClick={onClick}>
        {on ? 'On' : 'Off'}
      </Chip>
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-baseline gap-4 text-[0.875rem] font-light text-ink">
      <span className="w-[120px] shrink-0 text-ink-2">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="min-h-[32px] min-w-0 flex-1" />
      <span className="fw-tabular w-12 text-right">{Math.round(value * 1000) / 1000}</span>
    </label>
  );
}

function PatternField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-[0.875rem] font-light text-ink-2">
      Type w (light) and b (dark), e.g. w w b w b b w b
      <input value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} className="min-h-[40px] w-full border-b border-[var(--rail)] bg-transparent text-[1.0625rem] tracking-[0.2em] text-ink outline-none" />
    </label>
  );
}

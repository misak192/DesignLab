/**
 * File: src/components/brand/BrandColours.tsx
 * Description: The "Brand colours" panel of the Design Studio: the eight FrissonWorks core colours (plus the two neutrals) as
 * swatches with their tokens, the app colour map (one gradient pair per app, each end picked from the eight colours, with a
 * reset), the resulting gradients, and the exports (CSS variables, Tailwind classes, Color.kt for Compose). The source of
 * truth is src/lib/brand/tokens.json; this panel only shows and edits the *map*, never the colours themselves.
 */
"use client";
import { useState, type ReactNode } from 'react';
import { CSS_SOURCE, KOTLIN_SOURCE } from '@/lib/brand/kotlin.generated';
import { DEFAULT_APP_MAP, FW_COLOURS, FW_NEUTRALS, KOTLIN_NAME, colourById, cssVar, gradientOf, pairEquals, spectrumBetween, type BrandKey, type ColourId } from '@/lib/brand/tokens';
import { APP_KEYS, useBrandPalette } from './palette';
import { gradText } from './kit';

const LABELS: Record<BrandKey, { name: string; letter: string }> = {
  action: { name: 'ActionLyst', letter: 'A' },
  observa: { name: 'ObservaLyst', letter: 'O' },
  lore: { name: 'LoreLyst', letter: 'L' },
  chrono: { name: 'ChronoLyst', letter: 'C' },
  swiper: { name: 'SwiperLyst', letter: 'S' },
  eng: { name: 'EngLyst', letter: 'E' },
  frisson: { name: 'FrissonWorks (parent)', letter: 'F' },
};

function Swatches({ value, onChange, label }: { value: ColourId; onChange: (c: ColourId) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center">
      <span className="fw-kicker w-10 text-[0.6875rem] text-ink-3">{label}</span>
      {FW_COLOURS.map((c) => {
        const on = c.id === value;
        return (
          <button key={c.id} type="button" role="radio" aria-checked={on} aria-label={`${label}: ${c.name}`} title={c.name} onClick={() => onChange(c.id)} className="flex h-12 w-9 items-center justify-center sm:w-12">
            <i
              aria-hidden
              style={{ display: 'block', width: on ? 28 : 22, height: on ? 28 : 22, borderRadius: 999, background: cssVar(c.id), outline: on ? '2px solid var(--ink)' : 'none', outlineOffset: 3, transition: 'width .2s, height .2s' }}
            />
          </button>
        );
      })}
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 pb-14">
      <h2 className="flex items-baseline gap-3">
        <span className="fw-kicker fw-tabular text-t1">{n}</span>
        <span className="fw-kicker text-ink">{title}</span>
      </h2>
      {children}
    </section>
  );
}

export default function BrandColours() {
  const { map, setPair, reset } = useBrandPalette();
  const [copied, setCopied] = useState<string | null>(null);
  const changed = APP_KEYS.some((k) => !pairEquals(map[k], DEFAULT_APP_MAP[k]));

  const copy = async (what: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied('Copy blocked: use Download');
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([KOTLIN_SOURCE], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Color.kt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col">
      <Section n="01" title="Core colours">
        <p className="max-w-[60ch] text-[0.9375rem] font-light text-ink-2">
          The FrissonWorks brand colours. They never change per theme; themes may reference them. Everything on this page uses them as <code className="text-ink">var(--fw-…)</code>.
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
          {[...FW_COLOURS, ...FW_NEUTRALS].map((c) => (
            <div key={c.id} className="flex flex-col gap-3">
              <i aria-hidden className="block h-16 w-full" style={{ background: cssVar(c.id), borderRadius: 14, boxShadow: c.id === 'night' ? 'inset 0 0 0 1px color-mix(in srgb, var(--ink) 25%, transparent)' : 'none' }} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[1rem] font-normal text-ink">{c.name}</span>
                <span className="fw-tabular text-[0.8125rem] font-light text-ink-2">{c.hex}</span>
                <span className="text-[0.8125rem] font-light text-ink-3">--fw-{c.id}</span>
                <span className="text-[0.8125rem] font-light text-ink-3">{c.role}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <i aria-hidden className="block h-3 w-full" style={{ background: gradientOf(FW_COLOURS.map((c) => c.id), 90), borderRadius: 999 }} />
          <span className="fw-kicker text-[0.6875rem] text-ink-3">Full spectrum, pink to aqua</span>
        </div>
      </Section>

      <Section n="02" title="App colour map">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-[60ch] text-[0.9375rem] font-light text-ink-2">Each app has a gradient pair. Pick both ends from the eight colours; every tab follows. The presets are the defaults.</p>
          <button type="button" onClick={() => reset()} disabled={!changed} className="fw-kicker min-h-[48px] text-t1 transition-colors hover:text-ink disabled:text-ink-3">
            ↺ Reset all
          </button>
        </div>
        <div className="flex flex-col">
          {APP_KEYS.map((k) => {
            const pair = map[k];
            const stops = k === 'frisson' ? spectrumBetween(pair[0], pair[1]) : pair;
            const grad = gradientOf(stops);
            const isDefault = pairEquals(pair, DEFAULT_APP_MAP[k]);
            return (
              <div key={k} className="grid grid-cols-1 items-center gap-x-8 gap-y-1 border-t border-ink/10 py-3 lg:grid-cols-[210px_minmax(120px,1fr)_auto_auto]">
                <div className="flex items-center gap-4">
                  <span className="w-9 text-center text-[2.5rem] font-medium leading-none" style={gradText(cssVar(stops[0]), cssVar(stops[stops.length - 1]))}>
                    {LABELS[k].letter}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[1rem] font-normal text-ink">{LABELS[k].name}</span>
                    <span className="text-[0.75rem] font-light text-ink-3">
                      {colourById(pair[0]).name} → {colourById(pair[1]).name}
                      {k === 'frisson' ? `, ${stops.length} colours` : ''}
                    </span>
                  </span>
                </div>
                <i aria-hidden className="block h-3 w-full" style={{ background: grad, borderRadius: 999 }} />
                <div className="flex flex-col">
                  <Swatches value={pair[0]} onChange={(c) => setPair(k, [c, pair[1]])} label="From" />
                  <Swatches value={pair[1]} onChange={(c) => setPair(k, [pair[0], c])} label="To" />
                </div>
                <button type="button" onClick={() => reset(k)} disabled={isDefault} className="fw-kicker min-h-[48px] w-fit text-t1 transition-colors hover:text-ink disabled:text-ink-3">
                  ↺ Reset
                </button>
              </div>
            );
          })}
        </div>
      </Section>

      <Section n="03" title="Gradients, as the apps wear them">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-7">
          {APP_KEYS.map((k) => {
            const pair = map[k];
            const stops = k === 'frisson' ? spectrumBetween(pair[0], pair[1]) : pair;
            return (
              <div key={k} className="flex flex-col items-start gap-3">
                <span className="text-[4.5rem] font-medium leading-none" style={gradText(cssVar(stops[0]), cssVar(stops[stops.length - 1]))}>
                  {LABELS[k].letter}
                </span>
                <i aria-hidden className="block h-1 w-full" style={{ background: gradientOf(stops, 90), borderRadius: 999 }} />
                <span className="fw-kicker text-[0.6875rem] text-ink-3">{LABELS[k].name.replace(' (parent)', '')}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section n="04" title="Export">
        <p className="max-w-[64ch] text-[0.9375rem] font-light text-ink-2">
          Single source: <code className="text-ink">src/lib/brand/tokens.json</code>. After editing it run <code className="text-ink">npm run brand:tokens</code> to regenerate the CSS variables and Tailwind colours (<code className="text-ink">text-fw-pink</code>, <code className="text-ink">bg-fw-aqua</code>) and <code className="text-ink">Color.kt</code>. The map above is the defaults&apos; playground; to change a default, change <code className="text-ink">apps</code> in the JSON.
        </p>
        <div className="flex flex-wrap gap-x-8">
          <button type="button" onClick={() => copy('Color.kt', KOTLIN_SOURCE)} className="fw-kicker min-h-[48px] text-t1 transition-colors hover:text-ink">
            {copied === 'Color.kt' ? '✓ Copied' : 'Copy Color.kt'}
          </button>
          <button type="button" onClick={download} className="fw-kicker min-h-[48px] text-t1 transition-colors hover:text-ink">
            ↓ Download Color.kt
          </button>
          <button type="button" onClick={() => copy('CSS', CSS_SOURCE)} className="fw-kicker min-h-[48px] text-t1 transition-colors hover:text-ink">
            {copied === 'CSS' ? '✓ Copied' : 'Copy CSS variables'}
          </button>
        </div>
        {copied && !['Color.kt', 'CSS'].includes(copied) && <p className="text-[0.8125rem] text-ink-3">{copied}</p>}
        <div className="grid gap-8 lg:grid-cols-2">
          <pre className="overflow-x-auto text-[0.75rem] font-light leading-[1.6] text-ink-2">{KOTLIN_SOURCE}</pre>
          <div className="flex flex-col gap-6">
            <pre className="overflow-x-auto text-[0.75rem] font-light leading-[1.6] text-ink-2">{CSS_SOURCE}</pre>
            <p className="text-[0.8125rem] font-light text-ink-3">
              Gradient names in Kotlin:{' '}
              {Object.values(KOTLIN_NAME).join(', ')}.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

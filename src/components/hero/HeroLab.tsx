/**
 * File: src/components/hero/HeroLab.tsx
 * Description: The /hero-titles page: thirteen designs for the huge name behind a list or a page, every one fill only
 * (gradients and transparency, no outlines). Each is shown in the Nexus's own setting: the name behind a tagline and
 * three rows, at list size (about 88px, cropped by its column) or page size. Choose the word, the colours, the size and
 * a tag; "Use as FW default" saves one design (the home page draws its title with it). Everything moves with MOTION.
 */
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useDisplay } from '@/components/display/DisplayProvider';
import { HERO_STYLES, type HeroStyle } from '@/lib/display/settings';
import { HERO_INFO, HERO_TAGS, HERO_WORDS, SKIN_TINT, projectTint, type HeroTag, type HeroWord } from '@/lib/hero/heroes';
import HeroTitle from './HeroTitle';

/** A text choice: the colour sits on the inner span because the global button reset would override it on the button. */
function Choice({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="min-h-[48px] px-1 text-left">
      <span className="fw-big text-[19px]" style={{ color: on ? 'var(--t1)' : 'var(--ink)', fontWeight: on ? 500 : 300 }}>
        {label}
      </span>
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-0">
      <span className="fw-kicker w-[5.5rem] text-ink-2">{label}</span>
      <div className="flex flex-wrap gap-x-5">{children}</div>
    </div>
  );
}

/** What sits on top of a title in the Nexus: the kicker with its count, the tagline, then the rows. */
function Sample({ w, colour }: { w: HeroWord; colour: string }) {
  return (
    <div className="flex max-w-[34rem] flex-col pb-2">
      <div className="flex items-baseline gap-3">
        <span className="fw-big text-[14px] font-medium uppercase tracking-[3px]" style={{ color: colour }}>
          {w.word}
        </span>
        <span className="fw-tabular text-[14px] font-light text-t3">{w.rows.length}</span>
      </div>
      <p className="mt-1.5 text-[0.875rem] font-normal text-t3">{w.about}</p>
      <ul className="mt-3.5 flex flex-col gap-1">
        {w.rows.map((r) => (
          <li key={r.t} className="grid grid-cols-[30px_minmax(0,1fr)] items-start py-1.5">
            <span className="mt-[5px] size-[11px] rounded-full border-[1.5px]" style={{ borderColor: colour }} />
            <span className="flex flex-col">
              <span className="text-[1.1875rem] font-light leading-[1.3] text-ink">{r.t}</span>
              <span className="text-[0.875rem] font-normal leading-[1.5] text-t3">{r.d}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HeroLab() {
  const { settings, set } = useDisplay();
  const [wordIdx, setWordIdx] = useState(0);
  const [project, setProject] = useState(true);
  const [page, setPage] = useState(false);
  const [tag, setTag] = useState<HeroTag | 'All'>('All');
  const [plays, setPlays] = useState<Record<string, number>>({});

  const w = HERO_WORDS[wordIdx];
  const tint = project ? projectTint(w.colour, settings.light) : SKIN_TINT;
  const accent = project ? tint.c1 : 'var(--t1)';
  const shown = HERO_STYLES.filter((s) => tag === 'All' || HERO_INFO[s].tags.includes(tag));
  const replay = (id: string) => setPlays((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Hero titles</h1>
        <p className="fw-big max-w-[28ch] text-[29px] font-light leading-[1.25] text-ink">
          The huge name behind the text, drawn as light that follows the letters.
        </p>
        <p className="max-w-[60ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Letters made of light: haze, beams, glass, metal. No outlines anywhere, only fill and transparency. Shown at the
          size they have behind a Nexus list, cropped by the column. Move the pointer over them, scroll past them, and
          change MOTION in the header to feel each at OFF, NORMAL, COLOUR and OTT. A hero title is decoration: it carries
          no meaning and the text on top keeps every tap.
        </p>
      </header>

      <div className="flex flex-col">
        <Row label="Word">
          {HERO_WORDS.map((x, i) => (
            <Choice key={x.word} label={x.word} on={i === wordIdx} onClick={() => setWordIdx(i)} />
          ))}
        </Row>
        <Row label="Colour">
          <Choice label="Project" on={project} onClick={() => setProject(true)} />
          <Choice label="Skin" on={!project} onClick={() => setProject(false)} />
        </Row>
        <Row label="Size">
          <Choice label="List title" on={!page} onClick={() => setPage(false)} />
          <Choice label="Page title" on={page} onClick={() => setPage(true)} />
        </Row>
        <Row label="Show">
          <Choice label="All" on={tag === 'All'} onClick={() => setTag('All')} />
          {HERO_TAGS.map((t) => (
            <Choice key={t} label={t} on={tag === t} onClick={() => setTag(t)} />
          ))}
        </Row>
      </div>

      <div className={`grid gap-y-28 pt-20 ${page ? "" : "gap-x-14 md:grid-cols-2"}`}>
        {shown.map((style: HeroStyle) => {
          const info = HERO_INFO[style];
          const chosen = settings.hero === style;
          const n = HERO_STYLES.indexOf(style) + 1;
          return (
            <section key={style} aria-labelledby={`hero-${style}`} className="flex flex-col gap-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="fw-kicker fw-tabular text-t1">{String(n).padStart(2, '0')}</span>
                    <h2 id={`hero-${style}`} className="fw-kicker text-ink">
                      {info.name}
                    </h2>
                    <span className="text-[0.875rem] font-normal text-t3">{info.tags.join(' · ')}</span>
                  </div>
                  <p className="max-w-[60ch] text-[0.9375rem] font-light text-ink-2">{info.note}</p>
                  <p className="max-w-[60ch] text-[0.875rem] font-normal text-t3">{info.motion}</p>
                </div>

                <div className="flex items-baseline gap-6">
                  <button type="button" onClick={() => replay(style)} className="min-h-[48px]">
                    <span className="fw-kicker text-t1 transition-colors hover:text-ink">↻ Replay</span>
                  </button>
                  <button type="button" onClick={() => set({ hero: style })} aria-pressed={chosen} className="min-h-[48px] border-b" style={{ borderColor: chosen ? 'var(--t1)' : 'transparent' }}>
                    <span className="fw-big whitespace-nowrap text-[18px] font-light uppercase tracking-[0.08em] sm:text-[22px]" style={{ color: chosen ? 'var(--t1)' : 'var(--ink)' }}>
                      {chosen ? 'FW default ✓' : 'Use as FW default'}
                    </span>
                  </button>
                </div>
              </div>

              <HeroTitle word={w.word} variant={style} tint={tint} size={page ? 160 : 88} crop={!page} replay={plays[style] ?? 0}>
                <Sample w={w} colour={accent} />
              </HeroTitle>
            </section>
          );
        })}

        {shown.length === 0 && <p className="text-[1.0625rem] font-light text-ink-2 md:col-span-2">Nothing carries that tag.</p>}
      </div>
    </main>
  );
}

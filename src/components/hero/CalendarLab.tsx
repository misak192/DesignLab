/**
 * File: src/components/hero/CalendarLab.tsx
 * Description: The Calendar tab of /hero-titles: a plain twelve-month calendar (a grid of days per month, a number, a
 * name and a total in each header) used as a test bench for hero titles. The three header parts of every month, its
 * number, its name and its total, can each be tapped and given any hero design, put back to the plain small type, or
 * hidden; the "All" rows do the same for one part of every month at once.
 * Layout knobs:
 *   Size     the font size of a title.
 *   Bleed    how much of a title hangs down over the day numbers instead of pushing them away.
 *   Layout   Row (number, name, total on one line, overlapping when they are big) or Stack (the name under the number).
 *   Stretch  per part: Width (the letters spread across the month), Height (scaled until the capitals are as tall as the
 *            whole month, header and days) or Fill (stretched to the month's width AND height). Height and Fill titles
 *            sit behind the day numbers, anchored top-left (top-right for the total).
 * Nothing is saved: a refresh starts over. The totals are random test numbers; "Shuffle" rolls new ones.
 */
"use client";
import { useEffect, useRef, useState } from 'react';
import { useDisplay } from '@/components/display/DisplayProvider';
import { HERO_STYLES, type HeroStyle } from '@/lib/display/settings';
import { HERO_INFO, HERO_WORDS, SKIN_TINT, projectTint, type HeroTint } from '@/lib/hero/heroes';
import { MONTHS, SLOTS, pad2, sampleTotals, type CalendarMonth, type CalendarSlot } from '@/lib/hero/calendar';
import HeroTitle from './HeroTitle';
import { Choice, Row } from './choices';

/** Hero size (font px) for the number, name and total of a month. */
const SIZES = [
  { label: 'Small', px: 34 },
  { label: 'Medium', px: 50 },
  { label: 'Large', px: 72 },
  { label: 'XL', px: 110 },
  { label: 'Huge', px: 160 },
];

/** How much of a hero's height hangs down into the days instead of pushing them away. */
const BLEEDS = [
  { label: 'Off', v: 0 },
  { label: 'Half', v: 0.5 },
  { label: 'Full', v: 1 },
];

type Stretch = 'off' | 'width' | 'height' | 'fill';
const STRETCHES: { id: Stretch; label: string }[] = [
  { id: 'off', label: 'Off' },
  { id: 'width', label: 'Width' },
  { id: 'height', label: 'Height' },
  { id: 'fill', label: 'Fill' },
];

type Layout = 'row' | 'stack';

/** A part is a hero design, or hidden; plain small type is `undefined`. */
type Design = HeroStyle | 'none';
type Designs = Record<string, Design | undefined>;
const isHero = (d: Design | undefined): d is HeroStyle => d !== undefined && d !== 'none';

/** The height of one header row at rest: the tap target, and the room the plain type sits in. */
const ROW = 48;
/** Jost caps: the viewBox pads each side of the letters by 60 units of a 200 unit em, and the capitals are 0.7em tall. */
const padPx = (size: number) => 0.3 * size;
const capPx = (size: number) => 0.7 * size;
/** The padding above and below the capitals, as a share of the capitals' height (the same at any size). */
const PAD_OF_CAP = 0.3 / 0.7;

const BULK_LABEL: Record<CalendarSlot, string> = { number: 'Month number', name: 'Month name', total: 'Total' };

const keyOf = (n: number, slot: CalendarSlot) => `${n}:${slot}`;
const designName = (d: Design | undefined) => (d === 'none' ? 'hidden' : d ? HERO_INFO[d].name : 'plain');

/** A hero's slot is as tall as the part of it that may not bleed, and never less than a row. */
const slotHeight = (d: Design | undefined, size: number, bleed: number) => (isHero(d) ? Math.max(ROW, capPx(size) * (1 - bleed)) : ROW);

interface Open {
  n: number;
  slot: CalendarSlot;
}

/** The plain look from the reference: small tracked caps, T1 number, ink name, T2 total. */
function plainStyle(slot: CalendarSlot): React.CSSProperties {
  if (slot === 'number') return { color: 'var(--t1)', fontWeight: 500 };
  if (slot === 'name') return { color: 'var(--ink)', fontWeight: 500 };
  return { color: 'var(--t2)', fontWeight: 300 };
}

/** The size of an element, kept up to date. */
function useSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

/** One header part, in the flow of the header. Its button takes the tap; the header around it lets taps through. */
function Slot({ text, slot, design, size, tint, bleed, spread, open, label, onClick }: {
  text: string;
  slot: CalendarSlot;
  design: Design | undefined;
  size: number;
  tint: HeroTint;
  bleed: number;
  /** Stretch the word to this width (px); 0 leaves it as it is. */
  spread: number;
  open: boolean;
  label: string;
  onClick: () => void;
}) {
  const h = slotHeight(design, size, bleed);
  // The hero hangs from the top of its slot: the capitals start where the plain type would, the rest overflows below.
  const inset = isHero(design) ? Math.max(0, (h - capPx(size)) / 2) : 0;
  return (
    <div className={`relative flex-none ${spread ? 'w-full' : 'max-w-full'}`} style={{ height: h }}>
      {isHero(design) ? (
        // The hero is art (aria-hidden); the button on top carries the name. The negative right margin trims the empty
        // padding after the last letter, so a total sits flush with the right edge.
        <div style={{ marginTop: inset - padPx(size), marginRight: slot === 'total' ? -padPx(size) : 0 }}>
          <HeroTitle word={text} variant={design} tint={tint} size={size} crop={false} spread={spread} />
        </div>
      ) : design === 'none' ? null : (
        <span
          className={`fw-big fw-tabular flex h-full items-center whitespace-nowrap text-[15px] ${slot === 'total' ? '' : 'uppercase tracking-[3px]'}`}
          style={plainStyle(slot)}
        >
          {text}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        aria-label={`${label}: ${text}, ${designName(design)}. Change the design`}
        className={`pointer-events-auto absolute top-0 ${design === 'none' ? 'left-0 grid w-12 place-items-center' : '-inset-x-1'}`}
        style={{ height: Math.min(h, ROW) }}
      >
        {design === 'none' ? (
          <span aria-hidden className="fw-kicker text-ink-3">+</span>
        ) : (
          <span
            aria-hidden
            className="absolute inset-x-1 bottom-1.5 h-px transition-opacity"
            style={{ background: 'var(--t1)', opacity: open ? 1 : 0 }}
          />
        )}
      </button>
    </div>
  );
}

/**
 * A title stretched over the whole month, behind the day numbers. Height keeps the letters' proportions and makes the
 * capitals as tall as the month; Fill stretches them to the month's width as well. Anchored top-left, or top-right for
 * the total. Its button covers the letters, so tapping the big title changes it.
 */
function Overlay({ text, design, mode, w, h, right, tint, open, label, onClick }: {
  text: string;
  design: HeroStyle;
  mode: 'height' | 'fill';
  w: number;
  h: number;
  right: boolean;
  tint: HeroTint;
  open: boolean;
  label: string;
  onClick: () => void;
}) {
  if (!w || !h) return null;
  const pad = h * PAD_OF_CAP;
  return (
    <div
      className="absolute"
      style={{ top: -pad, width: mode === 'fill' ? undefined : 'max-content', ...(right ? { right: mode === 'fill' ? undefined : -pad, left: mode === 'fill' ? 0 : undefined } : { left: 0 }) }}
    >
      <HeroTitle
        word={text}
        variant={design}
        tint={tint}
        size={h / 0.7}
        crop={false}
        fit={mode === 'fill' ? { w, h } : undefined}
      />
      <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        aria-label={`${label}: ${text}, ${HERO_INFO[design].name}, stretched. Change the design`}
        className="absolute inset-x-0 cursor-pointer"
        style={{ top: pad, bottom: pad }}
      />
    </div>
  );
}

/** Plain, Hide, then every design, as one wrapping row of choices. `null` lights none (the months differ). */
function DesignChoices({ current, onPick }: { current: Design | undefined | null; onPick: (d: Design | undefined) => void }) {
  return (
    <div className="flex flex-wrap gap-x-5">
      <Choice label="Plain" on={current === undefined} onClick={() => onPick(undefined)} />
      <Choice label="Hide" on={current === 'none'} onClick={() => onPick('none')} />
      {HERO_STYLES.map((s) => (
        <Choice key={s} label={HERO_INFO[s].name} on={current === s} onClick={() => onPick(s)} />
      ))}
    </div>
  );
}

function Picker({ month, slot, current, onPick, onAll, onClose }: {
  month: CalendarMonth;
  slot: CalendarSlot;
  current: Design | undefined;
  onPick: (d: Design | undefined) => void;
  onAll: () => void;
  onClose: () => void;
}) {
  const label = SLOTS.find((s) => s.id === slot)!.label;
  return (
    <div role="group" aria-label={`Design for the ${label.toLowerCase()} of ${month.name}`} className="mb-3 flex flex-col gap-1 pt-2">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="fw-kicker fw-tabular text-t1">{pad2(month.n)}</span>
        <span className="fw-kicker text-ink">{month.name}</span>
        <span className="text-[0.875rem] font-normal text-t3">{label}</span>
      </div>
      <DesignChoices current={current} onPick={onPick} />
      <div className="flex flex-wrap gap-x-6">
        <button type="button" onClick={onAll} className="min-h-[48px]">
          <span className="fw-kicker text-t1 transition-colors hover:text-ink">Use for every {label.toLowerCase()}</span>
        </button>
        <button type="button" onClick={onClose} className="min-h-[48px]">
          <span className="fw-kicker text-ink-2 transition-colors hover:text-ink">Close</span>
        </button>
      </div>
    </div>
  );
}

function Month({ month, designs, totals, size, tint, bleed, layout, stretch, open, onToggle, onPick, onAll, onClose }: {
  month: CalendarMonth;
  designs: Designs;
  totals: number[];
  size: number;
  tint: HeroTint;
  bleed: number;
  layout: Layout;
  stretch: Record<CalendarSlot, Stretch>;
  open: CalendarSlot | null;
  onToggle: (slot: CalendarSlot) => void;
  onPick: (slot: CalendarSlot, d: Design | undefined) => void;
  onAll: (slot: CalendarSlot) => void;
  onClose: () => void;
}) {
  // The stage is the header and the days: what a Height or Fill title stretches over.
  const [stage, box] = useSize();
  const text: Record<CalendarSlot, string> = { number: pad2(month.n), name: month.name, total: String(totals[month.n - 1]) };
  const design = (slot: CalendarSlot) => designs[keyOf(month.n, slot)];
  // Only a hero design can stretch; plain type and hidden parts stay as they are.
  const mode = (slot: CalendarSlot): Stretch => (isHero(design(slot)) ? stretch[slot] : 'off');

  const ids = SLOTS.map((s) => s.id);
  const overlays = ids.filter((id) => mode(id) === 'height' || mode(id) === 'fill');
  const wide = ids.filter((id) => mode(id) === 'width');
  const inline = ids.filter((id) => mode(id) === 'off');
  const has = (id: CalendarSlot) => inline.includes(id);
  const rowH = Math.max(ROW, ...inline.map((id) => slotHeight(design(id), size, bleed)));
  const usesMirror = [...inline, ...wide].some((id) => design(id) === 'mirror');

  const slot = (id: CalendarSlot, spread = 0) => (
    <Slot
      text={text[id]}
      slot={id}
      design={design(id)}
      size={size}
      tint={tint}
      bleed={bleed}
      spread={spread}
      open={open === id}
      label={`${month.name} ${SLOTS.find((s) => s.id === id)!.label.toLowerCase()}`}
      onClick={() => onToggle(id)}
    />
  );

  return (
    <section aria-label={month.name} className="flex flex-col">
      {open && (
        <Picker
          month={month}
          slot={open}
          current={design(open)}
          onPick={(d) => onPick(open, d)}
          onAll={() => onAll(open)}
          onClose={onClose}
        />
      )}

      {/* Big titles overflow sideways (a name at full height is wider than its month), so the stage crops there. */}
      <div ref={stage} className="relative" style={{ clipPath: 'inset(-600px 0 -600px 0)' }}>
        {overlays.map((id) => (
          <Overlay
            key={id}
            text={text[id]}
            design={design(id) as HeroStyle}
            mode={mode(id) as 'height' | 'fill'}
            w={box.w}
            h={box.h}
            right={id === 'total'}
            tint={tint}
            open={open === id}
            label={`${month.name} ${SLOTS.find((s) => s.id === id)!.label.toLowerCase()}`}
            onClick={() => onToggle(id)}
          />
        ))}

        <div
          className="pointer-events-none relative z-[2] flex flex-col"
          // A Mirror's reflection hangs below the word; unless it may bleed, leave it room so it never lands on the days.
          style={{ minHeight: ROW, paddingBottom: usesMirror ? (capPx(size) + 8) * (1 - bleed) : 0 }}
        >
          {layout === 'row' ? (
            <div className="relative" style={{ height: rowH }}>
              <div className="flex h-full items-center gap-x-4">
                {has('number') && slot('number')}
                {/* The name keeps its place after the number and its size; only a name wider than the month shrinks, and
                    what runs past the month's edge is cropped by the stage. */}
                {has('name') && <div className="flex-none" style={{ maxWidth: box.w || undefined }}>{slot('name')}</div>}
              </div>
              {has('total') && <div className="absolute right-0 top-0 flex h-full items-center">{slot('total')}</div>}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-x-4">
                {has('number') ? slot('number') : <span />}
                {has('total') && slot('total')}
              </div>
              {has('name') && <div>{slot('name')}</div>}
            </>
          )}
          {wide.map((id) => (
            <div key={id}>{slot(id, box.w)}</div>
          ))}
        </div>

        <ol className="pointer-events-none relative z-[1] mt-1 grid grid-cols-7">
          {Array.from({ length: month.days }, (_, i) => (
            <li key={i} className="fw-tabular h-[27px] text-center text-[15px] font-light leading-[27px] text-ink-2">
              {i + 1}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function CalendarLab() {
  const { settings } = useDisplay();
  const [designs, setDesigns] = useState<Designs>({});
  const [open, setOpen] = useState<Open | null>(null);
  const [totals, setTotals] = useState<number[]>(() => sampleTotals());
  const [colour, setColour] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [bleedIdx, setBleedIdx] = useState(0);
  const [layout, setLayout] = useState<Layout>('row');
  const [stretch, setStretch] = useState<Record<CalendarSlot, Stretch>>({ number: 'off', name: 'off', total: 'off' });
  const [bulk, setBulk] = useState<CalendarSlot | null>(null);

  const tint = colour === 0 ? SKIN_TINT : projectTint(HERO_WORDS[colour - 1].colour, settings.light);
  const size = SIZES[sizeIdx].px;
  const bleed = BLEEDS[bleedIdx].v;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const setOne = (n: number, slot: CalendarSlot, d: Design | undefined) =>
    setDesigns((p) => ({ ...p, [keyOf(n, slot)]: d }));
  const setAll = (slot: CalendarSlot, d: Design | undefined) =>
    setDesigns((p) => {
      const next = { ...p };
      for (const m of MONTHS) next[keyOf(m.n, slot)] = d;
      return next;
    });
  const toggle = (n: number, slot: CalendarSlot) =>
    setOpen((o) => (o && o.n === n && o.slot === slot ? null : { n, slot }));

  // The design every month shares for a part, or null when they differ (so no design is lit in the "All" row).
  const shared = (slot: CalendarSlot): Design | undefined | null => {
    const first = designs[keyOf(1, slot)];
    return MONTHS.every((m) => designs[keyOf(m.n, slot)] === first) ? first : null;
  };

  return (
    <div className="flex flex-col gap-14">
      <p className="max-w-[60ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
        A plain calendar to try hero titles on. Tap a month&rsquo;s number, its name or its total and choose a design for
        just that one (or hide it), or use the All row to set one part of every month at once. Bleed lets a title hang
        down over the days. Stretch works per part: Width spreads the letters across the month, Height scales the title
        until it is as tall as the whole month, Fill stretches it to the month&rsquo;s width and height. Height and Fill
        sit behind the day numbers; tap the big title to change it.
      </p>

      <div className="flex flex-col">
        <Row label="Colour">
          <Choice label="Skin" on={colour === 0} onClick={() => setColour(0)} />
          {HERO_WORDS.map((w, i) => (
            <Choice key={w.word} label={w.word} on={colour === i + 1} onClick={() => setColour(i + 1)} />
          ))}
        </Row>
        <Row label="Size">
          {SIZES.map((s, i) => (
            <Choice key={s.label} label={s.label} on={sizeIdx === i} onClick={() => setSizeIdx(i)} />
          ))}
        </Row>
        <Row label="Bleed">
          {BLEEDS.map((b, i) => (
            <Choice key={b.label} label={b.label} on={bleedIdx === i} onClick={() => setBleedIdx(i)} />
          ))}
        </Row>
        <Row label="Layout">
          <Choice label="Row" on={layout === 'row'} onClick={() => setLayout('row')} />
          <Choice label="Stack" on={layout === 'stack'} onClick={() => setLayout('stack')} />
        </Row>
        {SLOTS.map((s, i) => (
          <Row key={s.id} label={i === 0 ? 'Stretch' : ''}>
            <span className="fw-kicker w-[4.5rem] self-center text-ink-3">{s.label}</span>
            {STRETCHES.map((m) => (
              <Choice key={m.id} label={m.label} on={stretch[s.id] === m.id} onClick={() => setStretch((p) => ({ ...p, [s.id]: m.id }))} />
            ))}
          </Row>
        ))}
        <Row label="Reset">
          <Choice label="Shuffle totals" on={false} onClick={() => setTotals(sampleTotals(Math.random))} />
          <Choice
            label="All plain"
            on={false}
            onClick={() => {
              setDesigns({});
              setStretch({ number: 'off', name: 'off', total: 'off' });
              setOpen(null);
            }}
          />
        </Row>
        <Row label="All">
          {SLOTS.map((s) => (
            <Choice key={s.id} label={BULK_LABEL[s.id]} on={bulk === s.id} onClick={() => setBulk((b) => (b === s.id ? null : s.id))} />
          ))}
        </Row>
        {bulk && (
          <Row label="Design">
            <DesignChoices current={shared(bulk)} onPick={(d) => setAll(bulk, d)} />
          </Row>
        )}
      </div>

      <div className="grid gap-x-14 gap-y-12 md:grid-cols-2">
        {MONTHS.map((month) => (
          <Month
            key={month.n}
            month={month}
            designs={designs}
            totals={totals}
            size={size}
            tint={tint}
            bleed={bleed}
            layout={layout}
            stretch={stretch}
            open={open && open.n === month.n ? open.slot : null}
            onToggle={(slot) => toggle(month.n, slot)}
            onPick={(slot, d) => setOne(month.n, slot, d)}
            onAll={(slot) => setAll(slot, designs[keyOf(month.n, slot)])}
            onClose={() => setOpen(null)}
          />
        ))}
      </div>
    </div>
  );
}

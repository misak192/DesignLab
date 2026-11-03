/**
 * File: src/components/time/designs/radial.tsx
 * Description: The four radial designs of /time: tree rings (a year is a ring, months are the angle), the spiral (time winds
 * outward so the seasons line up on the spokes), the polar rose (twelve Nightingale petals, one per month, stacked by label) and
 * the sunburst (life, decade, year, month; tap a ring to drill in, tap the centre to come back). Gradients and fills only.
 */
"use client";
import { useMemo, useState } from 'react';
import { anim } from '@/components/chartstudy/shared';
import { argmax, f, polar, sector, smooth, TAU } from '@/lib/time/geometry';
import {
  BY_MONTH,
  DENSITY,
  LABEL_MONTH,
  LABELS,
  MAX_MONTH,
  MEMORIES,
  MONTHS,
  MONTH_LONG,
  MONTH_TOTAL,
  N_MONTHS,
  NL,
  NY,
  TOTAL,
  Y0,
  YEAR_TOTAL,
} from '@/lib/time/data';
import { accent, dens, labelHue } from '../colour';
import { plural, Txt, type DesignProps } from '../kit';

const CX = 240;
const CY = 160;

/* ── T01 Tree rings ───────────────────────────────────────────────────────────────────────────────────────────────── */
export function TreeRings({ mode, live }: DesignProps) {
  const rings = useMemo(() => {
    const maxTot = Math.max(...YEAR_TOTAL);
    const th = YEAR_TOTAL.map((t) => 1.4 + 3.6 * Math.sqrt(t / maxTot));
    const gap = 0.5;
    const k = (126 - gap * NY) / th.reduce((a, b) => a + b, 0);
    const sizes = th.map((t) => t * k + gap);
    return sizes.map((s, i) => {
      const r0 = 12 + sizes.slice(0, i).reduce((a, b) => a + b, 0);
      return { r0, r1: r0 + s - gap };
    });
  }, []);
  return (
    <g>
      {rings.map((ring, i) => (
        <g key={i} style={anim(live, 'fw-tm-fade', 500, { delay: i * 28 })}>
          {BY_MONTH[i].map((c, m) => (
            <path
              key={m}
              d={sector(CX, CY, ring.r0, ring.r1, (m / 12) * TAU + 0.5 / ring.r1, ((m + 1) / 12) * TAU - 0.5 / ring.r1)}
              fill={c ? dens(mode, Math.sqrt(c / MAX_MONTH)) : 'var(--rail)'}
              fillOpacity={c ? 1 : 0.45}
              data-hint={`${Y0 + i} · ${MONTH_LONG[m]} · ${plural(c, 'memory', 'memories')}`}
            />
          ))}
        </g>
      ))}
      <Txt x={CX} y={12} anchor="middle" size={10}>
        Jan
      </Txt>
      <Txt x={CX} y={CY + 3} anchor="middle" size={9}>
        {Y0}
      </Txt>
    </g>
  );
}

/* ── T02 Spiral ───────────────────────────────────────────────────────────────────────────────────────────────────── */
export function Spiral({ mode, live }: DesignProps) {
  const pts = useMemo(
    () =>
      Array.from({ length: N_MONTHS }, (_, i) => {
        const m = i % 12;
        const r = 10 + (128 * i) / (N_MONTHS - 1);
        const [x, y] = polar(CX, CY, r, (m / 12) * TAU);
        return { x, y, r, c: DENSITY[i], m, i };
      }),
    []
  );
  const line = useMemo(() => smooth(pts.map((p) => [p.x, p.y] as [number, number])), [pts]);
  const may = 4;
  return (
    <g>
      {MONTHS.map((name, m) => {
        const [x0, y0] = polar(CX, CY, 8, (m / 12) * TAU);
        const [x1, y1] = polar(CX, CY, 142, (m / 12) * TAU);
        const [lx, ly] = polar(CX, CY, 152, (m / 12) * TAU);
        return (
          <g key={name}>
            <line x1={f(x0)} y1={f(y0)} x2={f(x1)} y2={f(y1)} stroke={m === may ? accent(mode) : 'var(--rail)'} strokeWidth={m === may ? 1 : 0.7} />
            <Txt x={lx} y={ly + 3} anchor="middle" size={10} hi={m === may} fill={m === may ? accent(mode) : undefined}>
              {name}
            </Txt>
          </g>
        );
      })}
      <path d={line} fill="none" stroke="var(--rail)" strokeWidth={0.6} />
      <g style={anim(live, 'fw-tm-fade', 900)}>
        {pts.map((p) => (
          <circle
            key={p.i}
            cx={f(p.x)}
            cy={f(p.y)}
            r={p.c ? 0.7 + 2.1 * Math.sqrt(p.c / MAX_MONTH) : 0.5}
            fill={p.c ? dens(mode, Math.sqrt(p.c / MAX_MONTH)) : 'var(--rail)'}
            data-hint={`${MONTHS[p.m]} ${Y0 + Math.floor(p.i / 12)} · ${plural(p.c, 'memory', 'memories')}`}
          />
        ))}
      </g>
      <Txt x={CX + 6} y={CY - 14} size={9}>
        {Y0}
      </Txt>
    </g>
  );
}

/* ── T03 Polar rose ───────────────────────────────────────────────────────────────────────────────────────────────── */
export function PolarRose({ mode, live }: DesignProps) {
  const best = argmax(MONTH_TOTAL);
  const maxTot = Math.max(...MONTH_TOTAL);
  const rIn = 16;
  const R = 124;
  const rad = (v: number) => rIn + (R - rIn) * Math.sqrt(v / maxTot);
  return (
    <g>
      {[0.25, 0.5, 1].map((s) => (
        <circle key={s} cx={CX} cy={CY} r={rad(maxTot * s)} fill="none" stroke="var(--rail)" strokeWidth={0.6} />
      ))}
      {MONTHS.map((name, m) => {
        let cum = 0;
        const a0 = (m / 12) * TAU + 0.02;
        const a1 = ((m + 1) / 12) * TAU - 0.02;
        const [lx, ly] = polar(CX, CY, R + 16, ((m + 0.5) / 12) * TAU);
        return (
          <g key={name} style={anim(live, 'fw-tm-fade', 600, { delay: m * 60 })}>
            {LABEL_MONTH[m].map((c, l) => {
              const r0 = cum ? rad(cum) : rIn;
              cum += c;
              return <path key={l} d={sector(CX, CY, r0, rad(cum), a0, a1)} fill={labelHue(mode, l)} fillOpacity={0.9} data-hint={`${MONTH_LONG[m]} · ${LABELS[l].name} · ${c} of ${MONTH_TOTAL[m]}`} />;
            })}
            <Txt x={lx} y={ly + 3} anchor="middle" size={10} hi={m === best} fill={m === best ? accent(mode) : undefined}>
              {name}
            </Txt>
          </g>
        );
      })}
      <Txt x={10} y={20} size={12} hi>
        {MONTH_LONG[best]} is the richest month
      </Txt>
      <Txt x={10} y={36} size={10}>
        {MONTH_TOTAL[best]} of {TOTAL} memories ({Math.round((100 * MONTH_TOTAL[best]) / TOTAL)}%)
      </Txt>
    </g>
  );
}

/* ── T04 Sunburst ─────────────────────────────────────────────────────────────────────────────────────────────────── */
interface SNode {
  key: string;
  name: string;
  value: number;
  lab: number[];
  kids: SNode[];
}

const newNode = (key: string, name: string): SNode => ({ key, name, value: 0, lab: Array.from({ length: NL }, () => 0), kids: [] });

function buildTree(): SNode {
  const root = newNode('life', 'Life');
  const decades = new Map<number, SNode>();
  const years = new Map<number, SNode>();
  const months = new Map<number, SNode>();
  for (const m of MEMORIES) {
    const dk = Math.floor(m.year / 10) * 10;
    let d = decades.get(dk);
    if (!d) {
      d = newNode(`d${dk}`, `${dk}s`);
      decades.set(dk, d);
      root.kids.push(d);
    }
    let y = years.get(m.year);
    if (!y) {
      y = newNode(`y${m.year}`, String(m.year));
      years.set(m.year, y);
      d.kids.push(y);
    }
    const mk = m.year * 12 + m.month;
    let mo = months.get(mk);
    if (!mo) {
      mo = newNode(`m${mk}`, `${MONTH_LONG[m.month]} ${m.year}`);
      months.set(mk, mo);
      y.kids.push(mo);
    }
    for (const n of [root, d, y, mo]) {
      n.value++;
      n.lab[m.label]++;
    }
  }
  return root;
}

interface SArc {
  node: SNode;
  a0: number;
  a1: number;
  depth: number;
}

function layout(node: SNode, a0: number, a1: number, depth: number, out: SArc[]) {
  let a = a0;
  for (const kid of node.kids) {
    const span = ((a1 - a0) * kid.value) / node.value;
    out.push({ node: kid, a0: a, a1: a + span, depth });
    if (depth < 2) layout(kid, a, a + span, depth + 1, out);
    a += span;
  }
}

export function Sunburst({ mode, live, hint }: DesignProps) {
  const tree = useMemo(() => buildTree(), []);
  const [trail, setTrail] = useState<string[]>([]);
  let root = tree;
  for (const key of trail) root = root.kids.find((k) => k.key === key) ?? root;
  const arcs: SArc[] = [];
  layout(root, 0, TAU, 0, arcs);
  const dom = (n: SNode) => argmax(n.lab);
  const drill = (n: SNode) => {
    if (n.kids.length) {
      setTrail([...trail, n.key]);
      hint(null);
    }
  };
  return (
    <g key={trail.join('/')} style={anim(live, 'fw-tm-fade', 450)}>
      {arcs.map(({ node, a0, a1, depth }) => {
        const r0 = 40 + depth * 34;
        const pad = Math.min(0.006, (a1 - a0) / 4);
        const mid = (a0 + a1) / 2;
        const [tx, ty] = polar(CX, CY, r0 + 15.5, mid);
        const hue = labelHue(mode, dom(node));
        return (
          <g key={node.key}>
            <path
              d={sector(CX, CY, r0, r0 + 31, a0 + pad, a1 - pad)}
              fill={hue}
              fillOpacity={0.95 - depth * 0.22}
              data-hint={`${node.name} · ${plural(node.value, 'memory', 'memories')} · mostly ${LABELS[dom(node)].name.toLowerCase()}${node.kids.length ? ' · tap to open' : ''}`}
              style={{ cursor: node.kids.length ? 'pointer' : 'default' }}
              role={node.kids.length ? 'button' : undefined}
              tabIndex={node.kids.length ? 0 : undefined}
              aria-label={node.kids.length ? `Open ${node.name}` : undefined}
              onClick={() => drill(node)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && drill(node)}
            />
            {a1 - a0 >= 0.45 && (
              <g style={{ pointerEvents: 'none' }}>
                <Txt x={tx} y={ty + 3} anchor="middle" size={10} hi>
                  {node.name.length > 5 && depth === 0 ? node.name.split(' ')[0].slice(0, 3) : node.name}
                </Txt>
              </g>
            )}
          </g>
        );
      })}
      <circle
        cx={CX}
        cy={CY}
        r={36}
        fill="rgba(0,0,0,0)"
        style={{ cursor: trail.length ? 'pointer' : 'default', pointerEvents: 'all' }}
        role={trail.length ? 'button' : undefined}
        tabIndex={trail.length ? 0 : undefined}
        aria-label={trail.length ? 'Go up one level' : undefined}
        onClick={() => trail.length && setTrail(trail.slice(0, -1))}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && trail.length && setTrail(trail.slice(0, -1))}
      />
      <g style={{ pointerEvents: 'none' }}>
        <Txt x={CX} y={CY - 2} anchor="middle" size={13} hi>
          {root.name.length > 11 ? root.name.slice(0, 3) + root.name.slice(root.name.lastIndexOf(' ')) : root.name}
        </Txt>
        <Txt x={CX} y={CY + 12} anchor="middle" size={9}>
          {root.value}
        </Txt>
        {trail.length > 0 && (
          <Txt x={CX} y={CY + 25} anchor="middle" size={9}>
            tap to go up
          </Txt>
        )}
      </g>
      <Txt x={10} y={312} size={10}>
        {trail.length ? 'Tap the centre to go up.' : 'Tap a decade to open it, then a year.'}
      </Txt>
    </g>
  );
}

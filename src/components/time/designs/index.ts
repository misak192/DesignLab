/**
 * File: src/components/time/designs/index.ts
 * Description: The sixteen designs of /time in order: id, name, group, whether it came from Michal's list or was added, what it
 * shows and what to look for, and the component that draws it.
 */
import type { ComponentType } from 'react';
import type { DesignProps } from '../kit';
import { PolarRose, Spiral, Sunburst, TreeRings } from './radial';
import { LifeInWeeks, SmallMultiples, WarmingStripes, WeekRhythm } from './grids';
import { GlowTimeline, Ridgeline, Sankey, Streamgraph } from './flows';
import { ArcDiagram, Constellation, DotLanes, PeriodLanes } from './links';

export interface Design {
  id: string;
  name: string;
  group: 'radial' | 'grids' | 'flows' | 'links';
  /** From Michal's list, or added. */
  from: 'list' | 'added';
  description: string;
  Component: ComponentType<DesignProps>;
}

export const GROUPS: { id: Design['group']; name: string; blurb: string }[] = [
  { id: 'radial', name: 'Radial', blurb: 'Time as a circle: the year is the angle, so the seasons line up.' },
  { id: 'grids', name: 'Stripes and grids', blurb: 'Every month, week or day is a cell, and the pattern is the picture.' },
  { id: 'flows', name: 'Flows and density', blurb: 'How things swell, thin and move over the years.' },
  { id: 'links', name: 'Periods and links', blurb: 'The chapters of a life, and what connects them.' },
];

export const DESIGNS: Design[] = [
  {
    id: 'T01',
    name: 'Tree rings',
    group: 'radial',
    from: 'list',
    description: 'Each year is a ring, the months are the angle from the top, clockwise. A rich year is a thick ring, so the life reads like the cross-section of a trunk.',
    Component: TreeRings,
  },
  {
    id: 'T02',
    name: 'Spiral',
    group: 'radial',
    from: 'list',
    description: 'Time winds outward, one turn a year, so the same month of every year lies on the same spoke. Look along the May spoke: it stays bright for 35 years.',
    Component: Spiral,
  },
  {
    id: 'T03',
    name: 'Polar rose',
    group: 'radial',
    from: 'list',
    description: 'Twelve Nightingale petals, one per month, their area the number of memories and the stack inside them the labels. The headline writes itself: most days landed in May.',
    Component: PolarRose,
  },
  {
    id: 'T04',
    name: 'Sunburst',
    group: 'radial',
    from: 'list',
    description: 'Life, decade, year, month as concentric rings, coloured by the label that dominates. Tap a decade to open it, a year to see its months, the centre to go back up.',
    Component: Sunburst,
  },
  {
    id: 'T05',
    name: 'Warming stripes',
    group: 'grids',
    from: 'list',
    description: 'One thin stripe for every month, coloured by how full it was, with a mood stripe under it. Minimal enough to be a shareable image of a whole life.',
    Component: WarmingStripes,
  },
  {
    id: 'T06',
    name: 'Life in weeks',
    group: 'grids',
    from: 'added',
    description: 'Every week of the life as one cell, a row for each year. The empty weeks matter as much as the full ones; the dim cells at the end are the weeks not yet lived.',
    Component: LifeInWeeks,
  },
  {
    id: 'T07',
    name: 'Small multiples',
    group: 'grids',
    from: 'list',
    description: 'A tiny calendar for every year, the weeks in four quarter rows, tiled in one grid. Patterns across years show without any interaction; the richest years are marked.',
    Component: SmallMultiples,
  },
  {
    id: 'T08',
    name: 'Week rhythm',
    group: 'grids',
    from: 'added',
    description: 'A punchcard of weekday against month: when in the week and the year things tend to be recorded. It shows what the other views cannot, the rhythm of the days.',
    Component: WeekRhythm,
  },
  {
    id: 'T09',
    name: 'Streamgraph',
    group: 'flows',
    from: 'list',
    description: 'The labels as ribbons around a moving centre: work, learning, love, travel, family and health swell and shrink over the years. Each ribbon is a shifted gradient of its own colour.',
    Component: Streamgraph,
  },
  {
    id: 'T10',
    name: 'Ridgeline',
    group: 'flows',
    from: 'list',
    description: 'One soft curve per year, stacked, showing when in the year the memories cluster and how that shifts. The dotted line is May.',
    Component: Ridgeline,
  },
  {
    id: 'T11',
    name: 'Glowing timeline',
    group: 'flows',
    from: 'added',
    description: 'A single line of light that swells where life was full, with stems rising from the richest months. The timeline as one object, in the lab’s light-ray language.',
    Component: GlowTimeline,
  },
  {
    id: 'T12',
    name: 'Sankey of chapters',
    group: 'flows',
    from: 'list',
    description: 'The places lived, the work and the focus as columns, joined by ribbons as wide as the time two chapters overlapped. Read it as a life seen from the side.',
    Component: Sankey,
  },
  {
    id: 'T13',
    name: 'Period lanes',
    group: 'links',
    from: 'added',
    description: 'The direct answer to periods over time: one lane each for places, work, focus and who you were with, every chapter a soft bar that melts into the next at its ends.',
    Component: PeriodLanes,
  },
  {
    id: 'T14',
    name: 'Arc diagram',
    group: 'links',
    from: 'list',
    description: 'Arcs join the memories that share a person, above the line for some and below for others, so recurring threads show: who was there, and for how long.',
    Component: ArcDiagram,
  },
  {
    id: 'T15',
    name: 'Dot lanes',
    group: 'links',
    from: 'added',
    description: 'A lane per label with every memory a dot, packed so none overlaps, over a soft glow of density. The size of a dot is how much it weighed.',
    Component: DotLanes,
  },
  {
    id: 'T16',
    name: 'Constellation',
    group: 'links',
    from: 'added',
    description: 'The two strongest memories of every year are stars, joined in time order into one constellation; height is mood. The rest of the life is dust around it.',
    Component: Constellation,
  },
];

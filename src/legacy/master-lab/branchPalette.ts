/**
 * File: src/legacy/master-lab/branchPalette.ts
 * Description: Colour for branching comments. Every top-level branch gets a whole theme gradient,
 * and every split shares its parent's slice of that gradient equally between the replies.
 */
import type { CommentNode } from './commentTree';
import type { ThemeLevel } from './themes';

export interface ColorRange {
  theme: ThemeLevel;
  // Where this branch's slice starts and ends along the theme gradient (0 to 1).
  start: number;
  end: number;
}

// Each theme in app/globals.css defines five colours, --node-1 to --node-5.
const THEME_NODES = 5;

export const rangeMidpoint = (range: ColorRange) => (range.start + range.end) / 2;

// A colour at a position along the gradient, mixed by the browser from the theme's CSS variables.
// It only resolves inside an element that carries the theme class.
export function colorAt(position: number): string {
  const scaled = Math.min(Math.max(position, 0), 1) * (THEME_NODES - 1);
  const segment = Math.min(Math.floor(scaled), THEME_NODES - 2);
  const share = Math.round((1 - (scaled - segment)) * 100);
  return `color-mix(in oklab, var(--node-${segment + 1}) ${share}%, var(--node-${segment + 2}))`;
}

// Slices are handed out in time order, so a comment keeps its colour when votes move it around.
export function assignColorRanges(roots: CommentNode[], themes: ThemeLevel[]): Map<string, ColorRange> {
  const ranges = new Map<string, ColorRange>();
  const oldestFirst = (nodes: CommentNode[]) => [...nodes].sort((a, b) => a.created_at.localeCompare(b.created_at));

  const paint = (node: CommentNode, range: ColorRange) => {
    ranges.set(node.id, range);
    const replies = oldestFirst(node.children);
    const width = (range.end - range.start) / replies.length;
    replies.forEach((reply, index) =>
      paint(reply, { theme: range.theme, start: range.start + index * width, end: range.start + (index + 1) * width })
    );
  };

  oldestFirst(roots).forEach((root, index) =>
    paint(root, { theme: themes[index % themes.length], start: 0, end: 1 })
  );

  return ranges;
}

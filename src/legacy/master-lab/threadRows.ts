/**
 * File: src/legacy/master-lab/threadRows.ts
 * Description: Lays a comment tree out as rows for the Master Lab thread. The best reply continues in the same
 * column; other replies step one column in, right under the comment they answer, and replies past the limit wait
 * behind a "more" row. Each row records the lines that pass it, so the thread is drawn with hairlines and dots only.
 */
import type { ColorRange } from './branchPalette';
import type { CommentNode } from './commentTree';

export interface ThreadRail {
  column: number;
  range: ColorRange;
}

export interface ThreadCommentRow {
  kind: 'comment';
  key: string;
  node: CommentNode;
  column: number;
  range: ColorRange;
  // How the row joins the thread: first comment of a top branch, the best reply continuing a column,
  // or a side reply stepping in under the comment it answers.
  joins: 'start' | 'continues' | 'branches';
  // Colour of the best reply below, when this row's column carries on.
  nextRange?: ColorRange;
  // Columns from rows above that run past this row on their way to their best reply.
  passing: ThreadRail[];
  isOpen: boolean;
}

export interface ThreadMoreRow {
  kind: 'more';
  key: string;
  // The comment whose remaining replies this row reveals.
  parent: CommentNode;
  column: number;
  range: ColorRange;
  hiddenCount: number;
  passing: ThreadRail[];
}

export type ThreadRow = ThreadCommentRow | ThreadMoreRow;

interface LayoutOptions {
  openIds: Set<string>;
  // Comments whose full list of replies was asked for with "more".
  expandedIds: Set<string>;
  ranges: Map<string, ColorRange>;
  // Replies shown under a comment before the rest wait behind "more". The best reply counts as one.
  replyLimit: number;
}

export function layoutThread(root: CommentNode, { openIds, expandedIds, ranges, replyLimit }: LayoutOptions): ThreadRow[] {
  const rows: ThreadRow[] = [];
  const rails: ThreadRail[] = [];

  const visit = (node: CommentNode, column: number, joins: ThreadCommentRow['joins']) => {
    const range = ranges.get(node.id);
    if (!range) return;

    const isOpen = openIds.has(node.id) && node.children.length > 0;
    const [best, ...sideReplies] = isOpen ? node.children : [];
    const bestRange = best ? ranges.get(best.id) : undefined;

    rows.push({ kind: 'comment', key: node.id, node, column, range, joins, nextRange: bestRange, passing: [...rails], isOpen });
    if (!best || !bestRange) return;

    const shownSideReplies = expandedIds.has(node.id) ? sideReplies : sideReplies.slice(0, Math.max(replyLimit - 1, 0));
    const hiddenCount = sideReplies.length - shownSideReplies.length;

    // The column keeps running past the side replies until it reaches the best reply.
    rails.push({ column, range: bestRange });
    shownSideReplies.forEach((reply) => visit(reply, column + 1, 'branches'));
    if (hiddenCount > 0) {
      rows.push({ kind: 'more', key: `more-${node.id}`, parent: node, column: column + 1, range, hiddenCount, passing: [...rails] });
    }
    rails.pop();

    visit(best, column, 'continues');
  };

  visit(root, 0, 'start');
  return rows;
}

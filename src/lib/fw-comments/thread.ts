/**
 * File: src/lib/fw-comments/thread.ts
 * Description: Thread maths for the letter-coded comments, as pure functions: vote tallies, the tree, and the two
 * counts the first word can show (direct replies for a hero, posts by one person for everyone else).
 * No React, no DOM, no storage: this must be able to move into @frissonworks/comments unchanged.
 */

export interface FwComment {
  id: string;
  parentId: string | null;
  authorId: string;
  body: string;
  /** Milliseconds since the epoch. */
  createdAt: number;
  /** Votes the comment arrived with (mock data), on top of the live votes below. */
  seedUp?: number;
  seedDown?: number;
}

/** commentId -> userId -> vote. One vote per person per comment; the same vote again takes it back. */
export type VoteMap = Record<string, Record<string, 1 | -1>>;

export interface Tally {
  up: number;
  down: number;
}

export function tally(comment: FwComment, votes: VoteMap): Tally {
  let up = comment.seedUp ?? 0;
  let down = comment.seedDown ?? 0;
  Object.values(votes[comment.id] ?? {}).forEach((vote) => {
    if (vote === 1) up++;
    else down++;
  });
  return { up, down };
}

/** Cast, switch or withdraw one person's vote. Returns a new map. */
export function castVote(votes: VoteMap, commentId: string, userId: string, vote: 1 | -1): VoteMap {
  const forComment = { ...(votes[commentId] ?? {}) };
  if (forComment[userId] === vote) delete forComment[userId];
  else forComment[userId] = vote;
  return { ...votes, [commentId]: forComment };
}

export interface ThreadNode {
  comment: FwComment;
  children: ThreadNode[];
  depth: number;
  /** The root comment of this node's thread: the "hero". */
  rootId: string;
  /** Immediate children only, not every descendant and not distinct branches: this drives a hero's meter. */
  directReplies: number;
  /** Every reply below this comment at every level (what the count at the end of a row shows). */
  descendants: number;
  /** How many times this comment's author has posted in this thread (the comment itself included). */
  authorPosts: number;
}

/**
 * Build every thread. Roots are newest first; replies follow `childOrder` (oldest first unless the room asks for Top or New).
 * A comment whose parent is missing is treated as a root.
 */
export function buildThreads(
  comments: FwComment[],
  /** How replies are ordered at every level. Default: oldest first, so a conversation reads top to bottom. */
  childOrder: (a: FwComment, b: FwComment) => number = (a, b) => a.createdAt - b.createdAt
): ThreadNode[] {
  const byId = new Map(comments.map((c) => [c.id, c]));
  const childrenOf = new Map<string, FwComment[]>();
  const roots: FwComment[] = [];

  comments.forEach((c) => {
    if (c.parentId && byId.has(c.parentId)) childrenOf.set(c.parentId, [...(childrenOf.get(c.parentId) ?? []), c]);
    else roots.push(c);
  });

  const build = (comment: FwComment, depth: number, rootId: string, posts: Map<string, number>): ThreadNode => {
    const kids = (childrenOf.get(comment.id) ?? []).sort(childOrder);
    const children = kids.map((kid) => build(kid, depth + 1, rootId, posts));
    return {
      comment,
      depth,
      rootId,
      directReplies: kids.length,
      descendants: children.reduce((sum, child) => sum + 1 + child.descendants, 0),
      authorPosts: posts.get(comment.authorId) ?? 1,
      children,
    };
  };

  const postsIn = (root: FwComment): Map<string, number> => {
    const posts = new Map<string, number>();
    const walk = (c: FwComment) => {
      posts.set(c.authorId, (posts.get(c.authorId) ?? 0) + 1);
      (childrenOf.get(c.id) ?? []).forEach(walk);
    };
    walk(root);
    return posts;
  };

  return roots.sort((a, b) => b.createdAt - a.createdAt).map((root) => build(root, 0, root.id, postsIn(root)));
}

/** Total comments in a thread, root included. */
export function threadSize(node: ThreadNode): number {
  return 1 + node.children.reduce((sum, child) => sum + threadSize(child), 0);
}

export type ThreadView = 'top' | 'new' | 'mine' | 'reply';

const hasComment = (node: ThreadNode, test: (node: ThreadNode, parent: ThreadNode | null) => boolean, parent: ThreadNode | null = null): boolean =>
  test(node, parent) || node.children.some((child) => hasComment(child, test, node));

/**
 * The room's filter row, as a pure function.
 *  top    every thread, best score first (the hero's net score, then its size)
 *  new    every thread, newest first
 *  mine   threads where the viewer (meId) has posted anything
 *  reply  threads where someone else has replied to one of the viewer's comments
 * Mine and reply are newest first too.
 */
export function arrangeThreads(threads: ThreadNode[], view: ThreadView, meId: string, score: (comment: FwComment) => number): ThreadNode[] {
  const byNew = (a: ThreadNode, b: ThreadNode) => b.comment.createdAt - a.comment.createdAt;
  if (view === 'top') {
    return [...threads].sort((a, b) => score(b.comment) - score(a.comment) || threadSize(b) - threadSize(a) || byNew(a, b));
  }
  if (view === 'mine') return threads.filter((t) => hasComment(t, (n) => n.comment.authorId === meId)).sort(byNew);
  if (view === 'reply') {
    return threads
      .filter((t) => hasComment(t, (n, parent) => parent !== null && parent.comment.authorId === meId && n.comment.authorId !== meId))
      .sort(byNew);
  }
  return [...threads].sort(byNew);
}

/**
 * File: src/legacy/master-lab/commentTree.ts
 * Description: Turns flat comment rows (the way Supabase returns them) into a ranked reply tree,
 * plus the helpers every comment layout shares.
 */
import type { CommentEntity } from './types';

export interface CommentNode extends CommentEntity {
  children: CommentNode[];
  // Total comments in this subtree, including the comment itself.
  size: number;
  // Up minus down votes. 0 everywhere when a layout does not use voting.
  score: number;
}

// Highest score first, then most discussed, then oldest, so the order never jumps around.
const byRank = (a: CommentNode, b: CommentNode) =>
  b.score - a.score || b.size - a.size || a.created_at.localeCompare(b.created_at);

export function buildCommentTree(comments: CommentEntity[], scores: Record<string, number> = {}): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  comments.forEach((comment) =>
    nodes.set(comment.id, { ...comment, children: [], size: 1, score: scores[comment.id] ?? 0 })
  );

  const roots: CommentNode[] = [];
  nodes.forEach((node) => {
    const parent = node.parent_comment_id ? nodes.get(node.parent_comment_id) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  const finalize = (node: CommentNode): number => {
    node.size = 1 + node.children.reduce((sum, child) => sum + finalize(child), 0);
    node.children.sort(byRank);
    return node.size;
  };
  roots.forEach(finalize);

  return roots.sort(byRank);
}

// The "main branch": starting from a comment, keep following its best-ranked reply.
export function getMainLine(start: CommentNode): CommentNode[] {
  const line = [start];
  let current = start;
  while (current.children.length > 0) {
    current = current.children[0];
    line.push(current);
  }
  return line;
}

export interface PathStep {
  // What the options answer: a comment id, or the root key for top-level comments.
  parentId: string;
  options: CommentNode[];
  chosen: CommentNode;
}

// Walk down a conversation: at each level take the picked reply, or the best one when nothing was picked.
export function followPath(roots: CommentNode[], picks: Record<string, string>, rootKey = 'post'): PathStep[] {
  const steps: PathStep[] = [];
  let options = roots;
  let parentId = rootKey;

  while (options.length > 0) {
    const chosen = options.find((option) => option.id === picks[parentId]) ?? options[0];
    steps.push({ parentId, options, chosen });
    parentId = chosen.id;
    options = chosen.children;
  }

  return steps;
}

export function countComments(roots: CommentNode[]): number {
  return roots.reduce((sum, root) => sum + root.size, 0);
}

// Every comment in the given subtrees as one list, oldest first.
export function flattenTree(nodes: CommentNode[]): CommentNode[] {
  const all: CommentNode[] = [];
  const walk = (list: CommentNode[]) =>
    list.forEach((node) => {
      all.push(node);
      walk(node.children);
    });
  walk(nodes);

  return all.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

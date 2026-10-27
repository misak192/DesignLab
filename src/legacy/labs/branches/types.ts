/**
 * File: src/legacy/labs/branches/types.ts
 * Description: Props every Branches Lab variation receives.
 */
import type { CommentNode } from '@/legacy/master-lab/commentTree';
import type { VoteHandler } from '@/legacy/master-lab/VoteControl';

export interface BranchLayoutProps {
  // Top-level comments, already ranked by votes (then discussion).
  roots: CommentNode[];
  onVote: VoteHandler;
}

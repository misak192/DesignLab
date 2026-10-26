/**
 * File: src/components/comments/context.tsx
 * Description: What every row of a comment board needs to know: who is looking, who the characters are, which display
 * options are on, the live votes, and the two things a row can do (vote, post). Everything lives in memory in
 * CommentsBoard.
 */
"use client";
import { createContext, useContext } from 'react';
import type { PaletteName, Person, VoteMap } from '@/lib/fw-comments';

export interface CommentsContextValue {
  /** Everyone who can appear in this board. */
  people: Person[];
  me: Person;
  /** The Comments Lab is read-only (you vote, nobody posts); the Room lets you post and reply. */
  canPost: boolean;
  /** First word also counts how many times that person has posted in the thread. */
  showParticipation: boolean;
  palette: PaletteName;
  /** Draw the 1px vertical hairline beside each group of replies (off in Row layout v2: indent + colour only). */
  threadLines: boolean;
  /** How many levels of replies one tap on a sentence opens (1 = just its direct replies). */
  openLevels: number;
  votes: VoteMap;
  vote: (commentId: string, vote: 1 | -1) => void;
  post: (parentId: string | null, body: string) => void;
}

export const CommentsContext = createContext<CommentsContextValue | null>(null);

export function useComments(): CommentsContextValue {
  const value = useContext(CommentsContext);
  if (!value) throw new Error('useComments must be used inside <CommentsContext>');
  return value;
}

export const personById = (people: Person[], id: string): Person => people.find((p) => p.id === id) ?? people[0];

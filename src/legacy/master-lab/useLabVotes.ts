/**
 * File: src/legacy/master-lab/useLabVotes.ts
 * Description: Lab-only vote state. Every click counts (no one-vote-per-person rule), so rankings can be pushed around.
 */
import { useMemo, useState } from 'react';

export function useLabVotes(initialVotes: Record<string, number>) {
  const [changes, setChanges] = useState<Record<string, number>>({});

  const scores = useMemo(() => {
    const merged = { ...initialVotes };
    Object.entries(changes).forEach(([commentId, change]) => {
      merged[commentId] = (merged[commentId] ?? 0) + change;
    });
    return merged;
  }, [initialVotes, changes]);

  const vote = (commentId: string, delta: 1 | -1) =>
    setChanges((prev) => ({ ...prev, [commentId]: (prev[commentId] ?? 0) + delta }));

  const reset = () => setChanges({});

  return { scores, vote, reset, hasVoted: Object.keys(changes).length > 0 };
}

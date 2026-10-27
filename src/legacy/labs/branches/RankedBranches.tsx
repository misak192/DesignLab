/**
 * File: src/legacy/labs/branches/RankedBranches.tsx
 * Description: Branches Lab 01. The git-style lanes from the Comments Lab, ranked by votes, with shorter controls.
 */
"use client";
import { motion } from 'framer-motion';
import BranchLine from './BranchLine';
import type { BranchLayoutProps } from './types';

export default function RankedBranches({ roots, onVote }: BranchLayoutProps) {
  return (
    <div className="flex flex-col gap-10">
      {roots.map((root) => (
        <motion.div layout="position" key={root.id}>
          <BranchLine start={root} onVote={onVote} />
        </motion.div>
      ))}
    </div>
  );
}

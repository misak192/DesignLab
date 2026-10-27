/**
 * File: src/legacy/labs/branches/OldBranches.tsx
 * Description: ObservaLyst's Branches Lab as a tab of /comments: six ways to branch one debate, with live voting.
 * Rendered on the server, because the seeded conversation is dated relative to "now".
 */
import { connection } from 'next/server';
import { legacyBody } from '@/legacy/legacyBody';
import BranchExperimentSection from './BranchExperimentSection';
import { getBranchExperiments } from './mockBranchLab';
import '@/legacy/master-lab/legacy.css';
import '../labs.css';

export default async function OldBranches() {
  await connection();
  const experiments = getBranchExperiments();

  return (
    <div className={`${legacyBody.className} fw-legacy fw-labs theme-aurora flex flex-col divide-y divide-[var(--foreground)]/10`}>
      {experiments.map((experiment) => (
        <BranchExperimentSection key={experiment.id} experiment={experiment} />
      ))}
    </div>
  );
}

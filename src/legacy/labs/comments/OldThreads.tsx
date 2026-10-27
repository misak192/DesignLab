/**
 * File: src/legacy/labs/comments/OldThreads.tsx
 * Description: ObservaLyst's Comments Lab as a tab of /comments: five ways to hold a conversation, each under the
 * post it belongs to. Rendered on the server, because the seeded conversations are dated relative to "now".
 */
import { connection } from 'next/server';
import { legacyBody } from '@/legacy/legacyBody';
import LabExperimentSection from './LabExperimentSection';
import { getLabExperiments } from './mockCommentLab';
import '@/legacy/master-lab/legacy.css';
import '../labs.css';

export default async function OldThreads() {
  await connection();
  const experiments = getLabExperiments();

  return (
    <div className={`${legacyBody.className} fw-legacy fw-labs theme-aurora flex flex-col divide-y divide-[var(--foreground)]/10`}>
      {experiments.map((experiment) => (
        <LabExperimentSection key={experiment.id} experiment={experiment} />
      ))}
    </div>
  );
}

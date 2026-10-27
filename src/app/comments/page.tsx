import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import CommentsPage from '@/components/comments/CommentsPage';
import MasterThread from '@/legacy/master-lab/MasterThread';
import { getMasterDiscussion } from '@/legacy/master-lab/mockMasterLab';
import { legacyBody } from '@/legacy/legacyBody';
import OldThreads from '@/legacy/labs/comments/OldThreads';
import OldBranches from '@/legacy/labs/branches/OldBranches';
import '@/legacy/master-lab/legacy.css';

export const metadata: Metadata = {
  title: 'Comments | FrissonWorks Design Lab',
};

// The old thread's mock timestamps are relative to "now", so it renders per request instead of being frozen at build time.
async function OldThread() {
  await connection();
  const { observation, comments, votes } = getMasterDiscussion();
  return (
    <div className={`${legacyBody.className} fw-legacy theme-aurora`}>
      <MasterThread observation={observation} comments={comments} votes={votes} />
    </div>
  );
}

export default function Page() {
  // The seed conversations are dated relative to "now", which Next won't freeze into the prerendered page,
  // so the page renders at request time behind a boundary. The three ported labs do the same, each in its own.
  return (
    <Suspense fallback={null}>
      <CommentsPage
        old={
          <Suspense fallback={null}>
            <OldThread />
          </Suspense>
        }
        threads={
          <Suspense fallback={null}>
            <OldThreads />
          </Suspense>
        }
        branches={
          <Suspense fallback={null}>
            <OldBranches />
          </Suspense>
        }
      />
    </Suspense>
  );
}

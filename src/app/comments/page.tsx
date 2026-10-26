import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { connection } from 'next/server';
import CommentsPage from '@/components/comments/CommentsPage';
import MasterThread from '@/legacy/master-lab/MasterThread';
import { getMasterDiscussion } from '@/legacy/master-lab/mockMasterLab';
import '@/legacy/master-lab/legacy.css';

export const metadata: Metadata = {
  title: 'Comments | FrissonWorks Design Lab',
};

// ObservaLyst's body face, so the old design reads the way it did there.
const inter = Inter({ subsets: ['latin'] });

// The old thread's mock timestamps are relative to "now", so it renders per request instead of being frozen at build time.
async function OldThread() {
  await connection();
  const { observation, comments, votes } = getMasterDiscussion();
  return (
    <div className={`${inter.className} fw-legacy theme-aurora`}>
      <MasterThread observation={observation} comments={comments} votes={votes} />
    </div>
  );
}

export default function Page() {
  // The seed conversations are dated relative to "now", which Next won't freeze into the prerendered page,
  // so the page renders at request time behind a boundary.
  return (
    <Suspense fallback={null}>
      <CommentsPage
        old={
          <Suspense fallback={null}>
            <OldThread />
          </Suspense>
        }
      />
    </Suspense>
  );
}

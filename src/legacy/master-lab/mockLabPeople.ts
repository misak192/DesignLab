/**
 * File: src/legacy/master-lab/mockLabPeople.ts
 * Description: The cast of mock observers shared by the labs, plus helpers that turn compact seed rows
 * into the same shapes Supabase will return.
 */
import type { CommentEntity, ObservationEntity, ObserverProfile } from './types';

export const MINUTE = 60000;

export const PEOPLE = {
  michalku: { id: 'mock-observer-1', display_name: 'Michálku', occupation: 'Lead Architect', aura_score: 85 },
  sarah: { id: 'mock-observer-2', display_name: 'Sarah V.', occupation: 'Teacher', aura_score: 42 },
  priya: { id: 'mock-priya', display_name: 'Priya', occupation: 'Nurse', aura_score: 64 },
  tom: { id: 'mock-tom', display_name: 'Tom', occupation: 'Bus Driver', aura_score: 38 },
  jana: { id: 'mock-jana', display_name: 'Jana', occupation: 'Barista', aura_score: 27 },
  marek: { id: 'mock-marek', display_name: 'Marek', occupation: 'Chef', aura_score: 51 },
  aisha: { id: 'mock-aisha', display_name: 'Aisha', occupation: 'Food Safety Inspector', aura_score: 73 },
  dan: { id: 'mock-dan', display_name: 'Dan', occupation: 'Accountant', aura_score: 19 },
  ellie: { id: 'mock-ellie', display_name: 'Ellie', occupation: 'Social Worker', aura_score: 58 },
  oliver: { id: 'mock-oliver', display_name: 'Oliver', occupation: 'Electrician', aura_score: 44 },
  kwame: { id: 'mock-kwame', display_name: 'Kwame', occupation: 'Student', aura_score: 12 },
  mei: { id: 'mock-mei', display_name: 'Mei', occupation: 'Software Developer', aura_score: 35 },
  nadia: { id: 'mock-nadia', display_name: 'Nadia', occupation: 'Pharmacist', aura_score: 61 },
  ruth: { id: 'mock-ruth', display_name: 'Ruth', occupation: 'Retired Teacher', aura_score: 47 },
  sam: { id: 'mock-sam', display_name: 'Sam', occupation: 'Courier', aura_score: 23 },
  leo: { id: 'mock-leo', display_name: 'Leo', occupation: 'Dog Walker', aura_score: 31 },
  hana: { id: 'mock-hana', display_name: 'Hana', occupation: 'Cognitive Psychologist', aura_score: 88 },
  zara: { id: 'mock-zara', display_name: 'Zara', occupation: 'Pilot', aura_score: 69 },
  viktor: { id: 'mock-viktor', display_name: 'Viktor', occupation: 'Chess Coach', aura_score: 57 },
  grace: { id: 'mock-grace', display_name: 'Grace', occupation: 'Data Scientist', aura_score: 62 },
  lucia: { id: 'mock-lucia', display_name: 'Lucía', occupation: 'Therapist', aura_score: 79 },
  farah: { id: 'mock-farah', display_name: 'Farah', occupation: 'Midwife', aura_score: 66 },
  igor: { id: 'mock-igor', display_name: 'Igor', occupation: 'Air Traffic Controller', aura_score: 71 },
  ben: { id: 'mock-ben', display_name: 'Ben', occupation: 'Firefighter', aura_score: 48 },
  yuki: { id: 'mock-yuki', display_name: 'Yuki', occupation: 'Violinist', aura_score: 53 },
  omar: { id: 'mock-omar', display_name: 'Omar', occupation: 'Football Referee', aura_score: 45 },
  pavel: { id: 'mock-pavel', display_name: 'Pavel', occupation: 'Carpenter', aura_score: 39 },
  nina: { id: 'mock-nina', display_name: 'Nina', occupation: 'Philosophy Lecturer', aura_score: 74 },
} satisfies Record<string, ObserverProfile>;

export type Person = keyof typeof PEOPLE;

// [id, parent id, author, minutes after the post, text]
export type CommentSeed = [string, string | null, Person, number, string];

// [id, parent id, author, minutes after the post, starting votes, text]
export type VotedSeed = [string, string | null, Person, number, number, string];

export function toComments(observation: ObservationEntity, seeds: CommentSeed[]): CommentEntity[] {
  const postedAt = new Date(observation.created_at).getTime();

  return seeds.map(([id, parentId, person, minutesAfterPost, content]) => ({
    id: `${observation.id}-${id}`,
    observation_id: observation.id,
    author_id: PEOPLE[person].id,
    content,
    created_at: new Date(postedAt + minutesAfterPost * MINUTE).toISOString(),
    parent_comment_id: parentId ? `${observation.id}-${parentId}` : null,
    profiles: PEOPLE[person],
  }));
}

// Comments plus their starting scores, keyed by the same ids the comments get.
export function toVotedComments(observation: ObservationEntity, seeds: VotedSeed[]) {
  const comments = toComments(
    observation,
    seeds.map(([id, parentId, person, minutes, , text]): CommentSeed => [id, parentId, person, minutes, text])
  );
  const votes: Record<string, number> = Object.fromEntries(
    seeds.map(([id, , , , score]) => [`${observation.id}-${id}`, score])
  );

  return { comments, votes };
}

export function toObservation(id: string, person: Person, postedAt: number, neighborhood: string, content: string): ObservationEntity {
  return {
    id,
    author_id: PEOPLE[person].id,
    content,
    created_at: new Date(postedAt).toISOString(),
    neighborhood,
    city: 'London',
    region: 'Greater London',
    nation: 'United Kingdom',
    continent: 'Europe',
    echo_count: 0,
    resonate_count: 0,
    profiles: PEOPLE[person],
  };
}

/**
 * File: src/legacy/labs/comments/mockObservations.ts
 * Description: The two posts from ObservaLyst's home feed. The Comments Lab borrows the first two for its own experiments.
 */
import { ObservationEntity } from '@/legacy/master-lab/types';

const ONE_HOUR = 3600000;

export function getMockObservations(): ObservationEntity[] {
  const now = Date.now();

  return [
    {
      id: '1',
      author_id: 'mock-observer-1',
      content: "The baker on 4th street just gave a homeless man a fresh loaf of bread. Quiet kindness still exists in the concrete jungle.",
      neighborhood: "Islington",
      city: "London",
      region: "Greater London",
      nation: "United Kingdom",
      continent: "Europe",
      echo_count: 42,
      resonate_count: 108,
      created_at: new Date(now).toISOString(),
      profiles: { id: 'mock-observer-1', display_name: "Michálku", occupation: "Lead Architect", aura_score: 85 }
    },
    {
      id: '2',
      author_id: 'mock-observer-2',
      content: "Traffic lights are completely down at the main intersection. Everyone is taking turns naturally. It is oddly beautiful to watch human cooperation.",
      neighborhood: "Hackney",
      city: "London",
      region: "Greater London",
      nation: "United Kingdom",
      continent: "Europe",
      echo_count: 12,
      resonate_count: 34,
      created_at: new Date(now - ONE_HOUR).toISOString(),
      profiles: { id: 'mock-observer-2', display_name: "Sarah V.", occupation: "Teacher", aura_score: 42 }
    }
  ];
}

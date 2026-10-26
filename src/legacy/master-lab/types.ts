/**
 * File: src/legacy/master-lab/types.ts
 * Description: The ObservaLyst row shapes the Master Lab uses (from types/database.ts), nothing else.
 */

export interface ObserverProfile {
  id: string;
  display_name: string;
  occupation: string;
  aura_score: number;
  avatar_url?: string;
}

export interface ObservationEntity {
  id: string;
  author_id: string;
  content: string; // 160 char limit
  created_at: string;

  // Spatial Identity Vectors
  neighborhood: string;
  city: string;
  region: string;
  nation: string;
  continent: string;

  // Engagement
  echo_count: number;
  resonate_count: number;

  // Join relation placeholder
  profiles?: ObserverProfile;
}

export interface CommentEntity {
  id: string;
  observation_id: string;
  author_id: string;
  content: string;
  created_at: string;
  parent_comment_id?: string | null;

  // Join relation placeholder
  profiles?: ObserverProfile;
}

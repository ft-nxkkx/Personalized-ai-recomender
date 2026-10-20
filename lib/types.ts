// Shared shapes between the UI and whatever backend answers the API client.
// Keep these in sync with the FastAPI response models (backend/models/).

export type Winner = 'a' | 'b' | 'tie' | 'both_bad';

/** Fixed domains plus anything the user adds. Custom domains are free text slugs. */
export type Category = string;

export const FIXED_CATEGORIES: { id: Category; label: string }[] = [
  { id: 'coding', label: 'Coding' },
  { id: 'research', label: 'Research' },
  { id: 'system', label: 'System design' },
];

export interface Model {
  id: string;
  name: string;
  provider: string;
  rating: number;
  wins: number;
  losses: number;
  ties: number;
}

/** What the client sees before voting. No model identity leaks here. */
export interface Battle {
  battleId: string;
  prompt: string;
  category: Category;
  responseA: string;
  responseB: string;
}

export interface RevealSide {
  modelId: string;
  name: string;
  provider: string;
  ratingBefore: number;
  ratingAfter: number;
  delta: number;
}

export interface VoteResult {
  battleId: string;
  winner: Winner;
  a: RevealSide;
  b: RevealSide;
}

export interface LeaderboardRow {
  rank: number;
  model: Model;
  winRate: number;
  matches: number;
}

export interface TasteEntry {
  category: Category;
  votes: number;
  /** Model the user picks most often in this category, null if no decisive votes yet. */
  favourite: { name: string; provider: string; share: number } | null;
}

export interface Session {
  email: string;
  signedInAt: number;
}

import type { Battle, Category, LeaderboardRow, Session, TasteEntry, VoteResult, Winner } from '../types';
import { createHttpApi } from './http';
import { mockApi } from './mock';

/**
 * The only door between the UI and a backend. Components import `api` and never call fetch directly.
 * Set NEXT_PUBLIC_API_URL (e.g. http://localhost:8000) to switch from the in-browser mock to FastAPI.
 */
export interface PairwiseApi {
  startBattle(input: { prompt: string; category: Category }): Promise<Battle>;
  vote(battleId: string, winner: Winner): Promise<VoteResult>;
  leaderboard(category?: Category): Promise<LeaderboardRow[]>;
  taste(): Promise<TasteEntry[]>;
  signIn(email: string): Promise<Session>;
  notify(email: string): Promise<{ ok: true }>;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const api: PairwiseApi = baseUrl ? createHttpApi(baseUrl) : mockApi;
export const usingMock = !baseUrl;

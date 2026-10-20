import type { PairwiseApi } from './client';
import { sanitize } from '../sanitization';

// Thin fetch wrapper for the FastAPI backend. Endpoint shapes are documented in handoff.md.
export function createHttpApi(baseUrl: string): PairwiseApi {
  const root = baseUrl.replace(/\/$/, '');

  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${root}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      credentials: 'include',
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`${res.status} ${res.statusText}${detail ? `: ${detail}` : ''}`);
    }
    return res.json() as Promise<T>;
  }

  return {
    async startBattle(input) {
      const b = await call<Awaited<ReturnType<PairwiseApi['startBattle']>>>('/battle', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return { ...b, responseA: sanitize(b.responseA), responseB: sanitize(b.responseB) };
    },
    vote: (battleId, winner) =>
      call('/vote', { method: 'POST', body: JSON.stringify({ battleId, winner }) }),
    leaderboard: (category) =>
      call(`/leaderboard${category ? `?category=${encodeURIComponent(category)}` : ''}`),
    taste: () => call('/profile/taste'),
    signIn: (email) => call('/auth/signin', { method: 'POST', body: JSON.stringify({ email }) }),
    notify: (email) => call('/waitlist', { method: 'POST', body: JSON.stringify({ email }) }),
  };
}

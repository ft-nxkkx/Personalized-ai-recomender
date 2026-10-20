import type { PairwiseApi } from './client';
import type { Battle, Category, LeaderboardRow, Model, TasteEntry, VoteResult, Winner } from '../types';
import { eloDeltas } from '../elo';
import { sanitize } from '../sanitization';
import { GENERIC_TEMPLATES, MOCK_MODELS, TEMPLATES } from './mock-data';

// In-browser stand-in for the FastAPI backend. Same contract as http.ts, state kept in localStorage.

const KEY = 'pairwise.mock.v1';

interface Store {
  /** ratings[category][modelId] plus an 'all' bucket */
  stats: Record<string, Record<string, Model>>;
  votes: { category: Category; winnerId: string | null; at: number }[];
  pending: Record<string, { category: Category; aId: string; bId: string; prompt: string }>;
}

function freshStats(): Record<string, Model> {
  return Object.fromEntries(
    MOCK_MODELS.map((m) => [m.id, { ...m, wins: 0, losses: 0, ties: 0 }]),
  );
}

let memory: Store | null = null;

function load(): Store {
  if (memory) return memory;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (raw) memory = JSON.parse(raw) as Store;
  } catch {
    /* storage blocked: fall through to a fresh in-memory store */
  }
  memory ??= { stats: { all: freshStats() }, votes: [], pending: {} };
  return memory;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* storage blocked: state lives for this tab only */
  }
}

const wait = (min: number, max: number) =>
  new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));

function bucket(store: Store, category: Category) {
  store.stats[category] ??= freshStats();
  return store.stats[category];
}

function pickTwo<T>(xs: T[]): [T, T] {
  const a = Math.floor(Math.random() * xs.length);
  let b = Math.floor(Math.random() * (xs.length - 1));
  if (b >= a) b++;
  return [xs[a], xs[b]];
}

function apply(m: Model, delta: number, result: 'w' | 'l' | 't' | 'n') {
  m.rating += delta;
  if (result === 'w') m.wins++;
  if (result === 'l') m.losses++;
  if (result === 't') m.ties++;
}

export const mockApi: PairwiseApi = {
  async startBattle({ prompt, category }): Promise<Battle> {
    await wait(700, 1300);
    const store = load();
    const [a, b] = pickTwo(MOCK_MODELS);
    const pool = TEMPLATES[category] ?? GENERIC_TEMPLATES;
    const [ta, tb] = pickTwo(pool);
    const battleId = `b_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    store.pending[battleId] = { category, aId: a.id, bId: b.id, prompt };
    save();
    return {
      battleId,
      prompt,
      category,
      responseA: sanitize(ta(prompt)),
      responseB: sanitize(tb(prompt)),
    };
  },

  async vote(battleId, winner: Winner): Promise<VoteResult> {
    await wait(250, 450);
    const store = load();
    const p = store.pending[battleId];
    if (!p) throw new Error('This battle has expired. Start a new one.');
    delete store.pending[battleId];

    const score = winner === 'a' ? 1 : winner === 'b' ? 0 : 0.5;
    const results = { a: 'w', b: 'l', tie: 't', both_bad: 'n' } as const;
    const flip = { w: 'l', l: 'w', t: 't', n: 'n' } as const;
    const rA = results[winner];

    let reveal: VoteResult | null = null;
    for (const key of ['all', p.category]) {
      const s = bucket(store, key);
      const ma = s[p.aId];
      const mb = s[p.bId];
      const before = { a: ma.rating, b: mb.rating };
      const { deltaA, deltaB } =
        winner === 'both_bad' ? { deltaA: -2, deltaB: -2 } : eloDeltas(ma.rating, mb.rating, score);
      apply(ma, deltaA, rA);
      apply(mb, deltaB, flip[rA]);
      if (key === p.category || !reveal) {
        reveal = {
          battleId,
          winner,
          a: { modelId: ma.id, name: ma.name, provider: ma.provider, ratingBefore: before.a, ratingAfter: ma.rating, delta: deltaA },
          b: { modelId: mb.id, name: mb.name, provider: mb.provider, ratingBefore: before.b, ratingAfter: mb.rating, delta: deltaB },
        };
      }
    }

    store.votes.push({
      category: p.category,
      winnerId: winner === 'a' ? p.aId : winner === 'b' ? p.bId : null,
      at: Date.now(),
    });
    save();
    return reveal!;
  },

  async leaderboard(category = 'all'): Promise<LeaderboardRow[]> {
    await wait(120, 260);
    const s = bucket(load(), category);
    return Object.values(s)
      .sort((x, y) => y.rating - x.rating)
      .map((model, i) => {
        const matches = model.wins + model.losses + model.ties;
        return {
          rank: i + 1,
          model: { ...model },
          matches,
          winRate: matches ? (model.wins + model.ties / 2) / matches : 0,
        };
      });
  },

  async taste(): Promise<TasteEntry[]> {
    await wait(100, 200);
    const { votes } = load();
    const cats = Array.from(new Set(votes.map((v) => v.category)));
    return cats.map((category) => {
      const inCat = votes.filter((v) => v.category === category);
      const counts: Record<string, number> = {};
      for (const v of inCat) if (v.winnerId) counts[v.winnerId] = (counts[v.winnerId] ?? 0) + 1;
      const decisive = Object.values(counts).reduce((a, b) => a + b, 0);
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      const model = top && MOCK_MODELS.find((m) => m.id === top[0]);
      return {
        category,
        votes: inCat.length,
        favourite: model ? { name: model.name, provider: model.provider, share: top[1] / decisive } : null,
      };
    });
  },

  async signIn(email) {
    await wait(500, 800);
    return { email, signedInAt: Date.now() };
  },

  async notify() {
    await wait(400, 700);
    return { ok: true };
  },
};

'use client';

import { PullQuote } from './PullQuote';
import { useEffect, useState } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { api } from '@/lib/api/client';
import { FIXED_CATEGORIES, type LeaderboardRow } from '@/lib/types';
import { useApp } from './providers';
import { Note } from './Scribble';

const TABS = [{ id: 'all', label: 'Overall' }, ...FIXED_CATEGORIES];

export function Leaderboard() {
  const { dataVersion } = useApp();
  const [tab, setTab] = useState('all');
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    api
      .leaderboard(tab)
      .then((r) => live && (setRows(r), setError('')))
      .catch((e) => live && setError(e instanceof Error ? e.message : 'Could not load the leaderboard.'));
    return () => {
      live = false;
    };
  }, [tab, dataVersion]);

  const top = rows?.[0]?.model.rating ?? 1;

  return (
    <section id="leaderboard" className="relative mx-3 rounded-[32px] border-[3px] border-ink bg-surface md:mx-6">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          <h2 className="display text-[clamp(30px,8.4vw,88px)] md:text-[clamp(40px,6vw,88px)]">Leaderboard</h2>
          <PullQuote by="a voter, after an upset" className="-rotate-2 md:mb-2">
            Rankings are just arguments that stopped for a second.
          </PullQuote>
          <LayoutGroup id="lb-tabs">
            <div role="tablist" aria-label="Domain" className="flex flex-wrap gap-2 md:ml-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold ${tab === t.id ? 'text-bg' : 'hover:bg-sunken'}`}
                >
                  {tab === t.id && (
                    <motion.span layoutId="lb-tab" style={{ borderRadius: 999 }} className="absolute inset-0 bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>

        {error && <p role="alert" className="mt-8 rounded-[18px] border-[3px] border-ink p-4">{error}</p>}

        {rows && rows.length >= 3 && <Podium rows={rows.slice(0, 3)} />}

        <ol className="mt-0 grid gap-3 border-t-[3px] border-ink pt-6" start={4}>
          {(rows ?? []).slice(3).map((r) => (
            <motion.li
              layout
              layoutId={`lb-${r.model.id}`}
              key={r.model.id}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              style={{ borderRadius: 18 }}
              className={`relative grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-[3px] border-ink px-5 py-3 md:grid-cols-[4rem_1.4fr_1fr_8rem_6rem] bg-bg`}
            >
              <span className="display text-2xl md:text-3xl">{String(r.rank).padStart(2, '0')}</span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold">{r.model.name}</span>
                <span className="text-sm opacity-75">{r.model.provider}</span>
              </span>
              {/* Rating as a hard-edged bar: width relative to the leader, no background track. */}
              <span className="hidden md:block" aria-hidden>
                <motion.span
                  className="block h-3 rounded-full bg-current"
                  initial={false}
                  animate={{ width: `${Math.max(8, ((r.model.rating - 1100) / (top - 1100)) * 100)}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </span>
              <span className="label hidden text-right md:block">
                {r.model.wins}W {r.model.losses}L {r.model.ties}T
              </span>
              <span className="text-right text-xl font-extrabold tabular-nums">{r.model.rating}</span>
            </motion.li>
          ))}
          {!rows && !error &&
            Array.from({ length: 6 }).map((_, i) => <li key={i} className="h-[66px] animate-pulse rounded-[18px] border-[3px] border-ink bg-sunken" />)}
        </ol>
      </div>
    </section>
  );
}

const STEP = { 1: 'h-44 md:h-56', 2: 'h-32 md:h-40', 3: 'h-24 md:h-28' } as const;

/**
 * Top three stand on a podium. Each name card shares a layoutId with its list row,
 * so a model that climbs out of the list flies up onto its step.
 */
function Podium({ rows }: { rows: LeaderboardRow[] }) {
  const order = [rows[1], rows[0], rows[2]];
  return (
    <div className="mt-14 grid grid-cols-3 items-end gap-2 md:mx-auto md:max-w-3xl md:gap-4">
      {order.map((r) => {
        const rank = r.rank as 1 | 2 | 3;
        const first = rank === 1;
        return (
          <div key={rank} className="flex flex-col items-stretch">
            <motion.div
              layoutId={`lb-${r.model.id}`}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              style={{ borderRadius: 16, rotate: rank === 2 ? -2 : rank === 3 ? 2.5 : 0 }}
              className={`relative mx-1 mb-3 border-[3px] border-ink px-3 py-2 text-center shadow-[4px_4px_0_0_var(--shadow)] ${first ? 'bg-accent text-on-accent' : 'bg-surface'}`}
            >
              <span className="block text-[13px] font-extrabold leading-tight [overflow-wrap:anywhere] md:text-lg">{r.model.name}</span>
              <span className="text-xs font-bold tabular-nums opacity-80 md:text-sm">{r.model.rating}</span>
              {first && (
                <Note rotate={8} className="absolute -right-3 -top-8 text-xl md:-right-10 md:text-2xl">
                  for now...
                </Note>
              )}
            </motion.div>
            <motion.div
              layout
              style={{ borderRadius: '18px 18px 0 0' }}
              className={`relative grid place-items-center border-[3px] border-b-0 border-ink ${STEP[rank]} ${first ? 'bg-accent-2 text-on-accent-2' : 'bg-sunken'}`}
            >
              <span className="display text-5xl md:text-7xl">{rank}</span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

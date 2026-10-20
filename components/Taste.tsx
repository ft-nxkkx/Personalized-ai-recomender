'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '@/lib/api/client';
import { FIXED_CATEGORIES, type TasteEntry } from '@/lib/types';
import { useApp } from './providers';

export function Taste({ onSignIn }: { onSignIn: () => void }) {
  const { dataVersion, session, scrollTo } = useApp();
  const [entries, setEntries] = useState<TasteEntry[] | null>(null);

  useEffect(() => {
    let live = true;
    api.taste().then((t) => live && setEntries(t)).catch(() => live && setEntries([]));
    return () => {
      live = false;
    };
  }, [dataVersion]);

  const label = (id: string) => FIXED_CATEGORIES.find((c) => c.id === id)?.label ?? id.replace(/-/g, ' ');
  const total = entries?.reduce((n, e) => n + e.votes, 0) ?? 0;

  return (
    <section id="taste" className="mx-auto max-w-[1400px] px-4 py-24 md:px-8">
      <h2 className="display text-[clamp(30px,8.4vw,88px)] md:text-[clamp(40px,6vw,88px)]">Your taste</h2>

      {entries && entries.length === 0 ? (
        <div className="slab mt-10 flex flex-col items-start gap-6 p-8 md:flex-row md:items-center">
          <p className="max-w-[48ch] text-lg">
            Nothing here yet. Vote a few times and we start noticing what you like, one domain at a time.
          </p>
          <button onClick={() => scrollTo('#arena')} className="slab-sm press shrink-0 bg-accent px-6 py-3 font-semibold text-on-accent md:ml-auto">
            Start a battle
          </button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-6">
          {(entries ?? []).map((e, i) => (
            <motion.article
              key={e.category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              // First tile spans wider so the grid has rhythm instead of equal cards.
              style={{ rotate: `${i % 2 ? 0.8 : -0.6}deg` }}
              className={`slab relative flex flex-col justify-between p-6 ${i === 0 ? `!bg-accent-2 text-on-accent-2 ${entries!.length === 1 ? 'md:col-span-6' : 'md:col-span-4'}` : 'md:col-span-2'}`}
            >
              <span className={`tape -top-3 ${i % 2 ? 'right-8 rotate-[5deg]' : 'left-8 rotate-[-4deg]'}`} aria-hidden />
              <p className="label opacity-80">
                {label(e.category)} / {e.votes} {e.votes === 1 ? 'vote' : 'votes'}
              </p>
              {e.favourite ? (
                <div className="mt-10">
                  <p className={`display ${i === 0 ? 'text-[clamp(36px,5vw,72px)]' : 'text-3xl'}`}>{e.favourite.name}</p>
                  <p className="hand mt-2 text-xl opacity-90">
                    you picked it {Math.round(e.favourite.share * 100)}% of the time
                  </p>
                </div>
              ) : (
                <p className="hand mt-10 text-2xl">Undecided. Fair enough.</p>
              )}
            </motion.article>
          ))}
        </div>
      )}

      {!session && total > 0 && (
        <p className="mt-8 text-muted">
          This profile lives in this browser.{' '}
          <button onClick={onSignIn} className="border-b-2 border-ink font-semibold text-ink">
            Sign in
          </button>{' '}
          to keep it everywhere.
        </p>
      )}
    </section>
  );
}

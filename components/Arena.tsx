'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { ArrowClockwise, CircleNotch, Lightning, Plus, X } from '@phosphor-icons/react';
import { api } from '@/lib/api/client';
import { PROMPT_SUGGESTIONS } from '@/lib/api/mock-data';
import { FIXED_CATEGORIES, type Battle, type Category, type RevealSide, type VoteResult, type Winner } from '@/lib/types';
import { CubeSlot } from './TravellingCube';
import { DecryptedText } from './DecryptedText';
import { Markdown } from './Markdown';
import { useApp } from './providers';
import { useStored } from '@/lib/store';
import { Note } from './Scribble';
import { CodeGutter, DomainSticker, domainStyle } from './DomainMotif';
import { PaperBurst } from './PaperBurst';
import { Duelist, type Mood } from './Duelist';
import { PullQuote } from './PullQuote';

type Phase = 'idle' | 'loading' | 'ready' | 'voting' | 'revealed' | 'error';

const VOTES: { id: Winner; label: string; key: string }[] = [
  { id: 'a', label: 'A is better', key: 'A' },
  { id: 'tie', label: 'Tie', key: 'T' },
  { id: 'both_bad', label: 'Both bad', key: 'N' },
  { id: 'b', label: 'B is better', key: 'B' },
];

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const NO_DOMAINS: { id: Category; label: string }[] = [];

function useCustomDomains() {
  const [domains, setDomains] = useStored('pairwise.domains', NO_DOMAINS);
  const add = (label: string) => {
    const id = slug(label);
    if (!id || FIXED_CATEGORIES.some((c) => c.id === id) || domains.some((d) => d.id === id)) return id;
    setDomains([...domains, { id, label: label.trim() }]);
    return id;
  };
  return { domains, add };
}

/** Reveals text progressively so both answers arrive at the same pace, like a live stream. */
function useStream(full: string | null) {
  const reduce = useReducedMotion();
  const [s, setS] = useState<{ src: string | null; len: number }>({ src: null, len: 0 });
  useEffect(() => {
    if (!full || reduce) return;
    const id = window.setInterval(() => {
      setS((prev) => {
        const len = prev.src === full ? prev.len : 0;
        const next = Math.min(full.length, len + 5 + Math.floor(Math.random() * 6));
        if (next >= full.length) window.clearInterval(id);
        return { src: full, len: next };
      });
    }, 18);
    return () => window.clearInterval(id);
  }, [full, reduce]);
  if (!full) return { text: '', done: false };
  if (reduce) return { text: full, done: true };
  const len = s.src === full ? s.len : 0;
  return { text: full.slice(0, len), done: len >= full.length };
}

export function Arena() {
  const { bumpData } = useApp();
  const { domains, add } = useCustomDomains();
  const categories = [...FIXED_CATEGORIES, ...domains];

  const [category, setCategory] = useState<Category>('coding');
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [battle, setBattle] = useState<Battle | null>(null);
  const [picked, setPicked] = useState<Winner | null>(null);
  const [result, setResult] = useState<VoteResult | null>(null);
  const [error, setError] = useState('');
  const [round, setRound] = useState(0);
  const { text: textA, done: doneA } = useStream(battle?.responseA ?? null);
  const { text: textB, done: doneB } = useStream(battle?.responseB ?? null);
  const canVote = phase === 'ready' && doneA && doneB;

  async function run(e?: React.FormEvent) {
    e?.preventDefault();
    if (!prompt.trim() || phase === 'loading') return;
    setPhase('loading');
    setRound((r) => r + 1);
    setBattle(null);
    setResult(null);
    setPicked(null);
    try {
      setBattle(await api.startBattle({ prompt: prompt.trim(), category }));
      setPhase('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The battle did not start.');
      setPhase('error');
    }
  }

  const vote = useCallback(
    async (w: Winner) => {
      if (!battle || !canVote) return;
      setPicked(w);
      setPhase('voting');
      try {
        const r = await api.vote(battle.battleId, w);
        setResult(r);
        setPhase('revealed');
        bumpData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Your vote did not go through.');
        setPhase('error');
      }
    },
    [battle, canVote, bumpData],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || e.metaKey || e.ctrlKey) return;
      const hit = VOTES.find((v) => v.key === e.key.toUpperCase());
      if (hit && canVote) {
        e.preventDefault();
        vote(hit.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canVote, vote]);

  function next() {
    setPhase('idle');
    setBattle(null);
    setResult(null);
    setPicked(null);
    setPrompt('');
    document.getElementById('prompt')?.focus();
  }

  const revealed = phase === 'revealed' && result;
  const moodFor = (side: 'a' | 'b'): Mood => {
    if (phase === 'loading' || (phase === 'ready' && !canVote)) return 'thinking';
    if (!revealed) return 'idle';
    if (result.winner === 'both_bad') return 'meh';
    return outcomeFor(side, result) === 'won' ? 'won' : outcomeFor(side, result) === 'lost' ? 'lost' : 'even';
  };
  const duelistSize = 'clamp(54px, 7vw, 92px)';

  return (
    <section id="arena" data-domain={category} className="relative mx-auto max-w-[1400px] px-4 py-24 md:px-8">
      <div className="flex items-center gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="display text-[clamp(30px,8.4vw,88px)] md:text-[clamp(40px,6vw,88px)]">The arena</h2>
          <p className="mt-4 max-w-[52ch] text-muted">
            Ask something you actually care about. Both answers show up nameless. Vote first, gossip after.
          </p>
        </div>
        <PullQuote by="overheard in the arena" className="mr-4 rotate-[3deg] self-end">
          The confident one was wrong. The shy one cited sources.
        </PullQuote>
        {/* The travelling cube from the hero lands here. */}
        <CubeSlot id="cube-slot-arena" size="clamp(76px, 10vw, 140px)" className="mr-2 md:mr-8" />
      </div>

      <form onSubmit={run} className="slab relative mt-12 p-4 transition-shadow duration-500 md:p-6 [box-shadow:7px_7px_0_0_var(--domain)]">
        <DomainSticker id={category} label={categories.find((c) => c.id === category)?.label ?? category} />
        <CategoryPicker categories={categories} value={category} onChange={setCategory} onAdd={(l) => setCategory(add(l))} />

        <label htmlFor="prompt" className="label mt-6 block">
          Your prompt
        </label>
        <div className="relative mt-2">
        <CodeGutter show={category === 'coding'} />
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run();
          }}
          rows={3}
          placeholder={domainStyle(category).placeholder}
          className={`block w-full resize-y rounded-[14px] border-[3px] border-ink bg-bg p-4 text-base leading-6 transition-[padding] placeholder:text-muted focus:outline-none focus-visible:shadow-[4px_4px_0_0_var(--accent-2)] ${category === 'coding' ? 'pl-12' : ''}`}
        />
        </div>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">
            {(PROMPT_SUGGESTIONS[category] ?? []).map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setPrompt(s)}
                className="max-w-full truncate rounded-full border-2 border-dashed border-ink px-3.5 py-1.5 text-left text-sm hover:border-solid hover:bg-sunken"
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!prompt.trim() || phase === 'loading'}
            className="slab-sm press ml-auto flex shrink-0 items-center gap-2 bg-accent px-6 py-3 font-semibold text-on-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {phase === 'loading' ? <CircleNotch size={18} className="animate-spin" /> : <Lightning size={18} weight="fill" />}
            Run battle
          </button>
        </div>
      </form>

      <LayoutGroup>
        <div className="mt-16 grid grid-cols-2 items-end gap-x-4 gap-y-6 md:grid-cols-[1fr_auto_1fr]">
          <SideLabel side="A" reveal={revealed ? result.a : null} />
          {/* The two fighters square up around the VS badge. They re-enter whenever the domain changes or a new battle starts. */}
          <div className="relative order-first col-span-2 flex items-end justify-center gap-3 md:order-none md:col-span-1 md:gap-5">
            <Duelist key={`a-${category}-${round}`} side="A" mood={moodFor('a')} domain={category} size={duelistSize} />
            <span className="relative mb-[0.6em] shrink-0">
              <span className="display grid h-12 w-12 rotate-[-8deg] place-items-center rounded-full border-[3px] border-ink bg-accent text-lg text-on-accent shadow-[3px_3px_0_0_var(--shadow)] md:h-16 md:w-16 md:text-2xl">
                VS
              </span>
              {!revealed && (
                <Note rotate={6} className="absolute left-1/2 top-full mt-1 hidden -translate-x-1/2 whitespace-nowrap text-xl md:block">
                  no peeking
                </Note>
              )}
            </span>
            <Duelist key={`b-${category}-${round}`} side="B" mood={moodFor('b')} domain={category} size={duelistSize} />
          </div>
          <SideLabel side="B" reveal={revealed ? result.b : null} align="right" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          <ResponseCard key={`a-${battle?.battleId ?? 'empty'}`} side="A" domain={battle?.category ?? category} phase={phase} text={textA} outcome={outcomeFor('a', result)} reveal={revealed ? result.a : null} />
          <ResponseCard key={`b-${battle?.battleId ?? 'empty'}`} side="B" domain={battle?.category ?? category} phase={phase} text={textB} outcome={outcomeFor('b', result)} reveal={revealed ? result.b : null} />
        </div>

        {phase === 'error' && (
          <div role="alert" className="slab mt-6 flex items-center gap-4 p-4">
            <p className="flex-1">{error}</p>
            <button onClick={() => run()} className="slab-sm press flex items-center gap-2 bg-surface px-4 py-2 font-semibold">
              <ArrowClockwise size={16} weight="bold" /> Try again
            </button>
          </div>
        )}

        <AnimatePresence>
          {battle && phase !== 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4"
            >
              {VOTES.map((v) => {
                const isPicked = picked === v.id;
                const stampHere = isPicked && (phase === 'voting' || (revealed && (v.id === 'tie' || v.id === 'both_bad')));
                return (
                  <button
                    key={v.id}
                    onClick={() => vote(v.id)}
                    disabled={!canVote}
                    className={`slab-sm relative flex items-center justify-between gap-3 px-5 py-3.5 text-left font-semibold transition-colors ${
                      isPicked ? 'bg-ink text-bg' : 'press bg-surface'
                    } disabled:cursor-not-allowed ${!canVote && !isPicked ? 'opacity-50' : ''}`}
                  >
                    {v.label}
                    <kbd className="label rounded-md border-2 border-current px-1.5">{v.key}</kbd>
                    {stampHere && <Stamp />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-col items-start gap-4 md:flex-row md:items-center"
          >
            <p className="text-lg">
              <Note rotate={-3} className="mr-2 inline-block text-3xl">
                {headline(result, battle?.category ?? category)}
              </Note>
              {result.winner === 'a' || result.winner === 'b' ? (
                <>
                  You backed <strong>{(result.winner === 'a' ? result.a : result.b).name}</strong>. It just picked up{' '}
                  {Math.abs((result.winner === 'a' ? result.a : result.b).delta)} points in{' '}
                  {categories.find((c) => c.id === battle?.category)?.label ?? battle?.category}.
                </>
              ) : (
                <>Noted. Nobody gains ground on that one.</>
              )}
            </p>
            <button onClick={next} className="slab-sm press bg-accent px-6 py-3 font-semibold text-on-accent md:ml-auto">
              Next battle
            </button>
          </motion.div>
        )}
      </LayoutGroup>
    </section>
  );
}

type Outcome = 'won' | 'lost' | 'even' | null;

function outcomeFor(side: 'a' | 'b', r: VoteResult | null): Outcome {
  if (!r) return null;
  if (r.winner === 'tie' || r.winner === 'both_bad') return 'even';
  return r.winner === side ? 'won' : 'lost';
}

type Call = 'upset' | 'favourite' | 'close' | 'tie' | 'bad';

/** Ringside commentary, in the dialect of each domain. Custom domains get the plain sports version. */
const CALLS: Record<string, Record<Call, string>> = {
  coding: {
    upset: 'The champ falters. Hotfix incoming.',
    favourite: 'Merged. The favourite ships it.',
    close: 'Close one. Approved with comments.',
    tie: 'Merge conflict. Nobody wins.',
    bad: 'Both builds failed.',
  },
  research: {
    upset: 'The champ falters. Retraction pending.',
    favourite: 'Peer review has spoken.',
    close: 'Close one. Needs more citations.',
    tie: 'Inconclusive. More data needed.',
    bad: 'Desk rejected. Both of them.',
  },
  system: {
    upset: 'The champ falters. Somebody page on-call.',
    favourite: 'Holds under load.',
    close: 'Close one. Both survive Monday traffic.',
    tie: 'Split brain. Nobody leads.',
    bad: 'Total outage.',
  },
};
const PLAIN_CALLS: Record<Call, string> = {
  upset: 'The champ falters!',
  favourite: 'The favourite holds.',
  close: 'Close one.',
  tie: 'Dead heat.',
  bad: 'Brutal. Both lose face.',
};

/** A line of commentary that depends on what actually happened to the ratings, and where. */
function headline(r: VoteResult, domain: string) {
  const calls = CALLS[domain] ?? PLAIN_CALLS;
  if (r.winner === 'tie') return calls.tie;
  if (r.winner === 'both_bad') return calls.bad;
  const [w, l] = r.winner === 'a' ? [r.a, r.b] : [r.b, r.a];
  if (w.ratingBefore + 25 < l.ratingBefore) return calls.upset;
  if (w.ratingBefore > l.ratingBefore + 25) return calls.favourite;
  return calls.close;
}

function Stamp() {
  return (
    <motion.span
      layoutId="verdict"
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      style={{ borderRadius: 10 }}
      className="hand absolute -right-3 -top-5 z-10 rotate-[-8deg] border-[2.5px] border-ink bg-accent-2 px-3 py-0.5 text-lg text-on-accent-2 shadow-[3px_3px_0_0_var(--shadow)]"
    >
      your pick!
    </motion.span>
  );
}

function SideLabel({ side, reveal, align }: { side: 'A' | 'B'; reveal: RevealSide | null; align?: 'right' }) {
  return (
    <div className={`min-w-0 ${align === 'right' ? 'text-right' : ''}`}>
      <p className="label text-muted">{reveal ? reveal.provider : 'Name hidden'}</p>
      <p className="display truncate text-[clamp(22px,3vw,40px)]">
        {reveal ? <DecryptedText text={reveal.name} /> : `Model ${side}`}
      </p>
    </div>
  );
}

/** How answer cards arrive, per domain: out of a terminal, dropped onto a paper pile, or built up from blocks. */
function entranceFor(domain: string, side: 'A' | 'B') {
  const out = side === 'A' ? -1 : 1;
  if (domain === 'coding') return { x: 120 * out, opacity: 0, skewX: -8 * out };
  if (domain === 'research') return { y: -90, rotate: 10 * out, opacity: 0 };
  if (domain === 'system') return { scaleY: 0.2, scaleX: 0.85, y: 60, opacity: 0 };
  return { y: 24, opacity: 0 };
}

function ResponseCard({
  side,
  domain,
  phase,
  text,
  outcome,
  reveal,
}: {
  side: 'A' | 'B';
  domain: string;
  phase: Phase;
  text: string;
  outcome: Outcome;
  reveal: RevealSide | null;
}) {
  const reduce = useReducedMotion();
  const winner = outcome === 'won';
  const lost = outcome === 'lost';
  // The vote lands with weight: the winner jumps forward, the loser takes the hit and slumps.
  const pose = reduce
    ? undefined
    : winner
      ? { scale: [1, 1.06, 1.02], y: [0, -14, -6], rotate: 0, opacity: 1 }
      : lost
        ? { scale: [1, 0.96, 0.97], y: [0, 4, 14], rotate: side === 'A' ? [0, 3, -2.5] : [0, -3, 2.5], opacity: 0.72 }
        : { scale: 1, scaleX: 1, scaleY: 1, x: 0, y: 0, skewX: 0, rotate: 0, opacity: 1 };
  // Only a real battle gets the domain entrance; the empty placeholders just sit there.
  const entering = !reduce && phase !== 'idle' && phase !== 'loading';
  return (
    <motion.article
      initial={entering ? entranceFor(domain, side) : false}
      animate={pose}
      transition={{
        duration: 0.7,
        ease: [0.22, 1.4, 0.36, 1],
        delay: entering && !outcome ? (side === 'A' ? 0 : 0.12) : 0,
        // The springy ease overshoots, which opacity cannot do, so fades get their own plain curve.
        opacity: { duration: 0.35, ease: 'easeOut', delay: lost ? 0.2 : entering && !outcome && side === 'B' ? 0.12 : 0 },
      }}
      style={{ transformOrigin: domain === 'system' ? '50% 100%' : '50% 50%' }}
      className={`slab relative flex min-h-[340px] flex-col transition-[rotate] duration-300 hover:rotate-0 ${side === 'A' ? 'rotate-[-1.4deg] md:mr-4' : 'rotate-[1.6deg] md:ml-4 md:mt-16'} ${winner ? 'shadow-[10px_10px_0_0_var(--accent-2)]' : ''}`}
      aria-label={`Response ${side}`}
      aria-busy={phase === 'loading'}
    >
      <span className={`tape -top-3 [background:color-mix(in_srgb,var(--domain)_75%,transparent)] ${side === 'A' ? 'left-6 rotate-[-5deg]' : 'right-10 rotate-[4deg]'}`} aria-hidden />
      <header className={`flex items-center justify-between rounded-t-[17px] border-b-[3px] border-ink px-5 py-2.5 ${winner ? 'bg-accent text-on-accent' : 'bg-sunken'}`}>
        <span className="label flex items-center gap-3 font-bold uppercase">
          Response {side}
        {reveal && (
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="label font-bold"
          >
            {reveal.ratingAfter} ({reveal.delta >= 0 ? '+' : ''}
            {reveal.delta})
          </motion.span>
        )}
        </span>
      </header>
      {winner && <Stamp />}
      {winner && <PaperBurst />}
      {lost && (
        <motion.span initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }} className="absolute -top-11 right-6 z-10">
          <Note rotate={-10} className="text-3xl">ouch</Note>
        </motion.span>
      )}

      <div className="max-h-[520px] flex-1 overflow-y-auto p-5" data-lenis-prevent>
        {phase === 'loading' ? (
          <Skeleton side={side} />
        ) : text ? (
          <Markdown text={text} />
        ) : (
          <p className="hand grid h-full min-h-[240px] place-items-center text-center text-2xl text-muted">
            {side === 'A' ? 'First answer lands here.' : 'Second answer lands here.'}
          </p>
        )}
      </div>
    </motion.article>
  );
}

function Skeleton({ side }: { side: 'A' | 'B' }) {
  return (
    <div className="space-y-3">
      <p className="hand text-xl text-muted">{side === 'A' ? 'Thinking...' : 'Thinking. Or pretending to.'}</p>
      {[92, 78, 85, 40, 0, 88, 70, 55].map((w, i) =>
        w === 0 ? (
          <div key={i} aria-hidden className="h-16 w-full animate-pulse rounded-[12px] border-2 border-ink bg-sunken" />
        ) : (
          <div key={i} aria-hidden className="h-3.5 animate-pulse rounded-full bg-sunken" style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }} />
        ),
      )}
    </div>
  );
}

function CategoryPicker({
  categories,
  value,
  onChange,
  onAdd,
}: {
  categories: { id: Category; label: string }[];
  value: Category;
  onChange: (c: Category) => void;
  onAdd: (label: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  return (
    <fieldset>
      <legend className="label">Pick a domain</legend>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            type="button"
            key={c.id}
            onClick={() => onChange(c.id)}
            aria-pressed={value === c.id}
            className={`stretchy relative rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold ${value === c.id ? 'text-on-accent' : 'hover:bg-sunken'}`}
          >
            {value === c.id && (
              <motion.span
                layoutId="domain-pill"
                className="absolute inset-0 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{c.label}</span>
          </button>
        ))}

        <AnimatePresence mode="popLayout" initial={false}>
          {adding ? (
            <motion.div
              key="input"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex overflow-hidden rounded-full border-2 border-ink"
            >
              <label htmlFor="new-domain" className="sr-only">
                New domain name
              </label>
              <input
                id="new-domain"
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (draft.trim()) onAdd(draft);
                    setDraft('');
                    setAdding(false);
                  }
                  if (e.key === 'Escape') setAdding(false);
                }}
                placeholder="e.g. Legal"
                className="w-36 bg-bg px-3 py-2 text-sm placeholder:text-muted focus:outline-none"
              />
              <button type="button" onClick={() => setAdding(false)} aria-label="Cancel" className="border-l-2 border-ink px-2">
                <X size={14} weight="bold" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="add"
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 rounded-full border-2 border-dashed border-ink px-3.5 py-2 text-sm hover:border-solid"
            >
              <Plus size={14} weight="bold" /> Add domain
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </fieldset>
  );
}

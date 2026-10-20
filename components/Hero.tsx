'use client';

import { useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, CircleNotch } from '@phosphor-icons/react';
import { api } from '@/lib/api/client';
import { CubeSlot } from './TravellingCube';
import { Note, Scribble } from './Scribble';
import { useApp } from './providers';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Hero({ onSignIn, authOpen }: { onSignIn: () => void; authOpen: boolean }) {
  const reduce = useReducedMotion();
  const { showToast } = useApp();
  const { scrollY } = useScroll();
  const lift = useTransform(scrollY, [0, 500], [0, -90]);
  const fade = useTransform(scrollY, [0, 420], [1, 0]);

  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setState('error');
      setError('Hmm, that email is missing a piece.');
      return;
    }
    setState('sending');
    try {
      await api.notify(email.trim());
      showToast(`You're on the list. We'll write to ${email.trim()} when it's your turn.`);
      setEmail('');
      setState('idle');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Could not save that. Try again.');
    }
  }

  const rise = (i: number) =>
    reduce
      ? {}
      : {
          initial: { y: '105%' },
          animate: { y: '0%' },
          transition: { delay: 0.15 + i * 0.08, type: 'spring' as const, stiffness: 90, damping: 18 },
        };

  return (
    <section id="top" className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-16 pt-24">
      <div className="flex w-full flex-col items-center">
        <h1 className="display relative flex items-center text-[clamp(38px,11.2vw,190px)]" aria-label="Pairwise AI">
          <span className="overflow-hidden pb-[0.04em]">
            <motion.span className="block" {...rise(0)}><Stretch word="Pair" from={0} /></motion.span>
          </span>
          <CubeSlot id="cube-slot-hero" size="0.86em" className="mx-[0.06em]" />
          <span className="overflow-hidden pb-[0.04em]">
            <motion.span className="block" {...rise(1)}><Stretch word="wise" from={4} /></motion.span>
          </span>
          <motion.span
            initial={reduce ? false : { scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -8 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 260, damping: 14 }}
            className="relative ml-[0.05em] self-start rounded-[0.12em] border-[3px] border-ink bg-accent-2 px-[0.14em] py-[0.02em] text-[0.3em] leading-[1.1] text-on-accent-2 shadow-[4px_4px_0_0_var(--shadow)]"
          >
            AI
            <Scribble shape="circle" delay={1.1} width={4} className="absolute -inset-x-[0.45em] -inset-y-[0.35em] h-[calc(100%+0.7em)] w-[calc(100%+0.9em)]" color="var(--accent)" />
          </motion.span>
          <span className="pointer-events-none absolute -top-[0.5em] left-[8%] hidden items-end gap-1 text-[0.13em] normal-case md:flex" aria-hidden>
            <Note rotate={-7}>psst, you can spin this</Note>
            <Scribble shape="arrow" delay={1.4} width={3} className="h-[1.6em] w-[3.4em] translate-y-[0.9em] rotate-[12deg]" />
          </span>
        </h1>

        <motion.div style={reduce ? undefined : { y: lift, opacity: fade }} className="flex w-full flex-col items-center">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-8 max-w-[44ch] text-center text-base text-muted md:text-lg"
        >
          Two models answer your question with their names hidden. Pick the better one and we&apos;ll tell you who it was.
        </motion.p>

        <motion.form
          onSubmit={submit}
          noValidate
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 w-full max-w-md"
        >
          <label htmlFor="hero-email" className="hand mb-1 block pl-5 text-xl text-accent-2">
            Want in early? Leave your email.
          </label>
          <div className="slab flex items-center gap-2 !rounded-full p-1.5 pl-2">
            <input
              id="hero-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state === 'error') setState('idle');
              }}
              placeholder="you@domain.com"
              aria-invalid={state === 'error'}
              aria-describedby="hero-email-msg"
              className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-base placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={state === 'sending'}
              className="flex shrink-0 items-center gap-2 rounded-full border-[2.5px] border-ink bg-accent px-5 py-2.5 font-semibold text-on-accent transition-transform hover:-rotate-2 active:scale-95 disabled:opacity-70"
            >
              {state === 'sending' ? <CircleNotch size={18} className="animate-spin" /> : <ArrowRight size={18} weight="bold" />}
              Notify me
            </button>
          </div>
          <p id="hero-email-msg" role="status" className="hand mt-2 min-h-6 pl-5 text-lg text-accent-2">
            {state === 'error' ? error : ''}
          </p>
          <p className="mt-1 text-center text-sm text-muted">
            Already have access?{' '}
            {authOpen ? (
              <span className="invisible inline-block border-b-2 font-semibold">Sign in</span>
            ) : (
            <motion.button
              type="button"
              layoutId="auth-hero"
              onClick={onSignIn}
              style={{ borderRadius: 4 }}
              className="inline-block border-b-2 border-ink font-semibold text-ink"
            >
              Sign in
            </motion.button>
            )}
          </p>
        </motion.form>
        </motion.div>
      </div>
    </section>
  );
}

/** Letters arrive thin and narrow, then each one stretches to full width (see .wordmark-letter). */
function Stretch({ word, from }: { word: string; from: number }) {
  return (
    <>
      {word.split('').map((ch, i) => (
        <span key={i} className="wordmark-letter" style={{ animationDelay: `${0.25 + (from + i) * 0.07}s` }}>
          {ch}
        </span>
      ))}
    </>
  );
}

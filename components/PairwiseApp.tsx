'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Arena } from './Arena';
import { AuthModal } from './AuthModal';
import { Hero } from './Hero';
import { Leaderboard } from './Leaderboard';
import { Motto } from './Motto';
import { Nav } from './Nav';
import { Providers, useApp } from './providers';
import { Taste } from './Taste';
import { TravellingCube } from './TravellingCube';

export function PairwiseApp() {
  return (
    <Providers>
      <Shell />
    </Providers>
  );
}

function Shell() {
  const [auth, setAuth] = useState<null | 'nav' | 'hero'>(null);
  const openFrom = (src: 'nav' | 'hero') => () => setAuth(src);
  const close = useCallback(() => setAuth(null), []);

  return (
    <>
      <div className="grid-backdrop" aria-hidden />
      <div className="grain" aria-hidden />
      <Nav onSignIn={openFrom('nav')} authOpen={auth === 'nav'} />
      <main className="relative z-10">
        <Hero onSignIn={openFrom('hero')} authOpen={auth === 'hero'} />
        <Motto />
        <Arena />
        <Leaderboard />
        <Taste onSignIn={openFrom('nav')} />
      </main>
      <Footer />
      <TravellingCube />
      <AnimatePresence>{auth && <AuthModal key="auth" layoutId={`auth-${auth}`} onClose={close} />}</AnimatePresence>
      <Toast />
    </>
  );
}

function Toast() {
  const { toast } = useApp();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.p
            key={toast}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="slab-sm bg-ink px-6 py-3 font-semibold text-bg"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 mx-3 mb-3 mt-10 rounded-[32px] border-[3px] border-ink bg-accent-2 text-on-accent-2 md:mx-6 md:mb-6">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-14 md:flex-row md:items-end md:px-10">
        <p className="display text-[clamp(30px,8.4vw,150px)]">
          Pairwise<span className="text-accent">.</span>ai
        </p>
        <p className="hand max-w-[24ch] rotate-[-3deg] text-2xl opacity-90 md:ml-auto md:text-right">
          Made by people who argue about chatbots for fun.
        </p>
      </div>
    </footer>
  );
}

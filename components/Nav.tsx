'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { Moon, Sun, SignOut } from '@phosphor-icons/react';
import { ACCENTS, useApp } from './providers';

const LINKS = [
  { href: '#arena', label: 'Arena' },
  { href: '#leaderboard', label: 'Leaderboard' },
  { href: '#taste', label: 'Your taste' },
];

/** Floating pill nav. The wordmark docks into it once the big hero name has scrolled away. */
export function Nav({ onSignIn, authOpen }: { onSignIn: () => void; authOpen: boolean }) {
  const { theme, setTheme, accent, setAccent, session, setSession, scrollTo } = useApp();
  const { scrollY } = useScroll();
  const markOpacity = useTransform(scrollY, [160, 320], [0, 1]);
  const markX = useTransform(scrollY, [160, 320], [-12, 0]);
  const lift = useTransform(scrollY, [0, 120], [0, -6]);

  return (
    <motion.header
      style={{ y: lift }}
      className="fixed inset-x-3 top-[calc(env(safe-area-inset-top,0px)+12px)] z-40 mx-auto max-w-[1180px] md:inset-x-6"
    >
      <nav className="slab flex h-14 items-center gap-3 !rounded-full px-2 pl-3 md:h-16 md:px-3 md:pl-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2"
          aria-label="Pairwise AI, back to top"
        >
          <span className="grid h-8 w-8 rotate-[-6deg] place-items-center rounded-[9px] border-[2.5px] border-ink bg-accent display text-sm text-on-accent">
            A
          </span>
          <motion.span style={{ opacity: markOpacity, x: markX }} className="display hidden text-lg sm:inline">
            Pairwise<span className="text-accent-2">.</span>ai
          </motion.span>
        </button>

        <ul className="ml-4 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <button
                onClick={() => scrollTo(l.href)}
                className="label rounded-full px-3.5 py-2 transition-colors hover:bg-ink hover:text-bg"
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <div className="hidden items-center gap-1.5 sm:flex" role="radiogroup" aria-label="Colourway">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                role="radio"
                aria-checked={accent === a.id}
                aria-label={a.label}
                title={a.label}
                onClick={() => setAccent(a.id)}
                className={`h-6 w-6 rounded-full border-2 border-ink transition-transform ${accent === a.id ? 'scale-110 shadow-[2px_2px_0_0_var(--shadow)]' : 'opacity-75 hover:opacity-100'}`}
                style={{ background: `linear-gradient(135deg, ${a.a} 50%, ${a.b} 50%)` }}
              />
            ))}
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="grid h-10 w-10 place-items-center rounded-full border-[2.5px] border-ink bg-surface transition-transform hover:rotate-[-12deg]"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
          </button>

          {session ? (
            <div className="flex items-center gap-2">
              <span className="hand hidden max-w-[16ch] truncate text-lg lg:inline">{session.email}</span>
              <span className="grid h-10 w-10 place-items-center rounded-full border-[2.5px] border-ink bg-accent-2 display text-sm text-on-accent-2">
                {session.email[0]}
              </span>
              <button
                onClick={() => setSession(null)}
                className="grid h-10 w-10 place-items-center rounded-full border-[2.5px] border-ink bg-surface"
                aria-label="Sign out"
              >
                <SignOut size={18} weight="bold" />
              </button>
            </div>
          ) : authOpen ? (
            <span className="invisible h-10 px-5 text-sm font-semibold">Sign in</span>
          ) : (
            <motion.button
              layoutId="auth-nav"
              onClick={onSignIn}
              style={{ borderRadius: 999 }}
              className="h-10 border-[2.5px] border-ink bg-ink px-5 text-sm font-semibold text-bg"
            >
              Sign in
            </motion.button>
          )}
        </div>
      </nav>
    </motion.header>
  );
}

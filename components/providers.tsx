'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Lenis from 'lenis';
import type { Session } from '@/lib/types';
import { useStored, writeStored } from '@/lib/store';

export type Theme = 'light' | 'dark';
export type Accent = 'grape' | 'highlighter' | 'signal';

/** Colourways: `a` is the loud colour, `b` the supporting one. Shown as split swatches in the nav. */
export const ACCENTS: { id: Accent; label: string; a: string; b: string }[] = [
  { id: 'grape', label: 'Grape and butter', a: '#ffd23f', b: '#6b2fd6' },
  { id: 'highlighter', label: 'Highlighter', a: '#6b2fd6', b: '#ffe14d' },
  { id: 'signal', label: 'Signal red', a: '#f2203e', b: '#111113' },
];


interface AppState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
  session: Session | null;
  setSession: (s: Session | null) => void;
  /** Bumps after each vote so leaderboard and taste refetch. */
  dataVersion: number;
  bumpData: () => void;
  scrollTo: (target: string) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside <Providers>');
  return v;
}

function useHtmlData<T extends string>(name: 'theme' | 'accent', fallback: T): T {
  return useSyncExternalStore(
    (cb) => {
      const mo = new MutationObserver(cb);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: [`data-${name}`] });
      return () => mo.disconnect();
    },
    () => (document.documentElement.dataset[name] as T) || fallback,
    () => fallback,
  );
}

const NO_SESSION: Session | null = null;

export function Providers({ children }: { children: React.ReactNode }) {
  // Theme and accent live on <html> (set before paint by THEME_BOOT_SCRIPT); React just mirrors them.
  const theme = useHtmlData<Theme>('theme', 'light');
  const accent = useHtmlData<Accent>('accent', 'grape');
  const [session, setSession] = useStored<Session | null>('pairwise.session', NO_SESSION);
  const [dataVersion, setDataVersion] = useState(0);
  const lenis = useRef<Lenis | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const l = new Lenis({ lerp: 0.12, wheelMultiplier: 0.9 });
    let raf = 0;
    const loop = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    lenis.current = l;
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
      lenis.current = null;
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.dataset.theme = t;
    writeStored('pairwise.theme', t);
  }, []);

  const setAccent = useCallback((a: Accent) => {
    document.documentElement.dataset.accent = a;
    writeStored('pairwise.accent', a);
  }, []);

  const scrollTo = useCallback((target: string) => {
    const el = document.querySelector(target) as HTMLElement | null;
    if (!el) return;
    if (lenis.current) lenis.current.scrollTo(el, { offset: -72 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 3600);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      theme,
      setTheme,
      accent,
      setAccent,
      session,
      setSession,
      dataVersion,
      bumpData: () => setDataVersion((v) => v + 1),
      scrollTo,
      toast,
      showToast,
    }),
    [theme, setTheme, accent, setAccent, session, setSession, dataVersion, scrollTo, toast, showToast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

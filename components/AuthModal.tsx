'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CircleNotch, X } from '@phosphor-icons/react';
import { api, usingMock } from '@/lib/api/client';
import { useApp } from './providers';

/** The Sign in button morphs into this panel (shared layoutId) and back again on close. */
export function AuthModal({ layoutId, onClose }: { layoutId: string; onClose: () => void }) {
  const { setSession, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('We need the email you signed up with.');
      return;
    }
    setBusy(true);
    try {
      setSession(await api.signIn(email.trim()));
      showToast(`Signed in as ${email.trim()}.`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal aria-labelledby="auth-title">
      <motion.button
        aria-label="Close"
        className="absolute inset-0 bg-ink/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        layoutId={layoutId}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ borderRadius: 24 }}
        className="slab relative w-full max-w-md overflow-hidden"
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.15 } }} exit={{ opacity: 0, transition: { duration: 0.05 } }}>
          <div className="flex items-center justify-between border-b-[3px] border-ink bg-accent-2 px-5 py-3 text-on-accent-2">
            <h2 id="auth-title" className="display text-xl">Welcome back</h2>
            <button onClick={onClose} aria-label="Close sign in" className="grid h-8 w-8 place-items-center rounded-full border-2 border-current">
              <X size={16} weight="bold" />
            </button>
          </div>
          <form onSubmit={submit} noValidate className="p-5">
            <label htmlFor="auth-email" className="label block">
              Email
            </label>
            <input
              ref={input}
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => (setEmail(e.target.value), setError(''))}
              placeholder="you@domain.com"
              aria-invalid={!!error}
              aria-describedby="auth-help"
              className="mt-2 w-full rounded-[14px] border-[3px] border-ink bg-bg px-4 py-3 placeholder:text-muted focus:outline-none focus-visible:shadow-[4px_4px_0_0_var(--accent-2)]"
            />
            <p id="auth-help" className={`hand mt-2 text-lg ${error ? 'text-accent-2' : 'text-muted'}`}>
              {error || (usingMock ? 'Demo mode, so any email works.' : "We'll send you a sign-in link.")}
            </p>
            <button
              type="submit"
              disabled={busy}
              className="slab-sm press mt-6 flex w-full items-center justify-center gap-2 bg-ink py-3 font-semibold text-bg disabled:opacity-70"
            >
              {busy && <CircleNotch size={18} className="animate-spin" />}
              Continue
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

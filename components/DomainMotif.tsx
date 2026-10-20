'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Note } from './Scribble';

/**
 * Each domain gets its own small visual language on the prompt card: a sticker slapped on the
 * corner, a margin note, and a placeholder written the way people in that field actually talk.
 */
export const DOMAIN_STYLE: Record<string, { placeholder: string; note: string }> = {
  coding: { placeholder: 'Paste the error, or describe the function you wish existed', note: 'tabs or spaces? we won’t judge' },
  research: { placeholder: 'Ask a question you would want sources for', note: 'citations make us happy' },
  system: { placeholder: 'Describe the system, the scale, and what keeps you up at night', note: 'draw the boxes first' },
};

const FALLBACK = { placeholder: 'Ask something only someone in this field would ask', note: 'new territory, love it' };

export function domainStyle(id: string) {
  return DOMAIN_STYLE[id] ?? FALLBACK;
}

function Glyph({ id, label }: { id: string; label: string }) {
  if (id === 'coding') return <span className="display text-[28px] leading-none">{'{ }'}</span>;
  if (id === 'research') return <span className="display text-[26px] leading-none">[1]</span>;
  if (id === 'system')
    return (
      <span className="flex items-center gap-1" aria-hidden>
        <span className="h-4 w-5 rounded-[4px] border-2 border-current" />
        <span className="h-0.5 w-3 bg-current" />
        <span className="h-4 w-5 rounded-[4px] border-2 border-current" />
      </span>
    );
  return <span className="display max-w-[7ch] truncate text-lg leading-none">#{label}</span>;
}

/** The sticker in the prompt card corner. Swapping domains peels one off and slaps the next on. */
export function DomainSticker({ id, label }: { id: string; label: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none absolute right-4 top-3 hidden flex-col items-end sm:flex md:right-6 md:top-4" aria-hidden>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={id}
          initial={reduce ? false : { scale: 1.6, rotate: -25, opacity: 0 }}
          animate={{ scale: 1, rotate: -7, opacity: 1 }}
          exit={reduce ? undefined : { y: -30, rotate: 20, opacity: 0, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 380, damping: 16 }}
          className="flex h-14 min-w-14 items-center justify-center rounded-[16px] border-[3px] border-ink bg-domain px-3 text-on-domain shadow-[4px_4px_0_0_var(--shadow)] transition-colors duration-500"
        >
          <Glyph id={id} label={label} />
        </motion.div>
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={id}
          initial={reduce ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="mt-1 hidden md:block"
        >
          <Note rotate={4} className="text-lg">
            {domainStyle(id).note}
          </Note>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** Fake line numbers down the side of the prompt when the domain is coding. */
export function CodeGutter({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          className="pointer-events-none absolute bottom-[3px] left-[3px] top-[3px] flex w-9 flex-col items-center rounded-l-[11px] border-r-2 border-dashed border-domain bg-sunken pt-4 font-mono text-xs leading-6 text-muted"
        >
          <span>1</span>
          <span>2</span>
          <span>3</span>
        </motion.span>
      )}
    </AnimatePresence>
  );
}

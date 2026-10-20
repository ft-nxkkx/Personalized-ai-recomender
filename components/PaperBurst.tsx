'use client';

import { motion, useReducedMotion } from 'motion/react';

// Hand-tuned scraps so the burst looks thrown, not computed. [angle deg, distance px, spin deg, w, h, colour]
const SCRAPS: [number, number, number, number, number, string][] = [
  [-160, 120, -220, 14, 8, 'var(--accent)'],
  [-130, 150, 180, 8, 16, 'var(--accent-2)'],
  [-105, 170, -90, 12, 12, 'var(--ink)'],
  [-80, 160, 260, 16, 7, 'var(--accent)'],
  [-55, 140, -160, 9, 14, 'var(--accent-2)'],
  [-30, 125, 140, 13, 9, 'var(--accent)'],
  [-145, 90, 300, 7, 7, 'var(--ink)'],
  [-40, 95, -300, 10, 10, 'var(--accent-2)'],
  [-92, 110, 90, 6, 18, 'var(--accent)'],
  [-118, 135, -40, 15, 6, 'var(--accent-2)'],
];

/** Paper scraps thrown up from the winning card. Pure decoration; off under reduced motion. */
export function PaperBurst() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <span className="pointer-events-none absolute left-1/2 top-0 z-20" aria-hidden>
      {SCRAPS.map(([deg, dist, spin, w, h, c], i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <motion.span
            key={i}
            className="absolute rounded-[2px] border border-ink"
            style={{ width: w, height: h, background: c }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{
              x: Math.cos(rad) * dist,
              y: [0, Math.sin(rad) * dist, Math.sin(rad) * dist + 90],
              rotate: spin,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1.3, ease: 'easeOut', delay: 0.15 + (i % 3) * 0.04 }}
          />
        );
      })}
    </span>
  );
}

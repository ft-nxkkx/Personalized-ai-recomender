'use client';

import { motion, useReducedMotion } from 'motion/react';

/**
 * Marker strokes drawn over the page as if someone annotated it by hand.
 * Each shape is stretched to its box (preserveAspectRatio none) and draws itself in once.
 */
const SHAPES = {
  underline: { viewBox: '0 0 300 24', d: 'M4 16 C 60 6, 120 20, 180 11 S 270 8, 296 14' },
  circle: {
    viewBox: '0 0 200 100',
    d: 'M118 8 C 60 2, 8 22, 10 52 C 12 84, 70 96, 120 92 C 172 88, 196 64, 190 40 C 184 16, 140 4, 92 10',
  },
  arrow: { viewBox: '0 0 120 60', d: 'M6 10 C 40 4, 80 18, 104 44 M 86 46 L 106 46 L 102 26' },
} as const;

export function Scribble({
  shape,
  className,
  color = 'var(--accent-2)',
  width = 5,
  delay = 0,
}: {
  shape: keyof typeof SHAPES;
  className?: string;
  color?: string;
  width?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const s = SHAPES[shape];
  return (
    <svg viewBox={s.viewBox} preserveAspectRatio="none" className={`pointer-events-none overflow-visible ${className ?? ''}`} aria-hidden>
      <motion.path
        d={s.d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, delay, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}

/** A handwritten note in the margin. Slightly rotated, never perfectly aligned. */
export function Note({ children, className, rotate = -4 }: { children: React.ReactNode; className?: string; rotate?: number }) {
  return (
    <span className={`hand pointer-events-none select-none text-accent-2 ${className ?? ''}`} style={{ rotate: `${rotate}deg` }}>
      {children}
    </span>
  );
}

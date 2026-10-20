'use client';

import { motion, type MotionValue } from 'motion/react';

/**
 * The Pairwise mark: a chunky toy block with A and B on opposite faces.
 * Pure CSS 3D (no WebGL) so the flat brutalist faces stay crisp and the bundle stays small.
 */
export function PairCube({
  size,
  rotateX,
  rotateY,
  className,
}: {
  size: number;
  rotateX: MotionValue<number> | number;
  rotateY: MotionValue<number> | number;
  className?: string;
}) {
  const half = size / 2;
  const face =
    'absolute inset-0 flex items-center justify-center rounded-[16%] border-[3px] border-ink display select-none';
  const fontSize = { fontSize: size * 0.48 };

  return (
    <div className={className} style={{ width: size, height: size, perspective: size * 4 }}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d', rotateX, rotateY }}
      >
        <div className={`${face} bg-accent text-on-accent`} style={{ ...fontSize, transform: `translateZ(${half}px)` }}>
          A
        </div>
        <div className={`${face} bg-accent-2 text-on-accent-2`} style={{ ...fontSize, transform: `rotateY(180deg) translateZ(${half}px)` }}>
          B
        </div>
        <div
          className={`${face} bg-surface text-ink`}
          style={{ fontSize: size * 0.26, transform: `rotateY(90deg) translateZ(${half}px)` }}
        >
          VS
        </div>
        <div
          className={`${face} bg-surface text-ink`}
          style={{ fontSize: size * 0.26, transform: `rotateY(-90deg) translateZ(${half}px)` }}
        >
          VS
        </div>
        <div className={`${face} bg-sunken`} style={{ transform: `rotateX(90deg) translateZ(${half}px)` }} />
        <div className={`${face} bg-accent`} style={{ transform: `rotateX(-90deg) translateZ(${half}px)` }} />
      </motion.div>
    </div>
  );
}

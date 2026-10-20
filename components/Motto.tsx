'use client';

import { useRef } from 'react';
import { Note } from './Scribble';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';

// PLACEHOLDER MOTTO: Priya will supply the final wording. Words wrapped in * get the accent block.
const MOTTO = 'Benchmarks rank models for everyone. We rank them *for* *you.*';

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [14, 0]);
  const marked = word.startsWith('*');
  const text = word.replaceAll('*', '');
  return (
    <motion.span style={{ opacity, y }} className="mr-[0.22em] inline-block">
      <span className={marked ? 'marker' : undefined}>{text}</span>
    </motion.span>
  );
}

export function Motto() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const words = MOTTO.split(' ');

  return (
    <section ref={ref} id="motto" className={reduce ? 'relative' : 'relative h-[230vh]'}>
      <div className="sticky top-0 flex min-h-[100dvh] items-center">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
          <p className="display max-w-[15ch] text-[clamp(30px,8.2vw,112px)] leading-[1.02] md:text-[clamp(40px,7vw,112px)]">
            {words.map((w, i) => {
              const start = 0.08 + (i / words.length) * 0.62;
              return reduce ? (
                <span key={i} className="mr-[0.22em] inline-block">
                  <span className={w.startsWith('*') ? 'marker' : undefined}>
                    {w.replaceAll('*', '')}
                  </span>
                </span>
              ) : (
                <Word key={i} word={w} progress={scrollYProgress} range={[start, start + 0.12]} />
              );
            })}
          </p>
          <Note rotate={-3} className="mt-8 block text-2xl md:ml-[30%] md:text-3xl">
            (placeholder motto, the real one is coming)
          </Note>
        </div>
      </div>
    </section>
  );
}

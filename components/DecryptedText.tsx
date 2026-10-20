'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';

/** Scrambles, then resolves left to right into `text`. Used for the model identity reveal. */
export function DecryptedText({ text, duration = 900, className }: { text: string; duration?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState('');

  useEffect(() => {
    if (reduce) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const settled = Math.floor(t * text.length);
      let s = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) {
        s += text[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setShown(s);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, reduce]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{reduce ? text : shown}</span>
    </span>
  );
}

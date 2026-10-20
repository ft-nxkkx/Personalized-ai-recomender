'use client';

import { useEffect, useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { PairCube } from './PairCube';

/**
 * One cube that travels with the reader: it starts inside the hero wordmark, parks at the right
 * edge while the motto plays, then lands in the arena between Model A and Model B.
 * Slots are plain placeholders (<CubeSlot id=...>) measured in document space.
 */

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Slot { x: number; y: number; s: number }

export function CubeSlot({ id, size, className }: { id: string; size: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span
      id={id}
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center align-middle ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      {reduce && <StaticCube />}
    </span>
  );
}

function StaticCube() {
  return <PairCube size={80} rotateX={-18} rotateY={-32} />;
}

export function TravellingCube() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const geo = useRef<{ hero: Slot; arena: Slot; vw: number; vh: number } | null>(null);
  const tick = useMotionValue(0);
  const ready = useMotionValue(0);

  useEffect(() => {
    if (reduce) return;
    const measure = () => {
      const h = document.getElementById('cube-slot-hero');
      const a = document.getElementById('cube-slot-arena');
      if (!h || !a) return;
      const rect = (el: HTMLElement): Slot => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY, s: r.width };
      };
      geo.current = { hero: rect(h), arena: rect(a), vw: window.innerWidth, vh: window.innerHeight };
      tick.set(tick.get() + 1);
      ready.set(1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    // The wordmark stretches on load, which slides the hero slot sideways without resizing the page.
    const heroRow = document.getElementById('cube-slot-hero')?.parentElement;
    if (heroRow) ro.observe(heroRow);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [reduce, tick, ready]);

  // Viewport-space centre and size of the cube for a given scroll position.
  const place = (y: number) => {
    const g = geo.current;
    if (!g) return { x: -999, y: -999, s: 1 };
    const { hero, arena, vw, vh } = g;
    const mobile = vw < 768;
    const parkS = mobile ? 68 : Math.min(150, Math.max(96, vw * 0.1));
    // On phones the motto fills the width, so the cube waits above it instead of beside it.
    const park = mobile ? { x: vw - 56, y: vh * 0.2, s: parkS } : { x: vw - parkS * 1.1, y: vh * 0.56, s: parkS };
    const s1 = vh * 0.6;
    const s3 = arena.y - vh * 0.4;
    const s2 = Math.max(s1, s3 - vh * 0.6);

    if (y <= s1) {
      const t = ease(clamp01(y / s1));
      return { x: lerp(hero.x, park.x, t), y: lerp(hero.y - y, park.y, t), s: lerp(hero.s, park.s, t) };
    }
    if (y <= s2) return park;
    if (y <= s3) {
      const t = ease(clamp01((y - s2) / (s3 - s2)));
      return { x: lerp(park.x, arena.x, t), y: lerp(park.y, arena.y - y, t), s: lerp(park.s, arena.s, t) };
    }
    return { x: arena.x, y: arena.y - y, s: arena.s };
  };

  const BASE = 220;
  const x = useTransform(() => (tick.get(), place(scrollY.get()).x - BASE / 2));
  const y = useTransform(() => (tick.get(), place(scrollY.get()).y - BASE / 2));
  const scale = useTransform(() => (tick.get(), place(scrollY.get()).s / BASE));

  // Rotation = idle spin + scroll spin + drag + pointer tilt.
  const idle = useMotionValue(0);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const dragging = useRef(false);

  useAnimationFrame((_, delta) => {
    if (!dragging.current) idle.set(idle.get() + delta * 0.012);
  });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      tiltX.set(((e.clientY / window.innerHeight) - 0.5) * -24);
      tiltY.set(((e.clientX / window.innerWidth) - 0.5) * 30);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [tiltX, tiltY]);

  const rxRaw = useTransform(() => -16 + tiltX.get() + dragX.get());
  const ryRaw = useTransform(() => -28 + idle.get() + scrollY.get() * 0.18 + tiltY.get() + dragY.get());
  const rotateX = useSpring(rxRaw, { stiffness: 120, damping: 18 });
  const rotateY = useSpring(ryRaw, { stiffness: 120, damping: 18 });

  if (reduce) return null;

  return (
    <motion.div
      className="fixed left-0 top-0 z-20 cursor-grab touch-none active:cursor-grabbing"
      style={{ x, y, scale, opacity: ready, width: BASE, height: BASE, willChange: 'transform' }}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        dragY.set(dragY.get() + e.movementX * 0.9);
        dragX.set(dragX.get() - e.movementY * 0.9);
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      aria-hidden
      title="Drag to spin"
    >
      <PairCube size={BASE} rotateX={rotateX} rotateY={rotateY} />
    </motion.div>
  );
}

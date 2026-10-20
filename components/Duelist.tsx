'use client';

import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'motion/react';

export type Mood = 'idle' | 'thinking' | 'won' | 'lost' | 'even' | 'meh';
type Kind = 'coding' | 'research' | 'system' | 'other';

const kindOf = (domain: string): Kind =>
  domain === 'coding' || domain === 'research' || domain === 'system' ? domain : 'other';

/**
 * One of the two little fighters that face off over the answers. A is round, B is boxy, both
 * wear a headband in the domain colour. Everything is sized in em, so `size` scales the whole
 * figure. Remount (change the key) to replay the domain entrance.
 */
export function Duelist({ side, mood, domain, size }: { side: 'A' | 'B'; mood: Mood; domain: string; size: string }) {
  const reduce = useReducedMotion();
  const kind = kindOf(domain);
  const inward = side === 'A' ? 1 : -1; // direction of the opponent

  // How each domain brings its fighter on stage.
  const enter: Record<Kind, TargetAndTransition> = {
    coding: { x: `${-90 * inward}%`, opacity: 0, skewX: -12 * inward },
    research: { y: '70%', opacity: 0 },
    system: { opacity: 1 }, // the parts assemble themselves, see `part`
    other: { y: '20%', opacity: 0, scale: 0.8 },
  };
  const enterTransition: Transition = { type: 'spring', stiffness: 260, damping: 20, delay: kind === 'coding' ? 0.25 : 0.1 };

  // System fighters arrive as loose blocks that snap together.
  const part = (i: number) =>
    kind === 'system' && !reduce
      ? {
          initial: { x: `${[60, -70, 40][i] * inward}%`, y: `${[-120, 90, -60][i]}%`, rotate: [40, -35, 90][i], opacity: 0 },
          animate: { x: '0%', y: '0%', rotate: 0, opacity: 1 },
          transition: { type: 'spring' as const, stiffness: 320, damping: 18, delay: 0.1 + i * 0.12 },
        }
      : {};

  const moods: Record<Mood, TargetAndTransition> = {
    idle: { x: '0%', y: ['0%', '-6%', '0%'], rotate: 0, scale: 1, transition: { y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: side === 'B' ? 0.7 : 0 }, default: { type: 'spring', stiffness: 200, damping: 16 } } },
    thinking: { x: `${8 * inward}%`, y: '0%', rotate: [-4 * inward, 4 * inward], scale: 1, transition: { rotate: { duration: 0.35, repeat: Infinity, repeatType: 'mirror' }, default: { duration: 0.3 } } },
    won: { x: `${22 * inward}%`, y: ['0%', '-38%', '0%', '-14%', '0%'], rotate: 6 * inward, scale: 1.18, transition: { duration: 0.9, ease: 'easeOut' } },
    lost: { x: `${-18 * inward}%`, y: '8%', rotate: -30 * inward, scale: 0.82, transition: { type: 'spring', stiffness: 160, damping: 9, delay: 0.1 } },
    even: { x: '0%', y: ['0%', '-18%', '0%', '-10%', '0%'], rotate: 0, scale: 1, transition: { duration: 0.8 } },
    meh: { x: `${-6 * inward}%`, y: '6%', rotate: 8 * inward, scale: 0.9, transition: { type: 'spring', stiffness: 120, damping: 12 } },
  };

  const head = side === 'A' ? 'rounded-full bg-accent' : 'rounded-[0.24em] bg-accent-2';

  return (
    <div className="relative shrink-0" style={{ fontSize: size, width: '1.05em', height: '1.3em' }} aria-hidden>
      <Pedestal kind={kind} side={side} reduce={!!reduce} />

      <motion.div
        className="absolute inset-x-0 top-0 z-[1] flex flex-col items-center"
        initial={reduce ? false : enter[kind]}
        animate={{ x: '0%', y: '0%', opacity: 1, skewX: 0, scale: 1 }}
        transition={enterTransition}
      >
        <motion.div className="flex origin-bottom flex-col items-center" animate={reduce ? undefined : moods[mood]}>
          {/* Head with headband and one big eye looking at the opponent. */}
          <motion.div {...part(0)} className={`relative h-[0.78em] w-[0.78em] overflow-hidden border-[3px] border-ink ${head}`}>
            <span className="absolute inset-x-0 top-[18%] h-[0.13em] border-y-[2.5px] border-ink bg-domain transition-colors duration-500" />
            <Eye mood={mood} inward={inward} />
          </motion.div>
          {/* Body: a stubby block in the same colour. */}
          <motion.div
            {...part(1)}
            className={`-mt-[3px] h-[0.3em] w-[0.5em] rounded-t-[0.16em] border-[3px] border-ink ${side === 'A' ? 'bg-accent' : 'bg-accent-2'}`}
          />
          <motion.span {...part(2)} className="mt-[0.02em] h-[0.05em] w-[0.62em] rounded-full bg-ink/25" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function Eye({ mood, inward }: { mood: Mood; inward: number }) {
  const pos = { left: inward > 0 ? '44%' : '18%' };
  if (mood === 'lost' || mood === 'meh')
    return (
      <span className="absolute top-[44%] grid h-[0.24em] w-[0.24em] place-items-center" style={pos}>
        <span className="absolute h-[3px] w-full rotate-45 rounded-full bg-ink" />
        <span className="absolute h-[3px] w-full -rotate-45 rounded-full bg-ink" />
      </span>
    );
  if (mood === 'won' || mood === 'even')
    return <span className="absolute top-[46%] h-[0.12em] w-[0.24em] rounded-t-full border-[3px] border-b-0 border-ink" style={pos} />;
  return (
    <span className="absolute top-[40%] h-[0.27em] w-[0.27em] rounded-full border-[2.5px] border-ink bg-surface" style={pos}>
      <motion.span
        className="absolute top-[22%] h-[0.11em] w-[0.11em] rounded-full bg-ink"
        animate={mood === 'thinking' ? { left: ['20%', '45%', '20%'], top: '42%' } : { left: inward > 0 ? '48%' : '8%', top: '22%' }}
        transition={mood === 'thinking' ? { duration: 0.9, repeat: Infinity } : { duration: 0.3 }}
      />
    </span>
  );
}

/** What the fighter stands on, which is also where it comes from. */
function Pedestal({ kind, side, reduce }: { kind: Kind; side: 'A' | 'B'; reduce: boolean }) {
  const pop = reduce ? {} : { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring' as const, stiffness: 400, damping: 20 } };
  if (kind === 'coding')
    return (
      <motion.span
        {...pop}
        className={`absolute bottom-0 z-[2] flex h-[0.28em] w-[0.72em] items-center gap-[0.04em] rounded-[0.08em] border-[2.5px] border-ink bg-on-domain px-[0.07em] font-bold leading-none text-domain ${side === 'A' ? '-left-[0.08em]' : '-right-[0.08em]'}`}
      >
        <span className="font-mono text-[0.17em]">{'>'}</span>
        <span className="inline-block h-[0.04em] w-[0.1em] animate-pulse bg-domain" />
      </motion.span>
    );
  if (kind === 'research')
    // The stack sits in front, so the fighter rises from behind it.
    return (
      <motion.span {...pop} className="absolute inset-x-[4%] bottom-0 z-[2] h-[0.3em]">
        {[-5, 4, -1].map((r, i) => (
          <span
            key={i}
            className="absolute inset-x-0 h-[0.24em] rounded-[0.05em] border-[2px] border-ink bg-surface"
            style={{ bottom: `${i * 0.03}em`, rotate: `${r}deg` }}
          >
            {i === 2 && <span className="absolute inset-x-[15%] top-[30%] h-[0.04em] bg-domain" />}
          </span>
        ))}
      </motion.span>
    );
  if (kind === 'system')
    return (
      <span className="absolute inset-x-0 bottom-0 z-0 flex justify-center gap-[0.03em]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={reduce ? false : { y: '-200%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.45 + i * 0.07 }}
            className="h-[0.12em] w-[0.22em] rounded-[0.03em] border-[2px] border-ink bg-domain"
          />
        ))}
      </span>
    );
  return null;
}

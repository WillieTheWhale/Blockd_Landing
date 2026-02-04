'use client';

import { motion, Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED HEADLINE COMPONENT
// Cinematic text reveal with glitch, scan, and character animations
// ═══════════════════════════════════════════════════════════════════════════

interface AnimatedHeadlineProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3';
  variant?: 'character' | 'word' | 'glitch' | 'scan';
  className?: string;
  delay?: number;
}

// Character-by-character animation
const characterVariants: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: -90 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.03,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

// Word-by-word animation
const wordVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

// Glitch effect
const glitchVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.1 },
  },
};

// Container for staggered animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.2,
    },
  },
};

function CharacterAnimation({ children, delay = 0 }: { children: string; delay?: number }) {
  const words = children.split(' ');
  let charIndex = 0;

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ perspective: 500 }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {word.split('').map((char) => {
            const currentIndex = charIndex++;
            return (
              <motion.span
                key={currentIndex}
                custom={currentIndex + delay * 30}
                variants={characterVariants}
                className="inline-block"
                style={{ transformOrigin: 'bottom' }}
              >
                {char}
              </motion.span>
            );
          })}
          {wordIndex < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </motion.span>
  );
}

function WordAnimation({ children, delay = 0 }: { children: string; delay?: number }) {
  const words = children.split(' ');

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i + delay * 10}
          variants={wordVariants}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

function GlitchAnimation({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <motion.span
      className="relative inline-block"
      initial="hidden"
      animate="visible"
    >
      {/* Main text */}
      <motion.span
        variants={glitchVariants}
        transition={{ delay }}
        className="relative z-10"
      >
        {children}
      </motion.span>

      {/* Glitch layers */}
      <motion.span
        className="absolute inset-0 text-blockd-accent"
        style={{ clipPath: 'inset(10% 0 60% 0)' }}
        animate={{
          x: [0, -2, 2, -1, 0],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 0.2,
          delay: delay + 0.5,
          repeat: 2,
          repeatDelay: 2,
        }}
      >
        {children}
      </motion.span>

      <motion.span
        className="absolute inset-0 text-red-500/50"
        style={{ clipPath: 'inset(60% 0 10% 0)' }}
        animate={{
          x: [0, 2, -2, 1, 0],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 0.2,
          delay: delay + 0.6,
          repeat: 2,
          repeatDelay: 2,
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

function ScanAnimation({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <motion.span className="relative inline-block overflow-hidden">
      {/* Revealed text */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.01, delay }}
      >
        <motion.span
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0 0 0)' }}
          transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {children}
        </motion.span>
      </motion.span>

      {/* Scan line */}
      <motion.span
        className="absolute top-0 bottom-0 w-[2px] bg-blockd-accent"
        style={{ boxShadow: '0 0 20px rgba(104, 113, 147, 0.8)' }}
        initial={{ left: 0, opacity: 0 }}
        animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </motion.span>
  );
}

export function AnimatedHeadline({
  children,
  as: Tag = 'h1',
  variant = 'character',
  className,
  delay = 0,
}: AnimatedHeadlineProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  const AnimationComponent = {
    character: CharacterAnimation,
    word: WordAnimation,
    glitch: GlitchAnimation,
    scan: ScanAnimation,
  }[variant];

  return (
    <Tag className={cn('relative', className)}>
      <AnimationComponent delay={delay}>{children}</AnimationComponent>
    </Tag>
  );
}

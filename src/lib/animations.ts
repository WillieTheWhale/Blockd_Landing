// ═══════════════════════════════════════════════════════════════════════════
// FRAMER MOTION ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

import { Variants } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// FADE ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STAGGER CONTAINERS
// ─────────────────────────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const heroHeadline: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.3,
    },
  },
};

export const heroCharacter: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.05,
      ease: 'easeOut',
    },
  },
};

export const heroDashboard: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA VISUALIZATION ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const gaugeVariants: Variants = {
  hidden: { pathLength: 0 },
  visible: (value: number) => ({
    pathLength: value,
    transition: {
      duration: 1.2,
      delay: 0.2,
      ease: [0.34, 1.56, 0.64, 1], // spring overshoot
    },
  }),
};

export const barVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HOVER ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const buttonHover = {
  scale: 1.02,
  y: -2,
  transition: {
    duration: 0.2,
    ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  },
};

export const buttonTap = {
  scale: 0.98,
  y: 0,
  transition: {
    duration: 0.1,
  },
};

export const cardHover = {
  y: -4,
  transition: {
    duration: 0.2,
    ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE LOAD SEQUENCE
// ─────────────────────────────────────────────────────────────────────────────

export const pageLoadSequence = {
  navigation: { delay: 0.2 },
  headline: { delay: 0.3 },
  subhead: { delay: 0.5 },
  ctas: { delay: 0.7 },
  dashboard: { delay: 0.8 },
  dashboardElements: { delay: 1.3 },
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOW ANIMATION (for Three.js/CSS)
// ─────────────────────────────────────────────────────────────────────────────

export const glowPulseVariants: Variants = {
  initial: {
    boxShadow: '0 0 20px rgba(104, 113, 147, 0.2)',
  },
  animate: {
    boxShadow: [
      '0 0 20px rgba(104, 113, 147, 0.2)',
      '0 0 40px rgba(104, 113, 147, 0.4)',
      '0 0 20px rgba(104, 113, 147, 0.2)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC SECTION TRANSITIONS
// ─────────────────────────────────────────────────────────────────────────────

export const cinematicFadeIn: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const cinematicScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const magneticHover = {
  scale: 1.05,
  transition: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 10,
  },
};

export const floatAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const pulseScale: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA VISUALIZATION ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const dataPointReveal: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      delay: i * 0.05,
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  }),
};

export const lineDrawIn: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] },
      opacity: { duration: 0.3 },
    },
  },
};

export const countUpTransition = {
  duration: 1.5,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

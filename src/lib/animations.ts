// ═══════════════════════════════════════════════════════════════════════════
// BRUTALIST ANIMATION VARIANTS
// Minimal, fast, linear - no spring physics, no blur, no scale effects
// ═══════════════════════════════════════════════════════════════════════════

import { Variants } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// FADE ANIMATIONS (kept minimal)
// ─────────────────────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: 'linear',
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: 'linear',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STAGGER CONTAINER (one only)
// ─────────────────────────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD VARIANTS (minimal)
// ─────────────────────────────────────────────────────────────────────────────

export const cardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.1,
      ease: 'linear',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HOVER ANIMATIONS (instant)
// ─────────────────────────────────────────────────────────────────────────────

export const buttonHover = {
  // No animation - handled by CSS
};

export const buttonTap = {
  // No animation - handled by CSS
};

export const cardHover = {
  // No animation - handled by CSS
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA VISUALIZATION (kept for charts)
// ─────────────────────────────────────────────────────────────────────────────

export const gaugeVariants: Variants = {
  hidden: { pathLength: 0 },
  visible: (value: number) => ({
    pathLength: value,
    transition: {
      duration: 0.3,
      ease: 'linear',
    },
  }),
};

export const barVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.2,
      ease: 'linear',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY EXPORTS (empty, for backwards compatibility)
// Will be removed after component updates
// ─────────────────────────────────────────────────────────────────────────────

export const fadeInDown = fadeInUp;
export const fadeInScale = fadeIn;
export const staggerContainerFast = staggerContainer;
export const staggerContainerSlow = staggerContainer;
export const sectionVariants = fadeIn;
export const heroHeadline = staggerContainer;
export const heroCharacter = fadeIn;
export const heroDashboard = fadeIn;
export const cinematicFadeIn = fadeInUp;
export const cinematicScale = fadeIn;
export const slideFromLeft = fadeInUp;
export const slideFromRight = fadeInUp;
export const magneticHover = {};
export const floatAnimation = fadeIn;
export const pulseScale = fadeIn;
export const glowPulseVariants = fadeIn;
export const dataPointReveal = fadeIn;
export const lineDrawIn = gaugeVariants;
export const countUpTransition = { duration: 0.3, ease: 'linear' as const };
export const pageLoadSequence = {
  navigation: { delay: 0 },
  headline: { delay: 0 },
  subhead: { delay: 0 },
  ctas: { delay: 0 },
  dashboard: { delay: 0 },
  dashboardElements: { delay: 0 },
};

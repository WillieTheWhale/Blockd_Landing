// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE ANIMATION VARIANTS
// Animation definitions for timeline interactions and event highlighting
// ═══════════════════════════════════════════════════════════════════════════

import { Variants } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// EVENT CARD HIGHLIGHT ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const highlightedEventVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  highlighted: {
    scale: 1.03,
    opacity: 1,
    transition: {
      scale: {
        type: 'spring',
        stiffness: 400,
        damping: 20,
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOW PULSE ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

export const glowPulseAnimation = {
  initial: {
    opacity: 0.6,
  },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE MARKER HIGHLIGHT
// ─────────────────────────────────────────────────────────────────────────────

export const markerHighlightVariants: Variants = {
  initial: {
    scale: 1,
  },
  highlighted: {
    scale: 1.5,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a glow box-shadow for highlighted events
 */
export function getHighlightGlow(color: string, isHighlighted: boolean): string {
  if (!isHighlighted) {
    return `0 0 8px ${color}`;
  }
  return `0 0 30px ${color}, 0 0 60px ${color}, 0 0 90px ${color}60`;
}

/**
 * Get the ring style for highlighted events
 */
export function getHighlightRing(color: string, isHighlighted: boolean): string {
  if (!isHighlighted) {
    return 'none';
  }
  return `0 0 0 2px ${color}40`;
}

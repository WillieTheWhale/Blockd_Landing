// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE ANIMATION VARIANTS
// Comprehensive animation definitions for the timeline system
// ═══════════════════════════════════════════════════════════════════════════

import { Variants, Transition } from 'framer-motion';
import { SPRING_CONFIGS } from '@/domain/timeline/types';

// ─────────────────────────────────────────────────────────────────────────────
// EASING CURVES
// ─────────────────────────────────────────────────────────────────────────────

export const EASINGS = {
  /** Standard smooth deceleration */
  easeOut: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  /** Acceleration then deceleration */
  easeInOut: [0.42, 0, 0.58, 1] as [number, number, number, number],
  /** Quick start, slow end - cinematic */
  cinematic: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** Subtle overshoot */
  overshoot: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  /** Bounce effect */
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE REVEAL ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Container for the entire timeline reveal sequence */
export const timelineContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      when: 'afterChildren',
    },
  },
};

/** Track background line reveal */
export const trackRevealVariants: Variants = {
  hidden: {
    scaleX: 0,
    opacity: 0,
  },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: EASINGS.cinematic,
    },
  },
};

/** Progress bar fill animation */
export const progressRevealVariants: Variants = {
  hidden: {
    scaleX: 0,
  },
  visible: (progress: number) => ({
    scaleX: progress,
    transition: {
      duration: 0.8,
      delay: 0.3,
      ease: EASINGS.easeOut,
    },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// MARKER ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Marker staggered entrance */
export const markerEntranceVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      ...SPRING_CONFIGS.bouncy,
      delay: index * 0.05,
    },
  }),
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/** Marker hover state */
export const markerHoverVariants: Variants = {
  idle: {
    scale: 1,
  },
  hovered: {
    scale: 1.3,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 20,
    },
  },
  pressed: {
    scale: 0.9,
    transition: {
      duration: 0.1,
    },
  },
};

/** Marker highlight state (when timeline position matches) */
export const markerHighlightVariants: Variants = {
  normal: {
    scale: 1,
    filter: 'brightness(1)',
  },
  highlighted: {
    scale: 1.5,
    filter: 'brightness(1.2)',
    transition: {
      scale: {
        type: 'spring',
        ...SPRING_CONFIGS.bouncy,
      },
      filter: {
        duration: 0.2,
      },
    },
  },
};

/** Marker pulse animation for active events */
export const markerPulseVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  pulse: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/** Glow ring animation for markers */
export const markerGlowVariants: Variants = {
  hidden: {
    scale: 0.5,
    opacity: 0,
  },
  visible: {
    scale: 1.5,
    opacity: [0, 0.6, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeOut',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SCRUBBER ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Scrubber handle entrance */
export const scrubberEntranceVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      ...SPRING_CONFIGS.bouncy,
      delay: 0.5,
    },
  },
};

/** Scrubber interaction states */
export const scrubberInteractionVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: '0 0 0 0 rgba(104, 113, 147, 0)',
  },
  hovered: {
    scale: 1.1,
    boxShadow: '0 0 12px 2px rgba(104, 113, 147, 0.3)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
  dragging: {
    scale: 0.95,
    boxShadow: '0 0 20px 4px rgba(104, 113, 147, 0.5)',
    transition: {
      duration: 0.1,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLS ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Controls bar entrance */
export const controlsEntranceVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.6,
      ease: EASINGS.easeOut,
    },
  },
};

/** Play/pause button animation */
export const playButtonVariants: Variants = {
  idle: {
    scale: 1,
  },
  hovered: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
  pressed: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

/** Speed indicator animation */
export const speedIndicatorVariants: Variants = {
  normal: {
    scale: 1,
    color: 'var(--blockd-muted)',
  },
  active: {
    scale: 1.1,
    color: 'var(--blockd-accent)',
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
};

/** Filter chip animation */
export const filterChipVariants: Variants = {
  inactive: {
    scale: 1,
    opacity: 0.6,
  },
  active: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  hovered: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TIME LABELS ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Time label entrance */
export const timeLabelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 5,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.8 + index * 0.03,
      ease: EASINGS.easeOut,
    },
  }),
};

/** Current time display */
export const currentTimeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: EASINGS.easeOut,
    },
  },
  updated: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.2,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EVENT CARD ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Event card entrance in list */
export const eventCardEntranceVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.98,
  },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: index * 0.05,
      ease: EASINGS.easeOut,
    },
  }),
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.98,
    transition: {
      duration: 0.2,
    },
  },
};

/** Event card highlight animation */
export const eventCardHighlightVariants: Variants = {
  normal: {
    scale: 1,
    opacity: 1,
  },
  highlighted: {
    scale: 1.03,
    opacity: 1,
    transition: {
      scale: {
        type: 'spring',
        ...SPRING_CONFIGS.bouncy,
      },
    },
  },
};

/** Event card glow border */
export const eventCardGlowVariants: Variants = {
  idle: {
    boxShadow: '0 0 0 0 rgba(104, 113, 147, 0)',
    borderColor: 'rgba(203, 213, 225, 0.08)',
  },
  highlighted: {
    boxShadow: '0 0 20px 0 rgba(104, 113, 147, 0.3)',
    borderColor: 'rgba(104, 113, 147, 0.4)',
    transition: {
      duration: 0.3,
    },
  },
  pulsing: {
    boxShadow: [
      '0 0 10px 0 rgba(104, 113, 147, 0.2)',
      '0 0 25px 0 rgba(104, 113, 147, 0.4)',
      '0 0 10px 0 rgba(104, 113, 147, 0.2)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MORPH TRANSITION ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Shared layout morph - marker side */
export const morphMarkerVariants: Variants = {
  marker: {
    borderRadius: '50%',
    scale: 1,
  },
  morphing: {
    borderRadius: '12px',
    scale: 0.5,
    transition: {
      type: 'spring',
      ...SPRING_CONFIGS.gentle,
    },
  },
};

/** Shared layout morph - card side */
export const morphCardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    borderRadius: '50%',
  },
  visible: {
    opacity: 1,
    scale: 1,
    borderRadius: '12px',
    transition: {
      type: 'spring',
      ...SPRING_CONFIGS.gentle,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

/** Overlay backdrop for expanded card */
export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ZOOM ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Zoom container animation */
export const zoomContainerVariants: Variants = {
  default: {
    scale: 1,
  },
  zooming: {
    transition: {
      type: 'spring',
      ...SPRING_CONFIGS.smooth,
    },
  },
};

/** Zoom button feedback */
export const zoomButtonVariants: Variants = {
  idle: {
    scale: 1,
    opacity: 1,
  },
  hovered: {
    scale: 1.1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
  pressed: {
    scale: 0.9,
    transition: {
      duration: 0.1,
    },
  },
  disabled: {
    opacity: 0.5,
    scale: 1,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MINIMAP ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Minimap container */
export const minimapVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.7,
      ease: EASINGS.easeOut,
    },
  },
};

/** Minimap viewport indicator */
export const minimapViewportVariants: Variants = {
  initial: {
    opacity: 0.6,
  },
  hovered: {
    opacity: 0.8,
    transition: {
      duration: 0.2,
    },
  },
  dragging: {
    opacity: 1,
    transition: {
      duration: 0.1,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIP ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Tooltip entrance */
export const tooltipVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LOADING STATES
// ─────────────────────────────────────────────────────────────────────────────

/** Skeleton loading animation */
export const skeletonVariants: Variants = {
  loading: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/** Shimmer effect */
export const shimmerVariants: Variants = {
  initial: {
    x: '-100%',
  },
  animate: {
    x: '200%',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TRANSITION PRESETS
// ─────────────────────────────────────────────────────────────────────────────

export const TRANSITIONS = {
  /** Fast micro-interaction */
  instant: {
    duration: 0.1,
  } as Transition,

  /** Quick response */
  quick: {
    duration: 0.2,
    ease: EASINGS.easeOut,
  } as Transition,

  /** Standard UI transition */
  standard: {
    duration: 0.3,
    ease: EASINGS.easeOut,
  } as Transition,

  /** Smooth movement */
  smooth: {
    duration: 0.5,
    ease: EASINGS.cinematic,
  } as Transition,

  /** Dramatic reveal */
  dramatic: {
    duration: 0.8,
    ease: EASINGS.cinematic,
  } as Transition,

  /** Spring for interactive elements */
  spring: {
    type: 'spring',
    ...SPRING_CONFIGS.snappy,
  } as Transition,

  /** Bouncy spring */
  bouncy: {
    type: 'spring',
    ...SPRING_CONFIGS.bouncy,
  } as Transition,

  /** Gentle spring for morphing */
  gentle: {
    type: 'spring',
    ...SPRING_CONFIGS.gentle,
  } as Transition,
} as const;

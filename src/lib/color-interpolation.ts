// ═══════════════════════════════════════════════════════════════════════════
// COLOR INTERPOLATION UTILITIES
// Functions for smooth color transitions between scroll sections
// ═══════════════════════════════════════════════════════════════════════════

import { hexToRgb } from '@/theme/utils';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ColorStop {
  id: string;
  progress: number;
  color: string;
}

export interface InterpolationResult {
  from: ColorStop;
  to: ColorStop;
  blendFactor: number;
  interpolatedColor: string;
}

// Default fallback color (dark navy matching void background)
const DEFAULT_COLOR = '#02121d';

// ─────────────────────────────────────────────────────────────────────────────
// EASING
// ─────────────────────────────────────────────────────────────────────────────

export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOR STOP GENERATION
// ─────────────────────────────────────────────────────────────────────────────

export function generateColorStops(
  sectionIds: readonly string[],
  sectionColors: Record<string, string>
): ColorStop[] {
  const count = sectionIds.length;
  if (count === 0) return [];

  return sectionIds.map((id, index) => ({
    id,
    progress: count === 1 ? 0 : index / (count - 1),
    color: sectionColors[id] || DEFAULT_COLOR,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOR INTERPOLATION
// ─────────────────────────────────────────────────────────────────────────────

function findColorStops(
  progress: number,
  stops: ColorStop[]
): { from: ColorStop; to: ColorStop; blendFactor: number } {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const defaultStop: ColorStop = { id: 'default', progress: 0, color: DEFAULT_COLOR };

  if (stops.length === 0) {
    return { from: defaultStop, to: defaultStop, blendFactor: 0 };
  }

  if (stops.length === 1) {
    return { from: stops[0], to: stops[0], blendFactor: 0 };
  }

  // Find bracketing stops
  let from = stops[0];
  let to = stops[1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (clampedProgress >= stops[i].progress && clampedProgress <= stops[i + 1].progress) {
      from = stops[i];
      to = stops[i + 1];
      break;
    }
  }

  // Calculate blend factor
  const range = to.progress - from.progress;
  const blendFactor = range > 0
    ? Math.max(0, Math.min(1, (clampedProgress - from.progress) / range))
    : 0;

  return { from, to, blendFactor };
}

function interpolateColors(fromColor: string, toColor: string, factor: number): string {
  try {
    const fromRgb = hexToRgb(fromColor);
    const toRgb = hexToRgb(toColor);

    const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * factor);
    const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * factor);
    const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * factor);

    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return `rgb(2, 18, 29)`; // Default dark navy in RGB format
  }
}

/**
 * Get interpolated color based on scroll progress
 * @param easingFn - Optional easing function. Pass identity (t => t) for linear.
 */
export function getInterpolatedColor(
  progress: number,
  stops: ColorStop[],
  easingFn?: (t: number) => number
): InterpolationResult {
  const { from, to, blendFactor } = findColorStops(progress, stops);
  const easedFactor = easingFn ? easingFn(blendFactor) : blendFactor;
  const interpolatedColor = interpolateColors(from.color, to.color, easedFactor);

  return {
    from,
    to,
    blendFactor: easedFactor,
    interpolatedColor,
  };
}

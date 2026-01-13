'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useScrollSection, SECTION_IDS, SECTION_COLORS } from '@/hooks/use-scroll-section';
import { generateColorStops, getInterpolatedColor, easeInOutCubic, ColorStop } from '@/lib/color-interpolation';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL BACKGROUND GRADIENT
// Provides smooth color transitions between sections as user scrolls
// Uses CSS custom properties for hardware-accelerated transitions
// ═══════════════════════════════════════════════════════════════════════════

interface ScrollBackgroundGradientProps {
  /**
   * Opacity of the background overlay (0-1)
   * Controls visibility of the gradient layer
   * @default 0.8
   */
  opacity?: number;

  /**
   * Whether to apply easing to color transitions
   * @default true
   */
  useEasing?: boolean;

  /**
   * Custom color stops (overrides default section colors)
   */
  customStops?: ColorStop[];
}

export function ScrollBackgroundGradient({
  opacity = 0.8,
  useEasing = true,
  customStops,
}: ScrollBackgroundGradientProps = {}) {
  const { overallProgress } = useScrollSection();
  const backgroundRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Generate color stops from section data (memoized)
  const colorStops = useMemo(() => {
    if (customStops && customStops.length > 0) {
      return customStops;
    }
    return generateColorStops(SECTION_IDS, SECTION_COLORS);
  }, [customStops]);

  // Update CSS custom properties on scroll (performance: direct DOM manipulation)
  useEffect(() => {
    if (!backgroundRef.current) return;

    const element = backgroundRef.current;

    // Get interpolated color based on scroll progress
    const easingFn = useEasing ? easeInOutCubic : undefined;
    const result = getInterpolatedColor(overallProgress, colorStops, easingFn);

    // Update CSS custom properties for the gradient
    element.style.setProperty('--scroll-bg-color-current', result.interpolatedColor);
    element.style.setProperty('--scroll-bg-color-from', result.from.color);
    element.style.setProperty('--scroll-bg-color-to', result.to.color);
    element.style.setProperty('--scroll-bg-blend', String(result.blendFactor));

  }, [overallProgress, colorStops, useEasing]);

  // For reduced motion, use a static color
  const staticColor = useMemo(() => {
    if (colorStops.length === 0) return '#02121d';
    // Use the middle color as static fallback
    const middleIndex = Math.floor(colorStops.length / 2);
    return colorStops[middleIndex].color;
  }, [colorStops]);

  return (
    <div
      ref={backgroundRef}
      className="scroll-background-gradient"
      style={{
        '--scroll-bg-color-current': staticColor,
        '--scroll-bg-color-from': colorStops[0]?.color || '#02121d',
        '--scroll-bg-color-to': colorStops[1]?.color || '#02121d',
        '--scroll-bg-blend': '0',
        '--scroll-bg-opacity': prefersReducedMotion ? '0.6' : String(opacity),
      } as React.CSSProperties}
      aria-hidden="true"
    />
  );
}

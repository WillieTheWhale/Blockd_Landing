'use client';

import { useCallback, useRef, RefObject } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL TO ELEMENT HOOK
// Generic hook for auto-scrolling to elements within a scrollable container
// ═══════════════════════════════════════════════════════════════════════════

interface UseScrollToElementOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  duration?: number; // Scroll duration in ms
}

interface UseScrollToElementReturn {
  scrollToElement: (elementId: string | null) => void;
  lastScrolledId: RefObject<string | null>;
}

// Easing function for smooth deceleration
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useScrollToElement({
  containerRef,
  duration = 600, // Default 600ms for smooth, slow scroll
}: UseScrollToElementOptions): UseScrollToElementReturn {
  // Track last scrolled ID to avoid redundant scrolls
  const lastScrolledId = useRef<string | null>(null);
  const animationRef = useRef<number | null>(null);

  const scrollToElement = useCallback(
    (elementId: string | null) => {
      // Reset tracking when no element is highlighted (allows re-scrolling when revisited)
      if (!elementId) {
        lastScrolledId.current = null;
        return;
      }

      // Skip if already scrolled to this element or container not available
      if (!containerRef.current || lastScrolledId.current === elementId) {
        return;
      }

      const element = containerRef.current.querySelector(
        `[data-event-id="${elementId}"]`
      ) as HTMLElement | null;

      if (element) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Calculate target scroll position (center the element)
        const elementTop = elementRect.top - containerRect.top + container.scrollTop;
        const targetScroll = Math.max(0, elementTop - (containerRect.height / 2) + (elementRect.height / 2));

        const startScroll = container.scrollTop;
        const scrollDistance = targetScroll - startScroll;

        // Cancel any existing animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        // Animate scroll with easing
        const startTime = performance.now();

        const animateScroll = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutCubic(progress);

          container.scrollTop = startScroll + (scrollDistance * easedProgress);

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animateScroll);
          } else {
            animationRef.current = null;
          }
        };

        animationRef.current = requestAnimationFrame(animateScroll);
        lastScrolledId.current = elementId;
      }
    },
    [containerRef, duration]
  );

  return {
    scrollToElement,
    lastScrolledId,
  };
}

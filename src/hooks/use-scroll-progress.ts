'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS HOOK - Tracks scroll position for animations & morphing
// ═══════════════════════════════════════════════════════════════════════════

interface ScrollProgress {
  progress: number; // 0 to 1 (normalized page scroll)
  velocity: number; // Scroll speed
  direction: 'up' | 'down' | 'idle';
  y: number; // Raw scroll Y position
  isScrolling: boolean;
}

export function useScrollProgress(): ScrollProgress {
  const [scroll, setScroll] = useState<ScrollProgress>({
    progress: 0,
    velocity: 0,
    direction: 'idle',
    y: 0,
    isScrolling: false,
  });

  const lastScrollRef = useRef({ y: 0, time: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const now = performance.now();
      const lastScroll = lastScrollRef.current;

      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(y / maxScroll, 1) : 0;

      // Calculate velocity and direction
      const dy = y - lastScroll.y;
      const dt = Math.max(now - lastScroll.time, 1);
      const velocity = Math.abs(dy) / dt * 16; // Normalize to ~60fps

      const direction: 'up' | 'down' | 'idle' =
        dy > 0 ? 'down' : dy < 0 ? 'up' : 'idle';

      lastScrollRef.current = { y, time: now };

      setScroll({
        progress,
        velocity: Math.min(velocity, 10), // Cap velocity
        direction,
        y,
        isScrolling: true,
      });

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set isScrolling to false after 150ms of no scroll
      timeoutRef.current = setTimeout(() => {
        setScroll((prev) => ({ ...prev, isScrolling: false, velocity: 0 }));
      }, 150);
    });
  }, []);

  useEffect(() => {
    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

  return scroll;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION SCROLL PROGRESS - Track progress within a specific section
// ═══════════════════════════════════════════════════════════════════════════

interface SectionProgress {
  progress: number; // 0 to 1 within the section
  isInView: boolean;
  hasEntered: boolean; // True once section enters viewport
}

export function useSectionProgress(
  ref: React.RefObject<HTMLElement>,
  options: { offset?: number } = {}
): SectionProgress {
  const { offset = 0 } = options;
  const [sectionProgress, setSectionProgress] = useState<SectionProgress>({
    progress: 0,
    isInView: false,
    hasEntered: false,
  });

  const hasEnteredRef = useRef(false);

  const updateProgress = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate when section is in view
    const isInView = rect.top < windowHeight - offset && rect.bottom > offset;

    // Calculate progress through section (0 when entering from bottom, 1 when leaving top)
    const sectionHeight = rect.height;
    const visibleTop = Math.max(0, windowHeight - rect.top);
    const progress = Math.min(Math.max(visibleTop / (windowHeight + sectionHeight), 0), 1);

    if (isInView && !hasEnteredRef.current) {
      hasEnteredRef.current = true;
    }

    setSectionProgress({
      progress,
      isInView,
      hasEntered: hasEnteredRef.current,
    });
  }, [ref, offset]);

  useEffect(() => {
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [updateProgress]);

  return sectionProgress;
}

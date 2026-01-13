'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL SECTION TRACKER
// Tracks which section is in view and provides scroll progress
// PERFORMANCE: Caches DOM element references and reuses Map object
// ═══════════════════════════════════════════════════════════════════════════

export interface SectionInfo {
  id: string;
  progress: number; // 0-1 progress through section
  isActive: boolean;
}

export interface ScrollSectionState {
  activeSection: string;
  sectionProgress: number;
  overallProgress: number;
  scrollDirection: 'up' | 'down' | 'none';
  scrollVelocity: number;
  sections: Map<string, SectionInfo>;
}

const SECTION_IDS = [
  'hero',
  'problem',
  'gaze',
  'ai-detection',
  'security',
  'report',
  'architecture',
  'scale',
  'cta',
];

// Color palette for section-aware effects - Light mode (darker colors)
export const SECTION_COLORS: Record<string, string> = {
  hero: '#36454F',      // dark slate
  problem: '#4A5A6A',   // medium slate
  gaze: '#5A6A7A',      // slate
  'ai-detection': '#687193', // slate blue
  security: '#36454F',  // dark slate
  report: '#4A5A6A',    // medium slate
  architecture: '#5A6A7A', // slate
  scale: '#36454F',     // dark slate
  cta: '#01101B',       // black blue
};

// PERFORMANCE: Cache for section elements to avoid repeated DOM queries
interface CachedSection {
  element: HTMLElement;
  id: string;
}

export function useScrollSection() {
  const [state, setState] = useState<ScrollSectionState>({
    activeSection: 'hero',
    sectionProgress: 0,
    overallProgress: 0,
    scrollDirection: 'none',
    scrollVelocity: 0,
    sections: new Map(),
  });

  const lastScrollY = useRef(0);
  const lastTime = useRef(performance.now());
  const rafId = useRef<number | null>(null);

  // PERFORMANCE: Cache DOM element references
  const cachedElements = useRef<CachedSection[]>([]);
  const elementsInitialized = useRef(false);

  // PERFORMANCE: Reuse Map and SectionInfo objects
  const sectionsMap = useRef(new Map<string, SectionInfo>());
  const sectionInfoCache = useRef<Record<string, SectionInfo>>(
    Object.fromEntries(SECTION_IDS.map(id => [id, { id, progress: 0, isActive: false }]))
  );

  // Initialize element cache once
  const initializeElements = useCallback(() => {
    if (elementsInitialized.current) return;

    cachedElements.current = SECTION_IDS
      .map(id => {
        const element = document.getElementById(id);
        return element ? { element, id } : null;
      })
      .filter((item): item is CachedSection => item !== null);

    elementsInitialized.current = true;
  }, []);

  const updateScroll = useCallback(() => {
    // PERFORMANCE: Initialize element cache if needed
    if (!elementsInitialized.current) {
      initializeElements();
    }

    const now = performance.now();
    const currentY = window.scrollY;
    const dt = Math.max(now - lastTime.current, 1);

    // Calculate velocity and direction
    const dy = currentY - lastScrollY.current;
    const velocity = Math.abs(dy / dt) * 100;
    const direction: 'up' | 'down' | 'none' = dy > 0 ? 'down' : dy < 0 ? 'up' : 'none';

    lastScrollY.current = currentY;
    lastTime.current = now;

    // Overall page progress
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const overallProgress = maxScroll > 0 ? currentY / maxScroll : 0;

    // Find active section and calculate progress
    const viewportCenter = currentY + window.innerHeight / 2;
    let activeSection = 'hero';
    let sectionProgress = 0;

    // PERFORMANCE: Clear and reuse Map instead of creating new one
    sectionsMap.current.clear();

    // PERFORMANCE: Use cached elements instead of document.getElementById
    for (const { element, id } of cachedElements.current) {
      const rect = element.getBoundingClientRect();
      const elementTop = currentY + rect.top;
      const elementBottom = elementTop + rect.height;

      // Calculate how far through this section we are
      const progress = Math.max(
        0,
        Math.min(1, (viewportCenter - elementTop) / (elementBottom - elementTop))
      );

      const isActive = viewportCenter >= elementTop && viewportCenter < elementBottom;

      // PERFORMANCE: Reuse cached SectionInfo object
      const info = sectionInfoCache.current[id];
      info.progress = progress;
      info.isActive = isActive;
      sectionsMap.current.set(id, info);

      if (isActive) {
        activeSection = id;
        sectionProgress = progress;
      }
    }

    setState({
      activeSection,
      sectionProgress,
      overallProgress,
      scrollDirection: direction,
      scrollVelocity: Math.min(velocity, 100),
      sections: sectionsMap.current,
    });

    rafId.current = null;
  }, [initializeElements]);

  const handleScroll = useCallback(() => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(updateScroll);
  }, [updateScroll]);

  useEffect(() => {
    // PERFORMANCE: Initialize elements on mount
    initializeElements();

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll, updateScroll, initializeElements]);

  return state;
}

// Hook to get current section color
export function useSectionColor() {
  const { activeSection } = useScrollSection();
  return SECTION_COLORS[activeSection] || '#36454F';
}

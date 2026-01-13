'use client';

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE CONTAINER
// Root orchestrator component for the timeline system
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, MotionValue, useMotionValue } from 'framer-motion';
import { SecurityEvent } from '@/types';
import { TimelineConfig, DEFAULT_TIMELINE_CONFIG } from '@/domain/timeline/types';
import { useTimelineStore } from '@/store/timeline';
import { createAnimationOrchestrator } from '@/services/timeline';
import { timelineContainerVariants } from '@/lib/timeline/animation-variants';
import { cn } from '@/lib/cn';

import { TimelineTrack } from './timeline-track';
import { TimelineControls } from './timeline-controls';
import { TimelineMinimap } from './timeline-minimap';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineContainerProps {
  /** Security events to display */
  events: SecurityEvent[];
  /** Total timeline duration in seconds */
  duration: number;
  /** Optional configuration overrides */
  config?: Partial<TimelineConfig>;
  /** Callback when time changes */
  onTimeChange?: (time: number) => void;
  /** Callback when seek is ready (exposes seekTo function) */
  onSeekReady?: (seekFn: (time: number) => void) => void;
  /** ID of highlighted event (from parent) */
  highlightedEventId?: string | null;
  /** Whether to show controls */
  showControls?: boolean;
  /** Whether to show minimap */
  showMinimap?: boolean;
  /** Whether to enable playback */
  enablePlayback?: boolean;
  /** Whether to enable zoom */
  enableZoom?: boolean;
  /** Whether to enable filters */
  enableFilters?: boolean;
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function TimelineContainer({
  events,
  duration,
  config,
  onTimeChange,
  onSeekReady,
  highlightedEventId: externalHighlightedId,
  showControls = true,
  showMinimap = false,
  enablePlayback = true,
  enableZoom = true,
  enableFilters = true,
  className,
}: TimelineContainerProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const orchestratorRef = useRef(createAnimationOrchestrator());

  // Motion value for smooth time updates without re-renders
  const timeMotionValue = useMotionValue(0);

  // Store actions
  const initialize = useTimelineStore((state) => state.initialize);
  const setViewport = useTimelineStore((state) => state.setViewport);
  const seek = useTimelineStore((state) => state.seek);
  const currentTime = useTimelineStore((state) => state.currentTime);
  const storeHighlightedId = useTimelineStore((state) => state.selection.highlightedEventId);
  const animation = useTimelineStore((state) => state.animation);
  const startReveal = useTimelineStore((state) => state.startReveal);

  // Use external highlighted ID if provided, otherwise use store's
  const highlightedEventId = externalHighlightedId ?? storeHighlightedId;

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fullConfig = { ...DEFAULT_TIMELINE_CONFIG, duration, ...config };
    initialize(events, fullConfig);
  }, [events, duration, config, initialize]);

  // Set up container measurements
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewport(rect.width, rect.height);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [setViewport]);

  // Set up animation orchestrator
  useEffect(() => {
    if (containerRef.current) {
      orchestratorRef.current.setContainer(containerRef.current);
    }

    return () => {
      orchestratorRef.current.destroy();
    };
  }, []);

  // Play reveal animation on mount
  useEffect(() => {
    if (animation.revealPhase === 'hidden') {
      startReveal();
      orchestratorRef.current.playRevealSequence();
    }
  }, [animation.revealPhase, startReveal]);

  // ─────────────────────────────────────────────────────────────────────────
  // SYNC MOTION VALUE WITH STORE
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    timeMotionValue.set(currentTime);
  }, [currentTime, timeMotionValue]);

  // Notify parent of time changes
  useEffect(() => {
    const unsubscribe = timeMotionValue.on('change', (value) => {
      onTimeChange?.(value);
    });
    return unsubscribe;
  }, [timeMotionValue, onTimeChange]);

  // ─────────────────────────────────────────────────────────────────────────
  // EXPOSE SEEK FUNCTION
  // ─────────────────────────────────────────────────────────────────────────

  const seekTo = useCallback(
    (time: number) => {
      seek(time);
    },
    [seek]
  );

  useEffect(() => {
    onSeekReady?.(seekTo);
  }, [onSeekReady, seekTo]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      ref={containerRef}
      className={cn('relative w-full', className)}
      variants={timelineContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Main Timeline Track */}
      <TimelineTrack
        events={events}
        duration={duration}
        timeMotionValue={timeMotionValue}
        highlightedEventId={highlightedEventId}
        onSeek={seekTo}
      />

      {/* Controls Bar */}
      <AnimatePresence>
        {showControls && (
          <TimelineControls
            enablePlayback={enablePlayback}
            enableZoom={enableZoom}
            enableFilters={enableFilters}
            timeMotionValue={timeMotionValue}
          />
        )}
      </AnimatePresence>

      {/* Minimap (optional) */}
      <AnimatePresence>
        {showMinimap && (
          <TimelineMinimap
            events={events}
            duration={duration}
            timeMotionValue={timeMotionValue}
            onSeek={seekTo}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RE-EXPORT FOR CONVENIENCE
// ─────────────────────────────────────────────────────────────────────────────

export { TimelineTrack } from './timeline-track';
export { TimelineControls } from './timeline-controls';
export { TimelineMinimap } from './timeline-minimap';
export { TimelineScrubber } from './timeline-scrubber';
export { EventMarker } from './event-marker';

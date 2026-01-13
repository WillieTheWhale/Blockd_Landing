'use client';

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE TRACK
// Main track rendering with markers and scrubber
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { motion, useTransform, MotionValue, AnimatePresence } from 'framer-motion';
import { SecurityEvent } from '@/types';
import { useTimelineStore } from '@/store/timeline';
import { createGestureHandler, getPhysicsEngine } from '@/services/timeline';
import { timeToNormalized, clamp } from '@/domain/timeline/calculations';
import {
  trackRevealVariants,
  progressRevealVariants,
  timeLabelVariants,
} from '@/lib/timeline/animation-variants';
import { formatTimestamp } from '@/data/security-events';
import { cn } from '@/lib/cn';

import { TimelineScrubber } from './timeline-scrubber';
import { EventMarker } from './event-marker';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineTrackProps {
  /** Security events to display */
  events: SecurityEvent[];
  /** Total duration in seconds */
  duration: number;
  /** Motion value for current time */
  timeMotionValue: MotionValue<number>;
  /** ID of highlighted event */
  highlightedEventId?: string | null;
  /** Callback when seeking */
  onSeek: (time: number) => void;
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function TimelineTrack({
  events,
  duration,
  timeMotionValue,
  highlightedEventId,
  onSeek,
  className,
}: TimelineTrackProps) {
  // Refs
  const trackRef = useRef<HTMLDivElement>(null);
  const gestureHandlerRef = useRef(createGestureHandler());
  const physicsEngineRef = useRef(getPhysicsEngine());

  // State
  const [isDragging, setIsDragging] = useState(false);

  // Store
  const filteredEvents = useTimelineStore((state) => state.filteredEvents);
  const physics = useTimelineStore((state) => state.physics);
  const startDrag = useTimelineStore((state) => state.startDrag);
  const updateDrag = useTimelineStore((state) => state.updateDrag);
  const endDrag = useTimelineStore((state) => state.endDrag);
  const seek = useTimelineStore((state) => state.seek);
  const viewport = useTimelineStore((state) => state.viewport);

  // Derived values
  const progressPercent = useTransform(timeMotionValue, [0, duration], [0, 100]);

  // Generate time labels
  const labelInterval = 300; // 5 minutes
  const timeLabels: number[] = [];
  for (let t = 0; t <= duration; t += labelInterval) {
    timeLabels.push(t);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GESTURE HANDLING
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const gestureHandler = gestureHandlerRef.current;
    const physicsEngine = physicsEngineRef.current;

    if (!trackRef.current) return;

    gestureHandler.attach(trackRef.current);

    // Handle drag gestures
    const unsubDrag = gestureHandler.on('drag', (event) => {
      if (event.isStart) {
        setIsDragging(true);
        physicsEngine.stopAnimation();
        startDrag(event.position * viewport.containerWidth);
      } else if (event.isEnd) {
        setIsDragging(false);
        endDrag(event.velocity);

        // Apply momentum if flick detected
        if (Math.abs(event.velocity) > 50) {
          const currentTime = timeMotionValue.get();
          physicsEngine.startMomentum(
            timeMotionValue,
            -event.velocity * 0.5, // Invert for natural feel
            (time) => seek(time),
            () => {}
          );
        }
      } else {
        updateDrag(event.position * viewport.containerWidth, viewport.containerWidth);
        const newTime = clamp(event.position * duration, 0, duration);
        timeMotionValue.set(newTime);
      }
    });

    // Handle tap to seek
    const unsubTap = gestureHandler.on('tap', (event) => {
      const targetTime = event.position * duration;
      physicsEngine.seekWithSpring(
        timeMotionValue,
        targetTime,
        (time) => seek(time)
      );
    });

    // Handle flick for fast scrubbing
    const unsubFlick = gestureHandler.on('flick', (event) => {
      const velocity = -event.velocity * 0.5;
      physicsEngine.startMomentum(
        timeMotionValue,
        velocity,
        (time) => seek(time)
      );
    });

    // Handle pinch for zoom
    const unsubPinch = gestureHandler.on('pinch', (event) => {
      // Zoom handling will be implemented in zoom controls
    });

    return () => {
      unsubDrag();
      unsubTap();
      unsubFlick();
      unsubPinch();
      gestureHandler.destroy();
    };
  }, [
    duration,
    viewport.containerWidth,
    timeMotionValue,
    seek,
    startDrag,
    updateDrag,
    endDrag,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // CLICK HANDLER (fallback for track clicks)
  // ─────────────────────────────────────────────────────────────────────────

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current || isDragging) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const position = clamp(x / rect.width, 0, 1);
      const targetTime = position * duration;

      physicsEngineRef.current.seekWithSpring(
        timeMotionValue,
        targetTime,
        (time) => seek(time)
      );
    },
    [duration, timeMotionValue, seek, isDragging]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={cn('w-full py-4', className)}>
      {/* Timeline track area */}
      <div
        ref={trackRef}
        data-timeline-track
        className={cn(
          'relative h-12',
          isDragging ? 'cursor-grabbing' : 'cursor-pointer'
        )}
        onClick={handleTrackClick}
      >
        {/* Background track */}
        <motion.div
          data-timeline-rail
          className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-blockd-surface origin-left"
          variants={trackRevealVariants}
          initial="hidden"
          animate="visible"
        />

        {/* Progress fill */}
        <motion.div
          data-timeline-progress
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-blockd-accent origin-left"
          style={{ width: useTransform(progressPercent, (v) => `${v}%`) }}
        />

        {/* Event markers */}
        <AnimatePresence>
          {filteredEvents.map((event, index) => {
            const position = timeToNormalized(event.timestamp, duration);
            const isHighlighted = event.id === highlightedEventId;

            return (
              <EventMarker
                key={event.id}
                event={event}
                position={position}
                index={index}
                isHighlighted={isHighlighted}
                onSeek={onSeek}
              />
            );
          })}
        </AnimatePresence>

        {/* Scrubber handle */}
        <TimelineScrubber
          timeMotionValue={timeMotionValue}
          duration={duration}
          isDragging={isDragging}
          onSeek={onSeek}
        />
      </div>

      {/* Time labels */}
      <div className="relative h-6 mt-2">
        {timeLabels.map((time, index) => {
          const position = timeToNormalized(time, duration);
          return (
            <motion.span
              key={time}
              data-timeline-label
              className="absolute -translate-x-1/2 text-xs font-mono text-blockd-muted/60"
              style={{ left: `${position * 100}%` }}
              variants={timeLabelVariants}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              {formatTimestamp(time)}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

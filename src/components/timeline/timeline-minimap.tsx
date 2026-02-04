'use client';

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE MINIMAP
// Overview navigation for zoomed timelines
// ═══════════════════════════════════════════════════════════════════════════

import React, { useCallback, useRef } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { SecurityEvent } from '@/types';
import { useTimelineStore } from '@/store/timeline';
import { SEVERITY_COLORS } from '@/lib/severity-colors';
import { timeToNormalized, clamp } from '@/domain/timeline/calculations';
import {
  minimapVariants,
  minimapViewportVariants,
} from '@/lib/timeline/animation-variants';
import { cn } from '@/lib/cn';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineMinimapProps {
  /** Security events to display */
  events: SecurityEvent[];
  /** Total duration in seconds */
  duration: number;
  /** Motion value for current time */
  timeMotionValue: MotionValue<number>;
  /** Callback when seeking */
  onSeek: (time: number) => void;
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function TimelineMinimap({
  events,
  duration,
  timeMotionValue,
  onSeek,
  className,
}: TimelineMinimapProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Store
  const zoom = useTimelineStore((state) => state.zoom);
  const viewport = useTimelineStore((state) => state.viewport);
  const filteredEvents = useTimelineStore((state) => state.filteredEvents);

  // Viewport indicator size based on zoom
  const viewportWidth = (1 / zoom.level) * 100;
  const viewportPosition = useTransform(timeMotionValue, [0, duration], [0, 100 - viewportWidth]);

  // ─────────────────────────────────────────────────────────────────────────
  // CLICK HANDLER
  // ─────────────────────────────────────────────────────────────────────────

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const position = clamp(x / rect.width, 0, 1);
      const targetTime = position * duration;

      onSeek(targetTime);
    },
    [duration, onSeek]
  );

  // Don't show minimap if not zoomed
  if (zoom.level <= 1) {
    return null;
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'relative w-full h-8 mt-3',
        'bg-blockd-surface/20 rounded-lg overflow-hidden',
        'border border-blockd-surface/30',
        'cursor-pointer',
        className
      )}
      variants={minimapVariants}
      initial="hidden"
      animate="visible"
      onClick={handleClick}
    >
      {/* Event density visualization */}
      <div className="absolute inset-0 flex items-end px-1">
        {filteredEvents.map((event) => {
          const position = timeToNormalized(event.timestamp, duration);
          const color = SEVERITY_COLORS[event.severity];

          return (
            <div
              key={event.id}
              className="absolute bottom-1 w-0.5 rounded-full"
              style={{
                left: `${position * 100}%`,
                height: event.severity === 'critical' ? '60%' : event.severity === 'warning' ? '40%' : '25%',
                backgroundColor: color,
                opacity: 0.7,
              }}
            />
          );
        })}
      </div>

      {/* Viewport indicator */}
      <motion.div
        className="absolute top-0 bottom-0 rounded"
        style={{
          left: useTransform(viewportPosition, (v) => `${v}%`),
          width: `${viewportWidth}%`,
        }}
        variants={minimapViewportVariants}
        initial="initial"
        whileHover="hovered"
      >
        {/* Viewport background */}
        <div className="absolute inset-0 bg-blockd-accent/20 border border-blockd-accent/40 rounded" />

        {/* Current position line */}
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-blockd-accent"
          style={{
            left: useTransform(timeMotionValue, (t) => {
              const normalizedInViewport = (t / duration - viewport.visibleStart / duration) / (1 / zoom.level);
              return `${clamp(normalizedInViewport * 100, 0, 100)}%`;
            }),
          }}
        />
      </motion.div>

      {/* Edge indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-blockd-void/50 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-blockd-void/50 to-transparent pointer-events-none" />
    </motion.div>
  );
}

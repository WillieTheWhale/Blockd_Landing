'use client';

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE SCRUBBER
// Draggable playhead handle
// ═══════════════════════════════════════════════════════════════════════════

import React, { useCallback } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import {
  scrubberEntranceVariants,
  scrubberInteractionVariants,
} from '@/lib/timeline/animation-variants';
import { formatTime } from '@/domain/timeline/calculations';
import { cn } from '@/lib/cn';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineScrubberProps {
  /** Motion value for current time */
  timeMotionValue: MotionValue<number>;
  /** Total duration in seconds */
  duration: number;
  /** Whether currently dragging */
  isDragging: boolean;
  /** Callback when seeking via keyboard */
  onSeek?: (time: number) => void;
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function TimelineScrubber({
  timeMotionValue,
  duration,
  isDragging,
  onSeek,
  className,
}: TimelineScrubberProps) {
  // Calculate position percentage
  const progressPercent = useTransform(timeMotionValue, [0, duration], [0, 100]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!onSeek) return;
      const currentTime = timeMotionValue.get();
      const step = e.shiftKey ? 30 : 5; // 30 seconds with shift, 5 seconds normally

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onSeek(Math.max(0, currentTime - step));
          break;
        case 'ArrowRight':
          e.preventDefault();
          onSeek(Math.min(duration, currentTime + step));
          break;
        case 'Home':
          e.preventDefault();
          onSeek(0);
          break;
        case 'End':
          e.preventDefault();
          onSeek(duration);
          break;
      }
    },
    [timeMotionValue, duration, onSeek]
  );

  // Get current time for aria-valuetext
  const currentTime = timeMotionValue.get();

  return (
    <motion.div
      data-timeline-scrubber
      role="slider"
      aria-label="Timeline scrubber"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blockd-accent focus-visible:ring-offset-2 focus-visible:ring-offset-blockd-void rounded-full',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
      style={{ left: useTransform(progressPercent, (v) => `${v}%`) }}
      variants={scrubberEntranceVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Outer glow ring (visible on drag) */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ scale: 1, opacity: 0 }}
        animate={{
          scale: isDragging ? 2 : 1,
          opacity: isDragging ? 0.3 : 0,
        }}
        transition={{ duration: 0.2 }}
        style={{
          background: 'radial-gradient(circle, rgba(104, 113, 147, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Main scrubber handle */}
      <motion.div
        className={cn(
          'relative w-5 h-5 rounded-full',
          'bg-blockd-light border-2 border-blockd-accent',
          'shadow-lg transition-shadow duration-200'
        )}
        variants={scrubberInteractionVariants}
        initial="idle"
        animate={isDragging ? 'dragging' : 'idle'}
        whileHover="hovered"
        whileTap="dragging"
      >
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-blockd-accent"
            animate={{
              scale: isDragging ? 0.8 : 1,
            }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </motion.div>

      {/* Pulse animation when playing */}
      <motion.div
        className="absolute inset-0 rounded-full bg-blockd-accent"
        initial={{ scale: 1, opacity: 0 }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ pointerEvents: 'none' }}
      />
    </motion.div>
  );
}

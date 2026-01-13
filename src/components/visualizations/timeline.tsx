'use client';

import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { cn } from '@/lib/cn';
import { SecurityEvent } from '@/types';
import { formatTimestamp } from '@/data/security-events';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTimelineDrag } from '@/hooks/use-timeline-drag';
import { markerHighlightVariants } from '@/lib/timeline-animations';
import { SEVERITY_COLORS } from '@/lib/severity-colors';

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE COMPONENT
// Interactive timeline with smooth drag animation and event markers
// ═══════════════════════════════════════════════════════════════════════════

interface TimelineProps {
  events: SecurityEvent[];
  duration: number; // Total session duration in seconds
  onTimeChange?: (time: number) => void;
  onSeekReady?: (seekFn: (time: number) => void) => void;
  highlightedEventId?: string | null;
  className?: string;
}

export function Timeline({
  events,
  duration,
  onTimeChange,
  onSeekReady,
  highlightedEventId,
  className,
}: TimelineProps) {
  const {
    currentTime,
    isDragging,
    trackRef,
    handleMouseDown,
    handleTrackClick,
    seekTo,
  } = useTimelineDrag({ duration, onTimeChange });

  // Expose the seekTo function to parent via callback
  React.useEffect(() => {
    onSeekReady?.(seekTo);
  }, [onSeekReady, seekTo]);

  // Transform currentTime for visual positioning
  const progressPercent = useTransform(currentTime, [0, duration], [0, 100]);

  // Generate time labels (every 5 minutes for a 45-minute interview)
  const timeLabels = [];
  const labelInterval = 300; // 5 minutes in seconds
  for (let t = 0; t <= duration; t += labelInterval) {
    timeLabels.push(t);
  }

  return (
    <TooltipProvider>
      <div className={cn('w-full py-4', className)}>
        {/* Timeline track */}
        <div
          ref={trackRef}
          className={cn(
            'relative h-12',
            isDragging ? 'cursor-grabbing' : 'cursor-pointer'
          )}
          onClick={handleTrackClick}
        >
          {/* Background track */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-blockd-surface" />

          {/* Progress fill - uses motion value for smooth updates */}
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-blockd-accent origin-left"
            style={{ width: useTransform(progressPercent, (v) => `${v}%`) }}
          />

          {/* Event markers */}
          {events.map((event, index) => {
            const position = (event.timestamp / duration) * 100;
            const isHighlighted = event.id === highlightedEventId;
            const color = SEVERITY_COLORS[event.severity];

            return (
              <Tooltip key={event.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer z-[5]"
                    style={{ left: `${position}%` }}
                    initial="initial"
                    animate={isHighlighted ? 'highlighted' : 'initial'}
                    variants={markerHighlightVariants}
                    whileHover={{ scale: 1.3 }}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full border-2 border-blockd-void"
                      style={{
                        backgroundColor: color,
                        boxShadow: isHighlighted
                          ? `0 0 16px ${color}, 0 0 32px ${color}80`
                          : `0 0 8px ${color}60`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium text-blockd-light">{event.title}</p>
                    <p className="text-blockd-muted text-xs">{event.description}</p>
                    <p className="text-blockd-muted/60 text-xs font-mono mt-1">
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Scrubber handle - uses motion value for smooth positioning */}
          <motion.div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10',
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            )}
            style={{ left: useTransform(progressPercent, (v) => `${v}%`) }}
            onMouseDown={handleMouseDown}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-full bg-blockd-light border-2 border-blockd-accent shadow-lg',
                'transition-shadow duration-200',
                isDragging && 'shadow-[0_0_12px_rgba(104,113,147,0.5)]'
              )}
            />
          </motion.div>
        </div>

        {/* Time labels */}
        <div className="relative h-6 mt-2">
          {timeLabels.map((time) => {
            const position = (time / duration) * 100;
            return (
              <span
                key={time}
                className="absolute -translate-x-1/2 text-xs font-mono text-blockd-muted/60"
                style={{ left: `${position}%` }}
              >
                {formatTimestamp(time)}
              </span>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

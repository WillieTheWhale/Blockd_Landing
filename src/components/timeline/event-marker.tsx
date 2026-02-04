'use client';

// ═══════════════════════════════════════════════════════════════════════════
// EVENT MARKER
// Individual event dot on the timeline
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SecurityEvent } from '@/types';
import { SEVERITY_COLORS } from '@/lib/severity-colors';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  markerEntranceVariants,
  markerHighlightVariants,
  markerGlowVariants,
} from '@/lib/timeline/animation-variants';
import { formatTimestamp } from '@/data/security-events';
import { cn } from '@/lib/cn';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface EventMarkerProps {
  /** The security event */
  event: SecurityEvent;
  /** Position as normalized value (0-1) */
  position: number;
  /** Index for stagger animation */
  index: number;
  /** Whether this marker is highlighted */
  isHighlighted: boolean;
  /** Callback when marker is clicked */
  onSeek: (time: number) => void;
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function EventMarker({
  event,
  position,
  index,
  isHighlighted,
  onSeek,
  className,
}: EventMarkerProps) {
  const color = SEVERITY_COLORS[event.severity];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSeek(event.timestamp);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            data-timeline-marker
            data-event-id={event.id}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
              'cursor-pointer z-[5]',
              className
            )}
            style={{ left: `${position * 100}%` }}
            variants={markerEntranceVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={index}
            onClick={handleClick}
            layoutId={`marker-${event.id}`}
          >
            {/* Highlight glow ring */}
            <AnimatePresence>
              {isHighlighted && (
                <motion.div
                  className="absolute inset-0 -m-2 rounded-full"
                  variants={markerGlowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  style={{
                    backgroundColor: color,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Main marker dot */}
            <motion.div
              className="relative w-3 h-3 rounded-full border-2 border-blockd-void"
              style={{
                backgroundColor: color,
                boxShadow: isHighlighted
                  ? `0 0 16px ${color}, 0 0 32px ${color}80`
                  : `0 0 8px ${color}60`,
              }}
              variants={markerHighlightVariants}
              initial="normal"
              animate={isHighlighted ? 'highlighted' : 'normal'}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            />

            {/* Severity pulse for critical events */}
            {event.severity === 'critical' && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          className="max-w-xs"
          sideOffset={8}
        >
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <p className="font-medium text-blockd-light">{event.title}</p>
            </div>
            <p className="text-blockd-muted text-xs">{event.description}</p>
            <p className="text-blockd-muted/60 text-xs font-mono mt-1">
              {formatTimestamp(event.timestamp)}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { SecurityEvent } from '@/types';
import { formatTimestamp } from '@/data/security-events';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface TimelineProps {
  events: SecurityEvent[];
  duration: number; // Total session duration in seconds
  onTimeChange?: (time: number) => void;
  className?: string;
}

const severityColors = {
  info: '#3B82F6',
  warning: '#FBBF24',
  critical: '#EF4444',
};

export function Timeline({ events, duration, onTimeChange, className }: TimelineProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, x / rect.width));
    const newTime = progress * duration;

    setCurrentTime(newTime);
    onTimeChange?.(newTime);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

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
          className="relative h-12 cursor-pointer"
          onClick={handleTrackClick}
        >
          {/* Background track */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-blockd-surface" />

          {/* Progress fill */}
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-blockd-accent"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Event markers */}
          {events.map((event, index) => {
            const position = (event.timestamp / duration) * 100;

            return (
              <Tooltip key={event.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer"
                    style={{ left: `${position}%` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.3 }}
                  >
                    <div
                      className="w-3 h-3 rounded-full border-2 border-blockd-void"
                      style={{
                        backgroundColor: severityColors[event.severity],
                        boxShadow: `0 0 8px ${severityColors[event.severity]}60`,
                      }}
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

          {/* Scrubber handle */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
            style={{ left: `${(currentTime / duration) * 100}%` }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-5 h-5 rounded-full bg-blockd-light border-2 border-blockd-accent shadow-lg cursor-grab active:cursor-grabbing" />
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

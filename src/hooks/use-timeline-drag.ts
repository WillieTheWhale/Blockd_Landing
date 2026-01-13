'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useMotionValue, animate, MotionValue } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE DRAG HOOK
// Encapsulates all timeline drag behavior with continuous cursor tracking
// ═══════════════════════════════════════════════════════════════════════════

interface UseTimelineDragOptions {
  duration: number;
  onTimeChange?: (time: number) => void;
  initialTime?: number;
}

interface UseTimelineDragReturn {
  currentTime: MotionValue<number>;
  isDragging: boolean;
  trackRef: React.RefObject<HTMLDivElement | null>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTrackClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  seekTo: (time: number) => void;
}

export function useTimelineDrag({
  duration,
  onTimeChange,
  initialTime = 0,
}: UseTimelineDragOptions): UseTimelineDragReturn {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  // Use MotionValue for zero-rerender continuous tracking
  const currentTime = useMotionValue(initialTime);

  // Convert mouse position to time value (instant, no animation)
  const updateTimeFromMouse = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;

      // Cancel any running animation when user drags
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }

      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const progress = x / rect.width;
      const newTime = progress * duration;

      currentTime.set(newTime);
      onTimeChange?.(newTime);
    },
    [duration, currentTime, onTimeChange]
  );

  // Handle click on track to jump to position (with animation)
  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const progress = x / rect.width;
      const targetTime = progress * duration;

      // Cancel any existing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // Animate to new position
      animationRef.current = animate(currentTime, targetTime, {
        type: 'spring',
        stiffness: 400,
        damping: 35,
        onUpdate: (latest) => {
          onTimeChange?.(latest);
        },
      });
    },
    [duration, currentTime, onTimeChange]
  );

  // Handle mouse down on scrubber to start dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      updateTimeFromMouse(e.clientX);
    },
    [updateTimeFromMouse]
  );

  // Seek to specific time (animated) - for clicking on events
  const seekTo = useCallback(
    (time: number) => {
      // Cancel any existing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // Animate to new position with spring
      animationRef.current = animate(currentTime, time, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        onUpdate: (latest) => {
          onTimeChange?.(latest);
        },
      });
    },
    [currentTime, onTimeChange]
  );

  // Global listeners for continuous drag tracking
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateTimeFromMouse(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Add listeners to window for tracking outside the component
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateTimeFromMouse]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  return {
    currentTime,
    isDragging,
    trackRef,
    handleMouseDown,
    handleTrackClick,
    seekTo,
  };
}

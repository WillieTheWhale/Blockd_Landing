'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MotionValue } from 'framer-motion';
import { SecurityEvent } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE EVENTS HOOK
// Calculates which events should be highlighted based on timeline position
// ═══════════════════════════════════════════════════════════════════════════

interface UseTimelineEventsOptions {
  currentTime: MotionValue<number>;
  events: SecurityEvent[];
  threshold?: number; // seconds within which an event is considered "hit"
}

interface UseTimelineEventsReturn {
  highlightedEventId: string | null;
  isEventHighlighted: (eventId: string) => boolean;
}

export function useTimelineEvents({
  currentTime,
  events,
  threshold = 5, // Default 5 seconds
}: UseTimelineEventsOptions): UseTimelineEventsReturn {
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

  // Sort events by timestamp for efficient proximity detection
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.timestamp - b.timestamp),
    [events]
  );

  // Subscribe to currentTime changes and find the closest event within threshold
  useEffect(() => {
    const unsubscribe = currentTime.on('change', (time) => {
      let closestEvent: SecurityEvent | null = null;
      let closestDistance = Infinity;

      for (const event of sortedEvents) {
        const distance = Math.abs(event.timestamp - time);

        if (distance <= threshold && distance < closestDistance) {
          closestDistance = distance;
          closestEvent = event;
        }
      }

      // Only update state if the highlighted event changes
      setHighlightedEventId((prev) => {
        const newId = closestEvent?.id ?? null;
        return prev === newId ? prev : newId;
      });
    });

    return unsubscribe;
  }, [currentTime, sortedEvents, threshold]);

  // Helper function to check if a specific event is highlighted
  const isEventHighlighted = useCallback(
    (eventId: string) => highlightedEventId === eventId,
    [highlightedEventId]
  );

  return {
    highlightedEventId,
    isEventHighlighted,
  };
}

'use client';

// ═══════════════════════════════════════════════════════════════════════════
// USE TIMELINE HOOK
// Main hook for timeline functionality - provides complete API
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMotionValue, MotionValue } from 'framer-motion';
import { SecurityEvent, EventSeverity, EventType } from '@/types';
import { TimelineConfig, DEFAULT_TIMELINE_CONFIG } from '@/domain/timeline/types';
import { useTimelineStore } from '@/store/timeline';
import {
  selectFormattedTime,
  selectFormattedDuration,
  selectNormalizedTime,
  selectIsPlaying,
  selectPlaybackSpeed,
  selectZoomLevel,
  selectIsDragging,
  selectFilteredEvents,
  selectHighlightedEvent,
  selectSelectedEvent,
} from '@/store/timeline/selectors';
import { getPhysicsEngine, getPlaybackService } from '@/services/timeline';
import { formatTime } from '@/domain/timeline/calculations';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface UseTimelineOptions {
  /** Security events */
  events: SecurityEvent[];
  /** Duration in seconds */
  duration: number;
  /** Configuration overrides */
  config?: Partial<TimelineConfig>;
  /** Callback when time changes */
  onTimeChange?: (time: number) => void;
  /** Callback when event is highlighted */
  onEventHighlight?: (event: SecurityEvent | null) => void;
}

export interface UseTimelineReturn {
  // Core state
  currentTime: number;
  timeMotionValue: MotionValue<number>;
  duration: number;
  progress: number;
  formattedTime: string;
  formattedDuration: string;

  // Events
  events: SecurityEvent[];
  filteredEvents: SecurityEvent[];
  highlightedEvent: SecurityEvent | null;
  selectedEvent: SecurityEvent | null;

  // Playback
  isPlaying: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  setSpeed: (speed: number) => void;

  // Seeking
  seek: (time: number) => void;
  seekToEvent: (eventId: string) => void;
  seekToStart: () => void;
  seekToEnd: () => void;

  // Zoom
  zoomLevel: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Filters
  activeSeverities: Set<EventSeverity>;
  activeTypes: Set<EventType>;
  toggleSeverity: (severity: EventSeverity) => void;
  toggleType: (type: EventType) => void;
  clearFilters: () => void;

  // Selection
  selectEvent: (eventId: string | null) => void;
  hoverEvent: (eventId: string | null) => void;

  // State flags
  isDragging: boolean;
  isZoomed: boolean;
  hasFilters: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useTimeline({
  events,
  duration,
  config,
  onTimeChange,
  onEventHighlight,
}: UseTimelineOptions): UseTimelineReturn {
  // Motion value for smooth updates
  const timeMotionValue = useMotionValue(0);

  // Refs for services
  const physicsEngineRef = useRef(getPhysicsEngine(config));
  const playbackServiceRef = useRef(getPlaybackService(config));

  // Full config
  const fullConfig = useMemo(
    () => ({ ...DEFAULT_TIMELINE_CONFIG, duration, ...config }),
    [duration, config]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // STORE SELECTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const currentTime = useTimelineStore((state) => state.currentTime);
  const formattedTime = useTimelineStore(selectFormattedTime);
  const formattedDuration = useTimelineStore(selectFormattedDuration);
  const progress = useTimelineStore(selectNormalizedTime);
  const isPlaying = useTimelineStore(selectIsPlaying);
  const speed = useTimelineStore(selectPlaybackSpeed);
  const zoomLevel = useTimelineStore(selectZoomLevel);
  const isDragging = useTimelineStore(selectIsDragging);
  const filteredEvents = useTimelineStore(selectFilteredEvents);
  const highlightedEvent = useTimelineStore(selectHighlightedEvent);
  const selectedEvent = useTimelineStore(selectSelectedEvent);
  const filters = useTimelineStore((state) => state.filters);

  // ─────────────────────────────────────────────────────────────────────────
  // STORE ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const initialize = useTimelineStore((state) => state.initialize);
  const storePlay = useTimelineStore((state) => state.play);
  const storePause = useTimelineStore((state) => state.pause);
  const storeTogglePlayback = useTimelineStore((state) => state.togglePlayback);
  const storeSetSpeed = useTimelineStore((state) => state.setSpeed);
  const storeSeek = useTimelineStore((state) => state.seek);
  const storeSeekToEvent = useTimelineStore((state) => state.seekToEvent);
  const storeSeekToStart = useTimelineStore((state) => state.seekToStart);
  const storeSeekToEnd = useTimelineStore((state) => state.seekToEnd);
  const storeZoomIn = useTimelineStore((state) => state.zoomIn);
  const storeZoomOut = useTimelineStore((state) => state.zoomOut);
  const storeResetZoom = useTimelineStore((state) => state.resetZoom);
  const storeToggleSeverity = useTimelineStore((state) => state.toggleSeverity);
  const storeToggleType = useTimelineStore((state) => state.toggleType);
  const storeClearFilters = useTimelineStore((state) => state.clearFilters);
  const storeSelectEvent = useTimelineStore((state) => state.selectEvent);
  const storeHoverEvent = useTimelineStore((state) => state.hoverEvent);

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    initialize(events, fullConfig);
  }, [events, fullConfig, initialize]);

  // ─────────────────────────────────────────────────────────────────────────
  // SYNC MOTION VALUE
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    timeMotionValue.set(currentTime);
  }, [currentTime, timeMotionValue]);

  // Subscribe to motion value changes
  useEffect(() => {
    const unsubscribe = timeMotionValue.on('change', (value) => {
      onTimeChange?.(value);
    });
    return unsubscribe;
  }, [timeMotionValue, onTimeChange]);

  // ─────────────────────────────────────────────────────────────────────────
  // HIGHLIGHT CALLBACK
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    onEventHighlight?.(highlightedEvent);
  }, [highlightedEvent, onEventHighlight]);

  // ─────────────────────────────────────────────────────────────────────────
  // WRAPPED ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    storePlay();
    playbackServiceRef.current.play();
  }, [storePlay]);

  const pause = useCallback(() => {
    storePause();
    playbackServiceRef.current.pause();
  }, [storePause]);

  const togglePlayback = useCallback(() => {
    storeTogglePlayback();
    playbackServiceRef.current.toggle();
  }, [storeTogglePlayback]);

  const setSpeed = useCallback(
    (newSpeed: number) => {
      storeSetSpeed(newSpeed);
      playbackServiceRef.current.setSpeed(newSpeed);
    },
    [storeSetSpeed]
  );

  const seek = useCallback(
    (time: number) => {
      physicsEngineRef.current.seekWithSpring(timeMotionValue, time, (t) => {
        storeSeek(t);
      });
    },
    [timeMotionValue, storeSeek]
  );

  const seekToEvent = useCallback(
    (eventId: string) => {
      const event = events.find((e) => e.id === eventId);
      if (event) {
        physicsEngineRef.current.seekToEventWithSpring(
          timeMotionValue,
          event.timestamp,
          (t) => storeSeek(t)
        );
        storeSelectEvent(eventId);
      }
    },
    [events, timeMotionValue, storeSeek, storeSelectEvent]
  );

  const seekToStart = useCallback(() => {
    seek(0);
  }, [seek]);

  const seekToEnd = useCallback(() => {
    seek(duration);
  }, [seek, duration]);

  // ─────────────────────────────────────────────────────────────────────────
  // DERIVED STATE
  // ─────────────────────────────────────────────────────────────────────────

  const isZoomed = zoomLevel > 1;
  const hasFilters = filters.severities.size < 3 || filters.types.size < 5;

  // ─────────────────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const physics = physicsEngineRef.current;
    const playback = playbackServiceRef.current;

    return () => {
      physics.destroy();
      playback.destroy();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────────

  return {
    // Core state
    currentTime,
    timeMotionValue,
    duration,
    progress,
    formattedTime,
    formattedDuration,

    // Events
    events,
    filteredEvents,
    highlightedEvent,
    selectedEvent,

    // Playback
    isPlaying,
    speed,
    play,
    pause,
    togglePlayback,
    setSpeed,

    // Seeking
    seek,
    seekToEvent,
    seekToStart,
    seekToEnd,

    // Zoom
    zoomLevel,
    zoomIn: storeZoomIn,
    zoomOut: storeZoomOut,
    resetZoom: storeResetZoom,

    // Filters
    activeSeverities: filters.severities,
    activeTypes: filters.types,
    toggleSeverity: storeToggleSeverity,
    toggleType: storeToggleType,
    clearFilters: storeClearFilters,

    // Selection
    selectEvent: storeSelectEvent,
    hoverEvent: storeHoverEvent,

    // State flags
    isDragging,
    isZoomed,
    hasFilters,
  };
}

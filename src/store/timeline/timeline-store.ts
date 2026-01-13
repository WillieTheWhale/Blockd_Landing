// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE STORE
// Centralized state management with Zustand
// ═══════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SecurityEvent, EventSeverity, EventType } from '@/types';
import {
  TimelineConfig,
  PlaybackState,
  ZoomState,
  FilterState,
  PhysicsState,
  SelectionState,
  AnimationState,
  ViewportState,
  DEFAULT_TIMELINE_CONFIG,
  DEFAULT_PLAYBACK_STATE,
  DEFAULT_ZOOM_STATE,
  DEFAULT_FILTER_STATE,
  DEFAULT_PHYSICS_STATE,
  DEFAULT_SELECTION_STATE,
  DEFAULT_ANIMATION_STATE,
} from '@/domain/timeline/types';
import {
  clamp,
  calculateVisibleRange,
  calculateZoomFocalPoint,
} from '@/domain/timeline/calculations';
import {
  toggleSeverityFilter,
  toggleTypeFilter,
  findClosestEventWithinThreshold,
  applyFilters,
  sortByTime,
} from '@/domain/timeline/filters';

// ─────────────────────────────────────────────────────────────────────────────
// STORE STATE INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

interface TimelineStoreState {
  // Core state
  currentTime: number;
  config: TimelineConfig;
  events: SecurityEvent[];

  // Derived/cached state
  sortedEvents: SecurityEvent[];
  filteredEvents: SecurityEvent[];

  // Sub-states
  playback: PlaybackState;
  zoom: ZoomState;
  filters: FilterState;
  physics: PhysicsState;
  selection: SelectionState;
  animation: AnimationState;
  viewport: ViewportState;
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE ACTIONS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

interface TimelineStoreActions {
  // Initialization
  initialize: (events: SecurityEvent[], config?: Partial<TimelineConfig>) => void;
  setViewport: (width: number, height: number) => void;

  // Playback
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  setSpeed: (speed: number) => void;
  setLoop: (loop: boolean) => void;

  // Seeking
  seek: (time: number) => void;
  seekRelative: (delta: number) => void;
  seekToEvent: (eventId: string) => void;
  seekToStart: () => void;
  seekToEnd: () => void;
  advanceTime: (delta: number) => void;

  // Zoom
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (level: number, focalPoint?: number) => void;
  resetZoom: () => void;

  // Filters
  toggleSeverity: (severity: EventSeverity) => void;
  toggleType: (type: EventType) => void;
  clearFilters: () => void;
  setFilters: (filters: Partial<FilterState>) => void;

  // Selection
  selectEvent: (eventId: string | null) => void;
  hoverEvent: (eventId: string | null) => void;
  expandEvent: (eventId: string | null) => void;
  updateHighlightedEvent: () => void;

  // Physics
  startDrag: (pointerX: number) => void;
  updateDrag: (pointerX: number, containerWidth: number) => void;
  endDrag: (velocity: number) => void;
  setMomentum: (hasMomentum: boolean) => void;
  setVelocity: (velocity: number) => void;

  // Animation
  startReveal: () => void;
  setRevealPhase: (phase: AnimationState['revealPhase']) => void;
  completeReveal: () => void;
  startMorph: (eventId: string) => void;
  completeMorph: () => void;

  // Utilities
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED STORE TYPE
// ─────────────────────────────────────────────────────────────────────────────

type TimelineStore = TimelineStoreState & TimelineStoreActions;

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const initialState: TimelineStoreState = {
  currentTime: 0,
  config: DEFAULT_TIMELINE_CONFIG,
  events: [],
  sortedEvents: [],
  filteredEvents: [],
  playback: DEFAULT_PLAYBACK_STATE,
  zoom: DEFAULT_ZOOM_STATE,
  filters: DEFAULT_FILTER_STATE,
  physics: DEFAULT_PHYSICS_STATE,
  selection: DEFAULT_SELECTION_STATE,
  animation: DEFAULT_ANIMATION_STATE,
  viewport: {
    visibleStart: 0,
    visibleEnd: DEFAULT_TIMELINE_CONFIG.duration,
    containerWidth: 0,
    containerHeight: 0,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STORE CREATION
// ─────────────────────────────────────────────────────────────────────────────

export const useTimelineStore = create<TimelineStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ─────────────────────────────────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────

    initialize: (events, config) => {
      const fullConfig = { ...DEFAULT_TIMELINE_CONFIG, ...config };
      const sortedEvents = sortByTime(events);
      const filteredEvents = applyFilters(sortedEvents, DEFAULT_FILTER_STATE);
      const { visibleStart, visibleEnd } = calculateVisibleRange(
        fullConfig.duration,
        DEFAULT_ZOOM_STATE
      );

      set({
        events,
        sortedEvents,
        filteredEvents,
        config: fullConfig,
        currentTime: 0,
        viewport: {
          ...get().viewport,
          visibleStart,
          visibleEnd,
        },
      });
    },

    setViewport: (width, height) => {
      const { config, zoom } = get();
      const { visibleStart, visibleEnd } = calculateVisibleRange(
        config.duration,
        zoom
      );

      set({
        viewport: {
          containerWidth: width,
          containerHeight: height,
          visibleStart,
          visibleEnd,
        },
      });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PLAYBACK
    // ─────────────────────────────────────────────────────────────────────────

    play: () => {
      set((state) => ({
        playback: { ...state.playback, isPlaying: true },
      }));
    },

    pause: () => {
      set((state) => ({
        playback: { ...state.playback, isPlaying: false },
      }));
    },

    togglePlayback: () => {
      set((state) => ({
        playback: { ...state.playback, isPlaying: !state.playback.isPlaying },
      }));
    },

    setSpeed: (speed) => {
      set((state) => ({
        playback: { ...state.playback, speed },
      }));
    },

    setLoop: (loop) => {
      set((state) => ({
        playback: { ...state.playback, loop },
      }));
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SEEKING
    // ─────────────────────────────────────────────────────────────────────────

    seek: (time) => {
      const { config } = get();
      const clampedTime = clamp(time, 0, config.duration);
      set({ currentTime: clampedTime });
      get().updateHighlightedEvent();
    },

    seekRelative: (delta) => {
      const { currentTime, config } = get();
      const newTime = clamp(currentTime + delta, 0, config.duration);
      set({ currentTime: newTime });
      get().updateHighlightedEvent();
    },

    seekToEvent: (eventId) => {
      const { sortedEvents } = get();
      const event = sortedEvents.find((e) => e.id === eventId);
      if (event) {
        get().seek(event.timestamp);
        get().selectEvent(eventId);
      }
    },

    seekToStart: () => {
      set({ currentTime: 0 });
      get().updateHighlightedEvent();
    },

    seekToEnd: () => {
      const { config } = get();
      set({ currentTime: config.duration });
      get().updateHighlightedEvent();
    },

    advanceTime: (delta) => {
      const { currentTime, config, playback } = get();
      const newTime = currentTime + delta * playback.speed;

      if (newTime >= config.duration) {
        if (playback.loop) {
          set({ currentTime: 0 });
        } else {
          set({
            currentTime: config.duration,
            playback: { ...playback, isPlaying: false },
          });
        }
      } else {
        set({ currentTime: newTime });
      }
      get().updateHighlightedEvent();
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ZOOM
    // ─────────────────────────────────────────────────────────────────────────

    zoomIn: () => {
      const { zoom, config } = get();
      const newLevel = Math.min(zoom.level * config.zoomStep, config.maxZoom);
      const newFocalPoint = calculateZoomFocalPoint(
        zoom.focalPoint,
        0.5,
        zoom.level,
        newLevel
      );
      const { visibleStart, visibleEnd } = calculateVisibleRange(
        config.duration,
        { ...zoom, level: newLevel, focalPoint: newFocalPoint }
      );

      set({
        zoom: { ...zoom, level: newLevel, focalPoint: newFocalPoint },
        viewport: {
          ...get().viewport,
          visibleStart,
          visibleEnd,
        },
      });
    },

    zoomOut: () => {
      const { zoom, config } = get();
      const newLevel = Math.max(zoom.level / config.zoomStep, config.minZoom);
      const newFocalPoint = calculateZoomFocalPoint(
        zoom.focalPoint,
        0.5,
        zoom.level,
        newLevel
      );
      const { visibleStart, visibleEnd } = calculateVisibleRange(
        config.duration,
        { ...zoom, level: newLevel, focalPoint: newFocalPoint }
      );

      set({
        zoom: { ...zoom, level: newLevel, focalPoint: newFocalPoint },
        viewport: {
          ...get().viewport,
          visibleStart,
          visibleEnd,
        },
      });
    },

    zoomTo: (level, focalPoint) => {
      const { zoom, config } = get();
      const clampedLevel = clamp(level, config.minZoom, config.maxZoom);
      const newFocalPoint =
        focalPoint !== undefined
          ? clamp(focalPoint, 0, 1)
          : calculateZoomFocalPoint(zoom.focalPoint, 0.5, zoom.level, clampedLevel);
      const { visibleStart, visibleEnd } = calculateVisibleRange(
        config.duration,
        { ...zoom, level: clampedLevel, focalPoint: newFocalPoint }
      );

      set({
        zoom: { ...zoom, level: clampedLevel, focalPoint: newFocalPoint },
        viewport: {
          ...get().viewport,
          visibleStart,
          visibleEnd,
        },
      });
    },

    resetZoom: () => {
      const { config } = get();
      const { visibleStart, visibleEnd } = calculateVisibleRange(
        config.duration,
        DEFAULT_ZOOM_STATE
      );

      set({
        zoom: DEFAULT_ZOOM_STATE,
        viewport: {
          ...get().viewport,
          visibleStart,
          visibleEnd,
        },
      });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // FILTERS
    // ─────────────────────────────────────────────────────────────────────────

    toggleSeverity: (severity) => {
      const { filters, sortedEvents } = get();
      const newSeverities = toggleSeverityFilter(filters.severities, severity);
      const newFilters = { ...filters, severities: newSeverities };
      const filteredEvents = applyFilters(sortedEvents, newFilters);

      set({ filters: newFilters, filteredEvents });
    },

    toggleType: (type) => {
      const { filters, sortedEvents } = get();
      const newTypes = toggleTypeFilter(filters.types, type);
      const newFilters = { ...filters, types: newTypes };
      const filteredEvents = applyFilters(sortedEvents, newFilters);

      set({ filters: newFilters, filteredEvents });
    },

    clearFilters: () => {
      const { sortedEvents } = get();
      const filteredEvents = applyFilters(sortedEvents, DEFAULT_FILTER_STATE);

      set({ filters: DEFAULT_FILTER_STATE, filteredEvents });
    },

    setFilters: (partial) => {
      const { filters, sortedEvents } = get();
      const newFilters = { ...filters, ...partial };
      const filteredEvents = applyFilters(sortedEvents, newFilters);

      set({ filters: newFilters, filteredEvents });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SELECTION
    // ─────────────────────────────────────────────────────────────────────────

    selectEvent: (eventId) => {
      set((state) => ({
        selection: { ...state.selection, selectedEventId: eventId },
      }));
    },

    hoverEvent: (eventId) => {
      set((state) => ({
        selection: { ...state.selection, hoveredEventId: eventId },
      }));
    },

    expandEvent: (eventId) => {
      set((state) => ({
        selection: { ...state.selection, expandedEventId: eventId },
      }));
    },

    updateHighlightedEvent: () => {
      const { currentTime, filteredEvents, config } = get();
      const closest = findClosestEventWithinThreshold(
        filteredEvents,
        currentTime,
        config.highlightThreshold
      );

      set((state) => ({
        selection: {
          ...state.selection,
          highlightedEventId: closest?.id ?? null,
        },
      }));
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PHYSICS
    // ─────────────────────────────────────────────────────────────────────────

    startDrag: (pointerX) => {
      set({
        physics: {
          velocity: 0,
          hasMomentum: false,
          isDragging: true,
          lastPointerX: pointerX,
          lastTimestamp: performance.now(),
        },
        playback: { ...get().playback, isPlaying: false },
      });
    },

    updateDrag: (pointerX, containerWidth) => {
      const { physics, config, currentTime } = get();
      const now = performance.now();
      const deltaTime = now - physics.lastTimestamp;
      const deltaX = pointerX - physics.lastPointerX;

      // Calculate velocity in time units
      const pixelVelocity = deltaTime > 0 ? (deltaX / deltaTime) * 1000 : 0;
      const timeVelocity = (pixelVelocity / containerWidth) * config.duration;

      // Calculate new time
      const normalizedDelta = deltaX / containerWidth;
      const timeDelta = normalizedDelta * config.duration;
      const newTime = clamp(currentTime + timeDelta, 0, config.duration);

      set({
        currentTime: newTime,
        physics: {
          ...physics,
          velocity: timeVelocity * 0.3 + physics.velocity * 0.7, // Smooth
          lastPointerX: pointerX,
          lastTimestamp: now,
        },
      });
      get().updateHighlightedEvent();
    },

    endDrag: (velocity) => {
      set((state) => ({
        physics: {
          ...state.physics,
          isDragging: false,
          hasMomentum: Math.abs(velocity) > state.config.velocityThreshold,
          velocity,
        },
      }));
    },

    setMomentum: (hasMomentum) => {
      set((state) => ({
        physics: { ...state.physics, hasMomentum },
      }));
    },

    setVelocity: (velocity) => {
      set((state) => ({
        physics: { ...state.physics, velocity },
      }));
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ANIMATION
    // ─────────────────────────────────────────────────────────────────────────

    startReveal: () => {
      set({
        animation: {
          ...get().animation,
          revealPhase: 'track-reveal',
          isRevealed: false,
        },
      });
    },

    setRevealPhase: (phase) => {
      set((state) => ({
        animation: { ...state.animation, revealPhase: phase },
      }));
    },

    completeReveal: () => {
      set((state) => ({
        animation: {
          ...state.animation,
          revealPhase: 'complete',
          isRevealed: true,
        },
      }));
    },

    startMorph: (eventId) => {
      set((state) => ({
        animation: { ...state.animation, morphingEventId: eventId },
      }));
    },

    completeMorph: () => {
      set((state) => ({
        animation: { ...state.animation, morphingEventId: null },
      }));
    },

    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────

    reset: () => {
      set(initialState);
    },
  }))
);

// ─────────────────────────────────────────────────────────────────────────────
// CONVENIENCE EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export type { TimelineStoreState, TimelineStoreActions, TimelineStore };

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE SELECTORS
// Derived state selectors for the timeline store
// ═══════════════════════════════════════════════════════════════════════════

import { TimelineStoreState } from './timeline-store';
import { SecurityEvent } from '@/types';
import {
  timeToNormalized,
  timeToPercent,
  formatTime,
  formatTimePrecise,
  calculateMarkerPosition,
} from '@/domain/timeline/calculations';
import { getFilterStats, hasActiveFilters } from '@/domain/timeline/filters';

// ─────────────────────────────────────────────────────────────────────────────
// TIME SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current time as normalized value (0-1)
 */
export const selectNormalizedTime = (state: TimelineStoreState): number =>
  timeToNormalized(state.currentTime, state.config.duration);

/**
 * Get current time as percentage (0-100)
 */
export const selectTimePercent = (state: TimelineStoreState): number =>
  timeToPercent(state.currentTime, state.config.duration);

/**
 * Get formatted current time (MM:SS)
 */
export const selectFormattedTime = (state: TimelineStoreState): string =>
  formatTime(state.currentTime);

/**
 * Get precisely formatted current time (HH:MM:SS.mmm)
 */
export const selectFormattedTimePrecise = (state: TimelineStoreState): string =>
  formatTimePrecise(state.currentTime);

/**
 * Get formatted total duration (MM:SS)
 */
export const selectFormattedDuration = (state: TimelineStoreState): string =>
  formatTime(state.config.duration);

/**
 * Check if timeline is at start
 */
export const selectIsAtStart = (state: TimelineStoreState): boolean =>
  state.currentTime <= 0;

/**
 * Check if timeline is at end
 */
export const selectIsAtEnd = (state: TimelineStoreState): boolean =>
  state.currentTime >= state.config.duration;

// ─────────────────────────────────────────────────────────────────────────────
// EVENT SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all sorted events
 */
export const selectSortedEvents = (state: TimelineStoreState): SecurityEvent[] =>
  state.sortedEvents;

/**
 * Get filtered events
 */
export const selectFilteredEvents = (state: TimelineStoreState): SecurityEvent[] =>
  state.filteredEvents;

/**
 * Get visible events (within current viewport)
 */
export const selectVisibleEvents = (state: TimelineStoreState): SecurityEvent[] =>
  state.filteredEvents.filter(
    (event) =>
      event.timestamp >= state.viewport.visibleStart &&
      event.timestamp <= state.viewport.visibleEnd
  );

/**
 * Get the currently selected event
 */
export const selectSelectedEvent = (
  state: TimelineStoreState
): SecurityEvent | null =>
  state.selection.selectedEventId
    ? state.sortedEvents.find((e) => e.id === state.selection.selectedEventId) ??
      null
    : null;

/**
 * Get the currently highlighted event
 */
export const selectHighlightedEvent = (
  state: TimelineStoreState
): SecurityEvent | null =>
  state.selection.highlightedEventId
    ? state.sortedEvents.find(
        (e) => e.id === state.selection.highlightedEventId
      ) ?? null
    : null;

/**
 * Get the currently hovered event
 */
export const selectHoveredEvent = (
  state: TimelineStoreState
): SecurityEvent | null =>
  state.selection.hoveredEventId
    ? state.sortedEvents.find((e) => e.id === state.selection.hoveredEventId) ??
      null
    : null;

/**
 * Get the currently expanded event
 */
export const selectExpandedEvent = (
  state: TimelineStoreState
): SecurityEvent | null =>
  state.selection.expandedEventId
    ? state.sortedEvents.find((e) => e.id === state.selection.expandedEventId) ??
      null
    : null;

/**
 * Get event by ID
 */
export const selectEventById =
  (eventId: string) =>
  (state: TimelineStoreState): SecurityEvent | null =>
    state.sortedEvents.find((e) => e.id === eventId) ?? null;

// ─────────────────────────────────────────────────────────────────────────────
// MARKER POSITION SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get marker positions for all visible events
 */
export const selectMarkerPositions = (
  state: TimelineStoreState
): Array<{ event: SecurityEvent; x: number; visible: boolean }> =>
  state.filteredEvents.map((event) => ({
    event,
    ...calculateMarkerPosition(event.timestamp, state.viewport),
  }));

/**
 * Get scrubber position in pixels
 */
export const selectScrubberPosition = (state: TimelineStoreState): number => {
  const normalizedTime = selectNormalizedTime(state);
  return normalizedTime * state.viewport.containerWidth;
};

// ─────────────────────────────────────────────────────────────────────────────
// FILTER SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get filter statistics
 */
export const selectFilterStats = (state: TimelineStoreState) =>
  getFilterStats(state.sortedEvents, state.filteredEvents);

/**
 * Check if any filters are active
 */
export const selectHasActiveFilters = (state: TimelineStoreState): boolean =>
  hasActiveFilters(state.filters);

/**
 * Get active severity filters
 */
export const selectActiveSeverities = (state: TimelineStoreState) =>
  state.filters.severities;

/**
 * Get active type filters
 */
export const selectActiveTypes = (state: TimelineStoreState) =>
  state.filters.types;

// ─────────────────────────────────────────────────────────────────────────────
// PLAYBACK SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if playing
 */
export const selectIsPlaying = (state: TimelineStoreState): boolean =>
  state.playback.isPlaying;

/**
 * Get current playback speed
 */
export const selectPlaybackSpeed = (state: TimelineStoreState): number =>
  state.playback.speed;

/**
 * Check if looping
 */
export const selectIsLooping = (state: TimelineStoreState): boolean =>
  state.playback.loop;

/**
 * Get playback progress (0-1)
 */
export const selectPlaybackProgress = (state: TimelineStoreState): number =>
  selectNormalizedTime(state);

// ─────────────────────────────────────────────────────────────────────────────
// ZOOM SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current zoom level
 */
export const selectZoomLevel = (state: TimelineStoreState): number =>
  state.zoom.level;

/**
 * Check if zoomed in
 */
export const selectIsZoomedIn = (state: TimelineStoreState): boolean =>
  state.zoom.level > 1;

/**
 * Check if at max zoom
 */
export const selectIsMaxZoom = (state: TimelineStoreState): boolean =>
  state.zoom.level >= state.config.maxZoom;

/**
 * Check if at min zoom
 */
export const selectIsMinZoom = (state: TimelineStoreState): boolean =>
  state.zoom.level <= state.config.minZoom;

/**
 * Get zoom percentage for display
 */
export const selectZoomPercentage = (state: TimelineStoreState): number =>
  Math.round(state.zoom.level * 100);

// ─────────────────────────────────────────────────────────────────────────────
// PHYSICS SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if currently dragging
 */
export const selectIsDragging = (state: TimelineStoreState): boolean =>
  state.physics.isDragging;

/**
 * Check if momentum is active
 */
export const selectHasMomentum = (state: TimelineStoreState): boolean =>
  state.physics.hasMomentum;

/**
 * Check if any interaction is happening
 */
export const selectIsInteracting = (state: TimelineStoreState): boolean =>
  state.physics.isDragging || state.physics.hasMomentum;

/**
 * Get current velocity
 */
export const selectVelocity = (state: TimelineStoreState): number =>
  state.physics.velocity;

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current reveal phase
 */
export const selectRevealPhase = (state: TimelineStoreState) =>
  state.animation.revealPhase;

/**
 * Check if reveal is complete
 */
export const selectIsRevealed = (state: TimelineStoreState): boolean =>
  state.animation.isRevealed;

/**
 * Get morphing event ID
 */
export const selectMorphingEventId = (state: TimelineStoreState): string | null =>
  state.animation.morphingEventId;

/**
 * Check if currently morphing
 */
export const selectIsMorphing = (state: TimelineStoreState): boolean =>
  state.animation.morphingEventId !== null;

// ─────────────────────────────────────────────────────────────────────────────
// VIEWPORT SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get visible time range
 */
export const selectVisibleRange = (state: TimelineStoreState) => ({
  start: state.viewport.visibleStart,
  end: state.viewport.visibleEnd,
});

/**
 * Get container dimensions
 */
export const selectContainerDimensions = (state: TimelineStoreState) => ({
  width: state.viewport.containerWidth,
  height: state.viewport.containerHeight,
});

/**
 * Get visible duration
 */
export const selectVisibleDuration = (state: TimelineStoreState): number =>
  state.viewport.visibleEnd - state.viewport.visibleStart;

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get timeline status for display
 */
export const selectTimelineStatus = (state: TimelineStoreState) => ({
  currentTime: state.currentTime,
  duration: state.config.duration,
  formattedTime: selectFormattedTime(state),
  formattedDuration: selectFormattedDuration(state),
  progress: selectNormalizedTime(state),
  isPlaying: state.playback.isPlaying,
  speed: state.playback.speed,
  zoom: state.zoom.level,
  eventCount: state.filteredEvents.length,
  highlightedEventId: state.selection.highlightedEventId,
});

/**
 * Get all selection states
 */
export const selectAllSelections = (state: TimelineStoreState) => ({
  selected: selectSelectedEvent(state),
  highlighted: selectHighlightedEvent(state),
  hovered: selectHoveredEvent(state),
  expanded: selectExpandedEvent(state),
});

/**
 * Check if event is in active state (selected, highlighted, or hovered)
 */
export const selectIsEventActive =
  (eventId: string) =>
  (state: TimelineStoreState): boolean =>
    state.selection.selectedEventId === eventId ||
    state.selection.highlightedEventId === eventId ||
    state.selection.hoveredEventId === eventId;

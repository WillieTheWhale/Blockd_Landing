// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE FILTERS
// Pure filter functions for event filtering and searching
// ═══════════════════════════════════════════════════════════════════════════

import { SecurityEvent, EventSeverity, EventType } from '@/types';
import { FilterState } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BY SEVERITY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter events by severity level
 * @param events - Array of security events
 * @param severities - Set of severity levels to include
 * @returns Filtered events
 */
export function filterBySeverity(
  events: SecurityEvent[],
  severities: Set<EventSeverity>
): SecurityEvent[] {
  if (severities.size === 0) return events; // Empty set means show all
  return events.filter((event) => severities.has(event.severity));
}

/**
 * Filter events to only show critical
 * @param events - Array of security events
 * @returns Critical events only
 */
export function filterCriticalOnly(events: SecurityEvent[]): SecurityEvent[] {
  return events.filter((event) => event.severity === 'critical');
}

/**
 * Filter events to show warnings and critical
 * @param events - Array of security events
 * @returns Warning and critical events
 */
export function filterImportant(events: SecurityEvent[]): SecurityEvent[] {
  return events.filter(
    (event) => event.severity === 'warning' || event.severity === 'critical'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BY TYPE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter events by event type
 * @param events - Array of security events
 * @param types - Set of event types to include
 * @returns Filtered events
 */
export function filterByType(
  events: SecurityEvent[],
  types: Set<EventType>
): SecurityEvent[] {
  if (types.size === 0) return events; // Empty set means show all
  return events.filter((event) => types.has(event.type));
}

/**
 * Filter events by single type
 * @param events - Array of security events
 * @param type - Event type to filter
 * @returns Filtered events
 */
export function filterBySingleType(
  events: SecurityEvent[],
  type: EventType
): SecurityEvent[] {
  return events.filter((event) => event.type === type);
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BY TIME RANGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter events within a time range
 * @param events - Array of security events
 * @param startTime - Start of time range (inclusive)
 * @param endTime - End of time range (inclusive)
 * @returns Events within the time range
 */
export function filterByTimeRange(
  events: SecurityEvent[],
  startTime: number,
  endTime: number
): SecurityEvent[] {
  return events.filter(
    (event) => event.timestamp >= startTime && event.timestamp <= endTime
  );
}

/**
 * Filter events before a given time
 * @param events - Array of security events
 * @param time - Time threshold (inclusive)
 * @returns Events at or before the time
 */
export function filterBefore(
  events: SecurityEvent[],
  time: number
): SecurityEvent[] {
  return events.filter((event) => event.timestamp <= time);
}

/**
 * Filter events after a given time
 * @param events - Array of security events
 * @param time - Time threshold (exclusive)
 * @returns Events after the time
 */
export function filterAfter(
  events: SecurityEvent[],
  time: number
): SecurityEvent[] {
  return events.filter((event) => event.timestamp > time);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED FILTERING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply all filters from FilterState
 * @param events - Array of security events
 * @param filters - Filter state object
 * @returns Filtered events
 */
export function applyFilters(
  events: SecurityEvent[],
  filters: FilterState
): SecurityEvent[] {
  let result = events;

  // Apply severity filter
  if (filters.severities.size > 0) {
    result = filterBySeverity(result, filters.severities);
  }

  // Apply type filter
  if (filters.types.size > 0) {
    result = filterByType(result, filters.types);
  }

  return result;
}

/**
 * Apply filters and time range
 * @param events - Array of security events
 * @param filters - Filter state object
 * @param startTime - Start of time range
 * @param endTime - End of time range
 * @returns Filtered events within time range
 */
export function applyFiltersWithTimeRange(
  events: SecurityEvent[],
  filters: FilterState,
  startTime: number,
  endTime: number
): SecurityEvent[] {
  const filtered = applyFilters(events, filters);
  return filterByTimeRange(filtered, startTime, endTime);
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH / TEXT FILTERING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search events by text query (searches title and description)
 * @param events - Array of security events
 * @param query - Search query string
 * @returns Matching events
 */
export function searchEvents(
  events: SecurityEvent[],
  query: string
): SecurityEvent[] {
  if (!query.trim()) return events;

  const lowerQuery = query.toLowerCase().trim();
  return events.filter(
    (event) =>
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Search events with fuzzy matching
 * @param events - Array of security events
 * @param query - Search query string
 * @returns Matching events with relevance scores
 */
export function searchEventsFuzzy(
  events: SecurityEvent[],
  query: string
): Array<{ event: SecurityEvent; score: number }> {
  if (!query.trim()) {
    return events.map((event) => ({ event, score: 1 }));
  }

  const lowerQuery = query.toLowerCase().trim();

  return events
    .map((event) => {
      const titleScore = calculateMatchScore(event.title.toLowerCase(), lowerQuery);
      const descScore = calculateMatchScore(event.description.toLowerCase(), lowerQuery);
      const score = Math.max(titleScore * 1.5, descScore); // Title matches are weighted higher
      return { event, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate simple match score for fuzzy search
 * @param text - Text to search in
 * @param query - Query to match
 * @returns Match score (0-1)
 */
function calculateMatchScore(text: string, query: string): number {
  if (text.includes(query)) {
    // Exact match gets highest score
    return 1;
  }

  // Check for partial word matches
  const words = query.split(/\s+/);
  let matchedWords = 0;
  for (const word of words) {
    if (text.includes(word)) {
      matchedWords++;
    }
  }

  return words.length > 0 ? matchedWords / words.length : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER COUNTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Count events by severity
 * @param events - Array of security events
 * @returns Object with counts per severity
 */
export function countBySeverity(
  events: SecurityEvent[]
): Record<EventSeverity, number> {
  const counts: Record<EventSeverity, number> = {
    info: 0,
    warning: 0,
    critical: 0,
  };

  for (const event of events) {
    counts[event.severity]++;
  }

  return counts;
}

/**
 * Count events by type
 * @param events - Array of security events
 * @returns Object with counts per type
 */
export function countByType(events: SecurityEvent[]): Record<EventType, number> {
  const counts: Record<EventType, number> = {
    window_focus: 0,
    clipboard: 0,
    process: 0,
    screen_recording: 0,
    vm_detected: 0,
  };

  for (const event of events) {
    counts[event.type]++;
  }

  return counts;
}

/**
 * Get filter statistics
 * @param events - All events
 * @param filteredEvents - Events after filtering
 * @returns Statistics object
 */
export function getFilterStats(
  events: SecurityEvent[],
  filteredEvents: SecurityEvent[]
): {
  total: number;
  visible: number;
  hidden: number;
  bySeverity: Record<EventSeverity, { total: number; visible: number }>;
  byType: Record<EventType, { total: number; visible: number }>;
} {
  const totalBySeverity = countBySeverity(events);
  const visibleBySeverity = countBySeverity(filteredEvents);
  const totalByType = countByType(events);
  const visibleByType = countByType(filteredEvents);

  return {
    total: events.length,
    visible: filteredEvents.length,
    hidden: events.length - filteredEvents.length,
    bySeverity: {
      info: { total: totalBySeverity.info, visible: visibleBySeverity.info },
      warning: { total: totalBySeverity.warning, visible: visibleBySeverity.warning },
      critical: { total: totalBySeverity.critical, visible: visibleBySeverity.critical },
    },
    byType: {
      window_focus: { total: totalByType.window_focus, visible: visibleByType.window_focus },
      clipboard: { total: totalByType.clipboard, visible: visibleByType.clipboard },
      process: { total: totalByType.process, visible: visibleByType.process },
      screen_recording: { total: totalByType.screen_recording, visible: visibleByType.screen_recording },
      vm_detected: { total: totalByType.vm_detected, visible: visibleByType.vm_detected },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SORTING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sort events by timestamp (ascending)
 * @param events - Array of security events
 * @returns Sorted events
 */
export function sortByTime(events: SecurityEvent[]): SecurityEvent[] {
  return [...events].sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Sort events by timestamp (descending)
 * @param events - Array of security events
 * @returns Sorted events
 */
export function sortByTimeReverse(events: SecurityEvent[]): SecurityEvent[] {
  return [...events].sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Sort events by severity (critical first)
 * @param events - Array of security events
 * @returns Sorted events
 */
export function sortBySeverity(events: SecurityEvent[]): SecurityEvent[] {
  const severityOrder: Record<EventSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return [...events].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROXIMITY DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find the closest event to a given time
 * @param events - Array of security events
 * @param time - Target time in seconds
 * @returns Closest event or null if no events
 */
export function findClosestEvent(
  events: SecurityEvent[],
  time: number
): SecurityEvent | null {
  if (events.length === 0) return null;

  let closestEvent = events[0];
  let closestDistance = Math.abs(events[0].timestamp - time);

  for (const event of events) {
    const distance = Math.abs(event.timestamp - time);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestEvent = event;
    }
  }

  return closestEvent;
}

/**
 * Find the closest event within a threshold
 * @param events - Array of security events
 * @param time - Target time in seconds
 * @param threshold - Maximum distance in seconds
 * @returns Closest event within threshold or null
 */
export function findClosestEventWithinThreshold(
  events: SecurityEvent[],
  time: number,
  threshold: number
): SecurityEvent | null {
  const closest = findClosestEvent(events, time);
  if (!closest) return null;

  const distance = Math.abs(closest.timestamp - time);
  return distance <= threshold ? closest : null;
}

/**
 * Find all events within a time range around a point
 * @param events - Array of security events
 * @param time - Center time in seconds
 * @param radius - Radius in seconds
 * @returns Events within the range
 */
export function findEventsNearTime(
  events: SecurityEvent[],
  time: number,
  radius: number
): SecurityEvent[] {
  return filterByTimeRange(events, time - radius, time + radius);
}

/**
 * Find the next event after a given time
 * @param events - Array of security events (should be sorted)
 * @param time - Current time in seconds
 * @returns Next event or null
 */
export function findNextEvent(
  events: SecurityEvent[],
  time: number
): SecurityEvent | null {
  for (const event of events) {
    if (event.timestamp > time) {
      return event;
    }
  }
  return null;
}

/**
 * Find the previous event before a given time
 * @param events - Array of security events (should be sorted)
 * @param time - Current time in seconds
 * @returns Previous event or null
 */
export function findPreviousEvent(
  events: SecurityEvent[],
  time: number
): SecurityEvent | null {
  let previousEvent: SecurityEvent | null = null;
  for (const event of events) {
    if (event.timestamp >= time) {
      break;
    }
    previousEvent = event;
  }
  return previousEvent;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER STATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Toggle a severity in the filter set
 * @param current - Current severity set
 * @param severity - Severity to toggle
 * @returns New severity set
 */
export function toggleSeverityFilter(
  current: Set<EventSeverity>,
  severity: EventSeverity
): Set<EventSeverity> {
  const next = new Set(current);
  if (next.has(severity)) {
    next.delete(severity);
  } else {
    next.add(severity);
  }
  return next;
}

/**
 * Toggle a type in the filter set
 * @param current - Current type set
 * @param type - Type to toggle
 * @returns New type set
 */
export function toggleTypeFilter(
  current: Set<EventType>,
  type: EventType
): Set<EventType> {
  const next = new Set(current);
  if (next.has(type)) {
    next.delete(type);
  } else {
    next.add(type);
  }
  return next;
}

/**
 * Check if any filters are active
 * @param filters - Filter state
 * @returns Whether any filters are active (not showing all)
 */
export function hasActiveFilters(filters: FilterState): boolean {
  const allSeverities = 3;
  const allTypes = 5;
  return (
    filters.severities.size < allSeverities || filters.types.size < allTypes
  );
}

/**
 * Create filter state for showing all
 * @returns FilterState with all options enabled
 */
export function createShowAllFilters(): FilterState {
  return {
    severities: new Set(['info', 'warning', 'critical']),
    types: new Set([
      'window_focus',
      'clipboard',
      'process',
      'screen_recording',
      'vm_detected',
    ]),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE CALCULATIONS
// Pure calculation functions for timeline operations
// ═══════════════════════════════════════════════════════════════════════════

import { TimelineConfig, ViewportState, ZoomState } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// COORDINATE TRANSFORMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert pixel position to time value
 * @param pixel - Pixel position relative to track start
 * @param containerWidth - Width of the container in pixels
 * @param duration - Total timeline duration in seconds
 * @param zoom - Current zoom state
 * @returns Time in seconds
 */
export function pixelToTime(
  pixel: number,
  containerWidth: number,
  duration: number,
  zoom: ZoomState
): number {
  // Guard against division by zero
  if (containerWidth === 0 || duration === 0) {
    return 0;
  }

  const visibleDuration = duration / zoom.level;
  const viewportStart = (zoom.focalPoint - 0.5 / zoom.level) * duration;

  const normalizedPosition = pixel / containerWidth;
  const time = viewportStart + normalizedPosition * visibleDuration;

  return clamp(time, 0, duration);
}

/**
 * Convert time value to pixel position
 * @param time - Time in seconds
 * @param containerWidth - Width of the container in pixels
 * @param duration - Total timeline duration in seconds
 * @param zoom - Current zoom state
 * @returns Pixel position relative to track start
 */
export function timeToPixel(
  time: number,
  containerWidth: number,
  duration: number,
  zoom: ZoomState
): number {
  const visibleDuration = duration / zoom.level;
  const viewportStart = (zoom.focalPoint - 0.5 / zoom.level) * duration;

  const normalizedTime = (time - viewportStart) / visibleDuration;
  const pixel = normalizedTime * containerWidth;

  return pixel;
}

/**
 * Convert normalized position (0-1) to time
 * @param normalized - Normalized position (0 = start, 1 = end)
 * @param duration - Total timeline duration in seconds
 * @returns Time in seconds
 */
export function normalizedToTime(normalized: number, duration: number): number {
  return clamp(normalized * duration, 0, duration);
}

/**
 * Convert time to normalized position (0-1)
 * @param time - Time in seconds
 * @param duration - Total timeline duration in seconds
 * @returns Normalized position (0 = start, 1 = end)
 */
export function timeToNormalized(time: number, duration: number): number {
  if (duration === 0) return 0;
  return clamp(time / duration, 0, 1);
}

/**
 * Convert percentage (0-100) to time
 * @param percent - Percentage (0-100)
 * @param duration - Total timeline duration in seconds
 * @returns Time in seconds
 */
export function percentToTime(percent: number, duration: number): number {
  return normalizedToTime(percent / 100, duration);
}

/**
 * Convert time to percentage (0-100)
 * @param time - Time in seconds
 * @param duration - Total timeline duration in seconds
 * @returns Percentage (0-100)
 */
export function timeToPercent(time: number, duration: number): number {
  return timeToNormalized(time, duration) * 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEWPORT CALCULATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate the visible time range based on zoom and focal point
 * @param duration - Total timeline duration
 * @param zoom - Current zoom state
 * @returns Object with visibleStart and visibleEnd times
 */
export function calculateVisibleRange(
  duration: number,
  zoom: ZoomState
): { visibleStart: number; visibleEnd: number } {
  const visibleDuration = duration / zoom.level;
  const halfVisible = visibleDuration / 2;

  // Calculate range centered on focal point
  let visibleStart = zoom.focalPoint * duration - halfVisible;
  let visibleEnd = zoom.focalPoint * duration + halfVisible;

  // Clamp to valid range
  if (visibleStart < 0) {
    visibleEnd -= visibleStart;
    visibleStart = 0;
  }
  if (visibleEnd > duration) {
    visibleStart -= visibleEnd - duration;
    visibleEnd = duration;
  }

  return {
    visibleStart: Math.max(0, visibleStart),
    visibleEnd: Math.min(duration, visibleEnd),
  };
}

/**
 * Calculate new focal point when zooming to maintain position
 * @param currentFocalPoint - Current focal point (0-1)
 * @param zoomCenter - Point where zoom is centered (0-1)
 * @param currentZoom - Current zoom level
 * @param newZoom - Target zoom level
 * @returns New focal point (0-1)
 */
export function calculateZoomFocalPoint(
  currentFocalPoint: number,
  zoomCenter: number,
  currentZoom: number,
  newZoom: number
): number {
  // This keeps the zoom center in the same visual position
  const newFocalPoint =
    currentFocalPoint + (zoomCenter - 0.5) * (1 / currentZoom - 1 / newZoom);

  return clamp(newFocalPoint, 0.5 / newZoom, 1 - 0.5 / newZoom);
}

/**
 * Calculate event marker position within the visible viewport
 * @param eventTime - Event timestamp in seconds
 * @param viewport - Current viewport state
 * @returns Position object with x (pixels) and visible (boolean)
 */
export function calculateMarkerPosition(
  eventTime: number,
  viewport: ViewportState
): { x: number; visible: boolean } {
  const visibleDuration = viewport.visibleEnd - viewport.visibleStart;
  if (visibleDuration === 0) {
    return { x: 0, visible: false };
  }

  const normalizedPosition =
    (eventTime - viewport.visibleStart) / visibleDuration;
  const x = normalizedPosition * viewport.containerWidth;
  const visible = normalizedPosition >= 0 && normalizedPosition <= 1;

  return { x, visible };
}

// ─────────────────────────────────────────────────────────────────────────────
// VELOCITY CALCULATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate velocity from position delta and time delta
 * @param deltaPixels - Change in pixel position
 * @param deltaTime - Time elapsed in milliseconds
 * @param containerWidth - Container width for normalization
 * @param duration - Timeline duration for conversion to time units
 * @returns Velocity in time units per second
 */
export function calculateVelocity(
  deltaPixels: number,
  deltaTime: number,
  containerWidth: number,
  duration: number
): number {
  if (deltaTime === 0 || containerWidth === 0) return 0;

  // Convert pixel velocity to time velocity
  const pixelsPerSecond = (deltaPixels / deltaTime) * 1000;
  const normalizedVelocity = pixelsPerSecond / containerWidth;
  const timeVelocity = normalizedVelocity * duration;

  return timeVelocity;
}

/**
 * Smooth velocity using exponential moving average
 * @param currentVelocity - Current smoothed velocity
 * @param newVelocity - New velocity sample
 * @param smoothing - Smoothing factor (0-1, higher = more smoothing)
 * @returns Smoothed velocity
 */
export function smoothVelocity(
  currentVelocity: number,
  newVelocity: number,
  smoothing: number = 0.7
): number {
  return currentVelocity * smoothing + newVelocity * (1 - smoothing);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIME SNAPPING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Snap time to nearest event within threshold
 * @param time - Current time in seconds
 * @param eventTimes - Array of event timestamps
 * @param threshold - Snap threshold in seconds
 * @returns Snapped time (original if no snap)
 */
export function snapToEvent(
  time: number,
  eventTimes: number[],
  threshold: number
): number {
  let closestTime = time;
  let closestDistance = threshold;

  for (const eventTime of eventTimes) {
    const distance = Math.abs(eventTime - time);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestTime = eventTime;
    }
  }

  return closestTime;
}

/**
 * Snap time to regular intervals
 * @param time - Current time in seconds
 * @param interval - Snap interval in seconds
 * @param threshold - Distance threshold to trigger snap
 * @returns Snapped time
 */
export function snapToInterval(
  time: number,
  interval: number,
  threshold: number
): number {
  const nearestInterval = Math.round(time / interval) * interval;
  const distance = Math.abs(nearestInterval - time);

  return distance <= threshold ? nearestInterval : time;
}

// ─────────────────────────────────────────────────────────────────────────────
// TIME LABEL CALCULATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate time labels for the timeline track
 * @param duration - Total duration in seconds
 * @param containerWidth - Container width in pixels
 * @param zoom - Current zoom level
 * @param minSpacing - Minimum spacing between labels in pixels
 * @returns Array of label objects with time and position
 */
export function generateTimeLabels(
  duration: number,
  containerWidth: number,
  zoom: ZoomState,
  minSpacing: number = 80
): Array<{ time: number; position: number; label: string }> {
  const visibleDuration = duration / zoom.level;
  const numLabels = Math.floor(containerWidth / minSpacing);
  const labelInterval = calculateLabelInterval(visibleDuration, numLabels);

  const { visibleStart, visibleEnd } = calculateVisibleRange(duration, zoom);
  const labels: Array<{ time: number; position: number; label: string }> = [];

  // Start from first label after visible start
  const firstLabel = Math.ceil(visibleStart / labelInterval) * labelInterval;

  for (let time = firstLabel; time <= visibleEnd; time += labelInterval) {
    const position = timeToPixel(time, containerWidth, duration, zoom);
    labels.push({
      time,
      position,
      label: formatTime(time),
    });
  }

  return labels;
}

/**
 * Calculate optimal label interval based on visible duration
 * @param visibleDuration - Visible duration in seconds
 * @param desiredLabels - Desired number of labels
 * @returns Label interval in seconds
 */
function calculateLabelInterval(
  visibleDuration: number,
  desiredLabels: number
): number {
  const rawInterval = visibleDuration / desiredLabels;

  // Nice intervals: 1s, 5s, 10s, 30s, 1m, 5m, 10m, 30m
  const niceIntervals = [1, 5, 10, 30, 60, 300, 600, 1800];

  // Find the closest nice interval
  let bestInterval = niceIntervals[0];
  for (const interval of niceIntervals) {
    if (interval >= rawInterval) {
      bestInterval = interval;
      break;
    }
    bestInterval = interval;
  }

  return bestInterval;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format time in seconds to MM:SS display format
 * @param seconds - Time in seconds
 * @returns Formatted string (e.g., "05:30")
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format time in seconds to HH:MM:SS.mmm display format
 * @param seconds - Time in seconds
 * @returns Formatted string (e.g., "00:05:30.500")
 */
export function formatTimePrecise(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms
    .toString()
    .padStart(3, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clamp a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param start - Start value
 * @param end - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Inverse linear interpolation (find t from value)
 * @param start - Start value
 * @param end - End value
 * @param value - Current value
 * @returns Interpolation factor (0-1)
 */
export function inverseLerp(start: number, end: number, value: number): number {
  if (start === end) return 0;
  return (value - start) / (end - start);
}

/**
 * Smoothstep interpolation
 * @param edge0 - Lower edge
 * @param edge1 - Upper edge
 * @param x - Input value
 * @returns Smoothstepped value (0-1)
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Map a value from one range to another
 * @param value - Input value
 * @param inMin - Input minimum
 * @param inMax - Input maximum
 * @param outMin - Output minimum
 * @param outMax - Output maximum
 * @returns Mapped value
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return lerp(outMin, outMax, inverseLerp(inMin, inMax, value));
}

/**
 * Calculate distance between two points
 * @param x1 - First point X
 * @param y1 - First point Y
 * @param x2 - Second point X
 * @param y2 - Second point Y
 * @returns Distance
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

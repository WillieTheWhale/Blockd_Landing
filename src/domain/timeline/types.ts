// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE DOMAIN TYPES
// Core domain models for the timeline system
// ═══════════════════════════════════════════════════════════════════════════

import { SecurityEvent, EventSeverity, EventType } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineConfig {
  /** Total duration in seconds */
  duration: number;
  /** Minimum zoom level (1 = 100%) */
  minZoom: number;
  /** Maximum zoom level */
  maxZoom: number;
  /** Zoom step multiplier */
  zoomStep: number;
  /** Friction coefficient for momentum (0-1, higher = more friction) */
  friction: number;
  /** Velocity threshold below which momentum stops */
  velocityThreshold: number;
  /** Time (seconds) within which an event is considered "highlighted" */
  highlightThreshold: number;
  /** Duration for auto-scroll animation (ms) */
  autoScrollDuration: number;
  /** Available playback speeds */
  playbackSpeeds: number[];
}

export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  duration: 2700, // 45 minutes
  minZoom: 1,
  maxZoom: 5,
  zoomStep: 1.5,
  friction: 0.92,
  velocityThreshold: 0.5,
  highlightThreshold: 5,
  autoScrollDuration: 800,
  playbackSpeeds: [0.5, 1, 1.5, 2, 4],
};

// ─────────────────────────────────────────────────────────────────────────────
// PLAYBACK STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface PlaybackState {
  /** Whether timeline is currently playing */
  isPlaying: boolean;
  /** Current playback speed multiplier */
  speed: number;
  /** Whether to loop when reaching the end */
  loop: boolean;
}

export const DEFAULT_PLAYBACK_STATE: PlaybackState = {
  isPlaying: false,
  speed: 1,
  loop: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// ZOOM STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface ZoomState {
  /** Current zoom level (1 = 100%) */
  level: number;
  /** Focal point for zoom (0-1 normalized position) */
  focalPoint: number;
  /** Whether currently zooming (for animation purposes) */
  isZooming: boolean;
}

export const DEFAULT_ZOOM_STATE: ZoomState = {
  level: 1,
  focalPoint: 0.5,
  isZooming: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// FILTER STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface FilterState {
  /** Active severity filters (empty = all) */
  severities: Set<EventSeverity>;
  /** Active type filters (empty = all) */
  types: Set<EventType>;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  severities: new Set(['info', 'warning', 'critical']),
  types: new Set(['window_focus', 'clipboard', 'process', 'screen_recording', 'vm_detected']),
};

// ─────────────────────────────────────────────────────────────────────────────
// PHYSICS STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface PhysicsState {
  /** Current velocity in time units per second */
  velocity: number;
  /** Whether currently applying momentum */
  hasMomentum: boolean;
  /** Whether currently dragging */
  isDragging: boolean;
  /** Last pointer position for delta calculations */
  lastPointerX: number;
  /** Timestamp of last update for velocity calculations */
  lastTimestamp: number;
}

export const DEFAULT_PHYSICS_STATE: PhysicsState = {
  velocity: 0,
  hasMomentum: false,
  isDragging: false,
  lastPointerX: 0,
  lastTimestamp: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// GESTURE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type GestureType =
  | 'tap'
  | 'drag'
  | 'flick'
  | 'pinch'
  | 'longPress';

export interface GestureEvent {
  type: GestureType;
  /** Position as normalized value (0-1) */
  position: number;
  /** Velocity in normalized units per second */
  velocity: number;
  /** For pinch gestures, the scale factor */
  scale?: number;
  /** Whether this is the start of the gesture */
  isStart: boolean;
  /** Whether this is the end of the gesture */
  isEnd: boolean;
  /** Original DOM event */
  originalEvent: PointerEvent | TouchEvent;
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTION STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface SelectionState {
  /** Currently selected event ID */
  selectedEventId: string | null;
  /** Currently hovered event ID */
  hoveredEventId: string | null;
  /** Currently highlighted event ID (based on timeline position) */
  highlightedEventId: string | null;
  /** Whether an event card is expanded */
  expandedEventId: string | null;
}

export const DEFAULT_SELECTION_STATE: SelectionState = {
  selectedEventId: null,
  hoveredEventId: null,
  highlightedEventId: null,
  expandedEventId: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE VIEW STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface ViewportState {
  /** Start of visible time range */
  visibleStart: number;
  /** End of visible time range */
  visibleEnd: number;
  /** Container width in pixels */
  containerWidth: number;
  /** Container height in pixels */
  containerHeight: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE TIMELINE STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineState {
  /** Current time position in seconds */
  currentTime: number;
  /** Configuration */
  config: TimelineConfig;
  /** Playback state */
  playback: PlaybackState;
  /** Zoom state */
  zoom: ZoomState;
  /** Filter state */
  filters: FilterState;
  /** Physics state */
  physics: PhysicsState;
  /** Selection state */
  selection: SelectionState;
  /** Viewport state */
  viewport: ViewportState;
  /** Events data */
  events: SecurityEvent[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type RevealPhase =
  | 'hidden'
  | 'track-reveal'
  | 'markers-stagger'
  | 'controls-fade'
  | 'complete';

export interface AnimationState {
  /** Current reveal phase */
  revealPhase: RevealPhase;
  /** Whether initial reveal is complete */
  isRevealed: boolean;
  /** Currently morphing event (marker to card transition) */
  morphingEventId: string | null;
}

export const DEFAULT_ANIMATION_STATE: AnimationState = {
  revealPhase: 'hidden',
  isRevealed: false,
  morphingEventId: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// SPRING CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
}

export const SPRING_CONFIGS = {
  /** Snappy response for controls */
  snappy: { stiffness: 400, damping: 35 } as SpringConfig,
  /** Smooth for seeking animations */
  smooth: { stiffness: 300, damping: 30 } as SpringConfig,
  /** Bouncy for emphasis */
  bouncy: { stiffness: 400, damping: 20 } as SpringConfig,
  /** Gentle for morphing transitions */
  gentle: { stiffness: 200, damping: 25 } as SpringConfig,
  /** Stiff for immediate feedback */
  stiff: { stiffness: 500, damping: 40 } as SpringConfig,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ACTION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineActions {
  // Playback
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  setSpeed: (speed: number) => void;

  // Seeking
  seek: (time: number) => void;
  seekRelative: (delta: number) => void;
  seekToEvent: (eventId: string) => void;

  // Zoom
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (level: number, focalPoint?: number) => void;
  resetZoom: () => void;

  // Filters
  toggleSeverityFilter: (severity: EventSeverity) => void;
  toggleTypeFilter: (type: EventType) => void;
  clearFilters: () => void;
  setFilters: (filters: Partial<FilterState>) => void;

  // Selection
  selectEvent: (eventId: string | null) => void;
  hoverEvent: (eventId: string | null) => void;
  expandEvent: (eventId: string | null) => void;

  // Physics
  startDrag: (pointerX: number) => void;
  updateDrag: (pointerX: number) => void;
  endDrag: () => void;
  applyMomentum: (velocity: number) => void;

  // Animation
  startReveal: () => void;
  completeReveal: () => void;
  startMorph: (eventId: string) => void;
  completeMorph: () => void;
}

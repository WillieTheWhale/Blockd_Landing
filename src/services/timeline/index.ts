// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE SERVICES - PUBLIC API
// Re-exports for the timeline services layer
// ═══════════════════════════════════════════════════════════════════════════

export {
  PhysicsEngine,
  getPhysicsEngine,
  resetPhysicsEngine,
} from './physics-engine';

export {
  GestureHandler,
  createGestureHandler,
  type GestureCallback,
} from './gesture-handler';

export {
  PlaybackService,
  getPlaybackService,
  resetPlaybackService,
  type PlaybackCallback,
  type PlaybackEndCallback,
} from './playback-service';

export {
  AnimationOrchestrator,
  createAnimationOrchestrator,
  type AnimationSequence,
  type AnimationStep,
  type PhaseChangeCallback,
} from './animation-orchestrator';

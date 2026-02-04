// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE PHYSICS
// Physics calculations for momentum, friction, and spring animations
// ═══════════════════════════════════════════════════════════════════════════

import { PhysicsState, TimelineConfig } from './types';
import { clamp } from './calculations';

// ─────────────────────────────────────────────────────────────────────────────
// MOMENTUM PHYSICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate momentum based on velocity and mass
 * @param velocity - Current velocity
 * @param mass - Mass coefficient (default 1)
 * @returns Momentum value
 */
export function calculateMomentum(velocity: number, mass: number = 1): number {
  return velocity * mass;
}

/**
 * Apply friction to velocity for a single frame
 * @param velocity - Current velocity
 * @param friction - Friction coefficient (0-1, higher = more friction)
 * @param deltaTime - Time elapsed since last frame in milliseconds
 * @returns New velocity after friction
 */
export function applyFriction(
  velocity: number,
  friction: number,
  deltaTime: number
): number {
  // Use exponential decay for smooth deceleration
  // Normalize to 16.67ms frame time (60fps)
  const normalizedDt = deltaTime / 16.67;
  const decayFactor = Math.pow(friction, normalizedDt);
  return velocity * decayFactor;
}

/**
 * Check if velocity is below threshold and should stop
 * @param velocity - Current velocity
 * @param threshold - Velocity threshold
 * @returns Whether velocity is effectively zero
 */
export function isVelocityNegligible(
  velocity: number,
  threshold: number
): boolean {
  return Math.abs(velocity) < threshold;
}

/**
 * Simulate a flick gesture and return predicted stopping position
 * @param startPosition - Starting position
 * @param velocity - Initial velocity
 * @param friction - Friction coefficient
 * @param threshold - Velocity threshold
 * @returns Predicted final position
 */
export function simulateFlick(
  startPosition: number,
  velocity: number,
  friction: number,
  threshold: number
): number {
  let position = startPosition;
  let currentVelocity = velocity;
  const maxIterations = 1000; // Safety limit
  let iterations = 0;

  while (!isVelocityNegligible(currentVelocity, threshold) && iterations < maxIterations) {
    position += currentVelocity * 0.01667; // ~60fps frame time
    currentVelocity = applyFriction(currentVelocity, friction, 16.67);
    iterations++;
  }

  return position;
}

/**
 * Generate keyframes for momentum animation
 * @param startTime - Starting time value
 * @param velocity - Initial velocity
 * @param friction - Friction coefficient
 * @param threshold - Velocity threshold
 * @param minTime - Minimum time boundary
 * @param maxTime - Maximum time boundary
 * @returns Array of time keyframes
 */
export function generateMomentumKeyframes(
  startTime: number,
  velocity: number,
  friction: number,
  threshold: number,
  minTime: number,
  maxTime: number
): { time: number; duration: number }[] {
  const keyframes: { time: number; duration: number }[] = [];
  let currentTime = startTime;
  let currentVelocity = velocity;
  let totalDuration = 0;
  const frameTime = 16.67;
  const maxDuration = 2000; // Maximum 2 seconds of momentum

  while (
    !isVelocityNegligible(currentVelocity, threshold) &&
    totalDuration < maxDuration
  ) {
    currentTime += currentVelocity * (frameTime / 1000);
    currentVelocity = applyFriction(currentVelocity, friction, frameTime);
    totalDuration += frameTime;

    // Bounce off boundaries
    if (currentTime < minTime) {
      currentTime = minTime;
      currentVelocity = 0; // Stop at boundary
    } else if (currentTime > maxTime) {
      currentTime = maxTime;
      currentVelocity = 0; // Stop at boundary
    }

    keyframes.push({ time: currentTime, duration: totalDuration });
  }

  return keyframes;
}

/**
 * Calculate the final position after momentum, respecting boundaries
 * @param startTime - Starting time value
 * @param velocity - Initial velocity
 * @param friction - Friction coefficient
 * @param threshold - Velocity threshold
 * @param minTime - Minimum time boundary
 * @param maxTime - Maximum time boundary
 * @returns Final clamped time position
 */
export function calculateMomentumTarget(
  startTime: number,
  velocity: number,
  friction: number,
  threshold: number,
  minTime: number,
  maxTime: number
): number {
  const rawTarget = simulateFlick(startTime, velocity, friction, threshold);
  return clamp(rawTarget, minTime, maxTime);
}

// ─────────────────────────────────────────────────────────────────────────────
// SPRING PHYSICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate spring force
 * @param displacement - Current displacement from rest position
 * @param stiffness - Spring stiffness (higher = stiffer spring)
 * @returns Spring force
 */
export function calculateSpringForce(
  displacement: number,
  stiffness: number
): number {
  return -stiffness * displacement;
}

/**
 * Calculate damping force
 * @param velocity - Current velocity
 * @param damping - Damping coefficient
 * @returns Damping force
 */
export function calculateDampingForce(
  velocity: number,
  damping: number
): number {
  return -damping * velocity;
}

/**
 * Update spring state for one frame
 * @param position - Current position
 * @param velocity - Current velocity
 * @param target - Target position
 * @param stiffness - Spring stiffness
 * @param damping - Damping coefficient
 * @param mass - Mass (default 1)
 * @param deltaTime - Time step in seconds
 * @returns New position and velocity
 */
export function updateSpring(
  position: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  mass: number = 1,
  deltaTime: number = 0.01667
): { position: number; velocity: number } {
  const displacement = position - target;
  const springForce = calculateSpringForce(displacement, stiffness);
  const dampingForce = calculateDampingForce(velocity, damping);
  const acceleration = (springForce + dampingForce) / mass;

  const newVelocity = velocity + acceleration * deltaTime;
  const newPosition = position + newVelocity * deltaTime;

  return { position: newPosition, velocity: newVelocity };
}

/**
 * Check if spring has settled (reached equilibrium)
 * @param position - Current position
 * @param velocity - Current velocity
 * @param target - Target position
 * @param positionThreshold - Position difference threshold
 * @param velocityThreshold - Velocity threshold
 * @returns Whether spring has settled
 */
export function hasSpringSettled(
  position: number,
  velocity: number,
  target: number,
  positionThreshold: number = 0.001,
  velocityThreshold: number = 0.001
): boolean {
  return (
    Math.abs(position - target) < positionThreshold &&
    Math.abs(velocity) < velocityThreshold
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTURE PHYSICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect if a gesture is a flick based on velocity
 * @param velocity - Final velocity of the gesture
 * @param minVelocity - Minimum velocity to qualify as flick
 * @returns Whether gesture is a flick
 */
export function isFlickGesture(
  velocity: number,
  minVelocity: number = 500
): boolean {
  return Math.abs(velocity) > minVelocity;
}

/**
 * Calculate velocity decay time for given initial velocity
 * @param velocity - Initial velocity
 * @param friction - Friction coefficient
 * @param threshold - Velocity threshold
 * @returns Decay time in milliseconds
 */
export function calculateDecayTime(
  velocity: number,
  friction: number,
  threshold: number
): number {
  if (Math.abs(velocity) <= threshold) return 0;

  // Using logarithmic decay formula
  // v(t) = v0 * friction^(t/frame)
  // Solve for t when v(t) = threshold
  const frameTime = 16.67;
  const ratio = threshold / Math.abs(velocity);
  const t = (Math.log(ratio) / Math.log(friction)) * frameTime;

  return Math.max(0, t);
}

/**
 * Calculate elastic bounce when hitting boundary
 * @param position - Current position
 * @param velocity - Current velocity
 * @param boundary - Boundary position
 * @param bounceFactor - How much energy is preserved (0-1)
 * @returns New position and velocity after bounce
 */
export function calculateElasticBounce(
  position: number,
  velocity: number,
  boundary: number,
  bounceFactor: number = 0.3
): { position: number; velocity: number } {
  // Reflect position across boundary
  const overshoot = position - boundary;
  const newPosition = boundary - overshoot * bounceFactor;
  const newVelocity = -velocity * bounceFactor;

  return { position: newPosition, velocity: newVelocity };
}

// ─────────────────────────────────────────────────────────────────────────────
// PHYSICS STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update physics state based on pointer movement
 * @param state - Current physics state
 * @param pointerX - Current pointer X position
 * @param containerWidth - Container width
 * @param duration - Timeline duration
 * @returns Updated physics state
 */
export function updatePhysicsState(
  state: PhysicsState,
  pointerX: number,
  containerWidth: number,
  duration: number
): PhysicsState {
  const now = performance.now();
  const deltaTime = now - state.lastTimestamp;
  const deltaX = pointerX - state.lastPointerX;

  // Calculate velocity in time units per second
  const pixelVelocity = deltaTime > 0 ? (deltaX / deltaTime) * 1000 : 0;
  const timeVelocity = (pixelVelocity / containerWidth) * duration;

  return {
    ...state,
    velocity: timeVelocity,
    lastPointerX: pointerX,
    lastTimestamp: now,
  };
}

/**
 * Create initial physics state for drag start
 * @param pointerX - Initial pointer X position
 * @returns Initial physics state
 */
export function createDragStartState(pointerX: number): PhysicsState {
  return {
    velocity: 0,
    hasMomentum: false,
    isDragging: true,
    lastPointerX: pointerX,
    lastTimestamp: performance.now(),
  };
}

/**
 * Create physics state for drag end (momentum phase)
 * @param velocity - Final velocity from drag
 * @returns Momentum physics state
 */
export function createMomentumState(velocity: number): PhysicsState {
  return {
    velocity,
    hasMomentum: true,
    isDragging: false,
    lastPointerX: 0,
    lastTimestamp: performance.now(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INERTIA CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Framer Motion inertia animation configuration generator
 * @param velocity - Initial velocity
 * @param config - Timeline config
 * @returns Framer Motion inertia transition config
 */
export function createInertiaConfig(
  velocity: number,
  config: TimelineConfig
): {
  type: 'inertia';
  velocity: number;
  power: number;
  timeConstant: number;
  restDelta: number;
  min: number;
  max: number;
} {
  return {
    type: 'inertia',
    velocity,
    power: 0.8,
    timeConstant: 700 * (1 - config.friction) + 100,
    restDelta: config.velocityThreshold,
    min: 0,
    max: config.duration,
  };
}

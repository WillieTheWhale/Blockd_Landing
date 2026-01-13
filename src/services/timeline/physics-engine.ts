// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE PHYSICS ENGINE
// Manages momentum, friction, and physics-based animations
// ═══════════════════════════════════════════════════════════════════════════

import { MotionValue, animate } from 'framer-motion';
import type { AnimationPlaybackControlsWithThen } from 'motion-dom';
import {
  TimelineConfig,
  DEFAULT_TIMELINE_CONFIG,
  SPRING_CONFIGS,
} from '@/domain/timeline/types';
import {
  applyFriction,
  isVelocityNegligible,
  calculateMomentumTarget,
  isFlickGesture,
  createInertiaConfig,
} from '@/domain/timeline/physics';
import { clamp } from '@/domain/timeline/calculations';

// ─────────────────────────────────────────────────────────────────────────────
// PHYSICS ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class PhysicsEngine {
  private config: TimelineConfig;
  private currentAnimation: AnimationPlaybackControlsWithThen | null = null;
  private rafId: number | null = null;
  private isActive: boolean = false;
  private currentUnsubscribe: (() => void) | null = null;

  // Velocity tracking
  private velocitySamples: Array<{ value: number; timestamp: number }> = [];
  private readonly maxSamples = 5;

  constructor(config: Partial<TimelineConfig> = {}) {
    this.config = { ...DEFAULT_TIMELINE_CONFIG, ...config };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────

  updateConfig(config: Partial<TimelineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VELOCITY TRACKING
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Record a velocity sample for averaging
   */
  recordVelocity(velocity: number): void {
    const now = performance.now();
    this.velocitySamples.push({ value: velocity, timestamp: now });

    // Keep only recent samples
    if (this.velocitySamples.length > this.maxSamples) {
      this.velocitySamples.shift();
    }
  }

  /**
   * Get averaged velocity from recent samples
   */
  getAveragedVelocity(): number {
    if (this.velocitySamples.length === 0) return 0;

    const now = performance.now();
    const recentSamples = this.velocitySamples.filter(
      (s) => now - s.timestamp < 100 // Only last 100ms
    );

    if (recentSamples.length === 0) return 0;

    // Weight recent samples more heavily
    let totalWeight = 0;
    let weightedSum = 0;

    for (let i = 0; i < recentSamples.length; i++) {
      const weight = (i + 1) / recentSamples.length;
      weightedSum += recentSamples[i].value * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Clear velocity samples
   */
  clearVelocitySamples(): void {
    this.velocitySamples = [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MOMENTUM ANIMATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Start momentum animation after drag release
   */
  startMomentum(
    timeMotionValue: MotionValue<number>,
    velocity: number,
    onUpdate?: (time: number) => void,
    onComplete?: () => void
  ): boolean {
    // Check if velocity qualifies as a flick
    if (!isFlickGesture(velocity, this.config.velocityThreshold * 10)) {
      return false;
    }

    // Cancel any existing animation
    this.stopAnimation();

    const currentTime = timeMotionValue.get();
    const targetTime = calculateMomentumTarget(
      currentTime,
      velocity,
      this.config.friction,
      this.config.velocityThreshold,
      0,
      this.config.duration
    );

    // Start inertia animation
    this.currentAnimation = animate(
      timeMotionValue,
      targetTime,
      createInertiaConfig(velocity, this.config)
    );

    this.isActive = true;

    // Set up update callback and store for cleanup
    this.currentUnsubscribe = timeMotionValue.on('change', (value) => {
      onUpdate?.(value);
    });

    // Handle completion
    this.currentAnimation.then(() => {
      this.cleanupSubscription();
      this.isActive = false;
      this.currentAnimation = null;
      onComplete?.();
    });

    return true;
  }

  /**
   * Clean up current subscription
   */
  private cleanupSubscription(): void {
    if (this.currentUnsubscribe) {
      this.currentUnsubscribe();
      this.currentUnsubscribe = null;
    }
  }

  /**
   * Start smooth seek animation to target time
   */
  seekWithSpring(
    timeMotionValue: MotionValue<number>,
    targetTime: number,
    onUpdate?: (time: number) => void,
    onComplete?: () => void
  ): void {
    // Cancel any existing animation
    this.stopAnimation();

    const clampedTarget = clamp(targetTime, 0, this.config.duration);

    this.currentAnimation = animate(timeMotionValue, clampedTarget, {
      type: 'spring',
      ...SPRING_CONFIGS.smooth,
      onUpdate: (latest) => {
        onUpdate?.(latest);
      },
      onComplete: () => {
        this.isActive = false;
        this.currentAnimation = null;
        onComplete?.();
      },
    });

    this.isActive = true;
  }

  /**
   * Start snappy seek animation (for clicking on events)
   */
  seekToEventWithSpring(
    timeMotionValue: MotionValue<number>,
    targetTime: number,
    onUpdate?: (time: number) => void,
    onComplete?: () => void
  ): void {
    this.stopAnimation();

    const clampedTarget = clamp(targetTime, 0, this.config.duration);

    this.currentAnimation = animate(timeMotionValue, clampedTarget, {
      type: 'spring',
      ...SPRING_CONFIGS.snappy,
      onUpdate: (latest) => {
        onUpdate?.(latest);
      },
      onComplete: () => {
        this.isActive = false;
        this.currentAnimation = null;
        onComplete?.();
      },
    });

    this.isActive = true;
  }

  /**
   * Immediately set time (for dragging)
   */
  setTimeImmediate(timeMotionValue: MotionValue<number>, time: number): void {
    this.stopAnimation();
    const clampedTime = clamp(time, 0, this.config.duration);
    timeMotionValue.set(clampedTime);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MANUAL PHYSICS LOOP (for custom effects)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Start manual physics loop with friction
   */
  startManualPhysicsLoop(
    timeMotionValue: MotionValue<number>,
    initialVelocity: number,
    onUpdate?: (time: number, velocity: number) => void,
    onComplete?: () => void
  ): void {
    this.stopAnimation();
    this.isActive = true;

    let velocity = initialVelocity;
    let lastTime = performance.now();

    const tick = () => {
      if (!this.isActive) return;

      const now = performance.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      // Apply friction
      velocity = applyFriction(velocity, this.config.friction, deltaTime);

      // Check if should stop
      if (isVelocityNegligible(velocity, this.config.velocityThreshold)) {
        this.isActive = false;
        onComplete?.();
        return;
      }

      // Update position
      const currentTime = timeMotionValue.get();
      let newTime = currentTime + velocity * (deltaTime / 1000);

      // Clamp to boundaries
      if (newTime < 0) {
        newTime = 0;
        velocity = 0;
      } else if (newTime > this.config.duration) {
        newTime = this.config.duration;
        velocity = 0;
      }

      timeMotionValue.set(newTime);
      onUpdate?.(newTime, velocity);

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTROL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Stop all animations
   */
  stopAnimation(): void {
    // Clean up subscription first
    this.cleanupSubscription();

    if (this.currentAnimation) {
      this.currentAnimation.stop();
      this.currentAnimation = null;
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.isActive = false;
  }

  /**
   * Check if physics is active
   */
  isPhysicsActive(): boolean {
    return this.isActive;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopAnimation();
    this.clearVelocitySamples();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON FACTORY
// ─────────────────────────────────────────────────────────────────────────────

let physicsEngineInstance: PhysicsEngine | null = null;

export function getPhysicsEngine(
  config?: Partial<TimelineConfig>
): PhysicsEngine {
  if (!physicsEngineInstance) {
    physicsEngineInstance = new PhysicsEngine(config);
  } else if (config) {
    physicsEngineInstance.updateConfig(config);
  }
  return physicsEngineInstance;
}

export function resetPhysicsEngine(): void {
  if (physicsEngineInstance) {
    physicsEngineInstance.destroy();
    physicsEngineInstance = null;
  }
}

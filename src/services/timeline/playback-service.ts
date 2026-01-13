// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE PLAYBACK SERVICE
// Controls timeline playback with variable speed and looping
// ═══════════════════════════════════════════════════════════════════════════

import { MotionValue } from 'framer-motion';
import { TimelineConfig, DEFAULT_TIMELINE_CONFIG } from '@/domain/timeline/types';

// ─────────────────────────────────────────────────────────────────────────────
// PLAYBACK STATE
// ─────────────────────────────────────────────────────────────────────────────

interface PlaybackServiceState {
  isPlaying: boolean;
  speed: number;
  loop: boolean;
  lastFrameTime: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYBACK SERVICE CLASS
// ─────────────────────────────────────────────────────────────────────────────

export type PlaybackCallback = (time: number) => void;
export type PlaybackEndCallback = () => void;

export class PlaybackService {
  private config: TimelineConfig;
  private state: PlaybackServiceState;
  private rafId: number | null = null;
  private timeMotionValue: MotionValue<number> | null = null;

  // Callbacks
  private onUpdate: PlaybackCallback | null = null;
  private onEnd: PlaybackEndCallback | null = null;
  private onLoop: PlaybackCallback | null = null;

  constructor(config: Partial<TimelineConfig> = {}) {
    this.config = { ...DEFAULT_TIMELINE_CONFIG, ...config };
    this.state = {
      isPlaying: false,
      speed: 1,
      loop: true,
      lastFrameTime: 0,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────

  updateConfig(config: Partial<TimelineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setTimeMotionValue(motionValue: MotionValue<number>): void {
    this.timeMotionValue = motionValue;
  }

  setCallbacks(
    onUpdate?: PlaybackCallback,
    onEnd?: PlaybackEndCallback,
    onLoop?: PlaybackCallback
  ): void {
    this.onUpdate = onUpdate ?? null;
    this.onEnd = onEnd ?? null;
    this.onLoop = onLoop ?? null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYBACK CONTROLS
  // ─────────────────────────────────────────────────────────────────────────

  play(): void {
    if (this.state.isPlaying) return;

    this.state.isPlaying = true;
    this.state.lastFrameTime = performance.now();
    this.startLoop();
  }

  pause(): void {
    if (!this.state.isPlaying) return;

    this.state.isPlaying = false;
    this.stopLoop();
  }

  toggle(): void {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  stop(): void {
    this.pause();
    if (this.timeMotionValue) {
      this.timeMotionValue.set(0);
      this.onUpdate?.(0);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SPEED CONTROLS
  // ─────────────────────────────────────────────────────────────────────────

  setSpeed(speed: number): void {
    const validSpeeds = this.config.playbackSpeeds;
    const closestSpeed = validSpeeds.reduce((prev, curr) =>
      Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev
    );
    this.state.speed = closestSpeed;
  }

  getSpeed(): number {
    return this.state.speed;
  }

  speedUp(): void {
    const validSpeeds = this.config.playbackSpeeds;
    const currentIndex = validSpeeds.indexOf(this.state.speed);
    if (currentIndex < validSpeeds.length - 1) {
      this.state.speed = validSpeeds[currentIndex + 1];
    }
  }

  slowDown(): void {
    const validSpeeds = this.config.playbackSpeeds;
    const currentIndex = validSpeeds.indexOf(this.state.speed);
    if (currentIndex > 0) {
      this.state.speed = validSpeeds[currentIndex - 1];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOOP CONTROLS
  // ─────────────────────────────────────────────────────────────────────────

  setLoop(loop: boolean): void {
    this.state.loop = loop;
  }

  isLooping(): boolean {
    return this.state.loop;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ANIMATION LOOP
  // ─────────────────────────────────────────────────────────────────────────

  private startLoop(): void {
    this.stopLoop();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (): void => {
    if (!this.state.isPlaying || !this.timeMotionValue) {
      return;
    }

    const now = performance.now();
    const deltaTime = (now - this.state.lastFrameTime) / 1000; // Convert to seconds
    this.state.lastFrameTime = now;

    const currentTime = this.timeMotionValue.get();
    const advance = deltaTime * this.state.speed;
    let newTime = currentTime + advance;

    // Handle end of timeline
    if (newTime >= this.config.duration) {
      if (this.state.loop) {
        newTime = newTime % this.config.duration;
        this.timeMotionValue.set(newTime);
        this.onLoop?.(newTime);
      } else {
        newTime = this.config.duration;
        this.timeMotionValue.set(newTime);
        this.pause();
        this.onEnd?.();
        return;
      }
    } else {
      this.timeMotionValue.set(newTime);
    }

    this.onUpdate?.(newTime);

    // Continue loop
    this.rafId = requestAnimationFrame(this.tick);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STATE QUERIES
  // ─────────────────────────────────────────────────────────────────────────

  isPlaying(): boolean {
    return this.state.isPlaying;
  }

  getState(): Readonly<PlaybackServiceState> {
    return { ...this.state };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SEEK
  // ─────────────────────────────────────────────────────────────────────────

  seekTo(time: number): void {
    if (!this.timeMotionValue) return;

    const clampedTime = Math.max(0, Math.min(time, this.config.duration));
    this.timeMotionValue.set(clampedTime);
    this.onUpdate?.(clampedTime);
  }

  seekToPercent(percent: number): void {
    const time = (percent / 100) * this.config.duration;
    this.seekTo(time);
  }

  skipForward(seconds: number = 5): void {
    if (!this.timeMotionValue) return;

    const currentTime = this.timeMotionValue.get();
    this.seekTo(currentTime + seconds * this.state.speed);
  }

  skipBackward(seconds: number = 5): void {
    if (!this.timeMotionValue) return;

    const currentTime = this.timeMotionValue.get();
    this.seekTo(currentTime - seconds * this.state.speed);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────────────────

  destroy(): void {
    this.stopLoop();
    this.timeMotionValue = null;
    this.onUpdate = null;
    this.onEnd = null;
    this.onLoop = null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON FACTORY
// ─────────────────────────────────────────────────────────────────────────────

let playbackServiceInstance: PlaybackService | null = null;

export function getPlaybackService(
  config?: Partial<TimelineConfig>
): PlaybackService {
  if (!playbackServiceInstance) {
    playbackServiceInstance = new PlaybackService(config);
  } else if (config) {
    playbackServiceInstance.updateConfig(config);
  }
  return playbackServiceInstance;
}

export function resetPlaybackService(): void {
  if (playbackServiceInstance) {
    playbackServiceInstance.destroy();
    playbackServiceInstance = null;
  }
}

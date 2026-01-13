// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE ANIMATION ORCHESTRATOR
// Coordinates complex animation sequences and transitions
// ═══════════════════════════════════════════════════════════════════════════

import { animate, stagger } from 'framer-motion';
import type { AnimationPlaybackControlsWithThen } from 'motion-dom';
import { RevealPhase, SPRING_CONFIGS } from '@/domain/timeline/types';

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION SEQUENCES
// ─────────────────────────────────────────────────────────────────────────────

export interface AnimationSequence {
  id: string;
  steps: AnimationStep[];
  onComplete?: () => void;
}

export interface AnimationStep {
  selector: string;
  properties: Record<string, any>;
  options?: {
    duration?: number;
    delay?: number;
    stagger?: number;
    type?: 'spring' | 'tween' | 'inertia';
    ease?: string | number[];
    stiffness?: number;
    damping?: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION ORCHESTRATOR CLASS
// ─────────────────────────────────────────────────────────────────────────────

export type PhaseChangeCallback = (phase: RevealPhase) => void;

export class AnimationOrchestrator {
  private container: HTMLElement | null = null;
  private activeAnimations: AnimationPlaybackControlsWithThen[] = [];
  private currentPhase: RevealPhase = 'hidden';
  private phaseCallbacks: PhaseChangeCallback[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // SETUP
  // ─────────────────────────────────────────────────────────────────────────

  setContainer(element: HTMLElement | null): void {
    this.container = element;
  }

  onPhaseChange(callback: PhaseChangeCallback): () => void {
    this.phaseCallbacks.push(callback);
    return () => {
      const index = this.phaseCallbacks.indexOf(callback);
      if (index > -1) {
        this.phaseCallbacks.splice(index, 1);
      }
    };
  }

  private setPhase(phase: RevealPhase): void {
    this.currentPhase = phase;
    this.phaseCallbacks.forEach((cb) => cb(phase));
  }

  getCurrentPhase(): RevealPhase {
    return this.currentPhase;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TIMELINE REVEAL SEQUENCE
  // ─────────────────────────────────────────────────────────────────────────

  async playRevealSequence(): Promise<void> {
    if (!this.container) return;

    this.cancelAllAnimations();

    // Phase 1: Track reveal
    this.setPhase('track-reveal');
    await this.animateTrackReveal();

    // Phase 2: Markers stagger in
    this.setPhase('markers-stagger');
    await this.animateMarkersReveal();

    // Phase 3: Controls fade in
    this.setPhase('controls-fade');
    await this.animateControlsReveal();

    // Complete
    this.setPhase('complete');
  }

  private async animateTrackReveal(): Promise<void> {
    if (!this.container) return;

    const track = this.container.querySelector('[data-timeline-track]');
    const progressBar = this.container.querySelector('[data-timeline-progress]');

    if (track) {
      const animation = animate(
        track,
        { scaleX: [0, 1], opacity: [0, 1] },
        {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
        }
      );
      this.activeAnimations.push(animation);
      await animation;
    }

    if (progressBar) {
      const animation = animate(
        progressBar,
        { scaleX: [0, 1] },
        {
          duration: 0.4,
          delay: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }
      );
      this.activeAnimations.push(animation);
      await animation;
    }
  }

  private async animateMarkersReveal(): Promise<void> {
    if (!this.container) return;

    const markers = this.container.querySelectorAll('[data-timeline-marker]');

    if (markers.length === 0) return;

    const animation = animate(
      markers,
      { scale: [0, 1], opacity: [0, 1] },
      {
        duration: 0.3,
        delay: stagger(0.05),
        type: 'spring',
        ...SPRING_CONFIGS.bouncy,
      }
    );

    this.activeAnimations.push(animation);
    await animation;
  }

  private async animateControlsReveal(): Promise<void> {
    if (!this.container) return;

    const controls = this.container.querySelector('[data-timeline-controls]');
    const scrubber = this.container.querySelector('[data-timeline-scrubber]');
    const labels = this.container.querySelectorAll('[data-timeline-label]');

    const promises: Promise<any>[] = [];

    if (controls) {
      const animation = animate(
        controls,
        { opacity: [0, 1], y: [10, 0] },
        {
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
        }
      );
      this.activeAnimations.push(animation);
      promises.push(animation.then(() => {}));
    }

    if (scrubber) {
      const animation = animate(
        scrubber,
        { scale: [0, 1], opacity: [0, 1] },
        {
          duration: 0.3,
          delay: 0.1,
          type: 'spring',
          ...SPRING_CONFIGS.bouncy,
        }
      );
      this.activeAnimations.push(animation);
      promises.push(animation.then(() => {}));
    }

    if (labels.length > 0) {
      const animation = animate(
        labels,
        { opacity: [0, 1], y: [5, 0] },
        {
          duration: 0.3,
          delay: stagger(0.03),
          ease: [0.25, 0.46, 0.45, 0.94],
        }
      );
      this.activeAnimations.push(animation);
      promises.push(animation.then(() => {}));
    }

    await Promise.all(promises);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MORPH TRANSITIONS
  // ─────────────────────────────────────────────────────────────────────────

  async morphMarkerToCard(
    marker: HTMLElement,
    card: HTMLElement,
    onComplete?: () => void
  ): Promise<void> {
    const markerRect = marker.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    // Calculate transform
    const scaleX = markerRect.width / cardRect.width;
    const scaleY = markerRect.height / cardRect.height;
    const translateX = markerRect.left - cardRect.left;
    const translateY = markerRect.top - cardRect.top;

    // Animate card from marker position
    const animation = animate(
      card,
      {
        x: [translateX, 0],
        y: [translateY, 0],
        scaleX: [scaleX, 1],
        scaleY: [scaleY, 1],
        opacity: [0.8, 1],
      },
      {
        duration: 0.4,
        type: 'spring',
        ...SPRING_CONFIGS.gentle,
        onComplete,
      }
    );

    this.activeAnimations.push(animation);

    // Fade out marker
    animate(
      marker,
      { opacity: [1, 0], scale: [1, 0.8] },
      { duration: 0.2 }
    );

    await animation;
  }

  async morphCardToMarker(
    card: HTMLElement,
    marker: HTMLElement,
    onComplete?: () => void
  ): Promise<void> {
    const markerRect = marker.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const translateX = markerRect.left - cardRect.left;
    const translateY = markerRect.top - cardRect.top;
    const scaleX = markerRect.width / cardRect.width;
    const scaleY = markerRect.height / cardRect.height;

    const animation = animate(
      card,
      {
        x: [0, translateX],
        y: [0, translateY],
        scaleX: [1, scaleX],
        scaleY: [1, scaleY],
        opacity: [1, 0],
      },
      {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
        onComplete,
      }
    );

    this.activeAnimations.push(animation);

    // Fade in marker
    animate(
      marker,
      { opacity: [0, 1], scale: [0.8, 1] },
      { duration: 0.2, delay: 0.2 }
    );

    await animation;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HIGHLIGHT ANIMATIONS
  // ─────────────────────────────────────────────────────────────────────────

  async highlightMarker(marker: HTMLElement): Promise<void> {
    const animation = animate(
      marker,
      { scale: [1, 1.5, 1.3] },
      {
        duration: 0.3,
        type: 'spring',
        ...SPRING_CONFIGS.bouncy,
      }
    );

    this.activeAnimations.push(animation);
    await animation;
  }

  async pulseMarker(marker: HTMLElement): Promise<() => void> {
    const animation = animate(
      marker,
      { scale: [1, 1.2, 1] },
      {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }
    );

    this.activeAnimations.push(animation);

    return () => animation.stop();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EVENT CARD ANIMATIONS
  // ─────────────────────────────────────────────────────────────────────────

  async animateEventListEntry(cards: NodeListOf<Element>): Promise<void> {
    if (cards.length === 0) return;

    const animation = animate(
      cards,
      { opacity: [0, 1], x: [-20, 0] },
      {
        duration: 0.4,
        delay: stagger(0.05),
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    );

    this.activeAnimations.push(animation);
    await animation;
  }

  async highlightEventCard(card: HTMLElement): Promise<void> {
    const animation = animate(
      card,
      { scale: [1, 1.03] },
      {
        duration: 0.3,
        type: 'spring',
        ...SPRING_CONFIGS.bouncy,
      }
    );

    this.activeAnimations.push(animation);
    await animation;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GENERIC SEQUENCE RUNNER
  // ─────────────────────────────────────────────────────────────────────────

  async runSequence(sequence: AnimationSequence): Promise<void> {
    for (const step of sequence.steps) {
      if (!this.container) return;

      const elements = this.container.querySelectorAll(step.selector);
      if (elements.length === 0) continue;

      const options = step.options ?? {};
      const animationConfig: any = {
        duration: options.duration ?? 0.3,
        delay: options.stagger ? stagger(options.stagger) : options.delay,
        ease: options.ease ?? [0.25, 0.46, 0.45, 0.94],
      };

      if (options.type === 'spring') {
        animationConfig.type = 'spring';
        animationConfig.stiffness = options.stiffness ?? 400;
        animationConfig.damping = options.damping ?? 25;
      }

      const animation = animate(elements, step.properties, animationConfig);
      this.activeAnimations.push(animation);
      await animation;
    }

    sequence.onComplete?.();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTROL
  // ─────────────────────────────────────────────────────────────────────────

  cancelAllAnimations(): void {
    this.activeAnimations.forEach((animation) => animation.stop());
    this.activeAnimations = [];
  }

  isAnimating(): boolean {
    return this.activeAnimations.length > 0;
  }

  destroy(): void {
    this.cancelAllAnimations();
    this.container = null;
    this.phaseCallbacks = [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export function createAnimationOrchestrator(): AnimationOrchestrator {
  return new AnimationOrchestrator();
}

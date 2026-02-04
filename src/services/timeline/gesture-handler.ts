// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE GESTURE HANDLER
// Unified handling for mouse and touch gestures
// ═══════════════════════════════════════════════════════════════════════════

import { GestureEvent, GestureType } from '@/domain/timeline/types';
import { distance } from '@/domain/timeline/calculations';

// ─────────────────────────────────────────────────────────────────────────────
// GESTURE STATE
// ─────────────────────────────────────────────────────────────────────────────

interface GestureState {
  isActive: boolean;
  type: GestureType | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  lastTime: number;
  velocityX: number;
  velocityY: number;
  // For pinch gestures
  initialPinchDistance: number;
  currentPinchDistance: number;
  pinchCenter: { x: number; y: number };
}

const initialState: GestureState = {
  isActive: false,
  type: null,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  startTime: 0,
  lastTime: 0,
  velocityX: 0,
  velocityY: 0,
  initialPinchDistance: 0,
  currentPinchDistance: 0,
  pinchCenter: { x: 0, y: 0 },
};

// ─────────────────────────────────────────────────────────────────────────────
// GESTURE HANDLER CLASS
// ─────────────────────────────────────────────────────────────────────────────

export type GestureCallback = (event: GestureEvent) => void;

export class GestureHandler {
  private element: HTMLElement | null = null;
  private state: GestureState = { ...initialState };
  private callbacks: Map<GestureType, GestureCallback[]> = new Map();

  // Configuration
  private readonly flickThreshold = 500; // pixels per second
  private readonly tapThreshold = 10; // pixels
  private readonly tapDuration = 300; // milliseconds
  private readonly longPressDelay = 500; // milliseconds

  private longPressTimeout: ReturnType<typeof setTimeout> | null = null;

  // ─────────────────────────────────────────────────────────────────────────
  // SETUP
  // ─────────────────────────────────────────────────────────────────────────

  attach(element: HTMLElement): void {
    this.detach();
    this.element = element;

    // Pointer events for unified handling
    element.addEventListener('pointerdown', this.handlePointerDown);
    element.addEventListener('pointermove', this.handlePointerMove);
    element.addEventListener('pointerup', this.handlePointerUp);
    element.addEventListener('pointercancel', this.handlePointerCancel);

    // Touch events for pinch
    element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd);

    // Prevent default touch behaviors
    element.style.touchAction = 'none';
  }

  detach(): void {
    if (!this.element) return;

    this.element.removeEventListener('pointerdown', this.handlePointerDown);
    this.element.removeEventListener('pointermove', this.handlePointerMove);
    this.element.removeEventListener('pointerup', this.handlePointerUp);
    this.element.removeEventListener('pointercancel', this.handlePointerCancel);

    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);

    this.element.style.touchAction = '';
    this.element = null;
    this.clearLongPressTimer();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EVENT SUBSCRIPTION
  // ─────────────────────────────────────────────────────────────────────────

  on(type: GestureType, callback: GestureCallback): () => void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, []);
    }
    this.callbacks.get(type)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private emit(event: GestureEvent): void {
    const callbacks = this.callbacks.get(event.type);
    if (callbacks) {
      callbacks.forEach((cb) => cb(event));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POINTER HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  private handlePointerDown = (e: PointerEvent): void => {
    if (!this.element) return;

    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedPosition = x / rect.width;

    this.state = {
      ...initialState,
      isActive: true,
      type: 'drag',
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      startTime: performance.now(),
      lastTime: performance.now(),
    };

    // Start long press timer
    this.startLongPressTimer(normalizedPosition, e);

    // Emit drag start
    this.emit({
      type: 'drag',
      position: normalizedPosition,
      velocity: 0,
      isStart: true,
      isEnd: false,
      originalEvent: e,
    });

    // Capture pointer for tracking outside element
    this.element.setPointerCapture(e.pointerId);
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (!this.state.isActive || !this.element) return;

    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedPosition = x / rect.width;

    const now = performance.now();
    const deltaTime = now - this.state.lastTime;
    const deltaX = x - this.state.currentX;

    // Calculate velocity
    const velocity = deltaTime > 0 ? (deltaX / deltaTime) * 1000 : 0;

    // Check if moved enough to cancel long press
    const totalDistance = distance(this.state.startX, this.state.startY, x, y);
    if (totalDistance > this.tapThreshold) {
      this.clearLongPressTimer();
    }

    this.state = {
      ...this.state,
      currentX: x,
      currentY: y,
      lastTime: now,
      velocityX: velocity * 0.3 + this.state.velocityX * 0.7, // Smooth
    };

    this.emit({
      type: 'drag',
      position: normalizedPosition,
      velocity: this.state.velocityX,
      isStart: false,
      isEnd: false,
      originalEvent: e,
    });
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (!this.state.isActive || !this.element) return;

    this.clearLongPressTimer();

    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const normalizedPosition = x / rect.width;

    const duration = performance.now() - this.state.startTime;
    const totalDistance = distance(
      this.state.startX,
      this.state.startY,
      this.state.currentX,
      this.state.currentY
    );

    // Determine gesture type
    let gestureType: GestureType = 'drag';

    if (totalDistance < this.tapThreshold && duration < this.tapDuration) {
      gestureType = 'tap';
    } else if (Math.abs(this.state.velocityX) > this.flickThreshold) {
      gestureType = 'flick';
    }

    this.emit({
      type: gestureType,
      position: normalizedPosition,
      velocity: this.state.velocityX,
      isStart: false,
      isEnd: true,
      originalEvent: e,
    });

    // Reset state
    this.state = { ...initialState };
    this.element.releasePointerCapture(e.pointerId);
  };

  private handlePointerCancel = (e: PointerEvent): void => {
    this.clearLongPressTimer();
    this.state = { ...initialState };
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TOUCH HANDLERS (for pinch)
  // ─────────────────────────────────────────────────────────────────────────

  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length !== 2 || !this.element) return;

    e.preventDefault();

    const rect = this.element.getBoundingClientRect();
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const dist = distance(
      touch1.clientX,
      touch1.clientY,
      touch2.clientX,
      touch2.clientY
    );

    const centerX = ((touch1.clientX + touch2.clientX) / 2 - rect.left) / rect.width;
    const centerY = ((touch1.clientY + touch2.clientY) / 2 - rect.top) / rect.height;

    this.state = {
      ...this.state,
      type: 'pinch',
      initialPinchDistance: dist,
      currentPinchDistance: dist,
      pinchCenter: { x: centerX, y: centerY },
    };

    this.emit({
      type: 'pinch',
      position: centerX,
      velocity: 0,
      scale: 1,
      isStart: true,
      isEnd: false,
      originalEvent: e,
    });
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length !== 2 || this.state.type !== 'pinch' || !this.element) return;

    e.preventDefault();

    const rect = this.element.getBoundingClientRect();
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const dist = distance(
      touch1.clientX,
      touch1.clientY,
      touch2.clientX,
      touch2.clientY
    );

    const scale = dist / this.state.initialPinchDistance;
    const centerX = ((touch1.clientX + touch2.clientX) / 2 - rect.left) / rect.width;

    this.state = {
      ...this.state,
      currentPinchDistance: dist,
      pinchCenter: { x: centerX, y: this.state.pinchCenter.y },
    };

    this.emit({
      type: 'pinch',
      position: centerX,
      velocity: 0,
      scale,
      isStart: false,
      isEnd: false,
      originalEvent: e,
    });
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    if (this.state.type !== 'pinch') return;

    const scale = this.state.currentPinchDistance / this.state.initialPinchDistance;

    this.emit({
      type: 'pinch',
      position: this.state.pinchCenter.x,
      velocity: 0,
      scale,
      isStart: false,
      isEnd: true,
      originalEvent: e,
    });

    this.state = { ...initialState };
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LONG PRESS
  // ─────────────────────────────────────────────────────────────────────────

  private startLongPressTimer(position: number, originalEvent: PointerEvent): void {
    this.clearLongPressTimer();

    this.longPressTimeout = setTimeout(() => {
      if (this.state.isActive) {
        this.emit({
          type: 'longPress',
          position,
          velocity: 0,
          isStart: true,
          isEnd: true,
          originalEvent,
        });
      }
    }, this.longPressDelay);
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────────────

  isGestureActive(): boolean {
    return this.state.isActive;
  }

  getCurrentGestureType(): GestureType | null {
    return this.state.type;
  }

  destroy(): void {
    this.detach();
    this.callbacks.clear();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export function createGestureHandler(): GestureHandler {
  return new GestureHandler();
}

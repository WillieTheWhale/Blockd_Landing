'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// MOUSE POSITION HOOK - Normalized mouse tracking for Three.js/interactions
// ═══════════════════════════════════════════════════════════════════════════

interface MousePosition {
  x: number; // -1 to 1 (normalized)
  y: number; // -1 to 1 (normalized)
  clientX: number; // Actual pixel position
  clientY: number;
  isMoving: boolean;
  velocity: number;
}

export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    clientX: 0,
    clientY: 0,
    isMoving: false,
    velocity: 0,
  });

  const lastPositionRef = useRef({ x: 0, y: 0, time: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now();
    const lastPos = lastPositionRef.current;

    // Calculate normalized position (-1 to 1)
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Calculate velocity
    const dx = x - lastPos.x;
    const dy = y - lastPos.y;
    const dt = Math.max(now - lastPos.time, 1);
    const velocity = Math.sqrt(dx * dx + dy * dy) / dt * 1000;

    lastPositionRef.current = { x, y, time: now };

    setPosition({
      x,
      y,
      clientX: e.clientX,
      clientY: e.clientY,
      isMoving: true,
      velocity: Math.min(velocity, 10), // Cap at 10 for sanity
    });

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set isMoving to false after 100ms of no movement
    timeoutRef.current = setTimeout(() => {
      setPosition((prev) => ({ ...prev, isMoving: false, velocity: 0 }));
    }, 100);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleMouseMove]);

  return position;
}

'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useReducedMotion } from './use-reduced-motion';

interface UseCountupOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  delay?: number;
}

export function useCountup({
  start = 0,
  end,
  duration = 1200,
  decimals = 0,
  delay = 0,
}: UseCountupOptions) {
  const [count, setCount] = useState(start);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;

    if (prefersReducedMotion) {
      setCount(end);
      return;
    }

    const startTime = performance.now() + delay;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (currentTime < startTime) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out function for natural deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = start + (end - start) * easeOut;

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [inView, start, end, duration, delay, prefersReducedMotion]);

  const formattedCount = count.toFixed(decimals);

  return { ref, count: formattedCount, rawCount: count };
}

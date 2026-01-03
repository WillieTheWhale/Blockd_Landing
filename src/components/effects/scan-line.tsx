'use client';

import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// ═══════════════════════════════════════════════════════════════════════════
// SCAN LINE EFFECT
// ═══════════════════════════════════════════════════════════════════════════

interface ScanLineProps {
  className?: string;
  color?: string;
  duration?: number;
}

export function ScanLine({
  className,
  color = '#3B82F6',
  duration = 10,
}: ScanLineProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      className={cn('scan-line', className)}
      style={{
        background: color,
        boxShadow: `0 0 30px ${color}`,
        animationDuration: `${duration}s`,
      }}
      aria-hidden="true"
    />
  );
}

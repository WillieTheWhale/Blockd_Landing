'use client';

import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════════════════
// BRUTALIST CARD WRAPPER
// No tilt, no perspective, no glass - just sharp borders
// ═══════════════════════════════════════════════════════════════════════════

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glareEnabled?: boolean;
  tiltAmount?: number;
  glowColor?: string;
}

export function TiltCard({
  children,
  className,
}: TiltCardProps) {
  return (
    <div
      className={cn(
        'bg-blockd-surface',
        'border-2 border-white/20',
        'hover:border-white',
        className
      )}
    >
      {children}
    </div>
  );
}

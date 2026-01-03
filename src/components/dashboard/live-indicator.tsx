'use client';

import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════════════════
// LIVE INDICATOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface LiveIndicatorProps {
  className?: string;
}

export function LiveIndicator({ className }: LiveIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Pulsing dot */}
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-blockd-risk-low live-pulse" />
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-blockd-risk-low animate-ping opacity-75" />
      </div>
      {/* Label */}
      <span className="text-xs font-mono uppercase tracking-wider text-blockd-risk-low">
        LIVE
      </span>
    </div>
  );
}

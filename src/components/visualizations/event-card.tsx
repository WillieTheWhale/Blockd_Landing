'use client';

import { motion } from 'framer-motion';
import {
  MonitorPlay,
  Clipboard,
  AppWindow,
  Cpu,
  Share2,
  AlertTriangle,
  Info,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { SecurityEvent, EventSeverity, EventType } from '@/types';
import { formatFullTimestamp } from '@/data/security-events';
import { cardVariants } from '@/lib/animations';

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY EVENT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SecurityEventCardProps {
  event: SecurityEvent;
  className?: string;
}

const severityColors: Record<EventSeverity, string> = {
  info: '#3B82F6',
  warning: '#FBBF24',
  critical: '#EF4444',
};

const severityIcons: Record<EventSeverity, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  critical: XCircle,
};

const typeIcons: Record<EventType, typeof AppWindow> = {
  window_focus: AppWindow,
  clipboard: Clipboard,
  process: Cpu,
  screen_recording: MonitorPlay,
  vm_detected: Cpu,
};

export function SecurityEventCard({ event, className }: SecurityEventCardProps) {
  const color = severityColors[event.severity];
  const SeverityIcon = severityIcons[event.severity];
  const TypeIcon = typeIcons[event.type] || AppWindow;

  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        'relative p-4 rounded-lg',
        'bg-blockd-surface/40',
        'border-l-[3px]',
        className
      )}
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <TypeIcon className="w-5 h-5" style={{ color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-blockd-light truncate">{event.title}</h4>
            <span className="text-xs font-mono text-blockd-muted/60 shrink-0">
              {formatFullTimestamp(event.timestamp)}
            </span>
          </div>
          <p className="text-sm text-blockd-muted mt-1">{event.description}</p>
        </div>
      </div>

      {/* Subtle glow effect on left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-px"
        style={{
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT LIST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface EventListProps {
  events: SecurityEvent[];
  className?: string;
}

export function EventList({ events, className }: EventListProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={cn('space-y-3', className)}
    >
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          variants={cardVariants}
          custom={index}
          transition={{ delay: index * 0.05 }}
        >
          <SecurityEventCard event={event} />
        </motion.div>
      ))}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT SUMMARY STATS
// ═══════════════════════════════════════════════════════════════════════════

interface EventSummaryProps {
  total: number;
  warnings: number;
  critical: number;
  className?: string;
}

export function EventSummary({ total, warnings, critical, className }: EventSummaryProps) {
  return (
    <div className={cn('flex items-center gap-6', className)}>
      <div className="text-center">
        <p className="text-2xl font-mono font-medium text-blockd-light tabular-nums">{total}</p>
        <p className="text-xs text-blockd-muted uppercase tracking-wider">Total Events</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-mono font-medium text-blockd-risk-medium tabular-nums">{warnings}</p>
        <p className="text-xs text-blockd-muted uppercase tracking-wider">Warnings</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-mono font-medium text-blockd-risk-critical tabular-nums">{critical}</p>
        <p className="text-xs text-blockd-muted uppercase tracking-wider">Critical</p>
      </div>
    </div>
  );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
import { highlightedEventVariants, getHighlightGlow } from '@/lib/timeline-animations';
import { SEVERITY_COLORS } from '@/lib/severity-colors';

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY EVENT CARD COMPONENT
// Displays a single security event with optional highlight state
// ═══════════════════════════════════════════════════════════════════════════

interface SecurityEventCardProps {
  event: SecurityEvent;
  isHighlighted?: boolean;
  onSeek?: (timestamp: number) => void;
  className?: string;
}

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

export function SecurityEventCard({ event, isHighlighted = false, onSeek, className }: SecurityEventCardProps) {
  const color = SEVERITY_COLORS[event.severity];
  const SeverityIcon = severityIcons[event.severity];
  const TypeIcon = typeIcons[event.type] || AppWindow;

  const handleClick = () => {
    onSeek?.(event.timestamp);
  };

  return (
    <motion.div
      data-event-id={event.id}
      variants={highlightedEventVariants}
      initial="initial"
      animate={isHighlighted ? 'highlighted' : 'visible'}
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'relative p-4 rounded-lg cursor-pointer',
        'bg-blockd-surface/40',
        'border-l-[3px]',
        'transition-all duration-300',
        isHighlighted && 'bg-blockd-accent/20 ring-2 ring-blockd-accent shadow-lg shadow-blockd-accent/30',
        className
      )}
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <motion.div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}20` }}
          animate={{
            scale: isHighlighted ? 1.1 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <TypeIcon className="w-5 h-5" style={{ color }} />
        </motion.div>

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

      {/* Glow effect on left border - pulses when highlighted */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-px pointer-events-none"
        animate={{
          boxShadow: getHighlightGlow(color, isHighlighted),
          opacity: isHighlighted ? [0.6, 1, 0.6] : 1,
        }}
        transition={{
          boxShadow: { duration: 0.3 },
          opacity: isHighlighted
            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3 },
        }}
      />

    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT LIST COMPONENT
// Renders a list of security events with optional highlighting
// ═══════════════════════════════════════════════════════════════════════════

interface EventListProps {
  events: SecurityEvent[];
  highlightedEventId?: string | null;
  onSeek?: (timestamp: number) => void;
  className?: string;
}

export function EventList({ events, highlightedEventId, onSeek, className }: EventListProps) {
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
          <SecurityEventCard
            event={event}
            isHighlighted={event.id === highlightedEventId}
            onSeek={onSeek}
          />
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

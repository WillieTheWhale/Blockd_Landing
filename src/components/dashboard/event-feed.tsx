'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, XCircle, AppWindow, Clipboard } from 'lucide-react';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════════════════
// EVENT FEED COMPONENT - Live scrolling events for Hero Dashboard
// ═══════════════════════════════════════════════════════════════════════════

interface MiniEvent {
  id: number;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

const sampleEvents: Omit<MiniEvent, 'id'>[] = [
  { title: 'Window focus change', severity: 'info', timestamp: '14:23:07' },
  { title: 'Clipboard paste detected', severity: 'warning', timestamp: '14:23:15' },
  { title: 'Tab switch detected', severity: 'info', timestamp: '14:23:22' },
  { title: 'Attention score: 0.87', severity: 'info', timestamp: '14:23:30' },
  { title: 'Off-screen gaze', severity: 'warning', timestamp: '14:23:38' },
  { title: 'Normal focus pattern', severity: 'info', timestamp: '14:23:45' },
];

const severityColors = {
  info: '#687193',
  warning: '#FBBF24',
  critical: '#F87171',
};

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: XCircle,
};

interface EventFeedProps {
  className?: string;
}

export function EventFeed({ className }: EventFeedProps) {
  const [events, setEvents] = useState<MiniEvent[]>([]);
  const [eventId, setEventId] = useState(0);

  // Add initial events
  useEffect(() => {
    const initialEvents = sampleEvents.slice(0, 3).map((e, i) => ({
      ...e,
      id: i,
    }));
    setEvents(initialEvents);
    setEventId(3);
  }, []);

  // Add new events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvent = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      const newEvent = {
        ...randomEvent,
        id: eventId,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 2)]);
      setEventId((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [eventId]);

  return (
    <div className={cn('space-y-2 overflow-hidden', className)}>
      <AnimatePresence mode="popLayout">
        {events.map((event) => {
          const Icon = severityIcons[event.severity];
          const color = severityColors[event.severity];

          return (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-xs p-2 rounded bg-blockd-surface/30"
            >
              <Icon className="w-3 h-3 shrink-0" style={{ color }} />
              <span className="text-blockd-muted truncate flex-1">{event.title}</span>
              <span className="text-blockd-muted/60 font-mono text-[10px] shrink-0">
                {event.timestamp}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

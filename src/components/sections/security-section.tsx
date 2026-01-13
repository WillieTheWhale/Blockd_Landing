'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Monitor, Cpu, Share2, Clipboard } from 'lucide-react';
import { fadeInUp, staggerContainer, cardVariants } from '@/lib/animations';
import { Section, SectionHeader } from '@/components/layout/section';
import { Timeline } from '@/components/visualizations/timeline';
import { EventList, EventSummary } from '@/components/visualizations/event-card';
import { sampleSecurityEvents, getEventSummary } from '@/data/security-events';

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY MONITORING SECTION
// ═══════════════════════════════════════════════════════════════════════════

const detectionCategories = [
  {
    icon: Monitor,
    title: 'Screen Recording',
    examples: 'OBS, Camtasia, QuickTime—via capture API monitoring',
  },
  {
    icon: Cpu,
    title: 'Virtual Machines',
    examples: 'CPUID, registry, and SMBIOS detection for VMware, VirtualBox, Parallels',
  },
  {
    icon: Share2,
    title: 'Remote Access',
    examples: 'TeamViewer, AnyDesk, RDP—process and network detection',
  },
  {
    icon: Clipboard,
    title: 'Clipboard Monitoring',
    examples: 'Content hashing for copy/paste correlation with AI responses',
  },
];

// Find the closest event within threshold (30 seconds for a 45min timeline)
function findHighlightedEvent(time: number, threshold: number = 30): string | null {
  let closest: { id: string; distance: number } | null = null;

  for (const event of sampleSecurityEvents) {
    const distance = Math.abs(event.timestamp - time);
    if (distance <= threshold) {
      if (!closest || distance < closest.distance) {
        closest = { id: event.id, distance };
      }
    }
  }

  return closest?.id ?? null;
}

export function SecuritySection() {
  const summary = getEventSummary(sampleSecurityEvents);

  // Use MotionValue to avoid re-renders during drag
  const timeMotion = useMotionValue(0);

  // Only use state for the highlighted event (throttled updates)
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

  // Refs for throttling
  const lastHighlightRef = useRef<string | null>(null);
  const eventListRef = useRef<HTMLDivElement>(null);
  const seekFnRef = useRef<((time: number) => void) | null>(null);

  // Subscribe to time changes and update highlighted event (throttled)
  useEffect(() => {
    const unsubscribe = timeMotion.on('change', (time) => {
      const newHighlight = findHighlightedEvent(time);

      // Only update state if highlight actually changed
      if (newHighlight !== lastHighlightRef.current) {
        lastHighlightRef.current = newHighlight;
        setHighlightedEventId(newHighlight);
      }
    });

    return unsubscribe;
  }, [timeMotion]);

  // Auto-scroll to highlighted event with smooth animation
  useEffect(() => {
    if (highlightedEventId && eventListRef.current) {
      const container = eventListRef.current;
      const eventElement = container.querySelector(
        `[data-event-id="${highlightedEventId}"]`
      ) as HTMLElement | null;

      if (eventElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = eventElement.getBoundingClientRect();

        // Calculate target scroll position (center the element in view)
        const elementTop = elementRect.top - containerRect.top + container.scrollTop;
        const targetScroll = elementTop - (containerRect.height / 2) + (elementRect.height / 2);
        const clampedTarget = Math.max(0, Math.min(targetScroll, container.scrollHeight - containerRect.height));

        // Animate scroll with easing
        animate(container.scrollTop, clampedTarget, {
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1], // Smooth ease-out curve
          onUpdate: (value) => {
            container.scrollTop = value;
          },
        });
      }
    }
  }, [highlightedEventId]);

  // Handle time change from timeline (no-op, just for MotionValue sync)
  const handleTimeChange = useCallback((time: number) => {
    timeMotion.set(time);
  }, [timeMotion]);

  // Store seek function
  const handleSeekReady = useCallback((fn: (time: number) => void) => {
    seekFnRef.current = fn;
  }, []);

  // Handle clicking on an event to seek
  const handleEventSeek = useCallback((timestamp: number) => {
    seekFnRef.current?.(timestamp);
  }, []);

  return (
    <Section id="security">
      <SectionHeader
        title="Nothing Escapes Notice"
        subtitle="Our custom Chromium browser provides native desktop monitoring that browser extensions simply can't achieve: VM detection via CPUID and registry checks, screen recording detection, remote access tool identification, and comprehensive process monitoring."
      />

      {/* Timeline */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-blockd-surface border-2 border-white/20 p-6 mb-8"
      >
        <h3 className="font-display font-semibold text-lg text-blockd-light mb-4">
          Session Timeline
        </h3>
        <Timeline
          events={sampleSecurityEvents}
          duration={2700}
          onTimeChange={handleTimeChange}
          onSeekReady={handleSeekReady}
          highlightedEventId={highlightedEventId}
        />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Event List */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-blockd-light">
              Security Events
            </h3>
            <EventSummary
              total={summary.total}
              warnings={summary.warnings}
              critical={summary.critical}
            />
          </div>
          <div
            ref={eventListRef}
            className="h-[400px] overflow-y-auto custom-scrollbar"
          >
            <div className="px-3 py-1">
              <EventList
                events={sampleSecurityEvents.slice(0, 8)}
                highlightedEventId={highlightedEventId}
                onSeek={handleEventSeek}
              />
            </div>
          </div>
        </motion.div>

        {/* Detection Categories */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          {detectionCategories.map((category) => (
            <motion.div
              key={category.title}
              variants={cardVariants}
              className="bg-blockd-surface border-2 border-white/20 hover:border-white p-5"
            >
              <div className="w-10 h-10 rounded-lg bg-blockd-accent/10 flex items-center justify-center mb-3">
                <category.icon className="w-5 h-5 text-blockd-accent" />
              </div>
              <h4 className="font-display font-semibold text-blockd-light mb-1">
                {category.title}
              </h4>
              <p className="text-xs text-blockd-muted">
                {category.examples}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Cpu, Share2, Clipboard } from 'lucide-react';
import { cn } from '@/lib/cn';
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

export function SecuritySection() {
  const summary = getEventSummary(sampleSecurityEvents);
  const [currentTime, setCurrentTime] = useState(0);

  // Show events up to current timeline position
  const visibleEvents = sampleSecurityEvents.filter(
    (event) => event.timestamp <= currentTime
  );

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
        className="glass-panel p-6 mb-8"
      >
        <h3 className="font-display font-semibold text-lg text-blockd-light mb-4">
          Session Timeline
        </h3>
        <Timeline
          events={sampleSecurityEvents}
          duration={2700} // 45 minutes
          onTimeChange={setCurrentTime}
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
          <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <EventList events={sampleSecurityEvents.slice(0, 8)} />
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
              className="glass-panel glass-hover p-5"
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

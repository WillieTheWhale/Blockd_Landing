'use client';

import { motion } from 'framer-motion';
import { Eye, AlertTriangle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { fadeInUp, staggerContainer, cardVariants } from '@/lib/animations';
import { Section, SectionHeader } from '@/components/layout/section';
import { GazeHeatmap } from '@/components/visualizations/gaze-heatmap';
import { normalGazeSession, suspiciousGazeSession } from '@/data/gaze-data';

// ═══════════════════════════════════════════════════════════════════════════
// GAZE INTELLIGENCE SECTION
// ═══════════════════════════════════════════════════════════════════════════

const features = [
  {
    icon: Eye,
    title: '30 FPS Tracking',
    description: 'MediaPipe FaceMesh with 468 landmarks and Kalman filtering for sub-50ms latency',
  },
  {
    icon: AlertTriangle,
    title: 'Off-Screen Detection',
    description: 'Directional categorization (up, down, left, right) with dwell time analysis',
  },
  {
    icon: BarChart3,
    title: 'Pattern Recognition',
    description: 'LSTM autoencoder trained on reading patterns with calibration scoring',
  },
];

export function GazeSection() {
  return (
    <Section id="gaze-intelligence">
      <SectionHeader
        title="Eyes Don't Lie"
        subtitle="MediaPipe's 468-point facial landmark detection tracks gaze patterns at 30 FPS. Off-screen glances, reading patterns, and attention drift are captured in real-time."
      />

      {/* Heatmap Visualization */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mb-16"
      >
        <GazeHeatmap
          normalData={normalGazeSession}
          suspiciousData={suspiciousGazeSession}
        />
      </motion.div>

      {/* Feature Points */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={cardVariants}
            className="glass-panel glass-hover p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blockd-accent/10 flex items-center justify-center">
              <feature.icon className="w-6 h-6 text-blockd-accent" />
            </div>
            <h3 className="font-display font-semibold text-lg text-blockd-light mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-blockd-muted">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

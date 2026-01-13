'use client';

import { motion } from 'framer-motion';
import { Download, FileText, BarChart, Eye, Shield } from 'lucide-react';
import { cn } from '@/lib/cn';
import { fadeInUp, cardVariants, staggerContainer } from '@/lib/animations';
import { Section, SectionHeader } from '@/components/layout/section';
import { Button } from '@/components/ui/button';

// ═══════════════════════════════════════════════════════════════════════════
// REPORT SECTION
// ═══════════════════════════════════════════════════════════════════════════

function ReportPreview() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="relative"
    >
      {/* Stacked report pages */}
      <div className="relative max-w-md mx-auto">
        {/* Page 3 (back) */}
        <div
          className="absolute inset-x-0 top-4 h-[400px] rounded-xl border border-blockd-muted/20 bg-blockd-surface/60"
          style={{
            transform: 'rotate(3deg) translateY(20px)',
          }}
        />

        {/* Page 2 (middle) */}
        <div
          className="absolute inset-x-0 top-2 h-[400px] rounded-xl border border-blockd-muted/30 bg-blockd-surface/80"
          style={{
            transform: 'rotate(-2deg) translateY(10px)',
          }}
        />

        {/* Page 1 (front) - Main report preview */}
        <motion.div
          className="relative bg-blockd-surface border-2 border-white/30 p-6 h-[400px] overflow-hidden"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          {/* Report header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blockd-muted/10">
            <div className="w-10 h-10 rounded-lg bg-blockd-accent flex items-center justify-center">
              <span className="font-display font-bold text-white">B</span>
            </div>
            <div>
              <h4 className="font-display font-semibold text-blockd-light">
                Interview Report
              </h4>
              <p className="text-xs text-blockd-muted">
                Session: INTERVIEW-2026-001
              </p>
            </div>
          </div>

          {/* Summary section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blockd-surface/30">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blockd-accent" />
                <span className="text-sm text-blockd-muted">Risk Score</span>
              </div>
              <span className="font-mono font-medium text-blockd-risk-low">0.21</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-blockd-surface/30">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blockd-accent" />
                <span className="text-sm text-blockd-muted">Attention Score</span>
              </div>
              <span className="font-mono font-medium text-blockd-light">0.89</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-blockd-surface/30">
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4 text-blockd-accent" />
                <span className="text-sm text-blockd-muted">AI Similarity</span>
              </div>
              <span className="font-mono font-medium text-blockd-light">21%</span>
            </div>
          </div>

          {/* Key findings */}
          <div className="mt-6 pt-4 border-t border-blockd-muted/10">
            <h5 className="text-xs font-mono uppercase tracking-wider text-blockd-muted mb-3">
              Key Findings
            </h5>
            <ul className="space-y-2 text-sm text-blockd-muted">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blockd-risk-low mt-1.5 shrink-0" />
                No reading patterns detected
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blockd-risk-low mt-1.5 shrink-0" />
                Natural gaze distribution
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blockd-risk-medium mt-1.5 shrink-0" />
                2 minor security events
              </li>
            </ul>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}

export function ReportSection() {
  return (
    <Section id="report">
      <SectionHeader
        title="Comprehensive Evidence Reports"
        subtitle="Every interview generates a detailed report with gaze heatmaps, AI analysis, security events, and risk assessment. The human makes the final call—with full evidence to support it."
      />

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Report Preview */}
        <ReportPreview />

        {/* Report Features */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-6"
        >
          <motion.div variants={fadeInUp} className="space-y-4">
            {[
              {
                icon: Eye,
                title: 'Gaze Analysis',
                description: 'Complete heatmap visualization with attention metrics and off-screen event tracking',
              },
              {
                icon: BarChart,
                title: 'AI Detection Results',
                description: 'Similarity scores across multiple LLMs with confidence intervals',
              },
              {
                icon: Shield,
                title: 'Security Timeline',
                description: 'Chronological log of all security events with severity ratings',
              },
              {
                icon: FileText,
                title: 'Exportable Evidence',
                description: 'PDF reports, raw data exports, and API access for integration',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-blockd-accent/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-blockd-accent" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-blockd-light">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-blockd-muted mt-1">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Button
              variant="secondary"
              icon={<Download className="w-5 h-5" />}
            >
              Download Sample Report
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/cn';
import { barVariants, staggerContainerSlow } from '@/lib/animations';

// ═══════════════════════════════════════════════════════════════════════════
// SIMILARITY BAR CHART COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SimilarityData {
  gpt4: number;
  claude: number;
  gemini: number;
}

interface SimilarityChartProps {
  data: SimilarityData;
  className?: string;
}

function getBarColor(value: number): string {
  if (value < 40) return '#22C55E';
  if (value < 70) return '#FBBF24';
  return '#EF4444';
}

interface BarProps {
  label: string;
  value: number;
  delay: number;
}

function Bar({ label, value, delay }: BarProps) {
  const color = getBarColor(value);

  return (
    <div className="flex items-center gap-4">
      {/* Label */}
      <span className="w-24 text-sm text-blockd-muted shrink-0">{label}</span>

      {/* Track and bar */}
      <div className="flex-1 h-8 rounded bg-blockd-surface/30 relative overflow-hidden">
        <motion.div
          className="h-full rounded"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}40`,
          }}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.8,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${color}20 50%, transparent 100%)`,
          }}
          initial={{ x: '-100%' }}
          whileInView={{ x: '200%' }}
          viewport={{ once: true }}
          transition={{
            duration: 1.5,
            delay: delay + 0.5,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Value */}
      <motion.span
        className="w-12 text-right font-mono text-sm tabular-nums"
        style={{ color }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.3 }}
      >
        {value}%
      </motion.span>
    </div>
  );
}

export function SimilarityChart({ data, className }: SimilarityChartProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Bar label="GPT-4" value={data.gpt4} delay={0} />
      <Bar label="Claude" value={data.claude} delay={0.1} />
      <Bar label="Gemini" value={data.gemini} delay={0.2} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DETECTION COMPARISON CHART - For Problem Section
// ═══════════════════════════════════════════════════════════════════════════

interface DetectionData {
  label: string;
  traditional: number;
  blockd: number;
}

interface DetectionComparisonChartProps {
  data: DetectionData[];
  className?: string;
}

export function DetectionComparisonChart({ data, className }: DetectionComparisonChartProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {data.map((item, index) => (
        <div key={item.label} className="space-y-2">
          {/* Label */}
          <p className="text-sm text-blockd-muted">{item.label}</p>

          {/* Bars container */}
          <div className="space-y-2">
            {/* Traditional */}
            <div className="flex items-center gap-3">
              <span className="w-32 text-xs text-blockd-muted/60 shrink-0">Traditional</span>
              <div className="flex-1 h-6 rounded bg-blockd-surface/30 relative overflow-hidden">
                <motion.div
                  className="h-full rounded bg-blockd-muted/40"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.traditional}%` }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              </div>
              <span className="w-12 text-right font-mono text-xs text-blockd-muted/60 tabular-nums">
                {item.traditional}%
              </span>
            </div>

            {/* Blockd */}
            <div className="flex items-center gap-3">
              <span className="w-32 text-xs text-blockd-accent shrink-0">Blockd</span>
              <div className="flex-1 h-6 rounded bg-blockd-surface/30 relative overflow-hidden">
                <motion.div
                  className="h-full rounded"
                  style={{
                    background: 'linear-gradient(90deg, #3B82F6 0%, #22C55E 100%)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.blockd}%` }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1 + 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              </div>
              <motion.span
                className="w-12 text-right font-mono text-xs text-blockd-accent tabular-nums"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {item.blockd}%
              </motion.span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

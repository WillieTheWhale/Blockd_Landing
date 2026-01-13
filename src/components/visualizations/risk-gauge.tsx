'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED RISK GAUGE - Dramatic Arc Gauge with Glow Effects
// ═══════════════════════════════════════════════════════════════════════════

interface RiskGaugeProps {
  value: number; // 0-1
  size?: number;
  className?: string;
}

function getRiskLevel(value: number): { label: string; color: string; glowColor: string } {
  if (value < 0.5) return { label: 'MINIMAL', color: '#687193', glowColor: 'rgba(104, 113, 147, 0.5)' };
  if (value < 0.7) return { label: 'LOW', color: '#4ADE80', glowColor: 'rgba(74, 222, 128, 0.5)' };
  if (value < 0.85) return { label: 'MEDIUM', color: '#FBBF24', glowColor: 'rgba(251, 191, 36, 0.5)' };
  return { label: 'HIGH', color: '#F87171', glowColor: 'rgba(248, 113, 113, 0.5)' };
}

export function RiskGauge({ value, size = 200, className }: RiskGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  const risk = getRiskLevel(value);

  // Animate the value counting up
  useEffect(() => {
    if (!inView) return;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic with slight overshoot
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, value, prefersReducedMotion]);

  // SVG Arc calculations
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;

  // Arc path for half circle (bottom to top, clockwise)
  const arcPath = `
    M ${strokeWidth / 2} ${size / 2}
    A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}
  `;

  // Tick marks for the gauge
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i / tickCount);

  return (
    <div ref={ref} className={cn('relative group', className)} style={{ width: size, height: size / 2 + 50 }}>
      <svg
        width={size}
        height={size / 2 + 20}
        viewBox={`0 0 ${size} ${size / 2 + 20}`}
        className="overflow-visible"
      >
        {/* Definitions for gradients and filters */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#687193" />
            <stop offset="40%" stopColor="#4ADE80" />
            <stop offset="70%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track with subtle gradient - lighter for dark mode */}
        <path
          d={arcPath}
          fill="none"
          stroke="rgba(104, 113, 147, 0.25)"
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
        />

        <path
          d={arcPath}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.15}
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => {
          const angle = Math.PI - tick * Math.PI;
          const innerRadius = radius - 20;
          const outerRadius = radius - 10;
          const x1 = size / 2 + Math.cos(angle) * innerRadius;
          const y1 = size / 2 - Math.sin(angle) * innerRadius;
          const x2 = size / 2 + Math.cos(angle) * outerRadius;
          const y2 = size / 2 - Math.sin(angle) * outerRadius;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(104, 113, 147, 0.4)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}

        {/* Animated glow effect behind the progress */}
        <motion.path
          d={arcPath}
          fill="none"
          stroke={risk.color}
          strokeWidth={strokeWidth + 12}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: inView ? displayValue : 0,
            opacity: 0.2,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.2,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.2,
          }}
          style={{
            filter: 'blur(15px)',
          }}
        />

        {/* Progress arc */}
        <motion.path
          d={arcPath}
          fill="none"
          stroke={risk.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? displayValue : 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.2,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.2,
          }}
          filter="url(#glow)"
        />

        {/* Bright tip glow */}
        {inView && displayValue > 0.01 && (
          <motion.circle
            cx={size / 2 + Math.cos(Math.PI - displayValue * Math.PI) * radius}
            cy={size / 2 - Math.sin(Math.PI - displayValue * Math.PI) * radius}
            r={8}
            fill={risk.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
            transition={{
              opacity: { duration: 1.5, repeat: Infinity },
              scale: { delay: 1 },
            }}
            filter="url(#strongGlow)"
          />
        )}

        {/* Center decoration */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={4}
          fill={risk.color}
          opacity={0.6}
        />
      </svg>

      {/* Center value with enhanced styling */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <motion.p
          className="text-4xl font-mono font-bold tabular-nums text-blockd-light"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.8 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          style={{
            textShadow: inView ? `0 0 20px ${risk.glowColor}` : 'none',
          }}
        >
          {displayValue.toFixed(2)}
        </motion.p>
        <motion.p
          className="text-xs font-mono uppercase tracking-widest mt-1 font-medium"
          style={{ color: risk.color }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 10 }}
          transition={{ delay: 0.5 }}
        >
          {risk.label}
        </motion.p>
      </div>

      {/* Hover effect indicator */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          background: `radial-gradient(circle at center, ${risk.glowColor} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED MINI RISK GAUGE - For dashboard preview
// ═══════════════════════════════════════════════════════════════════════════

interface MiniRiskGaugeProps {
  value: number;
  className?: string;
  showGlow?: boolean;
}

export function MiniRiskGauge({ value, className, showGlow = true }: MiniRiskGaugeProps) {
  const risk = getRiskLevel(value);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Enhanced progress bar with glow */}
      <div className="flex-1 h-2.5 rounded-full bg-blockd-surface/40 overflow-hidden relative">
        {/* Glow background */}
        {showGlow && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: risk.color }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: `${value * 100}%`, opacity: 0.3 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        )}

        {/* Main bar */}
        <motion.div
          className="h-full rounded-full relative"
          style={{
            backgroundColor: risk.color,
            boxShadow: showGlow ? `0 0 10px ${risk.glowColor}` : 'none',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, delay: 1, repeat: 1 }}
          />
        </motion.div>
      </div>

      {/* Value with color */}
      <motion.span
        className="text-sm font-mono font-medium tabular-nums min-w-[3rem] text-right"
        style={{ color: risk.color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {value.toFixed(2)}
      </motion.span>
    </div>
  );
}

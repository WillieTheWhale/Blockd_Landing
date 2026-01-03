'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useScrollSection, SECTION_COLORS } from '@/hooks/use-scroll-section';

// ═══════════════════════════════════════════════════════════════════════════
// CURSOR GLOW EFFECT
// Smooth mouse-following glow that changes color based on section
// PERFORMANCE: Optimized to reduce state updates and re-renders
// ═══════════════════════════════════════════════════════════════════════════

export function CursorGlow() {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const { activeSection } = useScrollSection();
  // PERFORMANCE: Track visibility to avoid redundant setIsVisible calls
  const isVisibleRef = useRef(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = useMemo(() => ({ damping: 25, stiffness: 150 }), []);
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const color = SECTION_COLORS[activeSection] || '#3B82F6';

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      // PERFORMANCE: Only call setIsVisible if visibility actually changed
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      // PERFORMANCE: Only call setIsVisible if visibility actually changed
      if (isVisibleRef.current) {
        isVisibleRef.current = false;
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Large outer glow */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          x,
          y,
          width: 400,
          height: 400,
          marginLeft: -200,
          marginTop: -200,
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        }}
      />

      {/* Inner glow */}
      <motion.div
        className="absolute rounded-full blur-xl"
        style={{
          x,
          y,
          width: 150,
          height: 150,
          marginLeft: -75,
          marginTop: -75,
          background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
        }}
      />

      {/* Core dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          x,
          y,
          width: 8,
          height: 8,
          marginLeft: -4,
          marginTop: -4,
          background: color,
          boxShadow: `0 0 20px ${color}`,
        }}
      />
    </motion.div>
  );
}

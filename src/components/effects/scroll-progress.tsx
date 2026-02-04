'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useScrollSection, SECTION_COLORS } from '@/hooks/use-scroll-section';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS INDICATOR
// Cinematic progress bar with section markers and color transitions
// ═══════════════════════════════════════════════════════════════════════════

const SECTION_NAMES: Record<string, string> = {
  hero: 'Home',
  problem: 'Problem',
  gaze: 'Eye Tracking',
  'ai-detection': 'AI Detection',
  security: 'Security',
  report: 'Report',
  architecture: 'Architecture',
  scale: 'Scale',
  cta: 'Get Started',
};

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const { activeSection, overallProgress } = useScrollSection();
  const prefersReducedMotion = useReducedMotion();

  // Smooth spring animation for progress
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Get active section color
  const sectionColor = SECTION_COLORS[activeSection] || '#687193';

  if (prefersReducedMotion) {
    return (
      <div className="scroll-progress">
        <div
          className="scroll-progress-bar"
          style={{ transform: `scaleX(${overallProgress})` }}
        />
      </div>
    );
  }

  return (
    <>
      {/* Main progress bar */}
      <div className="scroll-progress">
        <motion.div
          className="scroll-progress-bar"
          style={{
            scaleX,
            background: `linear-gradient(90deg, ${sectionColor}, ${sectionColor}cc)`,
            boxShadow: `0 0 20px ${sectionColor}80`,
          }}
        />
      </div>

      {/* Section indicator (appears after scrolling past hero) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: overallProgress > 0.05 ? 1 : 0,
          x: overallProgress > 0.05 ? 0 : -20,
        }}
        transition={{ duration: 0.3 }}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block"
      >
        <div className="flex flex-col gap-2 items-start">
          {Object.entries(SECTION_NAMES).map(([id, name]) => {
            const isActive = id === activeSection;
            const color = SECTION_COLORS[id] || '#687193';

            return (
              <motion.a
                key={id}
                href={`#${id}`}
                className="group flex items-center gap-3"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                {/* Dot indicator */}
                <motion.div
                  className="relative"
                  animate={{
                    scale: isActive ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="w-2 h-2 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: isActive ? color : 'rgba(203, 213, 225, 0.3)',
                    }}
                  />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: color }}
                      animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Section name */}
                <span
                  className="text-xs font-mono transition-colors duration-300 opacity-0 group-hover:opacity-100"
                  style={{ color: isActive ? color : 'rgba(203, 213, 225, 0.5)' }}
                >
                  {name}
                </span>
              </motion.a>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

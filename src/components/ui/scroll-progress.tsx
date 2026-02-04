'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS INDICATOR - Visual feedback for page scroll position
// ═══════════════════════════════════════════════════════════════════════════

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #687193, #9099BB, #B5BAD1)',
        boxShadow: '0 0 10px rgba(104, 113, 147, 0.5), 0 0 20px rgba(104, 113, 147, 0.3)',
      }}
    />
  );
}

'use client';

import dynamic from 'next/dynamic';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WaitlistProvider } from '@/contexts/waitlist-context';
import { WaitlistModal } from '@/components/ui/waitlist-modal';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { ProblemSection } from '@/components/sections/problem-section';
import { GazeSection } from '@/components/sections/gaze-section';
import { AIDetectionSection } from '@/components/sections/ai-detection-section';
import { SecuritySection } from '@/components/sections/security-section';
import { ReportSection } from '@/components/sections/report-section';
import { ArchitectureSection } from '@/components/sections/architecture-section';
import { ScaleSection } from '@/components/sections/scale-section';
import { CTASection } from '@/components/sections/cta-section';

// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC IMPORTS FOR CLIENT-SIDE ONLY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const ParticleField = dynamic(
  () => import('@/components/three/particle-field').then((mod) => mod.ParticleField),
  {
    ssr: false,
    loading: () => null,
  }
);

const ScrollProgress = dynamic(
  () => import('@/components/effects/scroll-progress').then((mod) => mod.ScrollProgress),
  {
    ssr: false,
    loading: () => null,
  }
);

const CursorGlow = dynamic(
  () => import('@/components/effects/cursor-glow').then((mod) => mod.CursorGlow),
  {
    ssr: false,
    loading: () => null,
  }
);

const ScrollBackgroundGradient = dynamic(
  () => import('@/components/effects/scroll-background-gradient').then((mod) => mod.ScrollBackgroundGradient),
  {
    ssr: false,
    loading: () => null,
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function Home() {
  return (
    <WaitlistProvider>
      <TooltipProvider>
        {/* Waitlist Modal */}
        <WaitlistModal />

        {/* Three.js Background */}
        <ParticleField />

        {/* Scroll-linked Background Color Gradient */}
        <ScrollBackgroundGradient />

        {/* Scroll Progress Indicator */}
        <ScrollProgress />

        {/* Cursor Glow Effect */}
        <CursorGlow />

        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main id="main-content" className="relative z-10">
          <HeroSection />
          <ProblemSection />
          <GazeSection />
          <AIDetectionSection />
          <SecuritySection />
          <ReportSection />
          <ArchitectureSection />
          <ScaleSection />
          <CTASection />
        </main>

        {/* Footer */}
        <Footer />
      </TooltipProvider>
    </WaitlistProvider>
  );
}

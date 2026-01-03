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

        {/* Scroll Progress Indicator */}
        <ScrollProgress />

        {/* Cursor Glow Effect */}
        <CursorGlow />

        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main id="main-content" className="relative z-10">
          {/* Hero Section */}
          <section id="hero">
            <HeroSection />
          </section>

          {/* Problem / Detection Comparison */}
          <section id="problem">
            <ProblemSection />
          </section>

          {/* Gaze Intelligence */}
          <section id="gaze">
            <GazeSection />
          </section>

          {/* AI Detection */}
          <section id="ai-detection">
            <AIDetectionSection />
          </section>

          {/* Security Monitoring */}
          <section id="security">
            <SecuritySection />
          </section>

          {/* Evidence Reports */}
          <section id="report">
            <ReportSection />
          </section>

          {/* Architecture & Technology Stack */}
          <section id="architecture">
            <ArchitectureSection />
          </section>

          {/* Enterprise Scale & Integration */}
          <section id="scale">
            <ScaleSection />
          </section>

          {/* Final CTA */}
          <section id="cta">
            <CTASection />
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </TooltipProvider>
    </WaitlistProvider>
  );
}

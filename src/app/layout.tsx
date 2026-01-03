import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import './globals.css';

// ═══════════════════════════════════════════════════════════════════════════
// FONT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const spaceGrotesk = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

// ═══════════════════════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: 'Blockd - Interview Integrity Platform | AI-Powered Cheating Detection',
  description:
    "Ensure candidates are evaluated on their actual abilities with Blockd's AI-powered interview security platform. Native browser monitoring, multi-LLM detection, real-time eye tracking.",
  keywords: [
    'interview security',
    'cheating detection',
    'AI proctoring',
    'remote hiring',
    'technical interviews',
    'eye tracking',
    'candidate assessment',
  ],
  openGraph: {
    type: 'website',
    title: 'Blockd - Evidence, Not Accusations',
    description:
      'The interview integrity platform that understands interviews—not just watches them. AI-powered detection, native browser security, comprehensive evidence.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blockd - Interview Integrity Platform',
    description:
      'AI-powered cheating detection for remote technical interviews. Evidence, not accusations.',
    images: ['/og-image.png'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOT LAYOUT
// ═══════════════════════════════════════════════════════════════════════════

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-blockd-void text-blockd-light`}
      >
        {/* Scroll Progress Indicator */}
        <ScrollProgress />

        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blockd-accent focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>

        {children}
      </body>
    </html>
  );
}

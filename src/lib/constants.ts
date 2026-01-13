// ═══════════════════════════════════════════════════════════════════════════
// BLOCKD CONSTANTS
// Re-exports from theme system for backward compatibility
// ═══════════════════════════════════════════════════════════════════════════

// Import from centralized theme system
export { COLORS } from '@/theme/colors';

export const ANIMATION = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
    slowest: 1200,
  },
  easing: {
    out: [0.25, 0.46, 0.45, 0.94] as const,
    spring: [0.34, 1.56, 0.64, 1] as const,
    smooth: [0.4, 0, 0.2, 1] as const,
  },
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
  },
} as const;

export const BREAKPOINTS = {
  mobile: 639,
  tablet: 1023,
  desktop: 1279,
  large: 1535,
} as const;

export const SITE_CONFIG = {
  name: 'Blockd',
  tagline: 'Interview integrity, verified.',
  description: 'Ensure candidates are evaluated on their actual abilities with Blockd\'s AI-powered interview security platform.',
  url: 'https://blockd.io',
} as const;

export const NAV_LINKS = [
  { label: 'Product', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Documentation', href: '#' },
] as const;

export const FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Enterprise', href: '#' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Status', href: '#' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
} as const;

export const SOCIAL_LINKS = [
  { label: 'Twitter', href: '#', icon: 'twitter' },
  { label: 'LinkedIn', href: '#', icon: 'linkedin' },
  { label: 'GitHub', href: '#', icon: 'github' },
] as const;

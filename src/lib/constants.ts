// ═══════════════════════════════════════════════════════════════════════════
// BLOCKD CONSTANTS
// Re-exports from theme system for backward compatibility
// ═══════════════════════════════════════════════════════════════════════════

// Import from centralized theme system
export { COLORS } from '@/theme/colors';

// Platform URLs - configurable via environment variables
export const PLATFORM_CONFIG = {
  platformUrl: process.env.NEXT_PUBLIC_BLOCKD_PLATFORM_URL || 'http://localhost:5173',
  apiUrl: process.env.NEXT_PUBLIC_BLOCKD_API_URL || 'http://localhost:3000',
  docsUrl: 'https://docs.blockd.site',
} as const;

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
  url: 'https://blockd.site',
} as const;

export const NAV_LINKS = [
  { label: 'Product', href: '#architecture' },
  { label: 'Pricing', href: '#scale' },
  { label: 'Documentation', href: PLATFORM_CONFIG.docsUrl },
] as const;

// Authentication URLs for the platform
export const AUTH_URLS = {
  login: `${PLATFORM_CONFIG.platformUrl}/login`,
  register: `${PLATFORM_CONFIG.platformUrl}/register`,
  dashboard: `${PLATFORM_CONFIG.platformUrl}/dashboard`,
} as const;

export const FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '#architecture' },
    { label: 'Pricing', href: '#scale' },
    { label: 'Security', href: '#security' },
    { label: 'Enterprise', href: 'mailto:enterprise@blockd.site' },
  ],
  resources: [
    { label: 'Documentation', href: PLATFORM_CONFIG.docsUrl },
    { label: 'API Reference', href: `${PLATFORM_CONFIG.docsUrl}/api` },
    { label: 'Blog', href: 'https://blog.blockd.site' },
    { label: 'Status', href: 'https://status.blockd.site' },
  ],
  company: [
    { label: 'About', href: '#hero' },
    { label: 'Careers', href: 'mailto:careers@blockd.site' },
    { label: 'Contact', href: 'mailto:contact@blockd.site' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
} as const;

export const SOCIAL_LINKS = [
  { label: 'Twitter', href: 'https://twitter.com/blockd_site', icon: 'twitter' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/blockd', icon: 'linkedin' },
  { label: 'GitHub', href: 'https://github.com/blockd-site', icon: 'github' },
] as const;

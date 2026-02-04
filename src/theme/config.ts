// ═══════════════════════════════════════════════════════════════════════════
// BLOCKD THEME - CONFIGURATION
// Generates CSS variables and Tailwind theme from color definitions
// ═══════════════════════════════════════════════════════════════════════════

import { colors, riskColors } from './colors';
import { hexToRgb, hexToRgba, createGlowColor } from './utils';

/**
 * CSS Custom Properties for :root
 * These are the primary source of truth for all CSS-based styling
 */
export const cssVariables = {
  // Brand Colors
  '--blockd-void': colors.void,
  '--blockd-surface': colors.surface,
  '--blockd-muted': colors.muted,
  '--blockd-accent': colors.accent,
  '--blockd-light': colors.light,

  // Risk Colors
  '--blockd-risk-minimal': riskColors.minimal,
  '--blockd-risk-low': riskColors.low,
  '--blockd-risk-medium': riskColors.medium,
  '--blockd-risk-high': riskColors.high,
  '--blockd-risk-critical': riskColors.critical,

  // Glass Effects (derived from surface color)
  '--glass-bg-foreground': hexToRgba(colors.surface, 0.7),
  '--glass-bg-mid': hexToRgba(colors.surface, 0.5),
  '--glass-bg-background': hexToRgba(colors.surface, 0.3),
  '--glass-border': hexToRgba(colors.muted, 0.08),
  '--glass-border-hover': hexToRgba(colors.accent, 0.3),

  // Shadows & Glows (derived from accent color)
  '--shadow-card': '0 4px 24px rgba(0, 0, 0, 0.3)',
  '--shadow-card-hover': '0 8px 32px rgba(0, 0, 0, 0.4)',
  '--glow-blue': createGlowColor(colors.accent, 0.3, 20),
  '--glow-blue-intense': createGlowColor(colors.accent, 0.5, 40),
  '--glow-subtle': createGlowColor(colors.accent, 0.15, 60),
} as const;

/**
 * Tailwind theme extension colors
 * Used with @theme inline in globals.css
 */
export const tailwindColors = {
  'blockd-void': colors.void,
  'blockd-surface': colors.surface,
  'blockd-muted': colors.muted,
  'blockd-accent': colors.accent,
  'blockd-light': colors.light,
  'blockd-risk-minimal': riskColors.minimal,
  'blockd-risk-low': riskColors.low,
  'blockd-risk-medium': riskColors.medium,
  'blockd-risk-high': riskColors.high,
  'blockd-risk-critical': riskColors.critical,
} as const;

/**
 * Generate CSS string for :root variables
 * Can be used for dynamic theme injection if needed
 */
export function generateCSSVariablesString(): string {
  return Object.entries(cssVariables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
}

/**
 * RGB values for use in CSS rgba() functions
 * Useful for opacity variants in Tailwind classes
 * Derived from hex colors to maintain single source of truth
 */
const toRgbString = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
};

export const rgbValues = {
  void: toRgbString(colors.void),
  surface: toRgbString(colors.surface),
  muted: toRgbString(colors.muted),
  accent: toRgbString(colors.accent),
  light: toRgbString(colors.light),
} as const;

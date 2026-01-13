// ═══════════════════════════════════════════════════════════════════════════
// BLOCKD THEME - COLOR SYSTEM
// Single source of truth for all colors
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Brand Color Palette
 * Based on the Blockd brand guidelines
 */
export const colors = {
  // Core brand colors - LIGHT MODE
  void: '#F3F6FB',      // Primary background - egg white
  surface: '#E8ECF4',   // Cards, panels - slightly darker
  muted: '#687193',     // Secondary text - slate blue
  accent: '#36454F',    // Primary accent - dark slate
  light: '#01101B',     // Primary text - black blue
} as const;

/**
 * Risk/Severity Color Palette
 * Harmonized with the blue-gray brand palette
 */
export const riskColors = {
  minimal: '#687193',   // Matches accent - low concern
  low: '#4ADE80',       // Green - good status
  medium: '#FBBF24',    // Amber - warning
  high: '#FB923C',      // Orange - elevated concern
  critical: '#F87171',  // Red - urgent attention needed
} as const;

/**
 * All colors combined for export
 */
export const COLORS = {
  ...colors,
  risk: riskColors,
} as const;

// Type exports for TypeScript consumers
export type BrandColor = keyof typeof colors;
export type RiskLevel = keyof typeof riskColors;
export type ThemeColor = BrandColor | `risk.${RiskLevel}`;

// ═══════════════════════════════════════════════════════════════════════════
// BLOCKD THEME - PUBLIC API
// Re-exports all theme utilities for external consumption
// ═══════════════════════════════════════════════════════════════════════════

// Color definitions
export { colors, riskColors, COLORS } from './colors';
export type { BrandColor, RiskLevel, ThemeColor } from './colors';

// Utility functions
export {
  hexToRgb,
  hexToRgba,
  createGlowColor,
  createMultiGlow,
  createGlassColor,
  createGlassEffect,
} from './utils';

// Configuration
export {
  cssVariables,
  tailwindColors,
  generateCSSVariablesString,
  rgbValues,
} from './config';

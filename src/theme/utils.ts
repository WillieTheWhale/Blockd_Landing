// ═══════════════════════════════════════════════════════════════════════════
// BLOCKD THEME - COLOR UTILITIES
// Helper functions for color manipulation and derivation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert hex color to rgba string with specified alpha
 */
export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Create a glow color from a base color with intensity
 * @param baseColor - Hex color string
 * @param intensity - 0-1, where 1 is full opacity
 * @param blurRadius - Size of the glow in pixels
 */
export function createGlowColor(
  baseColor: string,
  intensity: number,
  blurRadius: number
): string {
  return `0 0 ${blurRadius}px ${hexToRgba(baseColor, intensity)}`;
}

/**
 * Create multiple glow layers for enhanced effect
 */
export function createMultiGlow(
  baseColor: string,
  intensityLevels: { intensity: number; blur: number }[]
): string {
  return intensityLevels
    .map(({ intensity, blur }) => createGlowColor(baseColor, intensity, blur))
    .join(', ');
}

/**
 * Create a glass background color with opacity
 */
export function createGlassColor(baseColor: string, opacity: number): string {
  return hexToRgba(baseColor, opacity);
}

/**
 * Create glass effect properties (background, border, blur)
 */
export function createGlassEffect(
  surfaceColor: string,
  borderColor: string,
  opacity: number,
  borderOpacity: number,
  blurAmount: number
) {
  return {
    background: hexToRgba(surfaceColor, opacity),
    border: `1px solid ${hexToRgba(borderColor, borderOpacity)}`,
    backdropFilter: `blur(${blurAmount}px)`,
    WebkitBackdropFilter: `blur(${blurAmount}px)`,
  };
}

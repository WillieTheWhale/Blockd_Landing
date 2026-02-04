import { EventSeverity } from '@/types';
import { riskColors } from '@/theme/colors';

// ═══════════════════════════════════════════════════════════════════════════
// SEVERITY COLOR CONSTANTS
// Shared color definitions for security event severity levels
// Using centralized theme system for consistency
// ═══════════════════════════════════════════════════════════════════════════

export const SEVERITY_COLORS: Record<EventSeverity, string> = {
  info: riskColors.minimal,     // #687193 - slate blue
  warning: riskColors.medium,   // #FBBF24 - amber
  critical: riskColors.critical, // #F87171 - red
} as const;

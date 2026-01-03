// ═══════════════════════════════════════════════════════════════════════════
// BLOCKD TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// GAZE DATA TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface GazePoint {
  timestamp: number;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  duration: number; // ms at this position
  isOffScreen: boolean;
  direction: 'left' | 'right' | 'top' | 'bottom' | null;
}

export interface GazeSession {
  sessionId: string;
  duration: number; // seconds
  metadata: {
    type: 'normal' | 'suspicious';
    offScreenEvents: number;
    attentionScore: number;
    readingPatternDetected: boolean;
  };
  points: GazePoint[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY EVENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type EventSeverity = 'info' | 'warning' | 'critical';
export type EventType = 'window_focus' | 'clipboard' | 'process' | 'screen_recording' | 'vm_detected';

export interface SecurityEvent {
  id: string;
  timestamp: number; // seconds from start
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface SecuritySession {
  sessionId: string;
  events: SecurityEvent[];
}

// ─────────────────────────────────────────────────────────────────────────────
// AI ANALYSIS TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type RiskLevel = 'minimal' | 'low' | 'medium' | 'high';

export interface AIAnalysis {
  questionId: string;
  question: string;
  answer: string;
  analysis: {
    similarity: {
      gpt4: number;
      claude: number;
      gemini: number;
    };
    perplexity: number;
    ngramOverlap: number;
    stylometricScore: number;
    riskScore: number;
    riskLevel: RiskLevel;
    flags: string[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT PROP TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
}

export interface CardProps {
  title?: string;
  icon?: React.ReactNode;
  timestamp?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'compact' | 'full-width' | 'alert';
  alertColor?: string;
  children: React.ReactNode;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// VISUALIZATION PROP TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface GazeHeatmapProps {
  data: GazeSession;
  showToggle?: boolean;
  showMetrics?: boolean;
  interactive?: boolean;
  className?: string;
}

export interface RiskGaugeProps {
  value: number; // 0-1
  label?: string;
  animate?: boolean;
  className?: string;
}

export interface SimilarityChartProps {
  data: {
    gpt4: number;
    claude: number;
    gemini: number;
  };
  animate?: boolean;
  className?: string;
}

export interface TimelineProps {
  events: SecurityEvent[];
  duration: number; // total session duration in seconds
  interactive?: boolean;
  onScrub?: (time: number) => void;
  className?: string;
}

export interface SecurityEventCardProps {
  event: SecurityEvent;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

import { GazeSession, GazePoint } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// GAZE DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

function generateNormalGazePoints(count: number): GazePoint[] {
  const points: GazePoint[] = [];

  for (let i = 0; i < count; i++) {
    // Center-biased distribution (natural focus on screen center)
    const centerBias = 0.7;
    const x = 0.5 + (Math.random() - 0.5) * centerBias + (Math.random() - 0.5) * 0.3;
    const y = 0.5 + (Math.random() - 0.5) * centerBias + (Math.random() - 0.5) * 0.3;

    // Clamp to mostly within screen bounds
    const clampedX = Math.max(0.05, Math.min(0.95, x));
    const clampedY = Math.max(0.05, Math.min(0.95, y));

    // Occasional natural off-screen glance (2-5%)
    const isOffScreen = Math.random() < 0.02;

    points.push({
      timestamp: (i / count) * 2700, // 45 minutes in seconds
      x: isOffScreen ? (Math.random() > 0.5 ? -0.1 : 1.1) : clampedX,
      y: isOffScreen ? clampedY : clampedY,
      duration: 100 + Math.random() * 300, // 100-400ms dwell time
      isOffScreen,
      direction: isOffScreen ? (Math.random() > 0.5 ? 'left' : 'right') : null,
    });
  }

  return points;
}

function generateSuspiciousGazePoints(count: number): GazePoint[] {
  const points: GazePoint[] = [];

  for (let i = 0; i < count; i++) {
    const progress = i / count;

    // Simulate reading pattern - systematic left-to-right movement
    const isReadingPattern = Math.random() < 0.4;
    const readingX = isReadingPattern
      ? (progress % 0.1) / 0.1 // Sweep from left to right
      : 0.5 + (Math.random() - 0.5) * 0.6;

    // More frequent off-screen glances (15-20%)
    const isOffScreen = Math.random() < 0.18;

    // Direction bias to the left (looking at notes/second monitor)
    const direction: GazePoint['direction'] = isOffScreen
      ? Math.random() < 0.7 ? 'left' : 'right'
      : null;

    const x = isOffScreen
      ? (direction === 'left' ? -0.15 - Math.random() * 0.1 : 1.15 + Math.random() * 0.1)
      : readingX;

    const y = 0.3 + Math.random() * 0.4; // Reading tends to be in upper portion

    points.push({
      timestamp: progress * 2700,
      x,
      y,
      duration: 80 + Math.random() * 200, // Quicker glances when cheating
      isOffScreen,
      direction,
    });
  }

  return points;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTED DATA SESSIONS
// ═══════════════════════════════════════════════════════════════════════════

export const normalGazeSession: GazeSession = {
  sessionId: 'demo-normal-001',
  duration: 2700, // 45 minutes
  metadata: {
    type: 'normal',
    offScreenEvents: 2,
    attentionScore: 0.89,
    readingPatternDetected: false,
  },
  points: generateNormalGazePoints(650),
};

export const suspiciousGazeSession: GazeSession = {
  sessionId: 'demo-suspicious-001',
  duration: 2700, // 45 minutes
  metadata: {
    type: 'suspicious',
    offScreenEvents: 14,
    attentionScore: 0.52,
    readingPatternDetected: true,
  },
  points: generateSuspiciousGazePoints(650),
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getGazeSession(type: 'normal' | 'suspicious'): GazeSession {
  return type === 'normal' ? normalGazeSession : suspiciousGazeSession;
}

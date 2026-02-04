import { SecurityEvent, SecuritySession } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE SECURITY EVENTS DATA
// ═══════════════════════════════════════════════════════════════════════════

export const sampleSecurityEvents: SecurityEvent[] = [
  {
    id: 'evt-001',
    timestamp: 45,
    type: 'window_focus',
    severity: 'info',
    title: 'Window Focus Change',
    description: 'Returned to interview window after 1.2s',
    metadata: { awayDuration: 1200 },
  },
  {
    id: 'evt-002',
    timestamp: 180,
    type: 'window_focus',
    severity: 'info',
    title: 'Window Focus Change',
    description: 'Brief tab switch detected',
    metadata: { awayDuration: 800 },
  },
  {
    id: 'evt-003',
    timestamp: 420,
    type: 'clipboard',
    severity: 'warning',
    title: 'Clipboard Activity',
    description: 'Paste operation detected (124 characters)',
    metadata: { charCount: 124, operation: 'paste' },
  },
  {
    id: 'evt-004',
    timestamp: 685,
    type: 'window_focus',
    severity: 'info',
    title: 'Window Focus Change',
    description: 'Switched to external application for 3.2s',
    metadata: { awayDuration: 3200 },
  },
  {
    id: 'evt-005',
    timestamp: 890,
    type: 'clipboard',
    severity: 'warning',
    title: 'Clipboard Activity',
    description: 'Large paste operation (347 characters)',
    metadata: { charCount: 347, operation: 'paste' },
  },
  {
    id: 'evt-006',
    timestamp: 1050,
    type: 'window_focus',
    severity: 'warning',
    title: 'Frequent Tab Switching',
    description: '5 tab switches in last 2 minutes',
    metadata: { switchCount: 5, timeWindow: 120 },
  },
  {
    id: 'evt-007',
    timestamp: 1380,
    type: 'screen_recording',
    severity: 'critical',
    title: 'Screen Recording Detected',
    description: 'Process: OBS Studio (PID: 4521)',
    metadata: { processName: 'OBS Studio', pid: 4521 },
  },
  {
    id: 'evt-008',
    timestamp: 1520,
    type: 'window_focus',
    severity: 'info',
    title: 'Window Focus Change',
    description: 'Returned to interview window',
    metadata: { awayDuration: 500 },
  },
  {
    id: 'evt-009',
    timestamp: 1680,
    type: 'process',
    severity: 'warning',
    title: 'Suspicious Process',
    description: 'ChatGPT browser tab detected',
    metadata: { processName: 'chrome.exe', windowTitle: 'ChatGPT' },
  },
  {
    id: 'evt-010',
    timestamp: 1890,
    type: 'clipboard',
    severity: 'warning',
    title: 'Clipboard Activity',
    description: 'Copy operation from answer field',
    metadata: { charCount: 89, operation: 'copy' },
  },
  {
    id: 'evt-011',
    timestamp: 2100,
    type: 'window_focus',
    severity: 'info',
    title: 'Window Focus Change',
    description: 'Brief focus loss (0.8s)',
    metadata: { awayDuration: 800 },
  },
  {
    id: 'evt-012',
    timestamp: 2340,
    type: 'vm_detected',
    severity: 'critical',
    title: 'Virtual Machine Detected',
    description: 'Running inside VMware environment',
    metadata: { vmType: 'VMware' },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SESSION DATA
// ═══════════════════════════════════════════════════════════════════════════

export const sampleSecuritySession: SecuritySession = {
  sessionId: 'demo-session-001',
  events: sampleSecurityEvents,
};

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY STATS
// ═══════════════════════════════════════════════════════════════════════════

export function getEventSummary(events: SecurityEvent[]) {
  const total = events.length;
  const info = events.filter((e) => e.severity === 'info').length;
  const warnings = events.filter((e) => e.severity === 'warning').length;
  const critical = events.filter((e) => e.severity === 'critical').length;

  return { total, info, warnings, critical };
}

export function getEventsByType(events: SecurityEvent[], type: string) {
  if (type === 'all') return events;
  return events.filter((e) => e.type === type);
}

export function getEventsBySeverity(events: SecurityEvent[], severity: string) {
  if (severity === 'all') return events;
  return events.filter((e) => e.severity === severity);
}

// Format timestamp for display
export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatFullTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Logo } from '@/components/branding/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

// Meeting platform configuration
const MEETING_PLATFORMS = [
  {
    id: 'google-meet',
    name: 'Google Meet',
    icon: '/platforms/google-meet.svg',
    color: '#00897B',
    urlPattern: 'meet.google.com',
    description: 'Join via Google Meet',
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    icon: '/platforms/microsoft-teams.svg',
    color: '#6264A7',
    urlPattern: 'teams.microsoft.com',
    description: 'Join via Microsoft Teams',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '/platforms/zoom.svg',
    color: '#2D8CFF',
    urlPattern: 'zoom.us',
    description: 'Join via Zoom',
  },
] as const;

type Platform = typeof MEETING_PLATFORMS[number];

interface SessionData {
  id: string;
  companyName: string;
  position: string;
  interviewerName: string;
  scheduledTime: string;
  meetingUrl?: string;
  platform?: string;
  status: 'waiting' | 'ready' | 'in_progress' | 'completed';
}

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Simulate fetching session data from backend
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // In production, this would call the backend API
        // For now, simulate with mock data
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock session data - in production this comes from backend
        const mockSession: SessionData = {
          id: sessionId,
          companyName: 'Example Corp',
          position: 'Software Engineer',
          interviewerName: 'John Smith',
          scheduledTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          status: 'ready',
        };

        setSessionData(mockSession);
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
  };

  const handleJoinMeeting = async () => {
    if (!selectedPlatform || !meetingUrl) return;

    setIsJoining(true);

    try {
      // Validate meeting URL matches selected platform
      const url = new URL(meetingUrl);
      const hostname = url.hostname.toLowerCase();

      let isValidUrl = false;
      if (selectedPlatform.id === 'google-meet' && hostname.includes('meet.google.com')) {
        isValidUrl = true;
      } else if (selectedPlatform.id === 'microsoft-teams' && (hostname.includes('teams.microsoft.com') || hostname.includes('teams.live.com'))) {
        isValidUrl = true;
      } else if (selectedPlatform.id === 'zoom' && hostname.includes('zoom.us')) {
        isValidUrl = true;
      }

      if (!isValidUrl) {
        alert(`Please enter a valid ${selectedPlatform.name} URL`);
        setIsJoining(false);
        return;
      }

      // Notify backend that session is starting
      // In production: await fetch(`/api/sessions/${sessionId}/start`, { method: 'POST' });

      // Navigate to the meeting URL
      // The Blockd browser will detect this and enable monitoring
      window.location.href = meetingUrl;

    } catch (error) {
      alert('Please enter a valid meeting URL');
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blockd-void flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Logo height={60} />
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white animate-pulse" />
            <div className="w-2 h-2 bg-white animate-pulse delay-100" />
            <div className="w-2 h-2 bg-white animate-pulse delay-200" />
          </div>
          <p className="text-blockd-muted font-mono text-sm uppercase tracking-wider">
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blockd-void">
      {/* Header */}
      <header className="border-b-2 border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo height={40} />
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-400 animate-pulse" />
            <span className="text-blockd-muted font-mono text-xs uppercase tracking-wider">
              Secure Session
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Session Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
            Interview Session
          </h1>

          {sessionData && (
            <div className="bg-blockd-surface border-2 border-white/20 p-6 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-blockd-muted font-mono text-xs uppercase tracking-wider w-32">
                  Session ID
                </span>
                <span className="text-white font-mono">{sessionData.id}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-blockd-muted font-mono text-xs uppercase tracking-wider w-32">
                  Company
                </span>
                <span className="text-white">{sessionData.companyName}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-blockd-muted font-mono text-xs uppercase tracking-wider w-32">
                  Position
                </span>
                <span className="text-white">{sessionData.position}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-blockd-muted font-mono text-xs uppercase tracking-wider w-32">
                  Status
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400" />
                  <span className="text-green-400 uppercase font-bold tracking-wider text-sm">
                    Ready to Join
                  </span>
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Platform Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-6 font-display uppercase tracking-wider">
            Select Meeting Platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MEETING_PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handlePlatformSelect(platform)}
                className={cn(
                  'group relative p-6 border-2 transition-all duration-100',
                  'flex flex-col items-center gap-4',
                  'hover:border-white',
                  selectedPlatform?.id === platform.id
                    ? 'border-white bg-white/5'
                    : 'border-white/20 bg-blockd-surface'
                )}
              >
                {/* Platform Icon */}
                <div
                  className="w-16 h-16 flex items-center justify-center"
                  style={{ color: platform.color }}
                >
                  <PlatformIcon platform={platform.id} />
                </div>

                {/* Platform Name */}
                <span className="text-white font-bold uppercase tracking-wider">
                  {platform.name}
                </span>

                {/* Selection Indicator */}
                {selectedPlatform?.id === platform.id && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-white" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Meeting URL Input */}
        {selectedPlatform && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4 font-display uppercase tracking-wider">
              Enter Meeting URL
            </h2>

            <div className="bg-blockd-surface border-2 border-white/20 p-6">
              <label className="block mb-4">
                <span className="text-blockd-muted font-mono text-xs uppercase tracking-wider block mb-2">
                  {selectedPlatform.name} Link
                </span>
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder={`https://${selectedPlatform.urlPattern}/...`}
                  className={cn(
                    'w-full px-4 py-3 bg-blockd-void border-2 border-white/20',
                    'text-white placeholder-white/30 font-mono',
                    'focus:outline-none focus:border-white',
                    'transition-colors duration-100'
                  )}
                />
              </label>

              <p className="text-blockd-muted text-sm">
                Paste the meeting link provided by your interviewer. The Blockd browser will
                securely monitor the session to ensure interview integrity.
              </p>
            </div>
          </motion.div>
        )}

        {/* Join Button */}
        {selectedPlatform && meetingUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleJoinMeeting}
              disabled={isJoining}
              className="min-w-[200px]"
            >
              {isJoining ? 'Joining...' : 'Join Interview'}
            </Button>
          </motion.div>
        )}

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t-2 border-white/10"
        >
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 flex items-center justify-center text-blockd-muted">
              <ShieldIcon />
            </div>
            <div>
              <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-2">
                Secure Interview Session
              </h3>
              <p className="text-blockd-muted text-sm leading-relaxed">
                This session is being monitored to ensure interview integrity. The Blockd browser
                provides a secure environment with eye tracking, AI detection, and system monitoring.
                Your interview performance data will be analyzed to provide fair and objective assessment.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-white/10 mt-auto">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <p className="text-center text-blockd-muted font-mono text-xs uppercase tracking-wider">
            Blockd Interview Browser &bull; Secure &bull; Fair &bull; Objective
          </p>
        </div>
      </footer>
    </div>
  );
}

// Platform Icons (inline SVG for simplicity)
function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'google-meet':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2v-6l2 2v4zm0-6l-2-2V8h2v2z"/>
          <rect x="6" y="8" width="6" height="8" rx="1" fill="currentColor"/>
          <polygon points="14,10 18,7 18,17 14,14" fill="currentColor"/>
        </svg>
      );
    case 'microsoft-teams':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
          <path d="M19.5 3A2.5 2.5 0 0122 5.5v13a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 18.5v-13A2.5 2.5 0 014.5 3h15zm-8.25 4.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm5.25 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-5.25 5.5c-2.5 0-4.5 1-4.5 2.25V16h9v-.75c0-1.25-2-2.25-4.5-2.25zm5.25-.5c-1.25 0-2.25.5-2.25 1.125V14h4.5v-.375c0-.625-1-1.125-2.25-1.125z"/>
        </svg>
      );
    case 'zoom':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
          <path d="M4 4h10a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm14 3l4-2v10l-4-2V7z"/>
        </svg>
      );
    default:
      return null;
  }
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

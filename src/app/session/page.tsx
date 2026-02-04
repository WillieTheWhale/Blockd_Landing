'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/branding/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function SessionEntryPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }

    setIsLoading(true);

    try {
      // Validate session ID format (alphanumeric, dashes, min 6 chars)
      const cleanId = sessionId.trim();
      if (!/^[a-zA-Z0-9-]{6,}$/.test(cleanId)) {
        setError('Invalid session ID format');
        setIsLoading(false);
        return;
      }

      // Navigate to the session page
      router.push(`/session/${cleanId}`);
    } catch {
      setError('Failed to load session. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blockd-void flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo height={40} />
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-400 animate-pulse" />
            <span className="text-blockd-muted font-mono text-xs uppercase tracking-wider">
              Blockd Browser
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
              Join Interview
            </h1>
            <p className="text-blockd-muted">
              Enter your session ID to join your interview securely through the Blockd browser.
            </p>
          </div>

          {/* Session Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blockd-surface border-2 border-white/20 p-6">
              <label className="block">
                <span className="text-blockd-muted font-mono text-xs uppercase tracking-wider block mb-3">
                  Session ID
                </span>
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => {
                    setSessionId(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your session ID"
                  autoFocus
                  className={cn(
                    'w-full px-4 py-4 bg-blockd-void border-2',
                    'text-white placeholder-white/30 font-mono text-lg text-center',
                    'focus:outline-none focus:border-white',
                    'transition-colors duration-100',
                    error ? 'border-red-500' : 'border-white/20'
                  )}
                />
              </label>

              {error && (
                <p className="mt-3 text-red-400 text-sm font-mono">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t-2 border-white/10">
            <p className="text-blockd-muted text-sm text-center">
              Your session ID was provided by your interviewer. If you don&apos;t have one,
              please contact your interviewer for assistance.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <p className="text-center text-blockd-muted font-mono text-xs uppercase tracking-wider">
            Blockd Interview Browser &bull; Secure &bull; Fair &bull; Objective
          </p>
        </div>
      </footer>
    </div>
  );
}

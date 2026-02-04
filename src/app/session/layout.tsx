import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interview Session | Blockd',
  description: 'Join your interview securely through the Blockd browser with integrated eye tracking, AI detection, and system monitoring.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

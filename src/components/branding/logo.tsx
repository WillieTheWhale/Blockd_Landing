'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════════════════
// BLOCKD LOGO COMPONENT
// Uses the official PNG logo
// ═══════════════════════════════════════════════════════════════════════════

export interface LogoProps {
  /**
   * Height of the logo in pixels (width scales proportionally)
   * @default 40
   */
  height?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to show the wordmark (BLOCKD text is part of logo image when true)
   * @default false - shows just the icon
   */
  withWordmark?: boolean;
}

/**
 * Blockd Logo - Uses official PNG logo
 */
export function Logo({
  height = 40,
  className,
  withWordmark = false
}: LogoProps) {
  // The full logo with wordmark has different aspect ratio than icon only
  // Full logo is roughly square, icon is also roughly square
  const width = withWordmark ? height * 1.2 : height;

  return (
    <Image
      src="/logo.png"
      alt="Blockd"
      width={width}
      height={height}
      className={cn('object-contain', className)}
      priority
    />
  );
}

/**
 * Logo link wrapper for navigation
 */
export function LogoLink({
  href = '/',
  height = 40,
  className,
  ...props
}: LogoProps & { href?: string }) {
  return (
    <a
      href={href}
      className={cn('flex items-center', className)}
      aria-label="Blockd - Home"
    >
      <Logo height={height} {...props} />
    </a>
  );
}

// Also export LogoIcon for backwards compatibility
export const LogoIcon = Logo;

export default Logo;

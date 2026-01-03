'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { cardVariants, cardHover } from '@/lib/animations';

// ═══════════════════════════════════════════════════════════════════════════
// EVIDENCE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CardProps extends HTMLMotionProps<'div'> {
  title?: string;
  icon?: React.ReactNode;
  timestamp?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'compact' | 'full-width' | 'alert';
  alertColor?: string;
  hoverable?: boolean;
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      icon,
      timestamp,
      footer,
      variant = 'default',
      alertColor,
      hoverable = true,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isAlert = variant === 'alert';
    const isCompact = variant === 'compact';
    const isFullWidth = variant === 'full-width';

    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        whileHover={hoverable ? cardHover : undefined}
        className={cn(
          'glass-panel',
          'relative overflow-hidden',
          'shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
          'transition-all duration-200',
          hoverable && 'hover:border-blockd-accent/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)]',
          isCompact ? 'p-4' : 'p-6',
          isFullWidth && 'w-full',
          isAlert && 'border-l-[3px]',
          className
        )}
        style={isAlert && alertColor ? { borderLeftColor: alertColor } : undefined}
        {...props}
      >
        {/* Scan line effect */}
        <div className="scan-line" />

        {/* Header */}
        {(title || timestamp) && (
          <div
            className={cn(
              'flex items-center justify-between',
              'border-b border-blockd-muted/5',
              isCompact ? 'pb-3 mb-3' : 'pb-4 mb-4'
            )}
          >
            <div className="flex items-center gap-3">
              {icon && (
                <span className="w-5 h-5 text-blockd-muted flex items-center justify-center">
                  {icon}
                </span>
              )}
              {title && (
                <h3 className="font-display font-semibold text-lg text-blockd-light">
                  {title}
                </h3>
              )}
            </div>
            {timestamp && (
              <span className="font-mono text-xs tracking-wide text-blockd-muted/60">
                {timestamp}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn('relative z-[2]', footer && (isCompact ? 'mb-3' : 'mb-4'))}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              'flex items-center justify-between',
              'border-t border-blockd-muted/5',
              isCompact ? 'pt-3' : 'pt-4'
            )}
          >
            {footer}
          </div>
        )}

        {/* Shimmer effect */}
        <div className="absolute inset-0 shimmer pointer-events-none" />
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

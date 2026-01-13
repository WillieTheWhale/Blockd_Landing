'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════════════════
// BRUTALIST CARD COMPONENT
// Sharp edges, thick borders, no glass effects
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
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.1 }}
        className={cn(
          'bg-blockd-surface',
          'border-2 border-white/20',
          hoverable && 'hover:border-white',
          isCompact ? 'p-4' : 'p-6',
          isFullWidth && 'w-full',
          isAlert && 'border-l-4',
          className
        )}
        style={isAlert && alertColor ? { borderLeftColor: alertColor } : undefined}
        {...props}
      >
        {/* Header */}
        {(title || timestamp) && (
          <div
            className={cn(
              'flex items-center justify-between',
              'border-b-2 border-white/10',
              isCompact ? 'pb-3 mb-3' : 'pb-4 mb-4'
            )}
          >
            <div className="flex items-center gap-3">
              {icon && (
                <span className="w-5 h-5 text-white/60 flex items-center justify-center">
                  {icon}
                </span>
              )}
              {title && (
                <h3 className="font-bold uppercase tracking-wider text-lg text-white">
                  {title}
                </h3>
              )}
            </div>
            {timestamp && (
              <span className="font-mono text-xs tracking-wide text-white/40 uppercase">
                {timestamp}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(footer && (isCompact ? 'mb-3' : 'mb-4'))}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              'flex items-center justify-between',
              'border-t-2 border-white/10',
              isCompact ? 'pt-3' : 'pt-4'
            )}
          >
            {footer}
          </div>
        )}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

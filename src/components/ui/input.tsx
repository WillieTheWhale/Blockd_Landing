'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════════════════
// TEXT INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-blockd-muted mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3',
            'bg-blockd-surface/40 rounded-lg',
            'border border-blockd-muted/20',
            'text-blockd-light placeholder:text-blockd-muted/50',
            'transition-all duration-200',
            'focus:outline-none focus:border-blockd-accent focus:shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]',
            error && 'border-blockd-risk-critical',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-blockd-risk-critical">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ═══════════════════════════════════════════════════════════════════════════
// TEXTAREA COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-blockd-muted mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full min-h-[120px] px-4 py-3',
            'bg-blockd-surface/40 rounded-lg',
            'border border-blockd-muted/20',
            'text-blockd-light placeholder:text-blockd-muted/50',
            'transition-all duration-200',
            'resize-y',
            'focus:outline-none focus:border-blockd-accent focus:shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]',
            error && 'border-blockd-risk-critical',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-blockd-risk-critical">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

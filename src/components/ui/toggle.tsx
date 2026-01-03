'use client';

import { forwardRef } from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════════════════
// TOGGLE SWITCH COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const ToggleSwitch = forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  ({ checked, onCheckedChange, label, disabled, className }, ref) => {
    return (
      <button
        ref={ref}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex items-center',
          'w-12 h-6 rounded-full',
          'transition-colors duration-200',
          checked ? 'bg-blockd-accent' : 'bg-blockd-surface',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <motion.span
          className="absolute w-5 h-5 bg-blockd-light rounded-full shadow"
          animate={{
            x: checked ? 26 : 2,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
    );
  }
);

ToggleSwitch.displayName = 'ToggleSwitch';

// ═══════════════════════════════════════════════════════════════════════════
// SEGMENTED CONTROL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ options, value, onChange, className }, ref) => {
    const activeIndex = options.findIndex((opt) => opt.value === value);

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center',
          'p-1 rounded-lg',
          'bg-blockd-surface/50',
          className
        )}
      >
        {/* Sliding background indicator - wrapped to account for padding */}
        <div className="absolute inset-1 pointer-events-none">
          <motion.div
            className="h-full bg-blockd-accent rounded-md"
            initial={false}
            animate={{
              width: `${100 / options.length}%`,
              x: `${activeIndex * 100}%`,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          />
        </div>

        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 px-6 py-3',
              'text-sm font-medium',
              'transition-colors duration-200',
              'rounded-md',
              value === option.value ? 'text-blockd-light' : 'text-blockd-muted'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }
);

SegmentedControl.displayName = 'SegmentedControl';

// ═══════════════════════════════════════════════════════════════════════════
// TOGGLE BUTTON (for toolbar-style toggles)
// ═══════════════════════════════════════════════════════════════════════════

interface ToggleButtonProps extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {
  children: React.ReactNode;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <TogglePrimitive.Root
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          'px-4 py-2 rounded-lg',
          'text-sm font-medium text-blockd-muted',
          'transition-colors duration-200',
          'hover:bg-blockd-surface/50 hover:text-blockd-light',
          'data-[state=on]:bg-blockd-accent data-[state=on]:text-blockd-light',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blockd-accent focus-visible:ring-offset-2 focus-visible:ring-offset-blockd-void',
          className
        )}
        {...props}
      >
        {children}
      </TogglePrimitive.Root>
    );
  }
);

ToggleButton.displayName = 'ToggleButton';

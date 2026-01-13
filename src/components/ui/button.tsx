'use client';

import { forwardRef, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/cn';
import { buttonHover, buttonTap } from '@/lib/animations';

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED BUTTON COMPONENT - With Magnetic Effect & Micro-interactions
// ═══════════════════════════════════════════════════════════════════════════

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  magnetic?: boolean;
}

const variantStyles = {
  primary: cn(
    'bg-gradient-to-br from-blockd-accent to-blockd-light text-blockd-void',
    'shadow-[0_4px_14px_rgba(1,16,27,0.3)]',
    'hover:shadow-[0_6px_20px_rgba(1,16,27,0.4)]',
    'active:shadow-[0_2px_8px_rgba(1,16,27,0.2)]',
    'relative overflow-hidden'
  ),
  secondary: cn(
    'bg-transparent text-blockd-accent',
    'border border-blockd-accent/30',
    'hover:border-blockd-light hover:text-blockd-light hover:bg-blockd-light/5',
    'relative overflow-hidden'
  ),
  text: cn(
    'bg-transparent text-blockd-accent',
    'hover:text-blockd-light hover:underline underline-offset-4'
  ),
};

const sizeStyles = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-8 py-4 text-base',
  lg: 'px-10 py-5 text-lg',
};

// ═══════════════════════════════════════════════════════════════════════════
// RIPPLE EFFECT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface RippleProps {
  x: number;
  y: number;
  size: number;
}

function Ripple({ x, y, size }: RippleProps) {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        pointerEvents: 'none',
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHIMMER OVERLAY
// ═══════════════════════════════════════════════════════════════════════════

function ShimmerOverlay() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ x: '-100%' }}
      animate={{ x: '200%' }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3,
        ease: 'easeInOut',
      }}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        width: '50%',
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      href,
      icon,
      iconPosition = 'left',
      className,
      disabled,
      onClick,
      type = 'button',
      magnetic = true,
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
    const [ripples, setRipples] = useState<RippleProps[]>([]);

    // Magnetic effect values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 15 };
    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);

    // Handle mouse move for magnetic effect
    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!magnetic || disabled) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.15;
        const deltaY = (e.clientY - centerY) * 0.15;
        x.set(deltaX);
        y.set(deltaY);
      },
      [magnetic, disabled, x, y]
    );

    const handleMouseLeave = useCallback(() => {
      x.set(0);
      y.set(0);
    }, [x, y]);

    // Handle click for ripple effect
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        if (disabled) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const rippleX = e.clientX - rect.left;
        const rippleY = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;

        const newRipple = { x: rippleX, y: rippleY, size };
        setRipples((prev) => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.slice(1));
        }, 600);

        onClick?.();
      },
      [disabled, onClick]
    );

    const buttonClasses = cn(
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blockd-accent focus-visible:ring-offset-2 focus-visible:ring-offset-blockd-void',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    const content = (
      <>
        {icon && iconPosition === 'left' && (
          <motion.span
            className="w-5 h-5 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {icon}
          </motion.span>
        )}
        <span className="relative z-10">{children}</span>
        {icon && iconPosition === 'right' && (
          <motion.span
            className="w-5 h-5 flex items-center justify-center"
            whileHover={{ scale: 1.1, x: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {icon}
          </motion.span>
        )}
        {/* Ripple effects */}
        {ripples.map((ripple, i) => (
          <Ripple key={i} {...ripple} />
        ))}
        {/* Shimmer for primary variant */}
        {variant === 'primary' && !disabled && <ShimmerOverlay />}
      </>
    );

    if (href) {
      return (
        <motion.a
          href={href}
          style={{ x: xSpring, y: ySpring }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick as React.MouseEventHandler<HTMLAnchorElement>}
          whileHover={buttonHover}
          whileTap={buttonTap}
          className={buttonClasses}
        >
          {content}
        </motion.a>
      );
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        style={{ x: xSpring, y: ySpring }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
        whileHover={disabled ? undefined : buttonHover}
        whileTap={disabled ? undefined : buttonTap}
        className={buttonClasses}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

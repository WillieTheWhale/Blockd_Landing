'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { fadeInDown } from '@/lib/animations';
import { NAV_LINKS } from '@/lib/constants';
import { Container } from './container';
import { Button } from '@/components/ui/button';
import { useWaitlist } from '@/contexts/waitlist-context';

// ═══════════════════════════════════════════════════════════════════════════
// LOGO COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2 group">
      {/* Logo mark - stylized B */}
      <div className="relative w-9 h-9 flex items-center justify-center">
        <div className="absolute inset-0 bg-blockd-accent rounded-lg opacity-20 group-hover:opacity-30 transition-opacity" />
        <div className="absolute inset-0 bg-gradient-to-br from-blockd-accent to-blue-600 rounded-lg opacity-80" />
        <span className="relative font-display font-bold text-xl text-white">B</span>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-lg glow-pulse opacity-50" />
      </div>
      {/* Wordmark */}
      <span className="font-display font-bold text-xl text-blockd-light tracking-tight">
        Blockd
      </span>
    </a>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE MENU COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWaitlist: () => void;
}

function MobileMenu({ isOpen, onClose, onOpenWaitlist }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-40"
            onClick={onClose}
          />

          {/* Menu drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 glass-panel--foreground"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-blockd-muted hover:text-blockd-light transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Menu content */}
            <div className="flex flex-col h-full pt-20 pb-8 px-8">
              <nav className="flex-1">
                <ul className="space-y-4">
                  {NAV_LINKS.map((link, index) => (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <a
                        href={link.href}
                        className="block text-2xl font-display font-medium text-blockd-muted hover:text-blockd-light transition-colors py-2"
                        onClick={onClose}
                      >
                        {link.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* CTA buttons */}
              <div className="space-y-4">
                <Button variant="secondary" className="w-full justify-center">
                  Log In
                </Button>
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  icon={<Mail className="w-4 h-4" />}
                  onClick={() => {
                    onClose();
                    onOpenWaitlist();
                  }}
                >
                  Join Waiting List
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isScrolled } = useScrollAnimation();
  const { openWaitlist } = useWaitlist();

  return (
    <>
      <motion.header
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'h-[72px]',
          'transition-all duration-300',
          isScrolled
            ? 'bg-blockd-void/80 backdrop-blur-xl border-b border-blockd-muted/10'
            : 'bg-transparent'
        )}
      >
        <Container className="h-full flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-blockd-muted hover:text-blockd-light transition-colors duration-200 font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="text" size="sm">
              Log In
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Mail className="w-4 h-4" />}
              onClick={openWaitlist}
            >
              Join Waiting List
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-blockd-muted hover:text-blockd-light transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </Container>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenWaitlist={openWaitlist}
      />
    </>
  );
}

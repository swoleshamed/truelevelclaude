// ===========================================
// FILE: src/components/ui/Accessibility.tsx
// PURPOSE: Accessibility utilities and components
// PRD REFERENCE: PRD Section 10 - Accessibility
// USED BY: Layout, all interactive components
// ===========================================

'use client';

import React, { ReactNode, useEffect, useState } from 'react';

/**
 * SkipLink Component
 *
 * WHY: Allow keyboard users to skip navigation and jump to main content.
 * This is a WCAG 2.1 requirement for keyboard accessibility.
 */
export function SkipLink({ href = '#main-content', children = 'Skip to main content' }) {
  return (
    <a
      href={href}
      className="skip-link"
    >
      {children}
    </a>
  );
}

/**
 * VisuallyHidden Component
 *
 * WHY: Hide content visually while keeping it accessible to screen readers.
 * Useful for providing additional context to assistive technologies.
 */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{ clip: 'rect(0, 0, 0, 0)' }}
    >
      {children}
    </span>
  );
}

/**
 * LiveRegion Component
 *
 * WHY: Announce dynamic content changes to screen readers.
 * Useful for form validation errors, loading states, etc.
 */
interface LiveRegionProps {
  children: ReactNode;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
}

export function LiveRegion({
  children,
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

/**
 * FocusTrap Component
 *
 * WHY: Trap focus within a modal or dialog.
 * Prevents keyboard users from tabbing outside the modal.
 */
interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
}

export function FocusTrap({ children, active = true }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: If on first element, go to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: If on last element, go to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return <div ref={containerRef}>{children}</div>;
}

/**
 * useReducedMotion Hook
 *
 * WHY: Detect user's reduced motion preference.
 * Allows disabling animations for users who prefer reduced motion.
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

/**
 * useKeyboardShortcut Hook
 *
 * WHY: Add keyboard shortcuts for power users.
 * Improves efficiency for keyboard-heavy workflows.
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  } = {}
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        (!options.ctrl || e.ctrlKey) &&
        (!options.alt || e.altKey) &&
        (!options.shift || e.shiftKey) &&
        (!options.meta || e.metaKey)
      ) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, options]);
}

/**
 * Announce Component
 *
 * WHY: Programmatically announce messages to screen readers.
 * Useful for announcing the result of an action.
 */
export function useAnnounce() {
  const [message, setMessage] = useState('');

  const announce = (text: string, priority: 'polite' | 'assertive' = 'polite') => {
    setMessage('');
    // Small delay to ensure the message is announced
    setTimeout(() => setMessage(text), 100);
  };

  const Announcer = () => (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );

  return { announce, Announcer };
}

/**
 * FormFieldError Component
 *
 * WHY: Properly associate error messages with form fields.
 * Ensures screen readers announce errors correctly.
 */
interface FormFieldErrorProps {
  id: string;
  error?: string;
}

export function FormFieldError({ id, error }: FormFieldErrorProps) {
  if (!error) return null;

  return (
    <p
      id={`${id}-error`}
      role="alert"
      className="text-sm text-error mt-1"
    >
      {error}
    </p>
  );
}

/**
 * getAriaProps Helper
 *
 * WHY: Generate common ARIA props for form fields.
 */
export function getAriaProps(
  id: string,
  options: {
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
  } = {}
) {
  return {
    id,
    'aria-labelledby': options.label ? `${id}-label` : undefined,
    'aria-describedby': options.error ? `${id}-error` : undefined,
    'aria-invalid': options.error ? true : undefined,
    'aria-required': options.required,
    'aria-disabled': options.disabled,
  };
}
